import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const links = [
  { label: "site", href: "" },
  { label: "pkm", href: "bigdata/" },
  { label: "tags", href: "/tags/" },
  { label: "about", href: "/about/" },
]

const TopNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)

  return (
    <nav class={classNames(displayClass, "top-nav")} aria-label="Primary">
      {links.map((item) => (
        <a href={`${baseDir}${item.href}`}>{item.label}</a>
      ))}
    </nav>
  )
}

TopNav.css = `
.top-nav {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  border: 1px solid var(--lightgray);
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
}

.top-nav a {
  text-decoration: none;
  font-family: var(--titleFont);
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.5rem 1.5rem;
  border-right: 1px solid var(--lightgray);
  line-height: 1;
  white-space: nowrap;
}

.top-nav a:last-child {
  border-right: none;
}
`

export default (() => TopNav) satisfies QuartzComponentConstructor
