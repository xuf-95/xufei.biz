import { BuildCtx } from "../util/ctx"
import { PerfTimer } from "../util/perf"
import { ProcessedContent } from "../plugins/vfile"
import { FullSlug, SimpleSlug, simplifySlug } from "../util/path"
import { Element, Root } from "hast"
import { visit } from "unist-util-visit"

// ofm marks wikilink-generated anchors with `data-wikilink`. Depending on how
// the hast tree was built, that key can appear hyphenated or camelCased, so
// probe both.
function isWikilink(node: Element): boolean {
  const props = node.properties ?? {}
  return props["data-wikilink"] !== undefined || props["dataWikilink"] !== undefined
}

function getNodeText(node: Element): string {
  let text = ""
  visit(node, "text", (t) => {
    text += t.value
  })
  return text
}

// Replace wikilinks that point to unpublished or missing pages with plain text.
// The set of published pages is only known after filterContent has run, so this
// pass must happen there rather than during parse.
export function fixBrokenWikilinks(
  _ctx: BuildCtx,
  content: ProcessedContent[],
): ProcessedContent[] {
  const perf = new PerfTimer()
  const published = new Set<SimpleSlug>(
    content.map(([, vfile]) => simplifySlug(vfile.data.slug!)),
  )

  let downgraded = 0
  for (const [tree] of content) {
    visit(tree as Root, "element", (node, index, parent) => {
      if (
        node.tagName !== "a" ||
        parent === null ||
        parent === undefined ||
        index === undefined ||
        !isWikilink(node)
      ) {
        return
      }

      const slug = node.properties?.["data-slug"] as FullSlug | undefined
      // No data-slug means it's not a resolved internal page link (e.g. a
      // same-document anchor); leave those alone.
      if (!slug) {
        return
      }

      if (published.has(simplifySlug(slug))) {
        return
      }

      // Broken: swap the anchor for its plain text content.
      parent.children[index] = { type: "text", value: getNodeText(node) }
      downgraded++
    })
  }

  console.log(`Downgraded ${downgraded} broken wikilink(s) to plain text in ${perf.timeSince()}`)
  return content
}
