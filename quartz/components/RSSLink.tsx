import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { Icon } from "./Icon"

function siteRootPrefix(baseUrl: string | undefined): string {
  if (!baseUrl) return ""
  try {
    const url = baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`
    const pathname = new URL(url).pathname.replace(/\/$/, "")
    return pathname === "/" ? "" : pathname
  } catch {
    return ""
  }
}

const RSSLink: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const href = `${siteRootPrefix(cfg?.baseUrl)}/index.xml`

  return (
    <a class="rss-link" href={href} aria-label="RSS Feed" title="RSS Feed">
      <Icon name="rss" />
    </a>
  )
}

RSSLink.css = `
.rss-link {
  box-sizing: border-box;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--darkgray);
  text-decoration: none;
  background: transparent;
  border-radius: 6px;
}

.rss-link svg {
  width: 18px;
  height: 18px;
  display: block;
}

.rss-link:hover,
.rss-link:focus-visible {
  color: var(--dark);
  background: transparent;
  box-shadow: none;
}
`

export default (() => RSSLink) satisfies QuartzComponentConstructor
