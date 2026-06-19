import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? (
    <header>
      <div class="site-header-shell">{children}</div>
    </header>
  ) : null
}

Header.css = `
header {
  display: flex;
  align-items: center;
  margin: 0;
}

.site-header-shell {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: clamp(0.45rem, 1.4vw, 1rem);
  width: 100%;
  max-width: var(--site-shell-max);
  height: 100%;
  margin-inline: auto;
  padding-inline: var(--site-shell-pad);
}

@media all and (max-width: 1200px) {
  .site-header-shell {
    width: calc(100% - 2rem);
  }
}
`

export default (() => Header) satisfies QuartzComponentConstructor
