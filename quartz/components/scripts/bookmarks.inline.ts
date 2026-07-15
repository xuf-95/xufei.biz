document.addEventListener("nav", () => {
  const container = document.querySelector(".bookmarks-page") as HTMLElement | null
  if (!container) return

  const pills = container.querySelectorAll<HTMLButtonElement>(".bookmarks-group-pill")
  const searchInput = container.querySelector<HTMLInputElement>(".bookmarks-search")
  const groups = container.querySelectorAll<HTMLElement>(".bookmarks-group")
  const allRows = container.querySelectorAll<HTMLElement>(".bookmark-row")

  let currentGroup = "category"

  function showGroup(mode: string) {
    currentGroup = mode
    groups.forEach((g) => {
      const gMode = g.getAttribute("data-group-mode")
      g.setAttribute("data-hidden", gMode !== mode ? "true" : "false")
    })
    pills.forEach((p) => {
      p.classList.toggle("active", p.getAttribute("data-group") === mode)
    })
    applySearch()
  }

  function applySearch() {
    const query = (searchInput?.value ?? "").trim().toLowerCase()
    const visibleGroups = container!.querySelectorAll<HTMLElement>(
      `.bookmarks-group[data-group-mode="${currentGroup}"]`,
    )

    visibleGroups.forEach((group) => {
      const rows = group.querySelectorAll<HTMLElement>(".bookmark-row")
      let anyVisible = false
      rows.forEach((row) => {
        const title = (row.getAttribute("data-title") ?? "").toLowerCase()
        const desc = (row.getAttribute("data-desc") ?? "").toLowerCase()
        const cat = (row.getAttribute("data-category") ?? "").toLowerCase()
        const match = !query || title.includes(query) || desc.includes(query) || cat.includes(query)
        row.setAttribute("data-hidden", match ? "false" : "true")
        if (match) anyVisible = true
      })
      group.setAttribute("data-hidden", anyVisible ? "false" : "true")
    })

    const emptyEl = container!.querySelector<HTMLElement>(".bookmarks-empty")
    if (emptyEl) {
      const anyGroupVisible = container!.querySelector(
        `.bookmarks-group[data-group-mode="${currentGroup}"]:not([data-hidden="true"])`,
      )
      emptyEl.style.display = anyGroupVisible ? "none" : "block"
    }
  }

  // pill click handlers
  pills.forEach((pill) => {
    const handler = () => {
      const mode = pill.getAttribute("data-group") ?? "category"
      showGroup(mode)
    }
    pill.addEventListener("click", handler)
    window.addCleanup(() => pill.removeEventListener("click", handler))
  })

  // search handler
  if (searchInput) {
    const handler = () => applySearch()
    searchInput.addEventListener("input", handler)
    window.addCleanup(() => searchInput.removeEventListener("input", handler))
  }

  // initial state
  showGroup("category")
})
