import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

interface Rect { x: number; y: number; w: number; h: number }
interface TItem { tag: string; count: number; area: number; rect?: Rect }

function layoutRow(
  items: Array<TItem & { sa: number }>,
  x: number, y: number, w: number, h: number,
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
    const rect: Rect = horiz
      ? { x, y: pos, w: rowLen, h: dim }
      : { x: pos, y, w: dim, h: rowLen }
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
  // Sort descending by area for correct squarify behavior (largest first = top-left)
  const sorted = [...items].sort((a, b) => b.area - a.area)
  const scaled = sorted.map((i) => ({ ...i, sa: i.area * scale }))
  const result: TItem[] = []
  layoutRow(scaled, x, y, w, h, result)
  return result
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const allPagesWithTag = (tag: string) =>
      allFiles.filter((file) =>
        (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
      )

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    if (tag === "/") {
      const tags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))

      const tagItemMap: Map<string, QuartzPluginData[]> = new Map()
      for (const t of tags) {
        tagItemMap.set(t, allPagesWithTag(t))
      }

      // Use a fixed viewBox ratio; actual width is controlled by CSS (100% of body)
      // viewBox aspect ratio = 2:1
      const VW = 1000
      const VH = 500
      const GAP = 3

      const totalCount = tags.reduce((s, t) => s + tagItemMap.get(t)!.length, 0)

      const mainItems: TItem[] = []
      const otherTags: string[] = []

      for (const t of tags) {
        const count = tagItemMap.get(t)!.length
        if (count < 2) {
          otherTags.push(t)
        } else {
          mainItems.push({ tag: t, count, area: count })
        }
      }

      const otherCount = otherTags.length

      // "other" block: fixed area proportional to its article count
      const otherArticleCount = otherTags.reduce((s, t) => s + tagItemMap.get(t)!.length, 0)
      // Give "other" a minimum visible area
      const otherArea = Math.max(otherArticleCount, mainItems.length > 0 ? mainItems[0].area * 0.3 : 10)

      // Add "other" as a real treemap item so it's placed inside the grid
      const allItems: TItem[] =
        otherCount > 0
          ? [...mainItems, { tag: "__other__", count: otherCount, area: otherArea }]
          : mainItems

      // Sort descending by area → largest top-left, smallest bottom-right
      allItems.sort((a, b) => b.area - a.area)

      // Move __other__ to last so it lands bottom-right naturally after sort
      const otherIdx = allItems.findIndex((i) => i.tag === "__other__")
      if (otherIdx > -1) {
        const [otherItem] = allItems.splice(otherIdx, 1)
        allItems.push(otherItem)
      }

      const laid = squarify(allItems, 0, 0, VW, VH)

      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <p>{i18n(cfg.locale).pages.tagContent.totalTags({ count: tags.length })}</p>

          <div class="tag-treemap-wrap">
            <svg
              class="tag-treemap"
              viewBox={"0 0 " + VW + " " + VH}
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
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
                  return (
                    <g>
                      <rect
                        x={rx} y={ry} width={rw} height={rh}
                        rx="0"
                        class="treemap-rect treemap-rect--other"
                      />
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 - 10}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        font-size="18"
                        class="treemap-label"
                      >
                        other
                      </text>
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 10}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        font-size="13"
                        class="treemap-count"
                      >
                        {otherCount} tags
                      </text>
                    </g>
                  )
                }

                const tagListingPage = ("/tags/" + item.tag) as FullSlug
                const href = resolveRelative(fileData.slug!, tagListingPage)
                const fs = Math.min(Math.max(Math.min(rw / 7, rh / 2.8), 10), 22)
                const cs = Math.max(fs - 4, 9)
                const showCount = rh > 35 && rw > 35

                return (
                  <a href={href} class="treemap-cell-link">
                    <rect
                      x={rx} y={ry} width={rw} height={rh}
                      rx="0"
                      class="treemap-rect"
                    />
                    <text
                      x={rx + rw / 2}
                      y={ry + (showCount ? rh * 0.42 : rh / 2)}
                      text-anchor="middle"
                      dominant-baseline="middle"
                      font-size={fs}
                      class="treemap-label"
                    >
                      {item.tag}
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

          <div>
            {tags.map((tag) => {
              const pages = tagItemMap.get(tag)!
              const listProps = {
                ...props,
                allFiles: pages,
              }

              const contentPage = allFiles.filter((file) => file.slug === `tags/${tag}`).at(0)

              const root = contentPage?.htmlAst
              const tagContent =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)

              return (
                <div class="tag-section">
                  <div class="tag-section-left">
                    <h2>
                      <a class="internal tag-link" href={href}>
                        {tag}
                      </a>
                    </h2>
                    <p class="tag-count">
                      {i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}
                      {pages.length > options.numPages && (
                        <>
                          {" "}
                          <span>
                            {i18n(cfg.locale).pages.tagContent.showingFirst({
                              count: options.numPages,
                            })}
                          </span>
                        </>
                      )}
                    </p>
                    {tagContent && <p>{tagContent}</p>}
                  </div>
                  <div class="tag-section-right">
                    <PageList limit={options.numPages} {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)
      const listProps = {
        ...props,
        allFiles: pages,
      }

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <p>{i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
            <div>
              <PageList {...listProps} sort={options?.sort} />
            </div>
          </div>
        </div>
      )
    }
  }

  const tagIndexCss = `
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

.treemap-cell-link:hover .treemap-rect {
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

.tag-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-left {
  padding: 1rem 1.2rem 1rem 0;
  border-right: 1px solid var(--lightgray);
  position: sticky;
  top: 60px;
  align-self: start;
}

.tag-section-left h2 {
  margin-bottom: 0.3rem;
}

.tag-section-right {
  padding-left: 1.2rem;
}

.tag-section-right ul {
  list-style: none;
  padding-left: 0;
}

.tag-section-right ul > li {
  list-style: none;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-right ul > li:first-child {
  padding-top: 1rem;
}

.tag-section-right ul > li:last-child {
  border-bottom: none;
  padding-bottom: 1rem;
}

.tag-section-right .tags {
  display: none;
}
`

  TagContent.css = concatenateResources(style, PageList.css, tagIndexCss)
  return TagContent
}) satisfies QuartzComponentConstructor