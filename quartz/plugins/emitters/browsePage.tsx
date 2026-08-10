import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import { pageResources, renderPage } from "../../components/renderPage"
import { BrowseAllContent } from "../../components"
import { sharedPageComponents, defaultListPageLayout } from "../../../quartz.layout"

interface Options extends FullPageLayout {}

export const BrowsePage: QuartzEmitterPlugin<Options> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    ...userOpts,
    pageBody: BrowseAllContent(),
  }
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "BrowsePage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const cfg = ctx.cfg.configuration
      const slug = "wiki/index" as FullSlug
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: "",
        // description: "Browse all content",
        frontmatter: { title: "Wiki Home", tags: [] },
      })

      const externalResources = pageResources(pathToRoot(slug), resources)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        allFiles: content.map(([, file]) => file.data),
      }

      yield write({
        ctx,
        content: renderPage(cfg, slug, componentData, opts, externalResources),
        slug,
        ext: ".html",
      })

      yield write({
        ctx,
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting to Wiki</title>
    <link rel="canonical" href="../wiki/">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=../wiki/">
  </head>
  <body>
    <p>Moved to <a href="../wiki/">Wiki</a>.</p>
  </body>
</html>`,
        slug: "browse/index" as FullSlug,
        ext: ".html",
      })
    },
    async *partialEmit() {},
  }
}
