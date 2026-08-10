import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { QuartzPluginData } from "../../plugins/vfile"
import { byWikiPriority } from "./wikiSort"

function page(slug: string, priority?: number): QuartzPluginData {
  return {
    slug,
    frontmatter: {
      title: slug,
      ...(priority === undefined ? {} : { priority }),
    },
  } as QuartzPluginData
}

describe("byWikiPriority", () => {
  test("sorts higher priorities first and allows negative priorities", () => {
    const pages = [page("zero"), page("high", 100), page("low", -10), page("medium", 50)]

    pages.sort(byWikiPriority)

    assert.deepEqual(
      pages.map((item) => item.slug),
      ["high", "medium", "zero", "low"],
    )
  })

  test("defaults missing priorities to zero and sorts ties by slug", () => {
    const pages = [page("concepts/zeta"), page("concepts/alpha", 0), page("concepts/beta")]

    pages.sort(byWikiPriority)

    assert.deepEqual(
      pages.map((item) => item.slug),
      ["concepts/alpha", "concepts/beta", "concepts/zeta"],
    )
  })
})
