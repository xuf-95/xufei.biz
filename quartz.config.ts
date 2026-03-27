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
    ignorePatterns: ["private", "templates", ".obsidian"],
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
        lightMode: {
          light: "#10183A",          // 比较深的黑色，减少纯黑的硬度，适合作为主背景色 #14141D #10183A(best VICTOR)
          lightgray: "#204491",      // 搜索框；代码框线（``）；文本分割线；graph 图框；#3e5073
          gray: "#3f72af",           // 时间 阅读时间；中灰色，适合边框、次要文本或图标
          darkgray: "#c8c8ca",       // 亮灰色，适合作为次要文本（文本内容）、提示信息
          dark: "#c8c8ca",              // 文件；目录；加粗文本；链接图标；
          secondary: "#FF0",      // 2969e1
          tertiary: "#FF0",       // graphy 图中节点颜色；金黄色，作为次级强调色（悬浮高亮颜色），用于装饰元素或高优先级提示
          highlight: "rgba(220, 220, 56, 0.1)",     // 标签和Page页路由背景色，透明橙黄色，用于背景高亮，突出某些选中状态 325b8c
          // highlight: 'rgba(143, 159, 169, 0.15)',
          textHighlight: "#ffbe00"   // 柔和的黄橙色，用于文本高亮，增强视觉引导效果#F5C0C0 
        },
        darkMode: {
          // deep gray background + warm white text + desaturated gray accents
          light: "#111111",
          lightgray: "#2a2a2a",
          gray: "#8e8d87",
          darkgray: "#d2d0c7",
          dark: "#ece9df",
          secondary: "#d8d5cb",
          tertiary: "#b8b5ad",
          highlight: "rgba(214, 210, 197, 0.16)",
          textHighlight: "rgba(233, 224, 188, 0.36)",
        },
      }
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
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
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
