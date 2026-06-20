const folderFilterInit = () => {
  const folderBar = document.getElementById("folder-filter-bar")
  const languageBar = document.getElementById("language-filter-bar")
  const listEl = document.getElementById("folder-page-list")
  if (!listEl) return

  // Items are .folder-item-wrap with data-subfolder attribute
  const items = Array.from(listEl.querySelectorAll<HTMLElement>(".folder-item-wrap"))
  if (items.length === 0) return

  const folderPills = folderBar
    ? Array.from(folderBar.querySelectorAll<HTMLButtonElement>(".folder-filter-pill"))
    : []
  const languagePills = languageBar
    ? Array.from(languageBar.querySelectorAll<HTMLButtonElement>(".language-filter-pill"))
    : []
  let activeFolderFilter = "__all__"
  let activeLanguageFilter = "__all__"

  const applyFilters = () => {
    items.forEach((item) => {
      const sub = item.dataset.subfolder ?? "__root__"
      const language = item.dataset.language ?? "EN"
      const matchesFolder =
        activeFolderFilter === "__all__" ||
        (activeFolderFilter === "__root__" && sub === "__root__") ||
        sub === activeFolderFilter
      const matchesLanguage =
        activeLanguageFilter === "__all__" || language === activeLanguageFilter
      item.dataset.hidden = matchesFolder && matchesLanguage ? "false" : "true"
    })
  }

  folderPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      folderPills.forEach((p) => p.classList.remove("active"))
      pill.classList.add("active")
      activeFolderFilter = pill.dataset.filter ?? "__all__"
      applyFilters()
    })
  })

  languagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      languagePills.forEach((p) => p.classList.remove("active"))
      pill.classList.add("active")
      activeLanguageFilter = pill.dataset.languageFilter ?? "__all__"
      applyFilters()
    })
  })

  // Show all on init
  applyFilters()
}

document.addEventListener("nav", folderFilterInit)

export default folderFilterInit
