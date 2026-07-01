import { FullSlug, isAbsoluteURL, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"
import { Icon } from "./Icon"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // If both are folders or both are files, sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

export function PageListViewControls() {
  return (
    <div class="page-view-toolbar" data-page-view-controls aria-label="Page view">
      <button
        class="page-view-button"
        type="button"
        data-page-view="card"
        aria-label="Card view"
        aria-pressed="false"
        title="Card view"
      >
        <Icon name="grid" />
      </button>
      <button
        class="page-view-button active"
        type="button"
        data-page-view="list"
        aria-label="List view"
        aria-pressed="true"
        title="List view"
      >
        <Icon name="menu" />
      </button>
    </div>
  )
}

function getFolderName(slug: FullSlug | undefined): string {
  const folder = slug?.split("/").filter(Boolean).slice(0, -1).at(-1)

  if (!folder) return "root"

  let decoded = folder
  try {
    decoded = decodeURIComponent(folder)
  } catch {
    decoded = folder
  }

  return decoded
    .replace(/-+and-+/gi, " & ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getInitials(title: string | undefined): string {
  const text = title?.trim() || "Untitled"
  return [...text].slice(0, 2).join("").toUpperCase()
}

function getFrontmatterImage(page: QuartzPluginData, keys: string[]): string | undefined {
  for (const key of keys) {
    const image = page.frontmatter?.[key]
    if (typeof image === "string" && image.trim().length > 0) {
      return image.trim()
    }
  }
}

function getContentImageSrc(currentSlug: FullSlug, image: string): string {
  if (isAbsoluteURL(image)) return image

  if (image.startsWith("/content/")) {
    return `/${image.slice("/content/".length)}`
  }

  if (image.startsWith("/")) return image

  if (image.startsWith("content/")) {
    return resolveRelative(currentSlug, image.slice("content/".length) as FullSlug)
  }

  return resolveRelative(currentSlug, image as FullSlug)
}

type CardImageInfo = {
  src: string
  fit: "cover" | "contain"
}

function getCardImageInfo(
  currentSlug: FullSlug,
  page: QuartzPluginData,
): CardImageInfo | undefined {
  const cardImage = getFrontmatterImage(page, ["cardImage", "thumbnail"])
  if (cardImage) {
    return {
      src: getContentImageSrc(currentSlug, cardImage),
      fit: "cover",
    }
  }

  const image = page.frontmatter?.socialImage
  if (typeof image === "string" && image.length > 0) {
    return {
      src:
        isAbsoluteURL(image) || image.startsWith("/")
          ? image
          : resolveRelative(currentSlug, `static/${image}` as FullSlug),
      fit: "cover",
    }
  }
}

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = [...allFiles].sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const tags = page.frontmatter?.tags ?? []
        const href = resolveRelative(fileData.slug!, page.slug!)
        const imageInfo = getCardImageInfo(fileData.slug!, page)
        const folderName = getFolderName(page.slug)

        return (
          <li class="section-li">
            <div class="section">
              <a
                href={href}
                class="internal section-card-media"
                aria-label={title}
                data-image-fit={imageInfo?.fit}
              >
                {imageInfo && <img src={imageInfo.src} alt="" loading="lazy" decoding="async" />}
                <span class="section-card-placeholder" aria-hidden="true">
                  {getInitials(title)}
                </span>
              </a>
              <p class="meta section-list-date">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="desc">
                <h3>
                  <a href={href} class="internal">
                    {title}
                  </a>
                </h3>
              </div>
              <div class="section-card-details">
                <span class="section-card-folder">{folderName}</span>
                <span class="section-card-date">
                  {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
                </span>
              </div>
              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
`
