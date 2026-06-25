import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { Icon } from "./Icon"

const GitHubLink: QuartzComponent = () => {
  return (
    <a
      class="github-link"
      href="https://github.com/xuf-95"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      title="GitHub"
    >
      <Icon name="github" />
    </a>
  )
}

GitHubLink.css = `
.github-link {
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

.github-link svg {
  width: 18px;
  height: 18px;
  display: block;
}

.github-link:hover,
.github-link:focus-visible {
  color: var(--dark);
  background: transparent;
  box-shadow: none;
}
`

export default (() => GitHubLink) satisfies QuartzComponentConstructor
