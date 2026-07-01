import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, PageListViewControls, SortFn } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import folderScript from "../scripts/folderFilter.inline"
import pageListViewScript from "../scripts/pageListView.inline"

interface FolderContentOptions {
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
}

type ContentLanguage = "EN" | "CN"

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
}

function normalizeLanguage(language: unknown): ContentLanguage {
  return language?.toString().toUpperCase() === "CN" ? "CN" : "EN"
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    // Strip "/index" suffix — Quartz sets slug as "bigdata/index" for folder pages
    const rawSlug = fileData.slug!
    const currentSlug = rawSlug.endsWith("/index")
      ? rawSlug.slice(0, -6) // remove "/index"
      : rawSlug === "index"
        ? "" // root folder
        : rawSlug

    // ── Collect ALL real files whose slug starts with currentSlug ──
    const pagesInFolder: QuartzPluginData[] = allFiles.filter((f) => {
      const slug = f.slug ?? ""
      // Skip any index files (folder index pages)
      if (slug === "index" || slug.endsWith("/index")) return false
      // Root folder: include everything except index files
      if (currentSlug === "") return true
      // Must start with "currentSlug/"
      return slug.startsWith(currentSlug + "/")
    })

    // ── Extract direct subfolder names ────────────────────────────
    // A file at "bigdata/Apache-Flink/Flink-CDC" → subfolder = "Apache-Flink"
    // A file at "bigdata/DCMM" → no subfolder (direct child)
    const subfolderSet = new Set<string>()
    pagesInFolder.forEach((page) => {
      const slug = page.slug ?? ""
      // Remove the currentSlug prefix: "bigdata/Apache-Flink/Flink-CDC" → "Apache-Flink/Flink-CDC"
      const relative = slug.slice(currentSlug.length + 1)
      const parts = relative.split("/")
      if (parts.length >= 2) {
        // Has a subfolder
        subfolderSet.add(parts[0])
      }
    })
    const subfolders = Array.from(subfolderSet).sort()

    // ── Check if there are direct (root-level) files ───────────────
    const hasRootFiles = pagesInFolder.some((page) => {
      const relative = (page.slug ?? "").slice(currentSlug.length + 1)
      return !relative.includes("/")
    })

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    // Attach subfolder info to each page as a custom field for rendering
    // We embed data-subfolder in a wrapper div via a custom list
    const annotatedPages = pagesInFolder.map((page) => {
      const slug = page.slug ?? ""
      const relative = slug.slice(currentSlug.length + 1)
      const parts = relative.split("/")
      const sub = parts.length >= 2 ? parts[0] : "__root__"
      const language = normalizeLanguage(page.frontmatter?.language)
      return { page, sub, language }
    })

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing" data-page-listing>
          {options.showFolderCount && (
            <p class="page-listing-count">
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: pagesInFolder.length,
              })}
            </p>
          )}
          <div class="folder-list-toolbar">
            {subfolders.length > 0 && (
              <div class="folder-filter-bar" id="folder-filter-bar" aria-label="Folder filter">
                <button class="folder-filter-pill active" data-filter="__all__">
                  All
                </button>
                {hasRootFiles && (
                  <button class="folder-filter-pill" data-filter="__root__">
                    {currentSlug.split("/").pop() || "root"}
                  </button>
                )}
                {subfolders.map((sub) => (
                  <button class="folder-filter-pill" data-filter={sub}>
                    {sub.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            )}
            <PageListViewControls />
          </div>

          {/* Page list — each item wrapped with data-subfolder */}
          <div id="folder-page-list" data-page-list-view data-view="list">
            {annotatedPages.map(({ page, sub, language }) => (
              <div class="folder-item-wrap" data-subfolder={sub} data-language={language}>
                <PageList {...props} sort={options.sort} allFiles={[page]} />
              </div>
            ))}
          </div>
        </div>
        {/* <hr /> */}
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css, folderFilterCss)
  FolderContent.afterDOMLoaded = concatenateResources(
    folderScript as unknown as string,
    pageListViewScript as unknown as string,
  )
  return FolderContent
}) satisfies QuartzComponentConstructor

const folderFilterCss = `
.folder-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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

.folder-list-toolbar .page-view-toolbar {
  flex: 0 0 auto;
  margin: 0 0 0 auto;
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

.folder-item-wrap[data-hidden="true"] {
  display: none !important;
}

#folder-page-list {
  --folder-list-rule: color-mix(in srgb, var(--darkgray) 15%, transparent);

  margin-top: 0.35rem;
}

#folder-page-list[data-view="card"] {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: 1.2rem 1rem;
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

.folder-item-wrap:last-child {
  border-bottom: 1px solid var(--folder-list-rule);
}

#folder-page-list[data-view="card"] .folder-item-wrap,
#folder-page-list[data-view="card"] .folder-item-wrap:last-child {
  border: 0;
}

#folder-page-list[data-view="card"] .folder-item-wrap,
#folder-page-list[data-view="card"] .folder-item-wrap ul.section-ul,
#folder-page-list[data-view="card"] .folder-item-wrap li.section-li {
  min-width: 0;
  height: 100%;
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

.folder-item-wrap .section {
  align-items: baseline;
  padding: 0.95rem 0;
}

#folder-page-list[data-view="card"] .folder-item-wrap .section {
  align-items: stretch;
  padding: 0;
}

.folder-item-wrap .section > .desc > h3 > a {
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}
`
