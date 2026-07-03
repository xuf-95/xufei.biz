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
    pageBody: BrowseAllContent({ showFolderCount: true }),
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
      const slug = "browse/index" as FullSlug
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: "",
        // description: "Browse all content",
        frontmatter: { title: "Browse All", tags: [] },
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
    },
    async *partialEmit() {},
  }
}
