import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { h } from "preact"
import { render } from "preact-render-to-string"
import { Date as QuartzDate, formatDate } from "./Date"

describe("Date", () => {
  test("formats dates as abbreviated English month, day, and year", () => {
    assert.equal(formatDate(new globalThis.Date(2026, 5, 30)), "Jun 30, 2026")
    assert.equal(formatDate(new globalThis.Date(2026, 0, 2)), "Jan 2, 2026")
  })

  test("uses the same English date format for every locale", () => {
    assert.equal(formatDate(new globalThis.Date(2026, 5, 30), "zh-CN"), "Jun 30, 2026")
  })

  test("renders the formatted date in a time element", () => {
    const date = new globalThis.Date(2026, 5, 30)
    const html = render(h(QuartzDate, { date, locale: "en-US" }))

    assert.match(html, /^<time datetime="[^"]+">Jun 30, 2026<\/time>$/)
  })
})
