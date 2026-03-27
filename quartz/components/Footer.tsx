import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
          {i18n(cfg.locale).components.footer.createdWith}{" "}
          <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
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
