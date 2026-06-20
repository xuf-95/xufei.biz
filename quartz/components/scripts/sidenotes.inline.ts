const sidenoteMedia = window.matchMedia("(min-width: 1200px)")

function getSidenotesId(article: Element, index: number) {
  const articleEl = article as HTMLElement
  if (!articleEl.dataset.sidenotesId) {
    articleEl.dataset.sidenotesId = `sidenotes-${index}`
  }
  return articleEl.dataset.sidenotesId
}

function getSidenotesAside(article: Element) {
  const sidenotesId = (article as HTMLElement).dataset.sidenotesId
  const ownedAside = sidenotesId
    ? document.querySelector<HTMLElement>(
        `.sidenotes[data-sidenotes-owner="${CSS.escape(sidenotesId)}"]`,
      )
    : null

  return ownedAside ?? article.querySelector<HTMLElement>(":scope > .sidenotes")
}

function getSidenoteContainers(article: Element) {
  return [article, getSidenotesAside(article)].filter((el): el is Element => Boolean(el))
}

function containsSidenoteTarget(article: Element, target: Node | null) {
  if (!target) return false
  return getSidenoteContainers(article).some((container) => container.contains(target))
}

function moveSidenotesToRightSidebar(article: Element, index: number) {
  const aside = getSidenotesAside(article)
  const rightSidebar = document.querySelector<HTMLElement>("#quartz-body > .right.sidebar")
  if (!aside || !rightSidebar) return

  const sidenotesId = getSidenotesId(article, index)
  aside.dataset.sidenotesOwner = sidenotesId
  rightSidebar.classList.add("has-sidenotes")

  if (aside.parentElement !== rightSidebar) {
    rightSidebar.prepend(aside)
  }
}

function cleanupDetachedSidenotes(articles: Element[]) {
  const activeOwners = new Set(
    articles
      .map((article) => (article as HTMLElement).dataset.sidenotesId)
      .filter((id): id is string => Boolean(id)),
  )

  document
    .querySelectorAll<HTMLElement>("#quartz-body > .right.sidebar > .sidenotes")
    .forEach((aside) => {
      const owner = aside.dataset.sidenotesOwner
      if (owner && !activeOwners.has(owner)) {
        aside.remove()
      }
    })
}

function clearActiveSidenote(article: Element) {
  getSidenoteContainers(article)
    .flatMap((container) =>
      Array.from(
        container.querySelectorAll(
          ".sidenote.is-active, .sidenote-ref-link.is-active, .sidenote-anchor-text.is-active",
        ),
      ),
    )
    .forEach((el) => el.classList.remove("is-active"))
}

function setActiveSidenote(article: Element, sidenoteId: string | null) {
  alignSidenotes(article)
  clearActiveSidenote(article)
  if (!sidenoteId) return

  getSidenoteContainers(article).forEach((container) => {
    container
      .querySelectorAll(`.sidenote[data-sidenote-id="${CSS.escape(sidenoteId)}"]`)
      .forEach((el) => el.classList.add("is-active"))
    container
      .querySelectorAll(`.sidenote-ref-link[data-sidenote-id="${CSS.escape(sidenoteId)}"]`)
      .forEach((el) => el.classList.add("is-active"))
    container
      .querySelectorAll(`.sidenote-anchor-text[data-sidenote-id="${CSS.escape(sidenoteId)}"]`)
      .forEach((el) => el.classList.add("is-active"))
  })
}

function activateSidenoteFromRef(article: Element, ref: HTMLAnchorElement, event?: Event) {
  if (!sidenoteMedia.matches) return false

  const sidenoteId = ref.dataset.sidenoteId
  const note = sidenoteId
    ? getSidenoteContainers(article).flatMap((container) =>
        Array.from(
          container.querySelectorAll<HTMLElement>(
            `.sidenote[data-sidenote-id="${CSS.escape(sidenoteId)}"]`,
          ),
        ),
      )[0]
    : null

  if (!note) return false
  event?.preventDefault()
  event?.stopPropagation()
  setActiveSidenote(article, sidenoteId ?? null)
  return true
}

function alignSidenotes(article: Element) {
  const aside = getSidenotesAside(article)
  if (!aside) return

  const notes = Array.from(aside.querySelectorAll<HTMLElement>(".sidenote"))
  notes.forEach((note) => {
    note.style.marginTop = ""
    note.style.removeProperty("--sidenote-top")
    note.classList.remove("is-visible")
  })

  if (!sidenoteMedia.matches) return

  const asideTop = aside.getBoundingClientRect().top
  let cursor = Number.NEGATIVE_INFINITY
  const gap = 16

  notes.forEach((note) => {
    const sidenoteId = note.dataset.sidenoteId
    if (!sidenoteId) return

    const anchor =
      article.querySelector<HTMLElement>(
        `.sidenote-anchor-text[data-sidenote-id="${CSS.escape(sidenoteId)}"]`,
      ) ??
      article.querySelector<HTMLElement>(
        `.sidenote-ref-link[data-sidenote-id="${CSS.escape(sidenoteId)}"]`,
      )
    if (!anchor) return

    const ref = article.querySelector<HTMLElement>(
      `.sidenote-ref-link[data-sidenote-id="${CSS.escape(sidenoteId)}"]`,
    )
    const targetRect = anchor.getBoundingClientRect()
    const isVisible = targetRect.bottom > 0 && targetRect.top < window.innerHeight
    if (!isVisible) return

    const refRect = ref?.getBoundingClientRect()
    const baselineTop = refRect?.top ?? targetRect.top
    const desiredTop = Math.max(baselineTop - asideTop, cursor)

    note.classList.add("is-visible")
    note.style.setProperty("--sidenote-top", `${desiredTop}px`)
    cursor = desiredTop + note.offsetHeight + gap
  })
}

