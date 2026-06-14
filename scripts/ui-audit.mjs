import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const publicDir = path.join(root, "public")

const criticalPages = [
  {
    name: "Home",
    file: "index.html",
    required: ["Bigdata Wiki OS", "Quartz Style Guide", "Quartz Diagram Style Guide"],
  },
  {
    name: "Quartz Style Guide",
    file: "index/Posts/Quartz-Style-Guide.html",
    required: ["Style System Map", "Callout Patterns", "Style Changelog"],
  },
  {
    name: "Quartz Diagram Style Guide",
    file: "index/Posts/Quartz-Diagram-Style-Guide.html",
    required: ["wiki-diagram-architecture", "wiki-diagram-flow", "wiki-diagram-capability", "wiki-diagram-decision"],
    requiredHtml: ["<section class=\"wiki-diagram wiki-diagram-architecture\"", "<section class=\"wiki-diagram wiki-diagram-flow\""],
    minDiagramComponents: 4,
  },
  {
    name: "Bigdata Wiki OS",
    file: "index/00-Map/Bigdata-Wiki-OS.html",
    required: ["MOC-大数据全栈工程师能力地图", "MOC-DATA+AI Agent 地图", "Phase Roadmap"],
    requiredHtml: ["<section class=\"wiki-diagram wiki-diagram-architecture\""],
    minDiagramComponents: 1,
  },
  {
    name: "00-Map",
    file: "index/00-Map/index.html",
    required: ["Bigdata Wiki OS", "Core Maps", "Text2SQL", "MOC-职业资产地图"],
  },
  {
    name: "Data Agent Architecture",
    file: "index/AI/Data-Agent-Architecture.html",
    required: ["Data Agent Architecture", "Semantic Layer", "Metadata Management"],
    requiredHtml: ["<section class=\"wiki-diagram wiki-diagram-flow\""],
    minDiagramComponents: 1,
  },
  {
    name: "Text2SQL",
    file: "index/AI/Text2SQL.html",
    required: ["Text2SQL", "Semantic Layer", "Agent Governance"],
  },
  {
    name: "Data Architecture Blueprint",
    file: "index/Data-Architecture/Data-Architecture-Blueprint.html",
    required: ["Data Architecture Blueprint", "Data Architecture", "CDO"],
  },
  {
    name: "Career Assets Map",
    file: "index/Career-Assets/MOC-职业资产地图.html",
    required: ["Bigdata Interview Question Bank", "Bigdata Project Case Library", "Bigdata Presentation Playbook"],
  },
  {
    name: "Interview Bank",
    file: "index/Career-Assets/Bigdata-Interview-Question-Bank.html",
    required: ["Data Architecture", "Text2SQL", "Agent Governance"],
  },
]

const cssChecks = [
  {
    file: "quartz/styles/custom.scss",
    required: ['@use "./custom/diagram-components.scss";'],
  },
  {
    file: "quartz/styles/custom/diagram-components.scss",
    required: [
      ".wiki-diagram-architecture",
      ".wiki-diagram-flow",
      ".wiki-diagram-capability",
      ".wiki-diagram-decision",
      "--wiki-diagram-card",
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
      ".wiki-diagram .wiki-diagram-title",
      ".wiki-diagram .wiki-diagram-title a[role=\"anchor\"]",
      "@media (max-width: 760px)",
    ],
  },
]

const findings = []

function addFinding(severity, scope, message) {
  findings.push({ severity, scope, message })
}

function readRelative(file) {
  const fp = path.join(root, file)
  if (!fs.existsSync(fp)) {
    addFinding("error", file, "Missing file")
    return ""
  }
  return fs.readFileSync(fp, "utf8")
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length
}

function auditCss() {
  for (const check of cssChecks) {
    const text = readRelative(check.file)
    for (const token of check.required) {
      if (!text.includes(token)) {
        addFinding("error", check.file, `Missing required style token: ${token}`)
      }
    }
  }
}

