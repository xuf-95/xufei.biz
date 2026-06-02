import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import tocStyle from "./styles/toc.scss"
// @ts-ignore - Quartz's inline loader imports this file as a script string at build time.
import tocScript from "./scripts/toc.inline"
import { classNames } from "../util/lang"

interface Options {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6
  collapseByDefault: boolean
}

const defaultOptions: Options = {
  maxDepth: 3, // only 3 levels by default
  collapseByDefault: false,
}

export default ((opts?: Partial<Options>) => {
  const options: Options = { ...defaultOptions, ...opts }

  const TableOfContents: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    if (!fileData.toc || fileData.toc.length === 0) return null

    const filtered = fileData.toc.filter((e) => e.depth <= options.maxDepth)
    if (filtered.length === 0) return null

    const minDepth = Math.min(...filtered.map((e) => e.depth))
    const normalizedFiltered = filtered.map((e) => ({
      ...e,
      depth: e.depth - minDepth + 1,
    }))

    const BODY_RH = 6

    const bodyCounts = normalizedFiltered.map((entry, i) => {
      let childCount = 0
      for (let j = i + 1; j < normalizedFiltered.length; j++) {
        if (normalizedFiltered[j].depth <= entry.depth) break
        childCount++
      }
      return entry.depth === 1 && childCount > 3 ? 2 : 1
    })

    return (
      <nav class={classNames(displayClass, "toc-wrapper toc")} aria-label="Table of contents">
        <div class="toc-card">
          <div class="toc-sidebar" id="toc-body" style={"--body-rh:" + BODY_RH + "px"}>
            {normalizedFiltered.map((entry, hi) => {
              const bodyCount = bodyCounts[hi]
              return (
                <>
                  <a
                    class={"toc-row toc-heading toc-h" + entry.depth}
                    data-hi={String(hi)}
                    data-target={entry.slug}
                    href={"#" + entry.slug}
                  >
                    <span class="toc-rail" aria-hidden="true">
                      <span class="toc-marker"></span>
                    </span>
                    <span class="toc-lbl">{entry.text}</span>
                  </a>
                  {Array.from({ length: bodyCount }, (_, b) => {
                    return (
                      <div class="toc-row toc-body" data-hi={String(hi)}>
                        <span class="toc-rail" aria-hidden="true">
                          <span class="toc-dot" data-dot={String((hi + b) % 3)}></span>
                        </span>
                      </div>
                    )
                  })}
                </>
              )
            })}
          </div>
        </div>
      </nav>
    )
  }

  TableOfContents.css = tocStyle
  TableOfContents.afterDOMLoaded = tocScript as unknown as string
  return TableOfContents
}) satisfies QuartzComponentConstructor
