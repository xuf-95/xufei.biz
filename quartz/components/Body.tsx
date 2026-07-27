// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
// @ts-ignore
import footnotesScript from "./scripts/footnotes.inline"
// @ts-ignore
import imageLightboxScript from "./scripts/imageLightbox.inline"
import clipboardStyle from "./styles/clipboard.scss"
import footnotesStyle from "./styles/footnotes.scss"
import imageLightboxStyle from "./styles/imageLightbox.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = [clipboardScript, footnotesScript, imageLightboxScript]
Body.css = [clipboardStyle, footnotesStyle, imageLightboxStyle]

export default (() => Body) satisfies QuartzComponentConstructor
