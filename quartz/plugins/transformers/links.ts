import { QuartzTransformerPlugin } from "../types"
import {
  FullSlug,
  RelativeURL,
  SimpleSlug,
  TransformOptions,
  stripSlashes,
  simplifySlug,
  splitAnchor,
  transformLink,
} from "../../util/path"
import path from "path"
import { visit } from "unist-util-visit"
import isAbsoluteUrl from "is-absolute-url"
import { Root } from "hast"

type LinkIconPriority = "organization" | "domain" | "filetype" | "fallback"

type LinkIconMatch = {
  kind: string
  label: string
  priority: LinkIconPriority
  faviconUrl?: string
}

interface Options {
  /** How to resolve Markdown paths */
  markdownLinkResolution: TransformOptions["strategy"]
  /** Strips folders from a link so that it looks nice */
  prettyLinks: boolean
  openLinksInNewTab: boolean
  lazyLoad: boolean
  externalLinkIcon: boolean
}

const defaultOptions: Options = {
  markdownLinkResolution: "absolute",
  prettyLinks: true,
  openLinksInNewTab: false,
  lazyLoad: false,
  externalLinkIcon: true,
}

const organizationRules: Array<{
  kind: string
  label: string
  test: (url: URL) => boolean
}> = [
  { kind: "github", label: "GH", test: (url) => /(^|\.)github\.com$/i.test(url.hostname) },
  {
    kind: "wikipedia",
    label: "WP",
    test: (url) => /(^|\.)wikipedia\.org$/i.test(url.hostname),
  },
  {
    kind: "wikimedia",
    label: "WM",
    test: (url) => /(^|\.)wikimedia\.org$/i.test(url.hostname),
  },
  {
    kind: "youtube",
    label: "YT",
    test: (url) =>
      /(^|\.)youtube\.com$/i.test(url.hostname) || /(^|\.)youtu\.be$/i.test(url.hostname),
  },
  { kind: "reddit", label: "RD", test: (url) => /(^|\.)reddit\.com$/i.test(url.hostname) },
  {
    kind: "x",
    label: "X",
    test: (url) => /(^|\.)x\.com$/i.test(url.hostname) || /(^|\.)twitter\.com$/i.test(url.hostname),
  },
  { kind: "arxiv", label: "ARX", test: (url) => /(^|\.)arxiv\.org$/i.test(url.hostname) },
  { kind: "openai", label: "OAI", test: (url) => /(^|\.)openai\.com$/i.test(url.hostname) },
  {
    kind: "anthropic",
    label: "ANTH",
    test: (url) => /(^|\.)anthropic\.com$/i.test(url.hostname),
  },
  {
    kind: "deepmind",
    label: "DM",
    test: (url) =>
      /(^|\.)deepmind\.google$/i.test(url.hostname) || /(^|\.)deepmind\.com$/i.test(url.hostname),
  },
  { kind: "obsidian", label: "OBS", test: (url) => /(^|\.)obsidian\.md$/i.test(url.hostname) },
  {
    kind: "quartz",
    label: "QZ",
    test: (url) => /(^|\.)quartz\.jzhao\.xyz$/i.test(url.hostname),
  },
  { kind: "w3", label: "W3", test: (url) => /(^|\.)w3\.org$/i.test(url.hostname) },
  { kind: "medium", label: "MED", test: (url) => /(^|\.)medium\.com$/i.test(url.hostname) },
  {
    kind: "microsoft",
    label: "MS",
    test: (url) =>
      /(^|\.)microsoft\.com$/i.test(url.hostname) ||
      /(^|\.)learn\.microsoft\.com$/i.test(url.hostname),
  },
  {
    kind: "aws",
    label: "AWS",
    test: (url) =>
      /(^|\.)aws\.amazon\.com$/i.test(url.hostname) || /(^|\.)amazonaws\.com$/i.test(url.hostname),
  },
]

