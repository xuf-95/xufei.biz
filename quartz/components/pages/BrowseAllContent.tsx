import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { htmlToJsx } from "../../util/jsx"
import { Root } from "hast"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import folderScript from "../scripts/folderFilter.inline"
import { Icon } from "../Icon"
import { FOLDER_PAGE_LIMIT } from "./folderList"
import { byWikiPriority } from "./wikiSort"

interface BrowseAllContentOptions {
  sort?: SortFn
}

const defaultOptions: BrowseAllContentOptions = {}

export default ((opts?: Partial<BrowseAllContentOptions>) => {
  const options: BrowseAllContentOptions = { ...defaultOptions, ...opts }

  const BrowseAllContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles } = props

    // Folders to exclude from the browse listing
    const excludedFolders = ["hobby", "tools", "programmer", "good"]

    // Include ALL real pages (skip index files and excluded folders)
    const allPages: QuartzPluginData[] = allFiles
      .filter((f) => {
        const slug = f.slug ?? ""
        if (slug === "index" || slug.endsWith("/index")) return false
        const topFolder = slug.split("/")[0]
        if (excludedFolders.includes(topFolder)) return false
        return true
      })
      .sort(byWikiPriority)

    // Extract top-level folder names for filtering
    const subfolderSet = new Set<string>()
    allPages.forEach((page) => {
      const slug = page.slug ?? ""
      const parts = slug.split("/")
      if (parts.length >= 2) {
        subfolderSet.add(parts[0])
      }
    })
    const subfolders = Array.from(subfolderSet).sort()

    const nestedSubfolders = subfolders
      .map((parent) => {
        const children = new Set<string>()
        allPages.forEach((page) => {
          const parts = (page.slug ?? "").split("/")
          if (parts[0] === parent && parts.length >= 3) {
            children.add(parts[1])
          }
        })
        return { parent, children: Array.from(children).sort() }
      })
      .filter(({ children }) => children.length > 0)

    // Check if there are root-level files (no subfolder)
    const hasRootFiles = allPages.some((page) => {
      const slug = page.slug ?? ""
      return !slug.includes("/")
    })

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    const annotatedPages = allPages.map((page) => {
      const slug = page.slug ?? ""
      const parts = slug.split("/")
      const sub = parts.length >= 2 ? parts[0] : "__root__"
      const childFolder = parts.length >= 3 ? parts[1] : "__root__"
      const language = page.frontmatter?.language?.toString().toUpperCase() === "CN" ? "CN" : "EN"
      return { page, sub, childFolder, language }
    })

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing" data-page-listing>
          {subfolders.length > 0 && (
            <div class="folder-list-toolbar">
              <div class="folder-filter-bar" id="folder-filter-bar" aria-label="Folder filter">
                <button class="folder-filter-pill active" data-filter="__all__">
                  All
                </button>
                {hasRootFiles && (
                  <button class="folder-filter-pill" data-filter="__root__">
                    root
                  </button>
                )}
                {subfolders.map((sub) => (
                  <button class="folder-filter-pill" data-filter={sub}>
                    {sub.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {nestedSubfolders.length > 0 && (
            <div class="folder-subfilter-container">
              {nestedSubfolders.map(({ parent, children }) => (
                <div
                  class="folder-subfilter-panel"
                  data-parent-filter={parent}
                  aria-label={`${parent.replace(/-/g, " ")} subfolder filter`}
                  hidden
                >
                  <button class="folder-subfilter-pill active" data-subfilter="__all__">
                    All
                  </button>
                  {children.map((child) => (
                    <button class="folder-subfilter-pill" data-subfilter={child}>
                      {child.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div id="folder-page-list">
            {annotatedPages.map(({ page, sub, childFolder, language }, index) => (
              <div
                class="folder-item-wrap"
                data-subfolder={sub}
                data-child-folder={childFolder}
                data-language={language}
                data-hidden={index >= FOLDER_PAGE_LIMIT ? "true" : "false"}
              >
                <PageList {...props} sort={options.sort} allFiles={[page]} />
              </div>
            ))}
          </div>
          {annotatedPages.length > FOLDER_PAGE_LIMIT && (
            <button
              class="folder-list-more"
              type="button"
              aria-controls="folder-page-list"
              aria-expanded="false"
            >
              <span>See more</span>
              <Icon name="arrow-down" width="18" height="18" />
            </button>
          )}
        </div>
      </div>
    )
  }

  BrowseAllContent.css = concatenateResources(style, PageList.css, folderFilterCss)
  BrowseAllContent.afterDOMLoaded = folderScript as unknown as string
  return BrowseAllContent
}) satisfies QuartzComponentConstructor

const folderFilterCss = `
.folder-list-toolbar {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0.75rem 0 1.2rem;
  padding-bottom: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--darkgray) 16%, transparent);
}

.folder-filter-bar {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  align-items: center;
  gap: clamp(0.55rem, 1.7vw, 1.6rem);
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0.1rem 0 0.55rem;
  scrollbar-width: none;
}

.folder-filter-bar::-webkit-scrollbar {
  display: none;
}

.folder-filter-pill {
  position: relative;
  flex: 0 0 auto;
  padding: 0.42rem 0.62rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  font-family: var(--bodyFont);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.folder-filter-pill:hover {
  color: var(--dark);
  background: color-mix(in srgb, var(--lightgray) 38%, transparent);
}

.folder-filter-pill.active {
  background: color-mix(in srgb, var(--lightgray) 55%, transparent);
  color: var(--dark);
}

.folder-filter-pill.active::after {
  content: "";
  position: absolute;
  left: 0.08rem;
  right: 0.08rem;
  bottom: calc(-0.55rem + 1px);
  height: 2px;
  border-radius: 999px;
  background: var(--dark);
}

.folder-subfilter-container:not(:has(.folder-subfilter-panel:not([hidden]))) {
  display: none;
}

.folder-subfilter-panel {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.45rem;
  margin: -0.55rem 0 1.2rem;
  overflow-x: auto;
  padding: 0.2rem 0 0.65rem;
  border-bottom: 1px solid color-mix(in srgb, var(--darkgray) 12%, transparent);
  scrollbar-width: none;
  animation: folder-subfilter-reveal 0.16s ease-out;
}

.folder-subfilter-panel[hidden],
.folder-subfilter-panel::-webkit-scrollbar {
  display: none;
}

.folder-subfilter-pill {
  flex: 0 0 auto;
  padding: 0.32rem 0.58rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  font-family: var(--bodyFont);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.folder-subfilter-pill:hover {
  border-color: color-mix(in srgb, var(--darkgray) 18%, transparent);
  color: var(--dark);
}

.folder-subfilter-pill.active {
  border-color: color-mix(in srgb, var(--darkgray) 22%, transparent);
  background: color-mix(in srgb, var(--lightgray) 38%, transparent);
  color: var(--dark);
}

@keyframes folder-subfilter-reveal {
  from {
    opacity: 0;
    transform: translateY(-0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.folder-item-wrap[data-hidden="true"] {
  display: none !important;
}

.folder-list-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 3.25rem;
  margin: 1.15rem 0 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.55rem;
  background: var(--light);
  color: var(--gray);
  cursor: pointer;
  font-family: var(--bodyFont);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.folder-list-more:hover {
  border-color: var(--gray);
  background: var(--highlight);
  color: var(--dark);
}

.folder-list-more:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}

.folder-list-more[hidden] {
  display: none;
}

.folder-list-more svg {
  flex: 0 0 auto;
}

#folder-page-list {
  --folder-list-rule: color-mix(in srgb, var(--darkgray) 15%, transparent);
  margin-top: 0.35rem;
}

#folder-page-list:has(.folder-item-wrap:hover) .folder-item-wrap,
#folder-page-list:has(.folder-item-wrap:focus-within) .folder-item-wrap {
  opacity: 0.46;
}

#folder-page-list:has(.folder-item-wrap:hover) .folder-item-wrap:hover,
#folder-page-list:has(.folder-item-wrap:focus-within) .folder-item-wrap:focus-within {
  opacity: 1;
}

.folder-item-wrap {
  border-top: 1px solid var(--folder-list-rule);
  transition: opacity 0.18s ease;
}

.folder-item-wrap:first-child,
.folder-item-wrap[data-hidden="true"] + .folder-item-wrap:not([data-hidden="true"]) {
  border-top: none;
}

.folder-item-wrap:last-child {
  border-bottom: 1px solid var(--folder-list-rule);
}

.folder-item-wrap .page-listing {
  display: contents;
}

.folder-item-wrap ul.section-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.folder-item-wrap li.section-li {
  margin: 0;
}

.folder-item-wrap .section > .section-body > h3 > a {
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}
`
