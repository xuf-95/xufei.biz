import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { h } from "preact"
import { render } from "preact-render-to-string"
import { Date as QuartzDate, formatDate } from "./Date"

describe("Date", () => {
  test("formats dates as YYYY.MM.DD with zero padding", () => {
    assert.equal(formatDate(new globalThis.Date(2026, 5, 30)), "2026.06.30")
    assert.equal(formatDate(new globalThis.Date(2026, 0, 2)), "2026.01.02")
  })

  test("uses the same numeric date format for every locale", () => {
    assert.equal(formatDate(new globalThis.Date(2026, 5, 30), "zh-CN"), "2026.06.30")
  })

  test("renders the formatted date in a time element", () => {
    const date = new globalThis.Date(2026, 5, 30)
    const html = render(h(QuartzDate, { date, locale: "en-US" }))

    assert.match(html, /^<time datetime="[^"]+">2026\.06\.30<\/time>$/)
  })
})
