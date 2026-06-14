import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? {}
    return (
      <footer class={`${displayClass ?? ""} site-footer`}>
        <div class="footer-meta">
          <div>
            <ul class="footer-links">
              {Object.entries(links).map(([text, link]) => (
                <li>
                  <a href={link}>{text}</a>
                </li>
              ))}
            </ul>
            <p>© {year} xufei.biz. All rights reserved.</p>
          </div>
          {/* <div class="badges" style="display: flex; align-items: right; gap: 0.75rem;">
          <a href="https://www.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/foundation/press/kit/poweredBy/Apache_PoweredBy.svg" alt="Apache" width="88" height="31" />
          </a>
          <a href="https://www.wikipedia.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://lmnt.me/files/images/badges/wikipedia.gif" alt="Wikipedia" />
          </a>
          <a href="https://archive.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://lmnt.me/files/images/badges/internet-archive.gif" alt="Internet Archive" />
          </a>

          </div> */}
          <p class="footer-powered">
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>
          </p>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
