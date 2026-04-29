import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

const p = new DOMParser()
let hoverTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const SHORT_CONTENT_THRESHOLD = 180

function getSidebarPanel(): HTMLElement {
  let panel = document.getElementById("popover-sidebar-panel")
  if (!panel) {
    panel = document.createElement("div")
    panel.id = "popover-sidebar-panel"
    panel.classList.add("popover-sidebar-panel")

    const closeBtn = document.createElement("button")
    closeBtn.classList.add("popover-sidebar-close")
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    closeBtn.addEventListener("click", () => closeSidebarPanel())
    panel.appendChild(closeBtn)

    const header = document.createElement("div")
    header.classList.add("popover-sidebar-header")
    const tagsRow = document.createElement("div")
    tagsRow.classList.add("popover-sidebar-tags")
    const titleEl = document.createElement("h2")
    titleEl.classList.add("popover-sidebar-title")
    const metaEl = document.createElement("p")
    metaEl.classList.add("popover-sidebar-meta")
    header.appendChild(tagsRow)
    header.appendChild(titleEl)
    header.appendChild(metaEl)
    panel.appendChild(header)

    const content = document.createElement("div")
    content.classList.add("popover-sidebar-content")
    panel.appendChild(content)

    panel.addEventListener("mouseenter", () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
    })
    panel.addEventListener("mouseleave", () => scheduleClose())

    const rightSidebar = document.querySelector(".sidebar.right")
    if (rightSidebar) {
      rightSidebar.insertBefore(panel, rightSidebar.firstChild)
    } else {
      document.body.appendChild(panel)
    }
  }
  return panel
}

function getBubblePanel(): HTMLElement {
  let bubble = document.getElementById("popover-bubble-panel")
  if (!bubble) {
    bubble = document.createElement("div")
    bubble.id = "popover-bubble-panel"
    bubble.classList.add("popover-bubble-panel")

    const closeBtn = document.createElement("button")
    closeBtn.classList.add("popover-bubble-close")
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    closeBtn.addEventListener("click", () => closeBubblePanel())
    bubble.appendChild(closeBtn)

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.id = "popover-connector-svg"
    svg.classList.add("popover-connector-svg")
    document.body.appendChild(svg)

    const content = document.createElement("div")
    content.classList.add("popover-bubble-content")
    bubble.appendChild(content)

    bubble.addEventListener("mouseenter", () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
    })
    bubble.addEventListener("mouseleave", () => scheduleClose())

    document.body.appendChild(bubble)
  }
  return bubble
}

function closeSidebarPanel() {
  const panel = document.getElementById("popover-sidebar-panel")
  if (panel) panel.classList.remove("active")
  clearActiveLink()
}

function closeBubblePanel() {
  const bubble = document.getElementById("popover-bubble-panel")
  if (bubble) bubble.classList.remove("active")
  const svg = document.getElementById("popover-connector-svg")
  if (svg) svg.innerHTML = ""
  clearActiveLink()
}

function clearActiveLink() {
  document.querySelectorAll("a.internal.popover-active-link").forEach((el) => {
    el.classList.remove("popover-active-link")
  })
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    closeSidebarPanel()
    closeBubblePanel()
    closeTimer = null
  }, 300)
}

// ── 定位 bubble，margin 留出箭头字符空间 ──────────────────────────
function positionBubble(bubble: HTMLElement, linkRect: DOMRect) {
  const bubbleW = 280
  const arrowGap = 52  // 留给 ↬ 字符的水平空间
  const vp = { w: window.innerWidth, h: window.innerHeight }

  let left = linkRect.right + arrowGap
  let anchorSide: "right" | "left" = "right"
  if (left + bubbleW > vp.w - 8) {
    left = linkRect.left - bubbleW - arrowGap
    anchorSide = "left"
  }

  let top = linkRect.top + window.scrollY + 8
  const maxTop = window.scrollY + vp.h - bubble.offsetHeight - 12
  top = Math.min(top, maxTop)
  top = Math.max(window.scrollY + 8, top)

  bubble.style.left = left + "px"
  bubble.style.top = top + "px"
  bubble.style.width = bubbleW + "px"

  drawConnector(linkRect, { left, top: top - window.scrollY, w: bubbleW, side: anchorSide })
}

