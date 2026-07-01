const setPageListView = (
  listing: HTMLElement,
  list: HTMLElement,
  buttons: HTMLButtonElement[],
  view: "list" | "card",
) => {
  list.dataset.view = view
  listing.dataset.view = view
  buttons.forEach((button) => {
    const isActive = button.dataset.pageView === view
    button.classList.toggle("active", isActive)
    button.setAttribute("aria-pressed", isActive.toString())
  })
}

const pageListViewInit = () => {
  const listings = Array.from(document.querySelectorAll<HTMLElement>("[data-page-listing]"))

  for (const listing of listings) {
    const controls = listing.querySelector<HTMLElement>("[data-page-view-controls]")
    const list = listing.querySelector<HTMLElement>("[data-page-list-view]")
    if (!controls || !list) continue

    const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>("[data-page-view]"))
    setPageListView(listing, list, buttons, list.dataset.view === "card" ? "card" : "list")
  }

  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".section-card-media img"))
  images.forEach((image) => {
    const media = image.closest<HTMLElement>(".section-card-media")
    if (!media) return
    if (image.dataset.cardImageBound === "true") return
    image.dataset.cardImageBound = "true"

    const markMissing = () => {
      image.hidden = true
      media.classList.add("is-missing-image")
    }

    image.addEventListener("error", markMissing)
    window.addCleanup?.(() => image.removeEventListener("error", markMissing))

    if (image.complete && image.naturalWidth === 0) {
      markMissing()
    }
  })
}

document.addEventListener("click", (event) => {
  const target = event.target
  if (!(target instanceof Element)) return

  const button = target.closest<HTMLButtonElement>("[data-page-view]")
  if (!button) return

  const listing = button.closest<HTMLElement>("[data-page-listing]")
  const controls = listing?.querySelector<HTMLElement>("[data-page-view-controls]")
  const list = listing?.querySelector<HTMLElement>("[data-page-list-view]")
  if (!listing || !controls || !list) return

  event.preventDefault()
  const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>("[data-page-view]"))
  setPageListView(listing, list, buttons, button.dataset.pageView === "card" ? "card" : "list")
})

document.addEventListener("nav", pageListViewInit)
pageListViewInit()

export default pageListViewInit
