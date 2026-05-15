const folderFilterInit = () => {
    const bar = document.getElementById("folder-filter-bar")
    if (!bar) return
  
    const pills = Array.from(bar.querySelectorAll<HTMLButtonElement>(".folder-filter-pill"))
    const listEl = document.getElementById("folder-page-list")
    if (!listEl) return
  
    // Items are .folder-item-wrap with data-subfolder attribute
    const items = Array.from(listEl.querySelectorAll<HTMLElement>(".folder-item-wrap"))
    if (items.length === 0) return
  
    const applyFilter = (filter: string) => {
      items.forEach((item) => {
        const sub = item.dataset.subfolder ?? "__root__"
        if (filter === "__all__") {
          item.dataset.hidden = "false"
        } else if (filter === "__root__") {
          item.dataset.hidden = sub === "__root__" ? "false" : "true"
        } else {
          // filter is the subfolder slug e.g. "Apache-Flink"
          // sub is also the slug e.g. "Apache-Flink"
          item.dataset.hidden = sub === filter ? "false" : "true"
        }
      })
    }
  
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"))
        pill.classList.add("active")
        applyFilter(pill.dataset.filter ?? "__all__")
      })
    })
  
    // Show all on init
    applyFilter("__all__")
  }
  
  document.addEventListener("nav", folderFilterInit)
  
  export {}