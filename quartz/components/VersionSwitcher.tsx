import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type VersionEntry = {
  label?: unknown
  path?: unknown
  current?: unknown
}

function normalizeVersions(input: unknown): { label: string; path: FullSlug; current: boolean }[] {
  if (!Array.isArray(input)) return []

  return input.flatMap((entry: VersionEntry) => {
    if (!entry || typeof entry !== "object") return []
    if (typeof entry.label !== "string" || typeof entry.path !== "string") return []

    const label = entry.label.trim()
    const path = entry.path.trim()
    if (!label || !path || path.startsWith("/") || path.endsWith(".md")) return []

    return [{ label, path: path as FullSlug, current: entry.current === true }]
  })
}

const VersionSwitcher: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
}: QuartzComponentProps) => {
  const currentSlug = fileData.slug
  if (!currentSlug) return null

  const knownSlugs = new Set(allFiles.map((file) => file.slug).filter(Boolean))
  const versions = normalizeVersions(fileData.frontmatter?.versions).filter((version) =>
    knownSlugs.has(version.path),
  )

  if (versions.length < 2) return null

  return (
    <nav class={classNames(displayClass, "version-switcher")} aria-label="Page versions">
      <span class="version-switcher-label">Version</span>
      <div class="version-switcher-options">
        {versions.map((version) => {
          const isCurrent = version.current || version.path === currentSlug

          if (isCurrent) {
            return (
              <span class="version-switcher-item current" aria-current="page">
                {version.label}
              </span>
            )
          }

          return (
            <a
              class="version-switcher-item internal"
              href={resolveRelative(currentSlug, version.path)}
            >
              {version.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

VersionSwitcher.css = `
.version-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0.65rem auto 0;
  font-family: var(--bodyFont);
}

.version-switcher-label {
  color: var(--gray);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
}

.version-switcher-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.2rem;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
}

.version-switcher-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0 0.55rem;
  border-radius: 4px;
  color: var(--gray);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}

.version-switcher-item:hover {
  color: var(--dark);
  background: var(--highlight);
}

.version-switcher-item.current {
  color: var(--dark);
  background: var(--highlight);
  cursor: default;
}
`

export default (() => VersionSwitcher) satisfies QuartzComponentConstructor
