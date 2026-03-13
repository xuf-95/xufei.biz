import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"


const recentNotes = [
  Component.RecentNotes({
    title: "Recent Posts",
    limit: 3,
    filter: (f) =>
      f.slug!.startsWith("posts/") && f.slug! !== "posts/index" && !f.frontmatter?.noindex,
    linkToMore: "posts/" as SimpleSlug,
  }),
  Component.RecentNotes({
    title: "Recent BigData",
    limit: 2,
    filter: (f) => f.slug!.startsWith("bigdata/"),
    linkToMore: "bigdata/" as SimpleSlug,
  }),
]

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [...recentNotes.map((c) => Component.MobileOnly(c))],
  footer: Component.Footer({
    links: {
      "Home": "https://xufei.biz",
      "Tags": "https://xuf-95.github.io/xufei.biz/tags/",
      "GitHub": "https://github.com/xuf-95",
      "xufei.site": "https://xufei.site",
      "Bento.me": "https://bento.me/xfei",
    },
  }),
}

const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      {
        Component: Component.Search(),
        grow: true,
      },
      { Component: Component.Darkmode() },
    ],
  }),
  ...recentNotes.map((c) => Component.DesktopOnly(c)),
]
// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagList()],
  left,
  right: [
    Component.DesktopOnly(
      Component.Graph({
        localGraph: {
          showTags: true,
        },
        globalGraph: {
          showTags: false,
        },
      }),
    ),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left,
  right: [],
}
