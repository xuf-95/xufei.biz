import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import tocStyle from "./styles/toc.scss"
import tocScript from "./scripts/toc.inline"
import { classNames } from "../util/lang"

interface Options {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6
  collapseByDefault: boolean
}

const defaultOptions: Options = {
  maxDepth: 4,
  collapseByDefault: false,
}

export default ((opts?: Partial<Options>) => {
  const options: Options = { ...defaultOptions, ...opts }

  const TableOfContents: QuartzComponent = ({
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    if (!fileData.toc || fileData.toc.length === 0) return null

    const filtered = fileData.toc.filter((e) => e.depth <= options.maxDepth)
    if (filtered.length === 0) return null

    const totalHeadings = filtered.length
    const avgBody = 3
    const rawBodySum = totalHeadings * avgBody
    const totalRaw = totalHeadings + rawBodySum

    const SIDEBAR_H = 460
    const MIN_RH = 7
    const MAX_RH = 13

    let bodyScale: number
    let rowHeight: number

    if (totalRaw * MAX_RH <= SIDEBAR_H) {
      bodyScale = 1.0
      rowHeight = MAX_RH
    } else {
      const maxRows = Math.floor(SIDEBAR_H / MIN_RH)
      const avail = maxRows - totalHeadings
      bodyScale = Math.max(0, Math.min(1, avail / rawBodySum))
      const actual = totalHeadings + Math.round(rawBodySum * bodyScale)
      rowHeight = Math.min(MAX_RH, Math.max(MIN_RH, Math.floor(SIDEBAR_H / actual)))
    }

    const BW = [80, 62, 88, 52, 70, 65, 46, 76, 58, 84, 50, 68, 73, 56, 64]

    return (
      <div class={classNames(displayClass, "toc-wrapper")}>
        {/* ── Collapse toggle header ── */}
        <button
          class="toc-toggle"
          id="toc-toggle"
          aria-expanded={options.collapseByDefault ? "false" : "true"}
          aria-controls="toc-body"
        >
          <span class="toc-toggle-label">Table of Contents</span>
          <svg
            class="toc-chevron"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {/* ── TOC lines body ── */}
        <div
          class="toc-sidebar"
          id="toc-body"
          style={"--rh:" + rowHeight + "px"}
          data-collapsed={options.collapseByDefault ? "true" : "false"}
        >
          {filtered.map((entry, hi) => {
            const bodyCount = Math.max(0, Math.round(avgBody * bodyScale))
            return (
              <>
                <div
                  class={"toc-row toc-heading toc-h" + entry.depth}
                  data-hi={String(hi)}
                  data-target={entry.slug}
                >
                  <span class="toc-seg"></span>
                  <span class="toc-lbl">{entry.text}</span>
                </div>
                {Array.from({ length: bodyCount }, (_, b) => {
                  const w = Math.round(4 + (BW[(hi * 3 + b) % BW.length] / 100) * 8)
                  return (
                    <div class="toc-row toc-body" data-hi={String(hi)}>
                      <span class="toc-seg" style={"width:" + w + "px"}></span>
                    </div>
                  )
                })}
              </>
            )
          })}
        </div>
      </div>
    )
  }

  TableOfContents.css = tocStyle
  TableOfContents.afterDOMLoaded = tocScript
  return TableOfContents
}) satisfies QuartzComponentConstructor