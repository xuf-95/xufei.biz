import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"




// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
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

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    // Component.Explorer(),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Writing",
        limit: 3,
        filter: (f) =>
          f.slug!.startsWith("bigdata/") && f.slug! !== "bigdata/index" && !f.frontmatter?.noindex,
        linkToMore: "bigdata/" as SimpleSlug,
      }),
    ),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Notes",
        limit: 2,
        filter: (f) => f.slug!.startsWith("thoughts/"),
        linkToMore: "thoughts/" as SimpleSlug,
      }),
    ),


  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
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
    Component.Explorer(),
  ],
  right: [],
}