// ── 连接符：Unicode ↬ / ↫ 放在链接和 bubble 之间 ─────────────────
function drawConnector(
  linkRect: DOMRect,
  bubble: { left: number; top: number; w: number; side: "right" | "left" },
) {
  const svg = document.getElementById("popover-connector-svg") as SVGSVGElement | null
  if (!svg) return

  svg.innerHTML = ""
  svg.setAttribute("width", String(window.innerWidth))
  svg.setAttribute("height", String(window.innerHeight))

  const fontSize = 26
  // ↬ U+21AC（右向带环箭头）/ ↫ U+21AB（左向带环箭头）
  const arrowChar = bubble.side === "right" ? "\u21AC" : "\u21AB"

  // 水平中点放箭头
  const gapStart = bubble.side === "right" ? linkRect.right : bubble.left + bubble.w
  const gapEnd   = bubble.side === "right" ? bubble.left    : linkRect.left
  const midX = (gapStart + gapEnd) / 2
  const midY = linkRect.top + linkRect.height / 2

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
  text.setAttribute("x", String(midX))
  text.setAttribute("y", String(midY + fontSize * 0.36))
  text.setAttribute("text-anchor", "middle")
  text.setAttribute("class", "popover-connector-arrow-char")
  text.setAttribute("font-size", String(fontSize))
  text.textContent = arrowChar
  svg.appendChild(text)
}

async function mouseEnterHandler(this: HTMLAnchorElement) {
  if (window.innerWidth < 1000) return
  if (this.dataset.noPopover === "true") return

  const link = this
  if (hoverTimer) clearTimeout(hoverTimer)
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }

  hoverTimer = setTimeout(async () => {
    const targetUrl = new URL(link.href)
    const hash = decodeURIComponent(targetUrl.hash)
    targetUrl.hash = ""
    targetUrl.search = ""

    clearActiveLink()
    link.classList.add("popover-active-link")

    const cacheKey = "popover-cache-" + targetUrl.pathname
    let cached = (window as any)[cacheKey]

    if (!cached) {
      const panel = getSidebarPanel()
      const contentEl = panel.querySelector(".popover-sidebar-content") as HTMLElement
      contentEl.innerHTML = '<div class="popover-sidebar-loading">Loading</div>'
      ;(panel.querySelector(".popover-sidebar-tags") as HTMLElement).innerHTML = ""
      ;(panel.querySelector(".popover-sidebar-title") as HTMLElement).textContent = ""
      ;(panel.querySelector(".popover-sidebar-meta") as HTMLElement).textContent = ""
      panel.classList.add("active")
      closeBubblePanel()

      const response = await fetchCanonical(targetUrl).catch((err) => { console.error(err) })
      if (!response) {
        contentEl.innerHTML = '<div class="popover-sidebar-error">Failed to load.</div>'
        return
      }

      const [contentType] = response.headers.get("Content-Type")!.split(";")
      const [contentTypeCategory] = contentType.split("/")

      if (contentTypeCategory !== "text") {
        contentEl.innerHTML = '<div class="popover-sidebar-error">Cannot preview this type.</div>'
        return
      }

      const contents = await response.text()
      const html = p.parseFromString(contents, "text/html")
      normalizeRelativeURLs(html, targetUrl)
      html.querySelectorAll("[id]").forEach((el) => {
        el.id = "popover-internal-" + el.id
      })

      const elts = [...html.getElementsByClassName("popover-hint")]
      if (elts.length === 0) {
        cached = { type: "empty" }
      } else {
        const frag = document.createDocumentFragment()
        elts.forEach((elt) => frag.appendChild(elt))
        cached = { type: "html", el: frag }
      }
      ;(window as any)[cacheKey] = cached
    }

    if (cached.type === "empty") {
      showBubble('<div class="popover-bubble-empty">No preview available.</div>', link)
      closeSidebarPanel()
      return
    }

    const probe = document.createElement("div")
    probe.style.cssText = "position:absolute;visibility:hidden;width:280px;top:-9999px;"
    probe.appendChild((cached.el as DocumentFragment).cloneNode(true) as Node)
    document.body.appendChild(probe)
    const estimatedH = probe.scrollHeight
    document.body.removeChild(probe)

    if (estimatedH < SHORT_CONTENT_THRESHOLD) {
      closeSidebarPanel()
      const cloned = (cached.el as DocumentFragment).cloneNode(true) as DocumentFragment
      const wrap = document.createElement("div")
      wrap.appendChild(cloned)
      showBubble(wrap.innerHTML, link)
    } else {
      closeBubblePanel()
      const panel = getSidebarPanel()
      const contentEl = panel.querySelector(".popover-sidebar-content") as HTMLElement
      const tagsRow = panel.querySelector(".popover-sidebar-tags") as HTMLElement
      const titleEl = panel.querySelector(".popover-sidebar-title") as HTMLElement
      const metaEl = panel.querySelector(".popover-sidebar-meta") as HTMLElement
      renderSidebarContent(cached, contentEl, tagsRow, titleEl, metaEl, hash)
      panel.classList.add("active")
    }
  }, 200)
}

