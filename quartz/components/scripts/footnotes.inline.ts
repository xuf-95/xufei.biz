const footnoteLinkSelector = "a[data-footnote-ref], a[data-footnote-backref]"

function getFootnoteTarget(link: HTMLAnchorElement) {
  if (!link.hash) return null

  try {
    return document.getElementById(decodeURIComponent(link.hash.slice(1)))
  } catch {
    return null
  }
}

function jumpToFootnoteTarget(link: HTMLAnchorElement, target: HTMLElement) {
  const root = document.documentElement
  root.classList.add("footnote-jump")

  history.pushState(null, "", link.hash)

  if (!target.hasAttribute("tabindex") && !target.matches("a, button, input, select, textarea")) {
    target.setAttribute("tabindex", "-1")
  }

  target.focus({ preventScroll: true })
  target.scrollIntoView({ behavior: "auto", block: "start" })

  window.requestAnimationFrame(() => {
    root.classList.remove("footnote-jump")
  })
}

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(footnoteLinkSelector)
  if (!link) return

  const target = getFootnoteTarget(link)
  if (!target) return

  event.preventDefault()
  event.stopPropagation()
  jumpToFootnoteTarget(link, target)
})
