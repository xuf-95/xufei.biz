import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"

interface UnlinkedMentionsOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: UnlinkedMentionsOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<UnlinkedMentionsOptions>) => {
  const options: UnlinkedMentionsOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const UnlinkedMentions: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const title = fileData.frontmatter?.title
    if (!title || title.length === 0) return null

    // Pages that already link to this page (backlinks)
    const backlinkSlugs = new Set(
      allFiles.filter((file) => file.links?.includes(slug)).map((f) => simplifySlug(f.slug!)),
    )

    // Find pages whose text content mentions this page's title
    // but don't already link to it
    const titleLower = title.toLowerCase()
    const unlinked = allFiles.filter((file) => {
      const fileSlug = simplifySlug(file.slug!)
      // Skip self
      if (fileSlug === slug) return false
      // Skip pages that already link here
      if (backlinkSlugs.has(fileSlug)) return false
      // Check if the page's plain text contains the title
      const text = file.text
      if (!text) return false
      return text.toLowerCase().includes(titleLower)
    })

    if (options.hideWhenEmpty && unlinked.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "unlinked-mentions")}>
        <h3>Unlinked Mentions</h3>
        <OverflowList>
          {unlinked.length > 0 ? (
            unlinked.map((f) => (
              <li>
                <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                  {f.frontmatter?.title}
                </a>
              </li>
            ))
          ) : (
            <li>No unlinked mentions found</li>
          )}
        </OverflowList>
      </div>
    )
  }

  UnlinkedMentions.css = `
.unlinked-mentions {
  flex-direction: column;
  text-align: center;

  & > h3 {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
    display: inline;
    font-style: italic;
    font-family: var(--titleFont);

    &::after {
      content: ": ";
    }
  }

  & > ul.overflow {
    display: inline;
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: calc(100% - 2rem);
    overscroll-behavior: contain;

    & > li {
      display: inline;
      font-style: italic;

      &:not(:last-child)::after {
        content: ", ";
        color: var(--gray);
      }

      & > a {
        background-color: transparent;
        color: var(--secondary);

        &:hover {
          color: var(--dark);
          text-decoration: underline;
        }
      }
    }
  }
}
`
  UnlinkedMentions.afterDOMLoaded = overflowListAfterDOMLoaded

  return UnlinkedMentions
}) satisfies QuartzComponentConstructor