function showBubble(html: string, link: HTMLAnchorElement) {
  const bubble = getBubblePanel()
  const contentEl = bubble.querySelector(".popover-bubble-content") as HTMLElement
  contentEl.innerHTML = html
  bubble.classList.add("active")
  requestAnimationFrame(() => {
    positionBubble(bubble, link.getBoundingClientRect())
  })
}

function renderSidebarContent(
  cached: { type: string; el: DocumentFragment },
  contentEl: HTMLElement,
  tagsRow: HTMLElement,
  titleEl: HTMLElement,
  metaEl: HTMLElement,
  hash: string,
) {
  contentEl.innerHTML = ""
  tagsRow.innerHTML = ""
  titleEl.textContent = ""
  metaEl.textContent = ""

  const cloned = cached.el.cloneNode(true) as DocumentFragment

  cloned.querySelectorAll(".tags .tag-link, ul.tags li a").forEach((tag) => {
    const a = document.createElement("a")
    a.href = (tag as HTMLAnchorElement).href || "#"
    a.className = "tag-link"
    a.textContent = tag.textContent ?? ""
    tagsRow.appendChild(a)
  })

  const titleNode =
    cloned.querySelector("h1.article-title") ||
    cloned.querySelector(".article-title") ||
    cloned.querySelector("h1")
  if (titleNode) { titleEl.textContent = titleNode.textContent ?? ""; titleNode.remove() }

  const metaNode = cloned.querySelector(".content-meta")
  if (metaNode) { metaEl.textContent = metaNode.textContent ?? ""; metaNode.remove() }

  cloned.querySelectorAll(".tags").forEach((el) => el.remove())
  contentEl.appendChild(cloned)
  scrollToHash(contentEl, hash)
}

function scrollToHash(container: HTMLElement, hash: string) {
  if (hash !== "") {
    const target = container.querySelector("#popover-internal-" + hash.slice(1)) as HTMLElement | null
    if (target) container.scroll({ top: target.offsetTop - 12, behavior: "instant" })
  } else {
    container.scrollTop = 0
  }
}

function mouseLeaveHandler(this: HTMLAnchorElement) {
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null }
  scheduleClose()
}

document.addEventListener("nav", () => {
  document.getElementById("popover-sidebar-panel")?.remove()
  document.getElementById("popover-bubble-panel")?.remove()
  document.getElementById("popover-connector-svg")?.remove()

  const links = [...document.querySelectorAll("a.internal")] as HTMLAnchorElement[]
  for (const link of links) {
    if (link.dataset.noPopover === "true") continue
    link.addEventListener("mouseenter", mouseEnterHandler)
    link.addEventListener("mouseleave", mouseLeaveHandler)
    window.addCleanup(() => {
      link.removeEventListener("mouseenter", mouseEnterHandler)
      link.removeEventListener("mouseleave", mouseLeaveHandler)
    })
  }
})