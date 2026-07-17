import { getFolderItemVisibility, hasFolderListOverflow } from "../pages/folderList"

const folderFilterInit = () => {
  const folderBar = document.getElementById("folder-filter-bar")
  const languageBar = document.getElementById("language-filter-bar")
  const listEl = document.getElementById("folder-page-list")
  if (!listEl) return
  if (listEl.dataset.folderFilterBound === "true") return
  listEl.dataset.folderFilterBound = "true"

  // Items are .folder-item-wrap with data-subfolder attribute
  const items = Array.from(listEl.querySelectorAll<HTMLElement>(".folder-item-wrap"))
  if (items.length === 0) return

  const folderPills = folderBar
    ? Array.from(folderBar.querySelectorAll<HTMLButtonElement>(".folder-filter-pill"))
    : []
  const languagePills = languageBar
    ? Array.from(languageBar.querySelectorAll<HTMLButtonElement>(".language-filter-pill"))
    : []
  const moreButton = listEl.parentElement?.querySelector<HTMLButtonElement>(".folder-list-more")
  let activeFolderFilter = "__all__"
  let activeLanguageFilter = "__all__"
  let expanded = false

  const applyFilters = () => {
    const matches = items.map((item) => {
      const sub = item.dataset.subfolder ?? "__root__"
      const language = item.dataset.language ?? "EN"
      const matchesFolder =
        activeFolderFilter === "__all__" ||
        (activeFolderFilter === "__root__" && sub === "__root__") ||
        sub === activeFolderFilter
      const matchesLanguage =
        activeLanguageFilter === "__all__" || language === activeLanguageFilter
      return matchesFolder && matchesLanguage
    })
    const visibility = getFolderItemVisibility(matches, expanded)

    items.forEach((item, index) => {
      item.dataset.hidden = visibility[index] ? "false" : "true"
    })

    if (moreButton) {
      moreButton.hidden = expanded || !hasFolderListOverflow(matches)
      moreButton.setAttribute("aria-expanded", expanded ? "true" : "false")
    }
  }

  folderPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      folderPills.forEach((p) => p.classList.remove("active"))
      pill.classList.add("active")
      activeFolderFilter = pill.dataset.filter ?? "__all__"
      expanded = false
      applyFilters()
    })
  })

  languagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      languagePills.forEach((p) => p.classList.remove("active"))
      pill.classList.add("active")
      activeLanguageFilter = pill.dataset.languageFilter ?? "__all__"
      expanded = false
      applyFilters()
    })
  })

  if (moreButton) {
    const expandList = () => {
      expanded = true
      applyFilters()
    }
    moreButton.addEventListener("click", expandList)
    window.addCleanup?.(() => moreButton.removeEventListener("click", expandList))
  }

  // Show all on init
  applyFilters()
}

document.addEventListener("nav", folderFilterInit)
folderFilterInit()

export default folderFilterInit
