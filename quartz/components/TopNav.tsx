import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"
import { classNames } from "../util/lang"

/** Path prefix when baseUrl is e.g. https://user.github.io/repo/ → "/repo" */
function siteRootPrefix(cfg: GlobalConfiguration | undefined): string {
  if (!cfg?.baseUrl) return ""
  try {
    const pathname = new URL(cfg.baseUrl).pathname.replace(/\/$/, "")
    return pathname === "/" ? "" : pathname
  } catch {
    return ""
  }
}

function absSitePath(cfg: GlobalConfiguration | undefined, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${siteRootPrefix(cfg)}${p}`
}

const links = [
  { label: "POSTS", path: "/posts/" },
  { label: "BG", path: "/bigdata/" },
  { label: "TAGS", path: "/tags/" },
  { label: "GOODS", path: "/hobby/goods/" },
]

const TopNav: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const iconPath = absSitePath(cfg, "/static/icon.png")

  return (
    <nav class={classNames(displayClass, "top-nav")} aria-label="Primary">
      <div class="top-nav-left">
        <a href={absSitePath(cfg, "/")} class="top-nav-logo">
          <img src={iconPath} alt={cfg?.pageTitle ?? "site icon"} />
        </a>
        {links.map((item) => {
          const navKey = item.path.replace(/^\//, "").replace(/\/$/, "")
          const isActive = slug === navKey || slug.startsWith(`${navKey}/`)
          return (
            <a href={absSitePath(cfg, item.path)} class={isActive ? "active" : ""}>
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

TopNav.css = `
.top-nav {
  width: 100%;
}

.top-nav-left {
  display: flex;
  align-items: stretch;
  height: 44px;
}

.top-nav-logo {
  display: flex;
  align-items: center;
  padding: 0 0.8rem;
  border-right: 1px solid var(--lightgray);
  text-decoration: none;
  flex-shrink: 0;
}

.top-nav-logo img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
}

.top-nav-left a {
  display: flex;
  align-items: center;
  padding: 0 1.4rem;
  text-decoration: none;
  font-family: var(--titleFont);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-right: 1px solid var(--lightgray);
  white-space: nowrap;
  transition: color 0.15s ease;
  position: relative;
}

.top-nav-left a:first-child {
  border-left: 1px solid var(--lightgray);
}

.top-nav-left a:hover {
  color: var(--dark);
}

.top-nav-left a.active {
  color: var(--dark);
  font-weight: 600;
}

.top-nav-left a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--dark);
}
`

export default (() => TopNav) satisfies QuartzComponentConstructor