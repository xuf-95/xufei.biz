import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/articleSummary.scss"

const ArticleSummary: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  // prefer explicit `summary` field; fall back to `description`
  const summary =
    fileData.frontmatter?.summary?.toString().trim() ||
    fileData.frontmatter?.description?.toString().trim()

  if (!summary) return null

  return (
    <details class={classNames(displayClass, "article-summary")} open>
      <summary class="article-summary-header">
        {/* list / lines icon */}
        <svg
          class="article-summary-icon"
          viewBox="0 0 24 24"
          width="15"
          height="15"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="8" y1="6"  x2="21" y2="6"  />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <polyline points="3 6 4 7 6 5"  />
          <polyline points="3 12 4 13 6 11" />
          <polyline points="3 18 4 19 6 17" />
        </svg>
        <span class="article-summary-label">Overview</span>
        {/* chevron rotates when open */}
        <svg
          class="article-summary-chevron"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </summary>

      <div class="article-summary-body">
        <p>{summary}</p>
      </div>
    </details>
  )
}

ArticleSummary.css = style

export default (() => ArticleSummary) satisfies QuartzComponentConstructor
