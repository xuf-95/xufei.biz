const imageSelector = "article img:not([data-no-zoom])"

document.addEventListener("nav", () => {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(imageSelector)).filter(
    (image) => !image.closest("a, button, .no-image-zoom"),
  )

  if (images.length === 0) return

  const lightbox = document.createElement("div")
  lightbox.className = "image-lightbox"
  lightbox.hidden = true
  lightbox.setAttribute("role", "dialog")
  lightbox.setAttribute("aria-modal", "true")
  lightbox.setAttribute("aria-label", "Image preview")

  const preview = document.createElement("img")
  preview.className = "image-lightbox-preview"
  preview.alt = ""

  const closeButton = document.createElement("button")
  closeButton.className = "image-lightbox-close"
  closeButton.type = "button"
  closeButton.setAttribute("aria-label", "Close image preview")
  closeButton.textContent = "\u00d7"

  lightbox.append(preview, closeButton)
  document.body.append(lightbox)

  let trigger: HTMLImageElement | null = null
  let previousOverflow = ""

  const close = () => {
    if (lightbox.hidden) return

    lightbox.hidden = true
    preview.removeAttribute("src")
    document.body.style.overflow = previousOverflow
    trigger?.focus()
    trigger = null
  }

  const open = (image: HTMLImageElement) => {
    trigger = image
    preview.src = image.currentSrc || image.src
    preview.alt = image.alt
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    lightbox.hidden = false
    closeButton.focus()
  }

  const onBackdropClick = (event: MouseEvent) => {
    if (event.target === lightbox) close()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      event.preventDefault()
      close()
    }
  }

  lightbox.addEventListener("click", onBackdropClick)
  closeButton.addEventListener("click", close)
  document.addEventListener("keydown", onKeyDown)

  for (const image of images) {
    const originalTabIndex = image.getAttribute("tabindex")
    const originalRole = image.getAttribute("role")
    const originalAriaLabel = image.getAttribute("aria-label")

    image.classList.add("image-zoomable")
    image.tabIndex = 0
    image.setAttribute("role", "button")
    image.setAttribute(
      "aria-label",
      image.alt ? `View larger image: ${image.alt}` : "View larger image",
    )

    const onClick = () => open(image)
    const onImageKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        open(image)
      }
    }

    image.addEventListener("click", onClick)
    image.addEventListener("keydown", onImageKeyDown)

    window.addCleanup(() => {
      image.removeEventListener("click", onClick)
      image.removeEventListener("keydown", onImageKeyDown)
      image.classList.remove("image-zoomable")

      const restoreAttribute = (name: string, value: string | null) => {
        if (value === null) image.removeAttribute(name)
        else image.setAttribute(name, value)
      }

      restoreAttribute("tabindex", originalTabIndex)
      restoreAttribute("role", originalRole)
      restoreAttribute("aria-label", originalAriaLabel)
    })
  }

  window.addCleanup(() => {
    lightbox.removeEventListener("click", onBackdropClick)
    closeButton.removeEventListener("click", close)
    document.removeEventListener("keydown", onKeyDown)
    document.body.style.overflow = previousOverflow
    lightbox.remove()
  })
})
