import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.TopNav(),
    Component.GitHubLink(),
    Component.RSSLink(),
    Component.Darkmode(),
    Component.Search(),
  ],
  afterBody: [
    // Component.ConditionalRender({
    //   component: Component.TagTreemap({
    //     variant: "home",
    //     title: "Tag Map",
    //     showHeader: true,
    //     showTotal: true,
    //   }),
    //   condition: ({ fileData }) => fileData.slug === "index",
    // }),
    
    // Component.UnlinkedMentions(),
    Component.DesktopOnly(
      Component.Graph({
        localGraph: {
          showTags: true,
        },
      }),
    ),

  ],

  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/xuf-95",
      "xufei.site": "https://xufei.site",
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
    // Component.ArticleSummary(),
  ],
  left: [Component.DesktopOnly(Component.TableOfContents())],
  right: [],
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
