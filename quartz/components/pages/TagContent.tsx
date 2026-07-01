import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import TagTreemap, { getTagGroups, tagTreemapCss } from "../TagTreemap"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }
  const IndexTagTreemap = TagTreemap({ variant: "index" })

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const tagGroups = getTagGroups(allFiles)
    const tagItemMap = new Map(tagGroups.map((group) => [group.tag, group.pages]))
    const allPagesWithTag = (tag: string) => tagItemMap.get(tag) ?? []

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    if (tag === "/") {
      const tags = tagGroups.map((group) => group.tag)

      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <p>{i18n(cfg.locale).pages.tagContent.totalTags({ count: tags.length })}</p>
          <IndexTagTreemap {...props} />

          <div>
            {tags.map((tag) => {
              const pages = tagItemMap.get(tag) ?? []
              const listProps = {
                ...props,
                allFiles: pages,
              }

              const contentPage = allFiles.filter((file) => file.slug === `tags/${tag}`).at(0)

              const root = contentPage?.htmlAst
              const tagContent =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)

              return (
                <div class="tag-section">
                  <div class="tag-section-left">
                    <h2>
                      <a class="internal tag-link" href={href}>
                        {tag}
                      </a>
                    </h2>
                    <p class="tag-count">
                      {i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}
                      {pages.length > options.numPages && (
                        <>
                          {" "}
                          <span>
                            {i18n(cfg.locale).pages.tagContent.showingFirst({
                              count: options.numPages,
                            })}
                          </span>
                        </>
                      )}
                    </p>
                    {tagContent && <p>{tagContent}</p>}
                  </div>
                  <div class="tag-section-right">
                    <PageList limit={options.numPages} {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)
      const listProps = {
        ...props,
        allFiles: pages,
      }

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <p>{i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
            <div class="tag-page-list">
              <PageList {...listProps} sort={options?.sort} />
            </div>
          </div>
        </div>
      )
    }
  }

  const tagIndexCss = `
.tag-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-left {
  padding: 1rem 1.2rem 1rem 0;
  border-right: 1px solid var(--lightgray);
  position: sticky;
  top: 44px;
  align-self: start;
}

.tag-section-left h2 {
  margin-bottom: 0.3rem;
}

.tag-section-right {
  padding-left: 1.2rem;
}

.tag-section-right ul {
  list-style: none;
  padding-left: 0;
}

.tag-section-right ul > li {
  list-style: none;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-right ul > li:first-child {
  padding-top: 1rem;
}

.tag-section-right ul > li:last-child {
  border-bottom: none;
  padding-bottom: 1rem;
}

.tag-section-right .tags {
  display: none;
}

.tag-page-list {
  --tag-list-rule: color-mix(in srgb, var(--darkgray) 15%, transparent);

  margin-top: 0.35rem;
}

.tag-page-list ul.section-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-page-list:has(li.section-li:hover) li.section-li,
.tag-page-list:has(li.section-li:focus-within) li.section-li {
  opacity: 0.46;
}

.tag-page-list:has(li.section-li:hover) li.section-li:hover,
.tag-page-list:has(li.section-li:focus-within) li.section-li:focus-within {
  opacity: 1;
}

.tag-page-list li.section-li {
  margin: 0;
  border-top: 1px solid var(--tag-list-rule);
  transition: opacity 0.18s ease;
}

.tag-page-list li.section-li:last-child {
  border-bottom: 1px solid var(--tag-list-rule);
}

.tag-page-list .section {
  align-items: baseline;
  padding: 0.95rem 0;
}

.tag-page-list .section > .desc > h3 > a {
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}
`

  TagContent.css = concatenateResources(style, PageList.css, tagTreemapCss, tagIndexCss)
  return TagContent
}) satisfies QuartzComponentConstructor