function enhanceSidenoteAnchors(article: Element) {
  article.querySelectorAll<HTMLElement>(".sidenote-ref").forEach((ref) => {
    const sidenoteId = ref.dataset.sidenoteId
    if (!sidenoteId || ref.dataset.anchorEnhanced === "true") return
    ref.dataset.anchorEnhanced = "true"

    const previous = ref.previousSibling
    if (previous?.nodeType === Node.ELEMENT_NODE) {
      const previousEl = previous as HTMLElement
      if (previousEl.classList.contains("sidenote-anchor-text")) {
        previousEl.dataset.sidenoteId = sidenoteId
      }
      return
    }

    if (previous?.nodeType !== Node.TEXT_NODE || !previous.textContent) return

    const match = previous.textContent.match(/(\S+)(\s*)$/u)
    if (!match || match.index === undefined) return

    const [, anchorText, trailingSpace] = match
    const prefix = previous.textContent.slice(0, match.index)
    previous.textContent = prefix

    const anchor = document.createElement("span")
    anchor.className = "sidenote-anchor-text"
    anchor.dataset.sidenoteId = sidenoteId
    anchor.textContent = anchorText

    ref.parentNode?.insertBefore(anchor, ref)
    if (trailingSpace) {
      ref.parentNode?.insertBefore(document.createTextNode(trailingSpace), ref)
    }
  })
}

function setupSidenotes() {
  const articles = Array.from(document.querySelectorAll("article.has-sidenotes"))
  cleanupDetachedSidenotes(articles)

  articles.forEach((article, index) => {
    moveSidenotesToRightSidebar(article, index)
    enhanceSidenoteAnchors(article)
    alignSidenotes(article)
    const articleEl = article as HTMLElement
    if (articleEl.dataset.sidenotesReady === "true") return
    articleEl.dataset.sidenotesReady = "true"

    article.querySelectorAll<HTMLAnchorElement>(".sidenote-ref-link").forEach((ref) => {
      if (ref.dataset.sidenoteClickReady === "true") return
      ref.dataset.sidenoteClickReady = "true"
      ref.addEventListener("click", (event) => {
        activateSidenoteFromRef(article, ref, event)
      })
    })

    article.addEventListener("pointerover", (event) => {
      const target = event.target as Element | null
      const active = target?.closest<HTMLElement>("[data-sidenote-id]")
      if (!active || !containsSidenoteTarget(article, active)) return
      setActiveSidenote(article, active.dataset.sidenoteId ?? null)
    })

    article.addEventListener("pointerout", (event) => {
      const related = (event as PointerEvent).relatedTarget as Node | null
      if (containsSidenoteTarget(article, related)) return
      clearActiveSidenote(article)
    })

    article.addEventListener("focusin", (event) => {
      const target = event.target as Element | null
      const active = target?.closest<HTMLElement>("[data-sidenote-id]")
      if (!active || !containsSidenoteTarget(article, active)) return
      setActiveSidenote(article, active.dataset.sidenoteId ?? null)
    })

    article.addEventListener("focusout", (event) => {
      const related = (event as FocusEvent).relatedTarget as Node | null
      if (containsSidenoteTarget(article, related)) return
      clearActiveSidenote(article)
    })

    article.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element | null
        const ref = target?.closest<HTMLAnchorElement>(".sidenote-ref-link")
        if (!ref) return
        activateSidenoteFromRef(article, ref, event)
      },
      true,
    )

    getSidenotesAside(article)?.addEventListener("pointerover", (event) => {
      const target = event.target as Element | null
      const active = target?.closest<HTMLElement>("[data-sidenote-id]")
      if (!active || !containsSidenoteTarget(article, active)) return
      setActiveSidenote(article, active.dataset.sidenoteId ?? null)
    })

    getSidenotesAside(article)?.addEventListener("pointerout", (event) => {
      const related = (event as PointerEvent).relatedTarget as Node | null
      if (containsSidenoteTarget(article, related)) return
      clearActiveSidenote(article)
    })
  })
}

let sidenoteLayoutFrame = 0
function scheduleSidenoteLayout() {
  if (sidenoteLayoutFrame) return
  sidenoteLayoutFrame = window.requestAnimationFrame(() => {
    sidenoteLayoutFrame = 0
    document.querySelectorAll("article.has-sidenotes").forEach(alignSidenotes)
  })
}

setupSidenotes()
document.addEventListener("nav", setupSidenotes)
document.addEventListener("scroll", scheduleSidenoteLayout, { passive: true, capture: true })
window.addEventListener("scroll", scheduleSidenoteLayout, { passive: true })
window.addEventListener("resize", scheduleSidenoteLayout)
