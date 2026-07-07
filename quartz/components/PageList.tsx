import { FullSlug, isAbsoluteURL, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

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
  return null
}

function getCardImageSrc(currentSlug: FullSlug, image: string): string {
  if (isAbsoluteURL(image)) return image
  if (image.startsWith("/content/")) return `/${image.slice("/content/".length)}`
  if (image.startsWith("/")) return image
  if (image.startsWith("content/")) {
    return resolveRelative(currentSlug, image.slice("content/".length) as FullSlug)
  }
  return resolveRelative(currentSlug, image as FullSlug)
}

function getCardImage(currentSlug: FullSlug, page: QuartzPluginData): string | undefined {
  const image = page.frontmatter?.cardImage
  if (typeof image === "string" && image.trim().length > 0) {
    return getCardImageSrc(currentSlug, image.trim())
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
        const description = page.frontmatter?.description
        const href = resolveRelative(fileData.slug!, page.slug!)
        const imageSrc = getCardImage(fileData.slug!, page)

        return (
          <li class={`section-li ${imageSrc ? "has-image" : ""}`}>
            <div class="section">
              <p class="section-date">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="section-body">
                <h3>
                  <a href={href} class="internal">
                    {title}
                  </a>
                </h3>
                {description && <p class="section-desc">{description}</p>}
              </div>
              {imageSrc && (
                <a href={href} class="internal section-image">
                  <img src={imageSrc} alt="" loading="lazy" decoding="async" />
                </a>
              )}
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
`
