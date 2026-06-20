// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
// @ts-ignore
import sidenotesScript from "./scripts/sidenotes.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = [clipboardScript, sidenotesScript]
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor
