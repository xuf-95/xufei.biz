// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
// @ts-ignore
import sidenotesScript from "./scripts/sidenotes.inline"
// @ts-ignore
import imageLightboxScript from "./scripts/imageLightbox.inline"
import clipboardStyle from "./styles/clipboard.scss"
import imageLightboxStyle from "./styles/imageLightbox.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = [clipboardScript, sidenotesScript, imageLightboxScript]
Body.css = [clipboardStyle, imageLightboxStyle]

export default (() => Body) satisfies QuartzComponentConstructor
