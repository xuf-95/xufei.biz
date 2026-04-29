import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const links = [
  { label: "POSTS", href: "/posts/" },
  { label: "BG",  href: "/bigdata/" },
  { label: "TAGS",  href: "/tags/" },
]

const TopNav: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const slug = fileData.slug ?? ""
  const iconPath = baseDir + "/static/icon.png"  // 替换为你的实际图标文件名

  return (
    <nav class={classNames(displayClass, "top-nav")} aria-label="Primary">
      <div class="top-nav-left">
        <a href={baseDir} class="top-nav-logo">
          <img src={iconPath} alt={cfg?.pageTitle ?? "site icon"} />
        </a>
        {links.map((item) => {
          const isActive =
            item.href === ""
              ? slug === "index" || slug === ""
              : slug.startsWith(item.href.replace(/\/$/, ""))
          return (
            <a href={baseDir + item.href} class={isActive ? "active" : ""}>
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