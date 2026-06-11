import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import tocStyle from "./styles/toc.scss"
// @ts-ignore
import tocScript from "./scripts/toc.inline"
import { classNames } from "../util/lang"

interface Options {
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6
  collapseByDefault: boolean
}

const defaultOptions: Options = {
  maxDepth: 3,
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

    return (
      <nav class={classNames(displayClass, "toc-wrapper toc")} aria-label="Table of contents">
        <div class="toc-card">
          <div class="toc-sidebar" id="toc-body">
            {normalizedFiltered.map((entry, hi) => (
              <a
                class={"toc-heading toc-h" + entry.depth}
                data-hi={String(hi)}
                data-target={entry.slug}
                href={"#" + entry.slug}
              >
                <span class="toc-dash" aria-hidden="true"></span>
                <span class="toc-lbl">{entry.text}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    )
  }

  TableOfContents.css = tocStyle
  TableOfContents.afterDOMLoaded = tocScript as unknown as string
  return TableOfContents
}) satisfies QuartzComponentConstructor
