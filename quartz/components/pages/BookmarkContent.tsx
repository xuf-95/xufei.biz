import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/bookmarks.scss"
import script from "../scripts/bookmarks.inline"
import { formatDate as formatSiteDate } from "../Date"
import path from "path"
import fs from "fs"

interface Bookmark {
  title: string
  url: string
  type: string
  category: string
  date: string
  description?: string
}

type GroupMode = "category" | "type" | "date"

const typeIcons: Record<string, string> = {
  link: `<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  github: `<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  video: `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  article: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="12" y="17" text-anchor="middle" font-size="6" fill="currentColor" stroke="none" font-weight="700">PDF</text></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  tools: `<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  design: `<svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
}

const externalLinkIcon = `<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`

function formatDate(dateStr: string): string {
  return formatSiteDate(new Date(dateStr + "T00:00:00"))
}

function getDateMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

function loadBookmarks(): Bookmark[] {
  const jsonPath = path.join(process.cwd(), "quartz", "static", "bookmarks.json")
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8")
    return JSON.parse(raw) as Bookmark[]
  } catch {
    return []
  }
}

function groupBy(bookmarks: Bookmark[], mode: GroupMode): Map<string, Bookmark[]> {
  const groups = new Map<string, Bookmark[]>()
  const sorted = [...bookmarks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  for (const bm of sorted) {
    let key: string
    switch (mode) {
      case "category":
        key = bm.category
        break
      case "type":
        key = bm.type.charAt(0).toUpperCase() + bm.type.slice(1)
        break
      case "date":
        key = getDateMonth(bm.date)
        break
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(bm)
  }
  return groups
}

function BookmarkRow({ bm }: { bm: Bookmark }) {
  const icon = typeIcons[bm.type] ?? typeIcons.link
  return (
    <a
      class="bookmark-row"
      href={bm.url}
      target="_blank"
      rel="noopener noreferrer"
      data-title={bm.title}
      data-desc={bm.description ?? ""}
      data-category={bm.category}
      data-type={bm.type}
      data-date={bm.date}
    >
      <div class="bookmark-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      <div class="bookmark-body">
        <span class="bookmark-title">
          {bm.title}
          <span class="external-icon" dangerouslySetInnerHTML={{ __html: externalLinkIcon }} />
        </span>
        {bm.description && <span class="bookmark-desc">{bm.description}</span>}
      </div>
      <div class="bookmark-meta">
        <span class="bookmark-category">{bm.category}</span>
        <span class="bookmark-date">{formatDate(bm.date)}</span>
      </div>
    </a>
  )
}

export default (() => {
  const BookmarkContent: QuartzComponent = (_props: QuartzComponentProps) => {
    const bookmarks = loadBookmarks()
    const modes: GroupMode[] = ["category", "type", "date"]
    const modeLabels: Record<GroupMode, string> = {
      category: "Category",
      type: "Type",
      date: "Date",
    }

    return (
      <div class="bookmarks-page popover-hint">
        <p style="color: var(--gray); font-size: 0.88rem; margin: 0 0 0.25rem;">
          {bookmarks.length} bookmarks
        </p>

        <div class="bookmarks-toolbar">
          <div class="bookmarks-group-bar">
            {modes.map((mode) => (
              <button
                class={`bookmarks-group-pill${mode === "category" ? " active" : ""}`}
                data-group={mode}
                type="button"
              >
                {modeLabels[mode]}
              </button>
            ))}
          </div>
          <input
            class="bookmarks-search"
            type="text"
            placeholder="Search bookmarks..."
            aria-label="Search bookmarks"
          />
        </div>

        {/* Render all three groupings; JS toggles visibility */}
        {modes.map((mode) => {
          const grouped = groupBy(bookmarks, mode)
          return Array.from(grouped.entries()).map(([groupName, items]) => (
            <div
              class="bookmarks-group"
              data-group-mode={mode}
              data-hidden={mode !== "category" ? "true" : "false"}
            >
              <h4 class="bookmarks-group-header">{groupName}</h4>
              <div class="bookmarks-list">
                {items.map((bm) => (
                  <BookmarkRow bm={bm} />
                ))}
              </div>
            </div>
          ))
        })}

        <div class="bookmarks-empty" style="display: none;">
          No bookmarks match your search.
        </div>
      </div>
    )
  }

  BookmarkContent.css = style
  BookmarkContent.afterDOMLoaded = script
  return BookmarkContent
}) satisfies QuartzComponentConstructor
