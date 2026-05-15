import { Date, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: false,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      const segments: (string | JSX.Element)[] = []

      if (fileData.dates) {
        const created = getDate(cfg, fileData)!

        // publishDate may be a Date object (Quartz auto-parses date-like frontmatter)
        // or a string — handle both, and guard against undefined/invalid values
        const rawPublish = fileData.frontmatter?.publishDate
        let publishDate: globalThis.Date | null = null

        if (rawPublish instanceof globalThis.Date && !isNaN(rawPublish.getTime())) {
          publishDate = rawPublish
        } else if (typeof rawPublish === "string" && rawPublish.trim() !== "") {
          const parsed = new globalThis.Date(rawPublish.trim())
          if (!isNaN(parsed.getTime())) publishDate = parsed
        }

        if (publishDate) {
          segments.push(
            <span class="content-meta-dates">
              <Date date={created} locale={cfg.locale} />
              <span class="content-meta-separator"> — </span>
              <Date date={publishDate} locale={cfg.locale} />
            </span>
          )
        } else {
          segments.push(<Date date={created} locale={cfg.locale} />)
        }
      }

      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        segments.push(<span>{displayedTime}</span>)
      }

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor