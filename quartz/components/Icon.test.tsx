import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { render } from "preact-render-to-string"
import { Icon, IconName } from "./Icon"

const gardenIcons: IconName[] = [
  "search",
  "note",
  "talks",
  "library",
  "movies",
  "files",
  "folder",
  "sport",
  "bike",
  "dumbbell",
  "trophy",
]

describe("Icon", () => {
  test("renders every digital garden icon with a shared visual contract", () => {
    for (const name of gardenIcons) {
      const html = render(<Icon name={name} />)

      assert.match(html, /viewBox="0 0 24 24"/)
      assert.match(html, /stroke="currentColor"/)
      assert.match(html, /fill="none"/)
      assert.match(html, /aria-hidden="true"/)
    }
  })

  test("exposes an accessible title when provided", () => {
    const html = render(<Icon name="search" title="Search" class="search-icon" />)

    assert.match(html, /role="img"/)
    assert.match(html, /<title>Search<\/title>/)
    assert.match(html, /class="search-icon"/)
    assert.doesNotMatch(html, /aria-hidden="true"/)
  })
})
