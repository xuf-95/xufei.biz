import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "xufei.biz",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "https://xufei.biz",
    ignorePatterns: ["private", "templates", ".obsidian", "drafts/*"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        // Apple-like light: white surface, black/gray type, no blue in UI tokens
        lightMode: {
          // light: "#ffffff",
          // lightgray: "#d2d2d7",
          // gray: "#86868b",
          // darkgray: "#6e6e73",
          // dark: "#000000",
          // secondary: "#2c2c2c",
          // tertiary: "#000000",
          // highlight: "rgba(0, 0, 0, 0.06)",
          // textHighlight: "rgba(0, 0, 0, 0.14)",
          light: "#f5eedd", // warm letterpress paper
          lightgray: "#e3d9c0", // aged paper borders / code bg
          gray: "#9a8e76", // muted warm gray (dates, line numbers)
          darkgray: "#2d4673", // navy ink body text (reads clearly blue, not black)
          dark: "#16294e", // deep navy headings
          secondary: "#284d78", // navy links / title / primary accent
          tertiary: "#c8482b", // bright orange-red (hover, active, graph)
          highlight: "rgba(200, 72, 43, 0.1)", // faint vermilion ink wash
          textHighlight: "#f4c84b88", // warm yellow marker
        },
        darkMode: {
          light: "#121212" /* 背景色：Udara 风格的深灰黑 */,
          lightgray: "#2a2a2a" /* 边框和次要背景：稍浅的灰色 */,
          gray: "#888888" /* 次要文本：如日期、分类标签 */,
          darkgray: "#d1d1d1" /* 正文颜色：柔和的白色，不刺眼 */,
          dark: "#ffffff" /* 标题颜色：纯白，突出层级 */,
          secondary: "#ffffff" /* 链接颜色：Udara 使用白色链接加下划线 */,
          tertiary: "#a0a0a0" /* 鼠标悬停时的链接颜色 */,
          highlight: "#1F1F1F",
          textHighlight: "rgba(248, 133, 10, 0.97)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          dark: "github-dark",
          light: "github-light",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
        externalLinkIcon: false,
      }),
      Plugin.Sidenotes(),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.ExplicitPublish()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.MapPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
