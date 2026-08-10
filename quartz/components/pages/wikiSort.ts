import { QuartzPluginData } from "../../plugins/vfile"

function getWikiPriority(page: QuartzPluginData): number {
  const value: unknown = page.frontmatter?.priority

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export function byWikiPriority(a: QuartzPluginData, b: QuartzPluginData): number {
  const priorityDifference = getWikiPriority(b) - getWikiPriority(a)
  if (priorityDifference !== 0) return priorityDifference

  const aSlug = a.slug ?? ""
  const bSlug = b.slug ?? ""
  if (aSlug < bSlug) return -1
  if (aSlug > bSlug) return 1
  return 0
}
