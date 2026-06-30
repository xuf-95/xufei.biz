const tocInit = () => {
  const sidebar = document.getElementById("toc-body")
  if (!sidebar) return
  const sidebarEl: HTMLElement = sidebar
  const wrapper = sidebarEl.closest<HTMLElement>(".toc-wrapper")
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
  let stepTimers: ReturnType<typeof setTimeout>[] = []

  function updateFooterOverlap() {
    if (!wrapper || !siteFooter) return

    const tocRect = wrapper.getBoundingClientRect()
    const footerRect = siteFooter.getBoundingClientRect()
    const isOverFooter = footerRect.top < tocRect.bottom && footerRect.bottom > tocRect.top
    wrapper.classList.toggle("is-over-footer", isOverFooter)
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
      easeScroll(sidebarEl, Math.max(0, target), 320)
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
      const offset = 100
      let best = 0
      sections.forEach((el, i) => {
        if (el && el.offsetTop > 0 && el.offsetTop <= scrollTop + offset) best = i
      })
      activate(best)
      updateFooterOverlap()
    })
  }

  // Clicking a TOC link: smooth-scroll the page and animate the indicator
  headingRows.forEach((row, i) => {
    row.addEventListener("click", (event) => {
      event.preventDefault()
      const el = sections[i]
      if (el && el.offsetTop > 0) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
        history.replaceState(null, "", `#${row.dataset.target}`)
        activate(i)
      }
    })
  })

  function easeScroll(el: HTMLElement, to: number, ms: number) {
    const from = el.scrollTop
    const delta = to - from
    if (Math.abs(delta) < 1) return
    let t0: number | null = null
    function step(t: number) {
      if (!t0) t0 = t
      const p = Math.min((t - t0) / ms, 1)
      el.scrollTop = from + delta * (1 - Math.pow(1 - p, 4))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  applyActive(0)
  updateFooterOverlap()
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", updateFooterOverlap, { passive: true })
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", updateFooterOverlap)
    wrapper?.removeEventListener("mouseenter", expand)
    wrapper?.removeEventListener("mouseleave", collapse)
    if (rafId) cancelAnimationFrame(rafId)
    clearStepTimers()
  })
}

document.addEventListener("nav", tocInit)

export default tocInit
