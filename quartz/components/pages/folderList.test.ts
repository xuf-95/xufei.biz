import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { FOLDER_PAGE_LIMIT, getFolderItemVisibility, hasFolderListOverflow } from "./folderList"

describe("folder list visibility", () => {
  test("shows only the first 12 matching pages until expanded", () => {
    const matches = Array.from({ length: 15 }, () => true)

    assert.deepEqual(getFolderItemVisibility(matches, false), [
      ...Array.from({ length: FOLDER_PAGE_LIMIT }, () => true),
      false,
      false,
      false,
    ])
    assert.deepEqual(getFolderItemVisibility(matches, true), matches)
  })

  test("applies the 12-page limit to the active filter results", () => {
    const matches = [false, ...Array.from({ length: 13 }, () => true)]
    const visible = getFolderItemVisibility(matches, false)

    assert.equal(visible[0], false)
    assert.equal(visible.filter(Boolean).length, FOLDER_PAGE_LIMIT)
    assert.equal(visible.at(-1), false)
  })

  test("reports overflow only when more than 12 pages match", () => {
    assert.equal(hasFolderListOverflow(Array.from({ length: 12 }, () => true)), false)
    assert.equal(hasFolderListOverflow(Array.from({ length: 13 }, () => true)), true)
    assert.equal(hasFolderListOverflow([true, false, true]), false)
  })
})
