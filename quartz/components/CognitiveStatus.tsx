import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/cognitiveStatus.scss"

// ── Writing status: how finished the page is ──────────────────────────
// Maps a raw frontmatter value to its display label. Accepts a couple of
// spellings for "in progress" so authoring stays forgiving.
const STATUS_LABELS: Record<string, string> = {
  notes: "notes",
  draft: "draft",
  "in-progress": "in progress",
  "in progress": "in progress",
  finished: "finished",
}

// ── Kesselman epistemic confidence scale ──────────────────────────────
// gwern uses the Kesselman List of Estimative Words. `level` (0–6) drives
// the color ramp in cognitiveStatus.scss: 6 = confident (accent/navy),
// 0 = doubtful (vermilion). Tweak the labels or levels here to taste — this
// table is the single source of truth for how confidence renders.
const CONFIDENCE_SCALE: Record<string, { label: string; level: number }> = {
  certain: { label: "certain", level: 6 },
  "highly likely": { label: "highly likely", level: 5 },
  likely: { label: "likely", level: 4 },
  possible: { label: "possible", level: 3 },
  unlikely: { label: "unlikely", level: 2 },
  "highly unlikely": { label: "highly unlikely", level: 1 },
  remote: { label: "remote", level: 0 },
  impossible: { label: "impossible", level: 0 },
}

function normalize(value: unknown): string {
  return value?.toString().trim().toLowerCase() ?? ""
}

const CognitiveStatus: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const fm = fileData.frontmatter as Record<string, unknown> | undefined
  if (!fm) return null

  const statusKey = normalize(fm.status)
  const status = STATUS_LABELS[statusKey]

  const confidenceKey = normalize(fm.confidence)
  const confidence = CONFIDENCE_SCALE[confidenceKey]

  const importanceRaw = fm.importance
  const importanceNum =
    typeof importanceRaw === "number"
      ? importanceRaw
      : typeof importanceRaw === "string" && importanceRaw.trim() !== ""
        ? Number(importanceRaw)
        : NaN
  const hasImportance = Number.isFinite(importanceNum)
  const importance = hasImportance ? Math.max(0, Math.min(10, Math.round(importanceNum))) : 0

  // Nothing to show if none of the three fields are present/valid
  if (!status && !confidence && !hasImportance) return null

  return (
    <div
      class={classNames(displayClass, "cognitive-status")}
      role="group"
      aria-label="epistemic metadata"
    >
      {status && (
        <span class={`cog-badge cog-status cog-status-${statusKey.replace(/\s+/g, "-")}`}>
          <span class="cog-key">status</span>
          <span class="cog-val">{status}</span>
        </span>
      )}
      {confidence && (
        <span
          class={`cog-badge cog-confidence cog-conf-${confidence.level}`}
          title="Kesselman estimative confidence"
        >
          <span class="cog-key">confidence</span>
          <span class="cog-val">{confidence.label}</span>
        </span>
      )}
      {hasImportance && (
        <span class="cog-badge cog-importance" title="Importance, 0–10">
          <span class="cog-key">importance</span>
          <span class="cog-val">{importance}/10</span>
        </span>
      )}
    </div>
  )
}

CognitiveStatus.css = style

export default (() => CognitiveStatus) satisfies QuartzComponentConstructor
