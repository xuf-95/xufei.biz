const tocInit = () => {
  const sidebar = document.getElementById("toc-body")
  if (!sidebar) return
  const sidebarEl: HTMLElement = sidebar
  const wrapper = sidebarEl.closest<HTMLElement>(".toc-wrapper")
  const leftSidebar = wrapper?.closest<HTMLElement>(".sidebar.left")
  const pageFooter = document.querySelector<HTMLElement>("#quartz-body .center .page-footer")
  const siteFooter = document.querySelector<HTMLElement>("footer.site-footer")

  const expand = () => wrapper?.classList.add("is-expanded")
  const collapse = () => wrapper?.classList.remove("is-expanded")
  wrapper?.addEventListener("mouseenter", expand)
  wrapper?.addEventListener("mouseleave", collapse)

  const headingRows = Array.from(sidebarEl.querySelectorAll<HTMLElement>(".toc-heading"))
  if (headingRows.length === 0) return

  const articleHeadings = Array.from(
    document.querySelectorAll<HTMLElement>(
      "article h1, article h2, article h3, article h4, article h5, article h6",
    ),
  )

  // Map each TOC row to the corresponding article heading element
  const sections: HTMLElement[] = headingRows.map((row) => {
    const targetId = row.dataset.target
    if (targetId) {
      const byId = document.getElementById(targetId)
      if (byId) return byId
    }
    const labelText =
      row.querySelector<HTMLElement>(".toc-lbl")?.textContent?.trim().toLowerCase() ?? ""
    const matched = articleHeadings.find((h) => h.textContent?.trim().toLowerCase() === labelText)
    return matched ?? document.createElement("div")
  })

  let currentActive = -1
  let rafId: number | null = null
  let stickySettleTimer: ReturnType<typeof setTimeout> | null = null
  let stepTimers: ReturnType<typeof setTimeout>[] = []

  function getHeaderClearance() {
    const header = document.querySelector<HTMLElement>("header")
    if (!header) return 80

    const rect = header.getBoundingClientRect()
    const visibleBottom = Math.max(0, rect.bottom)
    const headerBottom = Math.max(visibleBottom, header.offsetHeight)
    return Math.ceil(headerBottom + 40)
  }

  function updateTocStickyTop() {
    if (!wrapper) return

    const header = document.querySelector<HTMLElement>("header")
    const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 56
    wrapper.style.setProperty("--toc-sticky-top", `${Math.ceil(headerBottom + 12)}px`)
  }

  function settleTocStickyTop() {
    if (stickySettleTimer) clearTimeout(stickySettleTimer)
    stickySettleTimer = setTimeout(() => {
      updateTocStickyTop()
      stickySettleTimer = null
    }, 280)
  }

  function updateTocFlowTop() {
    if (!wrapper || !leftSidebar) return

    const firstSection = sections.find((el) => el && document.body.contains(el))
    const firstDash = headingRows[0]?.querySelector<HTMLElement>(".toc-dash") ?? headingRows[0]
    if (!firstSection || !firstDash) return

    const sidebarRect = leftSidebar.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    const dashRect = firstDash.getBoundingClientRect()
    const sectionRect = firstSection.getBoundingClientRect()
    const sectionStyle = window.getComputedStyle(firstSection)
    const sectionLineHeight = Number.parseFloat(sectionStyle.lineHeight)
    const sectionTextOffset = Number.isFinite(sectionLineHeight)
      ? Math.min(sectionRect.height, sectionLineHeight) / 2
      : sectionRect.height / 2
    const dashCenterOffset = dashRect.top + dashRect.height / 2 - wrapperRect.top
    const sectionTextCenter = sectionRect.top + window.scrollY + sectionTextOffset
    const sidebarTop = sidebarRect.top + window.scrollY
    const flowTop = Math.max(0, Math.round(sectionTextCenter - sidebarTop - dashCenterOffset))

    wrapper.style.setProperty("--toc-flow-top", `${flowTop}px`)
  }

  function getDocumentTop(el: HTMLElement) {
    return el.getBoundingClientRect().top + window.scrollY
  }

  function updateTocLayout() {
    updateTocStickyTop()
    updateTocFlowTop()
  }

  function updateFooterOverlap() {
    if (!wrapper) return

    const tocRect = wrapper.getBoundingClientRect()
    const overlapsBottomContent = [pageFooter, siteFooter].some((element) => {
      if (!element || element.offsetHeight === 0) return false

      const elementRect = element.getBoundingClientRect()
      return elementRect.top < tocRect.bottom && elementRect.bottom > tocRect.top
    })
    wrapper.classList.toggle("is-over-footer", overlapsBottomContent)
  }

  function clearStepTimers() {
    stepTimers.forEach(clearTimeout)
    stepTimers = []
  }

  /** Applies active / near classes immediately — no animation queuing. */
  function applyActive(idx: number) {
    if (idx === currentActive) return
    currentActive = idx

    headingRows.forEach((row, i) => {
      row.classList.remove("active", "near1", "near2")
      row.removeAttribute("aria-current")
      const d = Math.abs(i - idx)
      if (d === 0) {
        row.classList.add("active")
        row.setAttribute("aria-current", "location")
      } else if (d === 1) {
        row.classList.add("near1")
      } else if (d === 2) {
        row.classList.add("near2")
      }
    })

    // Keep the active item visible inside the scrolling sidebar
    const activeEl = headingRows[idx]
    if (activeEl) {
      const target = activeEl.offsetTop - (sidebarEl.clientHeight - activeEl.offsetHeight) / 2
      sidebarEl.scrollTop = Math.max(0, target)
    }
  }

  /**
   * Animate the active indicator from currentActive → target by stepping
   * through each intermediate heading:
   *   dist 1      → direct (CSS handles visual)
   *   dist 2–6    → visit every intermediate, 48 ms apart
   *   dist > 6    → compress to last 2 steps (fast scroll / page jump)
   */
  function activate(target: number) {
    if (target === currentActive) return
    clearStepTimers()

    const dir = target > currentActive ? 1 : -1
    const dist = Math.abs(target - currentActive)

    if (dist <= 1) {
      applyActive(target)
      return
    }

    const steps: number[] = []
    if (dist <= 6) {
      for (let i = currentActive + dir; i !== target + dir; i += dir) steps.push(i)
    } else {
      steps.push(target - dir * 2, target - dir, target)
    }

    const STEP_MS = 48
    steps.forEach((idx, i) => {
      const t = setTimeout(() => applyActive(idx), i * STEP_MS)
      stepTimers.push(t)
    })
  }

  function onScroll() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      const scrollTop = window.scrollY
      const offset = getHeaderClearance() + 2
      let best = 0
      sections.forEach((el, i) => {
        if (el && document.body.contains(el) && getDocumentTop(el) <= scrollTop + offset) best = i
      })
      activate(best)
      updateTocStickyTop()
      settleTocStickyTop()
      updateFooterOverlap()
    })
  }

  // Clicking a TOC link: jump to the heading immediately and keep the indicator in sync.
  headingRows.forEach((row, i) => {
    row.addEventListener("click", (event) => {
      event.preventDefault()
      event.stopPropagation()
      const el = sections[i]
      if (el && document.body.contains(el)) {
        const top = el.getBoundingClientRect().top + window.scrollY - getHeaderClearance()
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" })
        history.replaceState(null, "", `#${row.dataset.target}`)
        applyActive(i)
      }
    })
  })

  applyActive(0)
  updateTocLayout()
  updateFooterOverlap()
  onScroll()
  window.requestAnimationFrame(updateTocLayout)
  window.setTimeout(updateTocLayout, 250)
  document.fonts?.ready.then(updateTocLayout)
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", updateTocLayout, { passive: true })
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", updateTocLayout)
    wrapper?.removeEventListener("mouseenter", expand)
    wrapper?.removeEventListener("mouseleave", collapse)
    if (rafId) cancelAnimationFrame(rafId)
    if (stickySettleTimer) clearTimeout(stickySettleTimer)
    clearStepTimers()
  })
}

document.addEventListener("nav", tocInit)

export default tocInit
