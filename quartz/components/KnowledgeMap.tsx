import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/knowledgeMap.inline"
// @ts-ignore
import style from "./styles/knowledgeMap.scss"
import { classNames } from "../util/lang"

const focusItems = [
  ["current", "Current note"],
  ["related", "Related notes"],
  ["visited", "Visited notes"],
  ["tags", "Tags"],
  ["context", "Context"],
] as const

const KnowledgeMap: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <main class={classNames(displayClass, "knowledge-map-shell")}>
      <div class="km-mobile-bar">
        <a class="km-mobile-close" href="/index/" aria-label="Close knowledge map">
          ×
        </a>
        <strong>Knowledge Map</strong>
        <div class="km-mobile-actions" aria-hidden="true">
          <span>⌕</span>
          <span>···</span>
        </div>
      </div>

      <section class="km-layout" aria-label="Knowledge Map">
        <aside class="km-sidebar">
          <div class="km-sidebar-head">
            <h1>Knowledge Map</h1>
            <p>Understand how this note connects across your digital garden.</p>
          </div>

          <label class="km-search" aria-label="Search notes or tags">
            <span>⌕</span>
            <input class="km-search-input" type="search" placeholder="Search notes or tags..." />
          </label>

          <div class="km-filter-row" aria-label="Map filters">
            <button class="km-filter is-active" data-filter="all" type="button">
              All
            </button>
            <button class="km-filter" data-filter="notes" type="button">
              Notes
            </button>
            <button class="km-filter" data-filter="tags" type="button">
              Tags
            </button>
            <button class="km-filter" data-filter="visited" type="button">
              Visited
            </button>
          </div>

          <div class="km-focus">
            <h2>Focus</h2>
            {focusItems.map(([key, label]) => (
              <label>
                <input type="checkbox" data-focus={key} checked />
                <span class={`km-focus-dot km-focus-${key}`}></span>
                {label}
              </label>
            ))}
          </div>

          <dl class="km-stats">
            <div>
              <dt>Nodes</dt>
              <dd data-stat="nodes">0</dd>
            </div>
            <div>
              <dt>Edges</dt>
              <dd data-stat="edges">0</dd>
            </div>
            <div>
              <dt>Clusters</dt>
              <dd data-stat="clusters">0</dd>
            </div>
          </dl>
        </aside>

        <div class="km-main">
          <div class="km-main-toolbar" aria-label="Map filters">
            <button class="km-filter is-active" data-filter="all" type="button">
              All
            </button>
            <button class="km-filter" data-filter="notes" type="button">
              Notes
            </button>
            <button class="km-filter" data-filter="tags" type="button">
              Tags
            </button>
            <button class="km-filter" data-filter="visited" type="button">
              Visited
            </button>
          </div>

          <div class="km-canvas-wrap">
            <svg class="km-graph" role="img" aria-label="Interactive knowledge graph"></svg>
            <div class="km-zoom-controls" aria-label="Map zoom controls">
              <button class="km-zoom-in" type="button" aria-label="Zoom in">
                +
              </button>
              <button class="km-zoom-out" type="button" aria-label="Zoom out">
                −
              </button>
              <button class="km-fit" type="button" aria-label="Reset map">
                ⊙
              </button>
            </div>
            <div class="km-legend">
              <span>
                <i class="km-focus-current"></i>Current note
              </span>
              <span>
                <i class="km-focus-related"></i>Related notes
              </span>
              <span>
                <i class="km-focus-visited"></i>Visited
              </span>
              <span>
                <i class="km-focus-tags"></i>Tags
              </span>
              <span>
                <i class="km-focus-context"></i>Context
              </span>
            </div>
          </div>
        </div>

        <aside class="km-detail" aria-live="polite">
          <div class="km-sheet-handle"></div>
          <p class="km-detail-eyebrow">Current note</p>
          <h2 data-detail="title">Knowledge Map</h2>
          <p class="km-detail-slug" data-detail="slug"></p>
          <p class="km-detail-summary" data-detail="summary"></p>

          <div class="km-detail-section">
            <h3>Tags</h3>
            <div class="km-tags" data-detail="tags"></div>
          </div>

          <div class="km-detail-section">
            <h3>Related notes</h3>
            <ul class="km-related" data-detail="related"></ul>
          </div>

          <a class="km-open-link" data-detail="open" href="/index/" target="_blank" rel="noopener">
            Open in new tab ↗
          </a>
        </aside>
      </section>
    </main>
  )
}

KnowledgeMap.afterDOMLoaded = script
KnowledgeMap.css = style

export default (() => KnowledgeMap) satisfies QuartzComponentConstructor