function auditHtmlPage(page) {
  const fp = path.join(publicDir, page.file)
  if (!fs.existsSync(fp)) {
    addFinding("error", page.name, `Generated page missing: public/${page.file}`)
    return
  }

  const html = fs.readFileSync(fp, "utf8")
  for (const token of page.required) {
    if (!html.includes(token)) {
      addFinding("error", page.name, `Required content not found in generated HTML: ${token}`)
    }
  }

  const htmlWithoutCode = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, "")
    .replace(/<code[\s\S]*?<\/code>/gi, "")

  for (const token of page.requiredHtml ?? []) {
    if (!htmlWithoutCode.includes(token)) {
      addFinding("error", page.name, `Required rendered HTML component not found outside code blocks: ${token}`)
    }
  }

  if (page.minDiagramComponents) {
    const componentCount = countMatches(htmlWithoutCode, /<section\s+class=(["'])[^"']*\bwiki-diagram\b[^"']*\1/gi)
    if (componentCount < page.minDiagramComponents) {
      addFinding("error", page.name, `Expected at least ${page.minDiagramComponents} rendered wiki-diagram component(s), found ${componentCount}`)
    }
  }

  const obviousBadTokens = ["[object Object]", "undefined", "NaN"]
  for (const token of obviousBadTokens) {
    if (htmlWithoutCode.includes(token)) {
      addFinding("error", page.name, `Suspicious rendered token found: ${token}`)
    }
  }

  const emptyHrefCount = countMatches(htmlWithoutCode, /href=(["'])\s*\1/g)
  if (emptyHrefCount > 0) {
    addFinding("warning", page.name, `${emptyHrefCount} empty href attribute(s) found`)
  }

  const inlineStyleCount = countMatches(htmlWithoutCode, /\sstyle=(["'])[\s\S]*?\1/g)
  if (inlineStyleCount > 12) {
    addFinding("warning", page.name, `${inlineStyleCount} inline style attributes found; prefer reusable SCSS for article components`)
  }

  const unparsedWikilinkCount = countMatches(htmlWithoutCode, /\[\[[^\]]+\]\]/g)
  if (unparsedWikilinkCount > 0) {
    addFinding("warning", page.name, `${unparsedWikilinkCount} unparsed wikilink-looking token(s) found in generated HTML`)
  }

  const titleCount = countMatches(html, /class="article-title"/g)
  if (titleCount !== 1) {
    addFinding("warning", page.name, `Expected one article title, found ${titleCount}`)
  }
}

function auditGeneratedPages() {
  if (!fs.existsSync(publicDir)) {
    addFinding("error", "public", "Missing public directory. Run `npm run quartz build` before `npm run ui:audit`.")
    return
  }

  for (const page of criticalPages) {
    auditHtmlPage(page)
  }
}

function summarize() {
  const errors = findings.filter((f) => f.severity === "error")
  const warnings = findings.filter((f) => f.severity === "warning")

  const lines = []
  lines.push("# UI Audit Report")
  lines.push("")
  lines.push(`Checked at: ${new Date().toISOString()}`)
  lines.push(`Critical pages: ${criticalPages.length}`)
  lines.push(`Errors: ${errors.length}`)
  lines.push(`Warnings: ${warnings.length}`)
  lines.push("")

  if (findings.length === 0) {
    lines.push("Result: PASS")
    lines.push("")
    lines.push("No blocking UI integration issues were detected in generated Quartz output.")
  } else {
    lines.push(errors.length > 0 ? "Result: FAIL" : "Result: PASS WITH WARNINGS")
    lines.push("")
    for (const finding of findings) {
      lines.push(`- [${finding.severity.toUpperCase()}] ${finding.scope}: ${finding.message}`)
    }
  }

  return { text: lines.join("\n"), errors, warnings }
}

auditCss()
auditGeneratedPages()

const { text, errors } = summarize()
console.log(text)

if (errors.length > 0) {
  process.exitCode = 1
}