const domainRules: Array<{
  kind: string
  label: string
  test: (url: URL) => boolean
}> = [
  {
    kind: "docs-google",
    label: "DOC",
    test: (url) => /(^|\.)docs\.google\.com$/i.test(url.hostname),
  },
  {
    kind: "scholar",
    label: "SCH",
    test: (url) => /(^|\.)scholar\.google\.com$/i.test(url.hostname),
  },
  {
    kind: "ossinsight",
    label: "OSS",
    test: (url) =>
      /(^|\.)ossinsight\.io$/i.test(url.hostname) ||
      /(^|\.)next\.ossinsight\.io$/i.test(url.hostname),
  },
  {
    kind: "zhihu",
    label: "ZHI",
    test: (url) =>
      /(^|\.)zhihu\.com$/i.test(url.hostname) || /(^|\.)link\.zhihu\.com$/i.test(url.hostname),
  },
  { kind: "csdn", label: "CSDN", test: (url) => /(^|\.)csdn\.net$/i.test(url.hostname) },
  {
    kind: "cnblogs",
    label: "CNB",
    test: (url) => /(^|\.)cnblogs\.com$/i.test(url.hostname),
  },
]

const fileTypeRules: Array<{
  kind: string
  label: string
  test: (url: URL) => boolean
}> = [
  { kind: "pdf", label: "PDF", test: (url) => hasFileExtension(url, [".pdf"]) || hasPdfHints(url) },
  { kind: "doc", label: "DOC", test: (url) => hasFileExtension(url, [".doc", ".docx", ".odt"]) },
  {
    kind: "sheet",
    label: "XLS",
    test: (url) => hasFileExtension(url, [".xls", ".xlsx", ".ods", ".csv"]),
  },
  {
    kind: "data",
    label: "JSON",
    test: (url) => hasFileExtension(url, [".json", ".jsonl", ".xml", ".yaml", ".yml", ".toml"]),
  },
  {
    kind: "image",
    label: "IMG",
    test: (url) =>
      hasFileExtension(url, [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".ico"]),
  },
  {
    kind: "audio",
    label: "MP3",
    test: (url) => hasFileExtension(url, [".mp3", ".wav", ".ogg", ".flac", ".m4a"]),
  },
  {
    kind: "video",
    label: "VID",
    test: (url) => hasFileExtension(url, [".mp4", ".webm", ".mov", ".avi", ".mkv", ".swf"]),
  },
  {
    kind: "archive",
    label: "ZIP",
    test: (url) => hasFileExtension(url, [".zip", ".tar", ".gz", ".xz", ".7z", ".rar"]),
  },
  {
    kind: "code",
    label: "JS",
    test: (url) =>
      hasFileExtension(url, [
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        ".py",
        ".r",
        ".rs",
        ".go",
        ".java",
        ".c",
        ".cpp",
        ".h",
        ".sh",
        ".css",
        ".scss",
        ".patch",
        ".php",
      ]),
  },
]

function hasFileExtension(url: URL, extensions: string[]): boolean {
  const lowerPath = url.pathname.toLowerCase()
  return extensions.some((ext) => lowerPath.endsWith(ext))
}

function hasPdfHints(url: URL): boolean {
  const lower = `${url.pathname}${url.search}${url.hash}`.toLowerCase()
  return lower.includes(".pdf") || lower.includes("=pdf") || lower.includes("type=pdf")
}

function getNodeText(node: any): string {
  if (!node) return ""
  if (node.type === "text") return typeof node.value === "string" ? node.value : ""
  if (!Array.isArray(node.children)) return ""
  return node.children.map((child: any) => getNodeText(child)).join("")
}

function tryParseAbsoluteUrl(dest: string): URL | null {
  try {
    return new URL(dest)
  } catch {
    return null
  }
}

