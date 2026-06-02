import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"

interface Options {
  links: Record<string, string>
  columns?: number
  itemsPerColumn?: number
}

type FooterColumn = {
  title: string
  pages: QuartzPluginData[]
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function titleFromSlug(slug: string): string {
  return slug
    .split("/")
    .pop()!
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
}

function sectionFromSlug(slug: string): string {
  return (slug.split("/")[1] ?? "Index").replace(/[-_]+/g, " ")
}

function buildIndexColumns(allFiles: QuartzPluginData[], columns: number, itemsPerColumn: number) {
  const grouped = allFiles
    .filter(
      (file) =>
        file.slug?.startsWith("index/") &&
        file.slug !== "index/index" &&
        !file.slug.endsWith("/") &&
        !file.frontmatter?.title?.startsWith("\uD83D\uDCC2"),
    )
    .reduce<Record<string, QuartzPluginData[]>>((acc, file) => {
      const section = sectionFromSlug(file.slug!)
      acc[section] ??= []
      acc[section].push(file)
      return acc
    }, {})

  return shuffle(
    Object.entries(grouped)
      .filter(([, pages]) => pages.length > 0)
      .map<FooterColumn>(([title, pages]) => ({
        title,
        pages: shuffle(pages).slice(0, itemsPerColumn),
      })),
  ).slice(0, columns)
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({
    allFiles,
    displayClass,
    fileData,
    cfg,
  }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? {}
    const columns = buildIndexColumns(allFiles, opts?.columns ?? 5, opts?.itemsPerColumn ?? 5)
    return (
      <footer class={`${displayClass ?? ""} site-footer`}>
        {columns.length > 0 && (
          <nav class="footer-directory" aria-label="Random index pages">
            {columns.map((column) => (
              <section class="footer-directory-column">
                <h2>{column.title}</h2>
                <ul>
                  {column.pages.map((page) => (
                    <li>
                      <a href={resolveRelative(fileData.slug!, page.slug!)}>
                        {page.frontmatter?.title ?? titleFromSlug(page.slug!)}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        )}
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
          <p class="footer-powered">
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>
          </p>
        </div>
        {/* <div class="badges">
          <a href="https://www.wikipedia.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://lmnt.me/files/images/badges/wikipedia.gif" alt="Wikipedia" />
          </a>
          <a href="https://archive.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://lmnt.me/files/images/badges/internet-archive.gif" alt="Internet Archive" />
          </a>
          <a href="https://www.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/foundation/press/kit/poweredBy/Apache_PoweredBy.svg" alt="Apache" width="88" height="31" />
          </a>

          <a href="https://flink.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/flink/default.png" alt="Flink" width="88" height="31" />
          </a>

          <a href="https://hadoop.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/hadoop/default.png" alt="Hadoop" width="88" height="31" />
          </a>

          <a href="https://hive.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/originals/hive.svg" alt="Hive" width="88" height="31" />
          </a>

          <a href="https://hbase.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/hbase/default.png" alt="HBase" width="88" height="31" />
          </a>

          <a href="https://spark.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/spark/default.png" alt="Spark" width="88" height="31" />
          </a>

          <a href="https://kafka.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/kafka/default.png" alt="Kafka" width="88" height="31" />
          </a>

          <a href="https://zookeeper.apache.org/" target="_blank" rel="noopener noreferrer">
            <img src="https://www.apache.org/logos/res/zookeeper/default.png" alt="Zookeeper" width="88" height="31" />
          </a>

        </div> */}
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
