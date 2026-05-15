import { registerEscapeHandler, removeAllChildren } from "./util"

const tocInit = () => {
  const sidebar = document.querySelector<HTMLElement>(".toc-sidebar")
  if (!sidebar) return
  const sidebarEl: HTMLElement = sidebar

  const headingRows = Array.from(
    sidebarEl.querySelectorAll<HTMLElement>(".toc-heading"),
  )
  const bodyRows = Array.from(
    sidebarEl.querySelectorAll<HTMLElement>(".toc-body"),
  )
  if (headingRows.length === 0) return

  // Map each heading row → article heading element
  const articleHeadings = Array.from(
    document.querySelectorAll<HTMLElement>(
      "article h1, article h2, article h3, article h4, article h5, article h6",
    ),
  )

  const sections: HTMLElement[] = headingRows.map((row) => {
    const targetId = row.dataset.target
    if (targetId) {
      const byId = document.getElementById(targetId)
      if (byId) return byId
    }
    const labelText = row.querySelector<HTMLElement>(".toc-lbl")?.textContent?.trim().toLowerCase() ?? ""
    const matched = articleHeadings.find(
      (h) => h.textContent?.trim().toLowerCase() === labelText,
    )
    return matched ?? document.createElement("div")
  })

  let currentActive = -1
  let rafId: number | null = null

  function activate(idx: number) {
    if (idx === currentActive) return
    currentActive = idx

    headingRows.forEach((row, i) => {
      row.classList.remove("active", "near1", "near2")
      const d = Math.abs(i - idx)
      if (d === 0) row.classList.add("active")
      else if (d === 1) row.classList.add("near1")
      else if (d === 2) row.classList.add("near2")
    })

    bodyRows.forEach((row) => {
      row.classList.remove("bn0", "bn1")
      const hi = parseInt(row.dataset.hi ?? "-1", 10)
      const d = Math.abs(hi - idx)
      if (d === 0) row.classList.add("bn0")
      else if (d === 1) row.classList.add("bn1")
    })

    const activeEl = headingRows[idx]
    if (activeEl) {
      const target = activeEl.offsetTop - sidebarEl.clientHeight * 0.38
      easeScroll(sidebarEl, Math.max(0, target), 340)
    }
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
    })
  }

  headingRows.forEach((row, i) => {
    row.addEventListener("click", () => {
      const el = sections[i]
      if (el && el.offsetTop > 0) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
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

  activate(0)
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    if (rafId) cancelAnimationFrame(rafId)
  })
}

document.addEventListener("nav", tocInit)

export {}