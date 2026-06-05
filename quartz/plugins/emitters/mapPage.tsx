import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import { pageResources, renderPage } from "../../components/renderPage"
import { KnowledgeMap } from "../../components"
import { sharedPageComponents } from "../../../quartz.layout"

interface Options extends FullPageLayout {}

export const MapPage: QuartzEmitterPlugin<Options> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...userOpts,
    beforeBody: [],
    afterBody: [],
    left: [],
    right: [],
    pageBody: KnowledgeMap(),
  }
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "MapPage",
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
      const slug = "map/index" as FullSlug
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: "",
        description: "Knowledge Map",
        frontmatter: { title: "Knowledge Map", tags: [] },
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
