import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"


const recentNotes = [
  Component.RecentNotes({
    title: "Recent Writing",
    limit: 4,
    filter: (f) =>
      f.slug!.startsWith("Posts/") && f.slug! !== "Posts/index" && !f.frontmatter?.noindex,
    linkToMore: "Posts/" as SimpleSlug,
  }),
  Component.RecentNotes({
    title: "Recent Notes",
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
          showTags: false,
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

// // components for pages that display a single page (e.g. a single note)
// export const defaultContentPageLayout: PageLayout = {
//   beforeBody: [
//     Component.ConditionalRender({
//       component: Component.Breadcrumbs(),
//       condition: (page) => page.fileData.slug !== "index",
//     }),
//     Component.ArticleTitle(),
//     Component.ContentMeta(),
//     Component.TagList(),
//   ],
//   left: [
//     Component.PageTitle(),
//     Component.MobileOnly(Component.Spacer()),
//     Component.Flex({
//       components: [
//         {
//           Component: Component.Search(),
//           grow: true,
//         },
//           { Component: Component.Darkmode() },
//           { Component: Component.ReaderMode() },
//       ],
//     }),
//     Component.Explorer(),
//   ],
//   right: [
//     Component.Graph(),
//     Component.DesktopOnly(Component.TableOfContents()),
//     Component.Backlinks(),
//   ],
// }

// // components for pages that display lists of pages  (e.g. tags or folders)
// export const defaultListPageLayout: PageLayout = {
//   beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
//   left: [
//     Component.PageTitle(),
//     Component.MobileOnly(Component.Spacer()),
//     Component.Flex({
//       components: [
//         {
//           Component: Component.Search(),
//           grow: true,
//         },
//         { Component: Component.Darkmode() },
//       ],
//     }),
//     Component.Explorer(),
//   ],
//   right: [],
// }
