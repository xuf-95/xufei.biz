import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import tocStyle from "./styles/toc.scss"
import tocScript from "./scripts/toc.inline"
import { classNames } from "../util/lang"

interface Options {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6
  collapseByDefault: boolean
}

const defaultOptions: Options = {
  maxDepth: 3,   // only 3 levels by default
  collapseByDefault: false,
}

export default ((opts?: Partial<Options>) => {
  const options: Options = { ...defaultOptions, ...opts }

  const TableOfContents: QuartzComponent = ({
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    if (!fileData.toc || fileData.toc.length === 0) return null

    // ── Only show first 3 levels ───────────────────────────────────
    const filtered = fileData.toc.filter((e) => e.depth <= options.maxDepth)
    if (filtered.length === 0) return null

    // ── Normalize depths so the shallowest heading = depth 1 ──────
    // Quartz may give depths like [2,3,4] if article starts at h2.
    // We normalize so the minimum depth in the article becomes 1,
    // ensuring h1 CSS class always applies to the top-level headings.
    const minDepth = Math.min(...filtered.map(e => e.depth))
    const normalizedFiltered = filtered.map(e => ({
      ...e,
      depth: e.depth - minDepth + 1,
    }))

    // ── Constants ──────────────────────────────────────────────────
    const BODY_RH = 5   // px per body line row

    // ── Body line count per section ────────────────────────────────
    // Estimate rawBody lines per section using character count of heading text
    // as a rough proxy for section length.
    // Rule: rawBody > 6 → show 2 body lines; otherwise → show 1 body line
    // We use a simple heuristic: h1 sections tend to be longer (2 lines),
    // h2/h3 tend to be shorter (1 line), unless explicitly many siblings.

    // Compute body count for each entry
    const bodyCounts = normalizedFiltered.map((entry, i) => {
      let childCount = 0
      for (let j = i + 1; j < normalizedFiltered.length; j++) {
        if (normalizedFiltered[j].depth <= entry.depth) break
        childCount++
      }
      // rawBody proxy: h1 with children > 3 → likely long section
      const rawBodyEstimate = entry.depth === 1
        ? Math.max(4, childCount * 1.5)
        : entry.depth === 2
        ? Math.max(2, childCount)
        : 2

      // Rule: > 6 → 2 lines, else → 1 line
      return rawBodyEstimate > 6 ? 2 : 1
    })

    // Body line widths pool (short — max 12px)
    const BW = [78, 58, 86, 50, 68, 62, 44, 74, 55, 82, 48, 66, 72, 54, 62]

    return (
      <div class={classNames(displayClass, "toc-wrapper")}>
        {/* ── Toggle header ── */}
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
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {/* ── Reading progress bar ── */}
        {/* <div class="toc-progress-wrap">
          <div class="toc-progress-bar">
            <div class="toc-progress-track"></div>
            <div class="toc-progress-fill"></div>
          </div>
          <span class="toc-progress-pct">0%</span>
        </div> */}

        {/* ── TOC body ── */}
        <div
          class="toc-sidebar"
          id="toc-body"
          style={"--body-rh:" + BODY_RH + "px"}
          data-collapsed={options.collapseByDefault ? "true" : "false"}
        >
          {normalizedFiltered.map((entry, hi) => {
            const bodyCount = bodyCounts[hi]
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