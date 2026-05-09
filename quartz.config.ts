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
          light: "#ffffff",
          lightgray: "#d2d2d7",
          gray: "#86868b",
          darkgray: "#6e6e73",
          dark: "#000000",
          secondary: "#2c2c2c",
          tertiary: "#000000",
          highlight: "rgba(0, 0, 0, 0.06)",
          textHighlight: "rgba(0, 0, 0, 0.14)",
        },
        darkMode: {
          light: "#000",
          lightgray: "#3A3A3A",
          gray: "#9ca3af",
          darkgray: "#e5e7eb",
          dark: "#ece9df",
          secondary: "#DCDCDC",
          tertiary: "#F3F3F3",
          highlight: "#1F1F1F",
          textHighlight: "rgba(64, 249, 7, 0.97)",
        }
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
