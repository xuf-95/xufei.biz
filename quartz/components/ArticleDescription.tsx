import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ArticleDescription: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const description = fileData.frontmatter?.description?.toString().trim()

  if (!description) {
    return null
  }

  return (
    <p class={classNames(displayClass, "article-description")}>
      <span class="article-description-text">{description}</span>
    </p>
  )
}

ArticleDescription.css = `
@font-face {
  font-family: 'Exposure';
  src: url('/static/exposure.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.article-description {
  margin: 0.75rem auto 0;
  max-width: min(100%, 56rem);
  text-align: center;
  font-family: 'Exposure', var(--titleFont);
  font-style: italic;
  font-size: 1.2rem;
  line-height: 1.7;
  opacity: 0.92;
}

.article-description-text {
  display: inline-block;
  font-style: oblique 10deg;
  transform: skewX(-8deg);
  transform-origin: center;
}
`

export default (() => ArticleDescription) satisfies QuartzComponentConstructor