function getFaviconUrl(url: URL): string {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return ""
  }

  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url.href)}&sz=64`
}

function maybeMatchRule(
  url: URL,
  rules: Array<{ kind: string; label: string; test: (url: URL) => boolean }>,
  priority: LinkIconPriority,
): LinkIconMatch | null {
  for (const rule of rules) {
    if (rule.test(url)) {
      return {
        kind: rule.kind,
        label: rule.label,
        priority,
        faviconUrl: getFaviconUrl(url) || undefined,
      }
    }
  }

  return null
}

function abbreviateToken(token: string, maxLength: number): string {
  const cleaned = token.replace(/[^a-zA-Z0-9]+/g, "")
  if (!cleaned) return "EXT"

  const camelChunks = cleaned.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g)
  if (camelChunks && camelChunks.length > 1) {
    return camelChunks
      .map((chunk) => chunk[0]!)
      .join("")
      .slice(0, maxLength)
      .toUpperCase()
  }

  if (cleaned.length <= maxLength) return cleaned.toUpperCase()
  return cleaned.slice(0, maxLength).toUpperCase()
}

function deriveHostLabel(hostname: string): string {
  const host = hostname.replace(/^www\./i, "").toLowerCase()
  const labels = host.split(".").filter(Boolean)
  if (labels.length === 0) return "EXT"

  const hostingSuffixes = [
    "github.io",
    "pages.dev",
    "vercel.app",
    "netlify.app",
    "substack.com",
    "blogspot.com",
    "wordpress.com",
  ]
  const matchedHostingSuffix = hostingSuffixes.find((suffix) => host.endsWith(suffix))
  if (matchedHostingSuffix) {
    const suffixParts = matchedHostingSuffix.split(".").length
    const candidate = labels[labels.length - suffixParts - 1]
    if (candidate) return abbreviateToken(candidate, 3)
  }

  const secondLevelCountryCodes = new Set(["co", "com", "org", "net", "gov", "ac", "edu"])
  if (
    labels.length >= 3 &&
    labels[labels.length - 1].length === 2 &&
    secondLevelCountryCodes.has(labels[labels.length - 2]!)
  ) {
    return abbreviateToken(labels[labels.length - 3]!, 3)
  }

  if (labels.length >= 3) {
    return abbreviateToken(labels[0]!, 3)
  }

  return abbreviateToken(labels[labels.length - 2] ?? labels[0]!, 3)
}

function deriveTextLabel(linkText: string): string | null {
  const cleaned = linkText
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned || cleaned.length > 40) return null

  const parts = cleaned
    .split(/[\s/:-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !["the", "a", "an", "and", "of", "for", "to"].includes(part.toLowerCase()))

  if (parts.length === 0) return null

  if (parts.length >= 2) {
    return parts
      .map((part) => abbreviateToken(part, 1))
      .join("")
      .slice(0, 4)
      .toUpperCase()
  }

  const [single] = parts
  if (!single) return null

  const camelChunks = single.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g)
  if (camelChunks && camelChunks.length > 1) {
    return camelChunks
      .map((chunk) => chunk[0]!)
      .join("")
      .slice(0, 4)
      .toUpperCase()
  }

  if (single.length <= 4) return single.toUpperCase()
  if (single.length <= 8) return single.slice(0, 2).toUpperCase()
  return single[0]!.toUpperCase()
}

function detectExternalLinkIcon(dest: string, linkText: string): LinkIconMatch | null {
  const url = tryParseAbsoluteUrl(dest)
  if (!url) return null

  const fileTypeMatch = maybeMatchRule(url, fileTypeRules, "filetype")
  if (fileTypeMatch) return fileTypeMatch

  const organizationMatch = maybeMatchRule(url, organizationRules, "organization")
  if (organizationMatch) return organizationMatch

  const domainMatch = maybeMatchRule(url, domainRules, "domain")
  if (domainMatch) return domainMatch

  const textLabel = deriveTextLabel(linkText)
  if (textLabel) {
    return {
      kind: "text",
      label: textLabel,
      priority: "fallback",
      faviconUrl: getFaviconUrl(url) || undefined,
    }
  }

  return {
    kind: "domain",
    label: deriveHostLabel(url.hostname),
    priority: "fallback",
    faviconUrl: getFaviconUrl(url) || undefined,
  }
}

export const CrawlLinks: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "LinkProcessing",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree: Root, file) => {
            const curSlug = simplifySlug(file.data.slug!)
            const outgoing: Set<SimpleSlug> = new Set()

            const transformOptions: TransformOptions = {
              strategy: opts.markdownLinkResolution,
              allSlugs: ctx.allSlugs,
            }

            visit(tree, "element", (node, _index, _parent) => {
              // rewrite all links
              if (
                node.tagName === "a" &&
                node.properties &&
                typeof node.properties.href === "string"
              ) {
                let dest = node.properties.href as RelativeURL
                const classes = (node.properties.className ?? []) as string[]
                const isExternal = isAbsoluteUrl(dest)
                const linkText = getNodeText(node).trim()
                classes.push(isExternal ? "external" : "internal")

                if (isExternal) {
                  const icon = detectExternalLinkIcon(dest, linkText)
                  if (icon) {
                    node.properties["data-link-icon"] = icon.label
                    node.properties["data-link-icon-kind"] = icon.kind
                    node.properties["data-link-icon-priority"] = icon.priority
                    if (icon.faviconUrl) {
                      const existingStyle =
                        typeof node.properties.style === "string"
                          ? node.properties.style.trim()
                          : ""
                      const faviconStyle = `--external-link-icon-url: url("${icon.faviconUrl}");`
                      node.properties.style = existingStyle
                        ? `${existingStyle} ${faviconStyle}`
                        : faviconStyle
                    }
                  }
                }

                if (isExternal && opts.externalLinkIcon) {
                  node.children.unshift({
                    type: "element",
                    tagName: "svg",
                    properties: {
                      "aria-hidden": "true",
                      focusable: "false",
                      className: ["external-icon"],
                      xmlns: "http://www.w3.org/2000/svg",
                      viewBox: "0 0 512 512",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          fill: "currentColor",
                          d: "M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z",
                        },
                        children: [],
                      },
                    ],
                  })
                }

                // Check if the link has alias text
                if (
                  node.children.length === 1 &&
                  node.children[0].type === "text" &&
                  node.children[0].value !== dest
                ) {
                  // Add the 'alias' class if the text content is not the same as the href
                  classes.push("alias")
                }
                node.properties.className = classes

                if (isExternal && opts.openLinksInNewTab) {
                  node.properties.target = "_blank"
                  node.properties.rel = "noopener noreferrer"
                }

                // don't process external links or intra-document anchors
                const isInternal = !(isAbsoluteUrl(dest) || dest.startsWith("#"))
                if (isInternal) {
                  dest = node.properties.href = transformLink(
                    file.data.slug!,
                    dest,
                    transformOptions,
                  )

                  // url.resolve is considered legacy
                  // WHATWG equivalent https://nodejs.dev/en/api/v18/url/#urlresolvefrom-to
                  const url = new URL(dest, "https://base.com/" + stripSlashes(curSlug, true))
                  const canonicalDest = url.pathname
                  let [destCanonical, _destAnchor] = splitAnchor(canonicalDest)
                  if (destCanonical.endsWith("/")) {
                    destCanonical += "index"
                  }

                  // need to decodeURIComponent here as WHATWG URL percent-encodes everything
                  const full = decodeURIComponent(stripSlashes(destCanonical, true)) as FullSlug
                  const simple = simplifySlug(full)
                  outgoing.add(simple)
                  node.properties["data-slug"] = full
                }

                // rewrite link internals if prettylinks is on
                if (
                  opts.prettyLinks &&
                  isInternal &&
                  node.children.length === 1 &&
                  node.children[0].type === "text" &&
                  !node.children[0].value.startsWith("#")
                ) {
                  node.children[0].value = path.basename(node.children[0].value)
                }
              }

              // transform all other resources that may use links
              if (
                ["img", "video", "audio", "iframe"].includes(node.tagName) &&
                node.properties &&
                typeof node.properties.src === "string"
              ) {
                if (opts.lazyLoad) {
                  node.properties.loading = "lazy"
                }

                if (!isAbsoluteUrl(node.properties.src)) {
                  let dest = node.properties.src as RelativeURL
                  dest = node.properties.src = transformLink(
                    file.data.slug!,
                    dest,
                    transformOptions,
                  )
                  node.properties.src = dest
                }
              }
            })

            file.data.links = [...outgoing]
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    links: SimpleSlug[]
  }
}
