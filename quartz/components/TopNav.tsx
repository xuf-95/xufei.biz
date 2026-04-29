import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const links = [
  { label: "SITE",  href: "" },
  { label: "POSTS", href: "/posts/" },
  { label: "TAGS",  href: "/tags/" },
]

const TopNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const slug = fileData.slug ?? ""

  return (
    <div class={classNames(displayClass, "top-nav")}>
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
  )
}

TopNav.css = `
.top-nav {
  display: flex;
  align-items: stretch;
  height: 44px;
  flex: 1;
}

.top-nav a {
  display: flex;
  align-items: center;
  padding: 0 1.4rem;
  text-decoration: none;
  font-family: var(--titleFont);
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--gray);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-right: 1px solid var(--lightgray);
  white-space: nowrap;
  transition: color 0.15s ease;
  position: relative;
}

.top-nav a:first-child {
  border-left: 1px solid var(--lightgray);
}

.top-nav a:hover {
  color: var(--dark);
}

.top-nav a.active {
  color: var(--dark);
}

.top-nav a.active::after {
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