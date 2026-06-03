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
  header: [Component.TopNav(), Component.Search(), Component.Darkmode(), Component.ReaderMode()],
  afterBody: [
    // ...recentNotes.map((c) => Component.DesktopOnly(c)),
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
  ],

  footer: Component.Footer({
    links: {
      Home: "https://xufei.biz",
      Tags: "https://xuf-95.github.io/xufei.biz/tags/",
      GitHub: "https://github.com/xuf-95",
      "xufei.site": "https://xufei.site",
      "Bento.me": "https://bento.me/xfei",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.TagList(),
    Component.ArticleTitle(),
    Component.VersionSwitcher(),
    Component.MobileOnly(Component.Spacer()),
    Component.ArticleDescription(),
    Component.ContentMeta(),
    Component.Backlinks(),
  ],
  left: [Component.DesktopOnly(Component.TableOfContents())],
  right: [
    // Component.Flex({
    //   direction: "column",
    //   components: [
    //     { Component: Component.Backlinks() },
    //   ],
    // }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left: [],
  right: [
    Component.Flex({
      direction: "column",
      components: [],
    }),
  ],
}
