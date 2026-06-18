import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"
import { GlobalConfiguration } from "../cfg"

interface Options {
  links: Record<string, string>
}

interface FooterItem {
  label: string
  href: string
}

interface FooterGroup {
  title: string
  items: FooterItem[]
}

const footerGroups: FooterGroup[] = [
  {
    title: "Index",
    items: [
      { label: "Map", href: "/index/00-Map/" },
      { label: "AI", href: "/index/AI/" },
      { label: "Open BigData", href: "/index/Open-BigData/" },
      { label: "Data Architecture", href: "/index/Data-Architecture/" },
      { label: "Data Store", href: "/index/Data-Store/" },
      { label: "Posts", href: "/index/Posts/" },
    ],
  },
  {
    title: "Open BigData",
    items: [
      { label: "Apache Spark", href: "/index/Open-BigData/Apache-Spark/" },
      { label: "Apache Hadoop", href: "/index/Open-BigData/Apache-Hadoop/" },
      { label: "Apache Flink", href: "/index/Open-BigData/Apache-Flink/" },
      { label: "Apache Hive", href: "/index/Open-BigData/Apache-Hive/" },
      { label: "Apache Paimon", href: "/index/Open-BigData/Apache-Paimon/" },
    ],
  },
  {
    title: "Data Architecture",
    items: [
      { label: "DCMM", href: "/index/Data-Architecture/DCMM/" },
      { label: "Data Mesh", href: "/index/Data-Architecture/Data-Mesh/" },
      { label: "Data Lake", href: "/index/Data-Architecture/Data-Lake/" },
      { label: "Lakehouse", href: "/index/Data-Architecture/Lakehouse/" },
      { label: "Lambda Architecture", href: "/index/Data-Architecture/Lambda-Architecture/" },
    ],
  },
  {
    title: "Data Store",
    items: [
      { label: "Cassandra", href: "/index/Data-Store/Cassandra/" },
      { label: "ClickHouse", href: "/index/Data-Store/ClickHouse/" },
      { label: "Apache Doris", href: "/index/Data-Store/Apache-Doris/" },
      { label: "Redis", href: "/index/Data-Store/Redis/" },
      { label: "Database Design", href: "/index/Data-Store/Database-Design/" },
    ],
  },
]

function siteRootPrefix(cfg: GlobalConfiguration | undefined): string {
  if (!cfg?.baseUrl) return ""
  try {
    const pathname = new URL(cfg.baseUrl).pathname.replace(/\/$/, "")
    return pathname === "/" ? "" : pathname
  } catch {
    return ""
  }
}

function absSitePath(cfg: GlobalConfiguration | undefined, path: string): string {
  if (/^https?:\/\//.test(path)) return path
  const p = path.startsWith("/") ? path : `/${path}`
  return `${siteRootPrefix(cfg)}${p}`
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? {}
    const iconPath = absSitePath(cfg, "/static/icon.png")

    return (
      <footer class={`${displayClass ?? ""} site-footer`}>
        <div class="footer-shell">
          <section class="footer-brand-panel" aria-label="Site">
            <a href={absSitePath(cfg, "/")} class="footer-brand">
              <img src={iconPath} alt="" class="footer-logo" />
              <span class="footer-brand-name">{cfg.pageTitle}</span>
            </a>
            <p class="footer-tagline">
              Data engineering notes, architecture maps, and working references.
            </p>
            <ul class="footer-social">
              {Object.entries(links).map(([text, link]) => (
                <li>
                  <a href={link}>{text}</a>
                </li>
              ))}
            </ul>
          </section>

          <nav class="footer-directory" aria-label="Index footer">
            {footerGroups.map((group) => (
              <section class="footer-group">
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li>
                      <a href={absSitePath(cfg, item.href)}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          <div class="footer-bottom">
            <p>© {year} xufei.biz. All rights reserved.</p>
            <p class="footer-powered">
              {i18n(cfg.locale).components.footer.createdWith}{" "}
              <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>
            </p>
          </div>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
