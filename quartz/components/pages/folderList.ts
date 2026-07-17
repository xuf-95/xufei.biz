export const FOLDER_PAGE_LIMIT = 12

export function hasFolderListOverflow(matches: boolean[]): boolean {
  return matches.filter(Boolean).length > FOLDER_PAGE_LIMIT
}

export function getFolderItemVisibility(matches: boolean[], expanded: boolean): boolean[] {
  let visibleMatches = 0

  return matches.map((matchesFilters) => {
    if (!matchesFilters) return false
    visibleMatches += 1
    return expanded || visibleMatches <= FOLDER_PAGE_LIMIT
  })
}
