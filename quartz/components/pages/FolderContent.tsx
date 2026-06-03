import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import folderScript from "../scripts/folderFilter.inline"

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

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const baseDir = url.pathname

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

    const isIndexListing = currentSlug === "" || currentSlug === "index"
    const showLanguageFilter = isIndexListing && annotatedPages.length > 0

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing">
          {options.showFolderCount && (
            <p class="page-listing-count">
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: pagesInFolder.length,
              })}
            </p>
          )}

          {showLanguageFilter && (
            <div class="language-filter-bar" id="language-filter-bar" aria-label="Language filter">
              <button class="language-filter-pill active" data-language-filter="__all__">
                All
              </button>
              <button class="language-filter-pill" data-language-filter="EN">
                EN
              </button>
              <button class="language-filter-pill" data-language-filter="CN">
                CN
              </button>
            </div>
          )}

          {/* Filter pills — only show if there are subfolders */}
          {subfolders.length > 0 && (
            <div class="folder-filter-bar" id="folder-filter-bar">
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

          {/* Page list — each item wrapped with data-subfolder */}
          <div id="folder-page-list">
            {annotatedPages.map(({ page, sub, language }) => (
              <div class="folder-item-wrap" data-subfolder={sub} data-language={language}>
                <PageList {...props} sort={options.sort} allFiles={[page]} />
              </div>
            ))}
          </div>
        </div>
        <a href={baseDir} class="internal">
          {i18n(cfg.locale).pages.error.home}
        </a>
        {/* <hr /> */}
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css, folderFilterCss)
  FolderContent.afterDOMLoaded = folderScript
  return FolderContent
}) satisfies QuartzComponentConstructor

const folderFilterCss = `
.language-filter-bar,
.folder-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.language-filter-bar {
  margin-bottom: 0.7rem;
}

.folder-filter-bar {
  margin-bottom: 1.2rem;
}

.language-filter-pill,
.folder-filter-pill {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--lightgray);
  background: transparent;
  color: var(--gray);
  font-family: var(--bodyFont);
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
}

.language-filter-pill:hover,
.folder-filter-pill:hover {
  border-color: var(--darkgray);
  color: var(--dark);
}

.language-filter-pill.active,
.folder-filter-pill.active {
  background: var(--dark);
  color: var(--light);
  border-color: var(--dark);
}

.folder-item-wrap[data-hidden="true"] {
  display: none !important;
}

.folder-item-wrap .page-listing {
  display: contents;
}

.folder-item-wrap ul.section-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
`
