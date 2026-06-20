import { Element, ElementContent, Root as HtmlRoot } from "hast"
import { QuartzTransformerPlugin } from "../types"
import { clone } from "../../util/clone"
import { visit } from "unist-util-visit"

function classNames(node: Element): string[] {
  const raw = node.properties?.className ?? node.properties?.class ?? []
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === "string") return raw.split(/\s+/).filter(Boolean)
  return []
}

function addClass(node: Element, ...names: string[]) {
  node.properties = node.properties ?? {}
  node.properties.className = [...new Set([...classNames(node), ...names])]
}

function isFootnoteSection(node: Element): boolean {
  return node.tagName === "section" && node.properties?.dataFootnotes !== undefined
}

function isFootnoteBackref(node: Element): boolean {
  return (
    node.tagName === "a" &&
    (node.properties?.dataFootnoteBackref !== undefined ||
      classNames(node).includes("data-footnote-backref"))
  )
}

function cleanSidenoteContent(node: ElementContent): ElementContent | null {
  if (node.type !== "element") return clone(node)
  if (isFootnoteBackref(node)) return null

  const next = clone(node) as Element
  next.children = next.children
    .map((child) => cleanSidenoteContent(child))
    .filter((child): child is ElementContent => Boolean(child))

  if (next.tagName === "p") {
    const last = next.children.at(-1)
    if (last?.type === "text") {
      last.value = last.value.replace(/\s+$/, "")
    }
  }

  return next
}

function footnoteIdFromHref(href: unknown): string | undefined {
  if (typeof href !== "string" || !href.startsWith("#")) return undefined
  return decodeURIComponent(href.slice(1))
}

function makeSidenote(note: Element, number: number): Element | undefined {
  const noteId = typeof note.properties?.id === "string" ? note.properties.id : undefined
  if (!noteId) return undefined

  const children = note.children
    .map((child) => cleanSidenoteContent(child))
    .filter((child): child is ElementContent => Boolean(child))

  return {
    type: "element",
    tagName: "div",
    properties: {
      id: `sidenote-${noteId}`,
      className: ["sidenote"],
      dataSidenoteId: noteId,
    },
    children: [
      {
        type: "element",
        tagName: "span",
        properties: { className: ["sidenote-number"], ariaHidden: true },
        children: [{ type: "text", value: `${number}` }],
      },
      {
        type: "element",
        tagName: "div",
        properties: { className: ["sidenote-body"] },
        children,
      },
    ],
  }
}

export const Sidenotes: QuartzTransformerPlugin = () => {
  return {
    name: "Sidenotes",
    htmlPlugins() {
      return [
        () => {
          return (tree: HtmlRoot, file) => {
            let footnotesIndex: number | undefined
            let footnotesSection: Element | undefined

            for (const [index, child] of tree.children.entries()) {
              if (child.type === "element" && isFootnoteSection(child)) {
                footnotesIndex = index
                footnotesSection = child
                break
              }
            }

            if (footnotesIndex === undefined || !footnotesSection) return

            const noteItems =
              footnotesSection.children
                .find(
                  (child): child is Element => child.type === "element" && child.tagName === "ol",
                )
                ?.children.filter(
                  (child): child is Element => child.type === "element" && child.tagName === "li",
                ) ?? []

            const sidenotes = noteItems
              .map((note, index) => makeSidenote(note, index + 1))
              .filter((note): note is Element => Boolean(note))

            if (sidenotes.length === 0) return

            const sidenoteIds = new Set(
              sidenotes
                .map((note) =>
                  typeof note.properties?.dataSidenoteId === "string"
                    ? note.properties.dataSidenoteId
                    : undefined,
                )
                .filter((id): id is string => Boolean(id)),
            )

            visit(tree, "element", (node, _index, parent) => {
              if (node.tagName !== "a") return
              const noteId = footnoteIdFromHref(node.properties.href)
              if (!noteId || !sidenoteIds.has(noteId)) return

              node.properties = {
                ...node.properties,
                dataSidenoteId: noteId,
                ariaControls: `sidenote-${noteId}`,
              }
              addClass(node, "sidenote-ref-link")

              if (parent?.type === "element" && parent.tagName === "sup") {
                parent.properties = {
                  ...(parent.properties ?? {}),
                  dataSidenoteId: noteId,
                }
                addClass(parent, "sidenote-ref")
              }
            })

            addClass(footnotesSection, "sidenotes-source")
            tree.children.splice(footnotesIndex, 0, {
              type: "element",
              tagName: "aside",
              properties: {
                className: ["sidenotes"],
                ariaLabel: "Article notes",
              },
              children: sidenotes,
            })

            file.data.hasSidenotes = true
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    hasSidenotes: boolean | undefined
  }
}
