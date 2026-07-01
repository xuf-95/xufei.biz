import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, getAllSegmentPrefixes, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface TagTreemapOptions {
  variant: "index" | "home"
  title: string
  showHeader: boolean
  showTotal: boolean
}

const defaultOptions: TagTreemapOptions = {
  variant: "index",
  title: "Tag Map",
  showHeader: false,
  showTotal: false,
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface TItem {
  tag: string
  count: number
  area: number
  rect?: Rect
}

export interface TagGroup {
  tag: string
  pages: QuartzPluginData[]
}

export function getTagGroups(allFiles: QuartzPluginData[]): TagGroup[] {
  const tagItemMap = new Map<string, QuartzPluginData[]>()

  for (const file of allFiles) {
    const tags = [...new Set((file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes))]
    for (const tag of tags) {
      const pages = tagItemMap.get(tag) ?? []
      pages.push(file)
      tagItemMap.set(tag, pages)
    }
  }

  return [...tagItemMap.entries()]
    .map(([tag, pages]) => ({ tag, pages }))
    .sort((a, b) => a.tag.localeCompare(b.tag))
}

function layoutRow(
  items: Array<TItem & { sa: number }>,
  x: number,
  y: number,
  w: number,
  h: number,
  result: TItem[],
) {
  if (items.length === 0) return
  const horiz = w >= h
  const row: Array<TItem & { sa: number }> = []
  let rowArea = 0
  let best = Infinity

  for (let i = 0; i < items.length; i++) {
    const cur = items[i]
    const testRow = [...row, cur]
    const testArea = rowArea + cur.sa
    const rowLen = horiz ? testArea / h : testArea / w
    let worst = 0

    for (const it of testRow) {
      const dim = it.sa / rowLen
      const cw = horiz ? rowLen : dim
      const ch = horiz ? dim : rowLen
      worst = Math.max(worst, Math.max(cw / ch, ch / cw))
    }

    if (row.length > 0 && worst > best) break
    row.push(cur)
    rowArea += cur.sa
    best = worst
  }

  const rowLen = horiz ? rowArea / h : rowArea / w
  let pos = horiz ? y : x

  for (const it of row) {
    const dim = it.sa / rowLen
    const rect: Rect = horiz ? { x, y: pos, w: rowLen, h: dim } : { x: pos, y, w: dim, h: rowLen }
    result.push({ ...it, rect })
    pos += dim
  }

  const rest = items.slice(row.length) as Array<TItem & { sa: number }>
  if (rest.length > 0) {
    if (horiz) layoutRow(rest, x + rowLen, y, w - rowLen, h, result)
    else layoutRow(rest, x, y + rowLen, w, h - rowLen, result)
  }
}

function squarify(items: TItem[], x: number, y: number, w: number, h: number): TItem[] {
  if (items.length === 0) return []
  const total = items.reduce((s, i) => s + i.area, 0)
  const scale = (w * h) / total
  const sorted = [...items].sort((a, b) => b.area - a.area)
  const scaled = sorted.map((i) => ({ ...i, sa: i.area * scale }))
  const result: TItem[] = []
  layoutRow(scaled, x, y, w, h, result)
  return result
}

function fitLabel(label: string, width: number, fontSize: number) {
  const maxChars = Math.max(3, Math.floor(width / (fontSize * 0.58)))
  if (label.length <= maxChars) return label
  return `${label.slice(0, Math.max(1, maxChars - 3))}...`
}

const VW = 1000
const VH = 500
const GAP = 3

export const tagTreemapCss = `
.tag-treemap-wrap {
  margin: 1rem 0 2rem 0;
  width: 100%;
}

.tag-treemap {
  display: block;
  width: 100%;
  height: auto;
}

.treemap-rect {
  fill: var(--highlight);
  transition: fill 0.15s ease;
}

.treemap-rect--other {
  fill: var(--lightgray);
  opacity: 0.6;
}

.treemap-cell-link:hover .treemap-rect,
.treemap-cell-link:focus-visible .treemap-rect {
  fill: var(--secondary);
  opacity: 0.85;
}

.treemap-label {
  fill: var(--dark);
  font-family: var(--bodyFont);
  font-weight: 600;
  pointer-events: none;
}

.treemap-count {
  fill: var(--gray);
  font-family: var(--bodyFont);
  pointer-events: none;
}

.treemap-cell-link {
  cursor: pointer;
  text-decoration: none;
}

.home-tag-map {
  grid-column: 1 / -1;
  margin: 2.5rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--lightgray);
}

.home-tag-map__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.home-tag-map__header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.home-tag-map__meta {
  margin: 0;
  color: var(--gray);
  font-size: 0.95rem;
}

.home-tag-map__all {
  white-space: nowrap;
  font-weight: 700;
}

.home-tag-map .tag-treemap-wrap {
  margin-bottom: 0;
}

body[data-slug="index"] #quartz-body .center .page-footer {
  box-sizing: border-box;
  width: min(calc(100vw - 4rem), 1080px);
  max-width: 100%;
  margin-left: 50%;
  transform: translateX(-50%);
}

@media all and (max-width: 800px) {
  html:has(body[data-slug="index"]),
  body[data-slug="index"],
  body[data-slug="index"] .page {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  body[data-slug="index"] #quartz-root,
  body[data-slug="index"] #quartz-body,
  body[data-slug="index"] #quartz-body .center,
  body[data-slug="index"] #quartz-body .center > article {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    overflow-x: hidden !important;
  }

  body[data-slug="index"] #quartz-body .center > article p,
  body[data-slug="index"] #quartz-body .center > article li {
    overflow-wrap: anywhere;
  }

  body[data-slug="index"] #quartz-body .sidebar.left {
    height: unset !important;
    min-height: 0 !important;
    position: initial !important;
    padding: 0 !important;
  }

  body[data-slug="index"] #quartz-body .center .page-footer {
    width: 100%;
    margin-left: 0;
    transform: none;
  }

  .home-tag-map {
    margin-top: 2rem;
    padding-top: 1rem;
  }

  .home-tag-map__header {
    align-items: start;
    flex-direction: column;
    gap: 0.4rem;
  }
}
`

export default ((opts?: Partial<TagTreemapOptions>) => {
  const options: TagTreemapOptions = { ...defaultOptions, ...opts }

  const TagTreemap: QuartzComponent = ({
    allFiles,
    cfg,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const groups = getTagGroups(allFiles)
    const mainItems: TItem[] = []
    const otherTags: TagGroup[] = []

    for (const group of groups) {
      const count = group.pages.length
      if (count < 2) {
        otherTags.push(group)
      } else {
        mainItems.push({ tag: group.tag, count, area: count })
      }
    }

    const otherArticleCount = otherTags.reduce((s, group) => s + group.pages.length, 0)
    const otherArea = Math.max(
      otherArticleCount,
      mainItems.length > 0 ? mainItems[0].area * 0.3 : 10,
    )

    const allItems: TItem[] =
      otherTags.length > 0
        ? [...mainItems, { tag: "__other__", count: otherTags.length, area: otherArea }]
        : mainItems

    allItems.sort((a, b) => b.area - a.area)
    const otherIdx = allItems.findIndex((i) => i.tag === "__other__")
    if (otherIdx > -1) {
      const [otherItem] = allItems.splice(otherIdx, 1)
      allItems.push(otherItem)
    }

    const laid = squarify(allItems, 0, 0, VW, VH)
    const totalLabel = i18n(cfg.locale).pages.tagContent.totalTags({ count: groups.length })
    const allTagsHref = resolveRelative(fileData.slug!, "/tags/" as FullSlug)
    const treemap = (
      <div class="tag-treemap-wrap">
        <svg
          class="tag-treemap"
          viewBox={"0 0 " + VW + " " + VH}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={totalLabel}
        >
          {laid.map((item) => {
            if (!item.rect) return null
            const { x, y, w, h } = item.rect
            const rx = x + GAP / 2
            const ry = y + GAP / 2
            const rw = w - GAP
            const rh = h - GAP
            if (rw <= 2 || rh <= 2) return null

            const isOther = item.tag === "__other__"

            if (isOther) {
              const fs = Math.min(Math.max(Math.min(rw / 7, rh / 3.2), 12), 22)
              const cs = Math.max(fs - 4, 9)
              return (
                <g>
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    rx="0"
                    class="treemap-rect treemap-rect--other"
                  />
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 - fs * 0.45}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={fs}
                    class="treemap-label"
                  >
                    other
                  </text>
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 + fs * 0.62}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={cs}
                    class="treemap-count"
                  >
                    {otherTags.length} tags
                  </text>
                </g>
              )
            }

            const tagListingPage = ("/tags/" + item.tag) as FullSlug
            const href = resolveRelative(fileData.slug!, tagListingPage)
            const fs = Math.min(Math.max(Math.min(rw / 7, rh / 2.8), 10), 22)
            const cs = Math.max(fs - 4, 9)
            const showCount = rh > 35 && rw > 35
            const label = fitLabel(item.tag, rw - 8, fs)

            return (
              <a href={href} class="treemap-cell-link">
                <title>
                  {item.tag}: {item.count}
                </title>
                <rect x={rx} y={ry} width={rw} height={rh} rx="0" class="treemap-rect" />
                <text
                  x={rx + rw / 2}
                  y={ry + (showCount ? rh * 0.42 : rh / 2)}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-size={fs}
                  class="treemap-label"
                >
                  {label}
                </text>
                {showCount && (
                  <text
                    x={rx + rw / 2}
                    y={ry + rh * 0.42 + fs + 3}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={cs}
                    class="treemap-count"
                  >
                    {item.count}
                  </text>
                )}
              </a>
            )
          })}
        </svg>
      </div>
    )

    if (!options.showHeader && !options.showTotal) {
      return treemap
    }

    return (
      <section class={classNames(displayClass, `tag-treemap-section ${options.variant}-tag-map`)}>
        {options.showHeader && (
          <div class={`${options.variant}-tag-map__header`}>
            <div>
              <h2>{options.title}</h2>
              {options.showTotal && <p class={`${options.variant}-tag-map__meta`}>{totalLabel}</p>}
            </div>
            <a class={`${options.variant}-tag-map__all internal`} href={allTagsHref}>
              All tags
            </a>
          </div>
        )}
        {!options.showHeader && options.showTotal && <p>{totalLabel}</p>}
        {treemap}
      </section>
    )
  }

  TagTreemap.css = tagTreemapCss
  return TagTreemap
}) satisfies QuartzComponentConstructor<Partial<TagTreemapOptions> | undefined>
