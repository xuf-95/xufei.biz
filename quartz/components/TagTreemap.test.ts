import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { getTagGroups, layoutTagTreemap } from "./TagTreemap"
import { QuartzPluginData } from "../plugins/vfile"

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const otherRect: Rect = { x: 840, y: 410, w: 160, h: 90 }

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

describe("layoutTagTreemap", () => {
  test("keeps other at a fixed area in the bottom-right corner", () => {
    const items = [
      { tag: "architecture", count: 22, area: 22 },
      { tag: "bigdata", count: 17, area: 17 },
      { tag: "governance", count: 14, area: 14 },
      { tag: "concepts", count: 9, area: 9 },
      { tag: "flink", count: 7, area: 7 },
      { tag: "__other__", count: 76, area: 1 },
    ]

    const laidOut = layoutTagTreemap(items)
    const other = laidOut.find((item) => item.tag === "__other__")

    assert.deepEqual(other?.rect, otherRect)
    assert.equal(otherRect.x + otherRect.w, 1000)
    assert.equal(otherRect.y + otherRect.h, 500)
    for (const item of laidOut.filter((item) => item.tag !== "__other__")) {
      assert.ok(item.rect)
      assert.equal(overlaps(item.rect, otherRect), false)
    }

    const totalArea = laidOut.reduce((sum, item) => sum + item.rect!.w * item.rect!.h, 0)
    assert.ok(Math.abs(totalArea - 1000 * 500) < 0.001)
  })

  test("uses the full canvas when there is no other group", () => {
    const laidOut = layoutTagTreemap([
      { tag: "architecture", count: 22, area: 22 },
      { tag: "bigdata", count: 17, area: 17 },
    ])
    const totalArea = laidOut.reduce((sum, item) => sum + item.rect!.w * item.rect!.h, 0)

    assert.equal(totalArea, 1000 * 500)
  })
})

describe("getTagGroups", () => {
  test("filters the index tag from treemap data", () => {
    const files = [
      { frontmatter: { tags: ["index", "ai"] } },
      { frontmatter: { tags: ["index", "bigdata"] } },
    ] as QuartzPluginData[]

    const groups = getTagGroups(files)

    assert.deepEqual(
      groups.map((group) => group.tag),
      ["ai", "bigdata"],
    )
  })
})
