import { QuartzEmitterPlugin } from "../types"
import { SimpleSlug, simplifySlug } from "../../util/path"
import { styleText } from "node:util"

interface BrokenLink {
  source: string
  target: SimpleSlug
}

export const BrokenLinks: QuartzEmitterPlugin = () => {
  return {
    name: "BrokenLinks",
    // eslint-disable-next-line @typescript-eslint/require-await
    async *emit(_ctx, content, _resources) {
      // Build the set of all published slugs (as SimpleSlug)
      const publishedSlugs = new Set<SimpleSlug>()
      for (const [_tree, file] of content) {
        const slug = file.data.slug
        if (slug) {
          publishedSlugs.add(simplifySlug(slug))
        }
      }

      // Also add tag and folder index slugs that Quartz auto-generates
      for (const slug of publishedSlugs) {
        // For each published slug like "Open-BigData/foo", ensure its
        // parent folder slug is considered valid (folder pages are generated
        // by FolderPage emitter)
        const parts = slug.split("/")
        for (let i = 1; i < parts.length; i++) {
          publishedSlugs.add(parts.slice(0, i).join("/") as SimpleSlug)
        }
      }

      // Collect all broken internal links
      const broken: BrokenLink[] = []

      for (const [_tree, file] of content) {
        const sourceSlug = file.data.slug
        const links = file.data.links ?? []

        for (const target of links) {
          // Skip anchor-only links and tag links (tag pages are auto-generated)
          if (target.startsWith("tags/")) continue

          // Check if target exists in published slugs
          if (!publishedSlugs.has(target)) {
            broken.push({
              source: sourceSlug ?? "unknown",
              target,
            })
          }
        }
      }

      // Report results
      if (broken.length > 0) {
        console.log(
          styleText(
            "yellow",
            `\n⚠ Found ${broken.length} broken internal link(s):`,
          ),
        )
        // Group by source page
        const bySource = new Map<string, SimpleSlug[]>()
        for (const { source, target } of broken) {
          if (!bySource.has(source)) bySource.set(source, [])
          bySource.get(source)!.push(target)
        }

        for (const [source, targets] of bySource) {
          console.log(styleText("cyan", `  📄 ${source}`))
          for (const t of targets) {
            console.log(styleText("red", `     → ${t}`) + "  (404)")
          }
        }
        console.log()
      } else {
        console.log(styleText("green", "\n✅ No broken internal links found.\n"))
      }

      // This emitter produces no output files
    },
  }
}
