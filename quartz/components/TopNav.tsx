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
        <div class="top-nav-links">
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
  gap: 0.5rem;
}

.top-nav-logo {
  display: flex;
  align-items: center;
  padding: 0 0.8rem;
  margin-right: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
  border-right: 1px solid var(--lightgray);
}

.top-nav-logo img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
}

.top-nav-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.top-nav-links a {
  display: flex;
  align-items: center;
  padding: 0 0.8rem;
  text-decoration: none;
  font-family: var(--titleFont);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 0.15s ease;
  border-radius: 4px;
}

.top-nav-links a:hover {
  color: var(--dark);
  background: var(--highlight);
}

.top-nav-links a.active {
  color: var(--dark);
  font-weight: 600;
}
`

export default (() => TopNav) satisfies QuartzComponentConstructor