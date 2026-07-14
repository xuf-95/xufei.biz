import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { Icon, IconName } from "./Icon"
import { FullSlug, resolveRelative } from "../util/path"

interface LearningResource {
  title: string
  description: string
  href: FullSlug
  icon: IconName
}

const resources: LearningResource[] = [
  {
    title: "AI Notes",
    description: "Agents, LLMs, RAG and applied AI workflows.",
    href: "/AI/" as FullSlug,
    icon: "note",
  },
  {
    title: "Big Data Wiki",
    description: "Architecture, engines, storage and governance.",
    href: "/BigData/" as FullSlug,
    icon: "library",
  },
  {
    title: "Technical English",
    description: "Build technical vocabulary through architecture topics.",
    href: "/BigData/Data-Architecture/" as FullSlug,
    icon: "book-open",
  },
  {
    title: "Prompt Engineering",
    description: "Patterns for clearer and more reliable AI prompts.",
    href: "/AI/Prompt-Engineering" as FullSlug,
    icon: "talks",
  },
  {
    title: "Data Architecture",
    description: "Blueprints and decisions for modern data systems.",
    href: "/BigData/Data-Architecture/Data-Architecture" as FullSlug,
    icon: "grid",
  },
]

const KeepLearning: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  return (
    <section class="keep-learning-shell" aria-labelledby="keep-learning-title">
      <div class="keep-learning">
        <div class="keep-learning__header">
          <p class="keep-learning__eyebrow">Resources</p>
          <h2 id="keep-learning-title">Keep Learning</h2>
        </div>
        <div class="keep-learning__grid">
          {resources.map((resource) => (
            <a
              class="keep-learning__card internal"
              href={resolveRelative(fileData.slug!, resource.href)}
            >
              <Icon class="keep-learning__icon" name={resource.icon} />
              <span class="keep-learning__title">
                {resource.title}
                <Icon class="keep-learning__arrow" name="arrow-up-right" />
              </span>
              <span class="keep-learning__description">{resource.description}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

KeepLearning.css = `
.keep-learning-shell {
  box-sizing: border-box;
  grid-column: 1 / -1;
  width: 100%;
}

.keep-learning {
  --keep-learning-accent: #cf6b4d;
  box-sizing: border-box;
  width: min(calc(100vw - 4rem), 1080px);
  margin: 1rem 0 0 50%;
  padding: clamp(2rem, 4vw, 3rem);
  border: 1px solid color-mix(in srgb, var(--lightgray) 78%, transparent);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--light) 76%, var(--lightgray));
  transform: translateX(-50%);
}

.keep-learning__header {
  margin-bottom: 2.25rem;
}

.keep-learning__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--keep-learning-accent);
  font-family: var(--titleFont);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
}

.keep-learning__header h2 {
  margin: 0;
  color: var(--dark);
  font-family: var(--titleFont);
  font-size: clamp(1.65rem, 3vw, 2rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.keep-learning__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.keep-learning__card,
.keep-learning__card:hover,
.keep-learning__card:focus-visible {
  box-shadow: none !important;
  text-decoration: none;
}

.keep-learning__card {
  box-sizing: border-box;
  min-width: 0;
  min-height: 10.5rem;
  padding: 1.6rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.85rem;
  background: transparent;
  color: var(--dark);
  transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.keep-learning__card:hover,
.keep-learning__card:focus-visible {
  border-color: color-mix(in srgb, var(--darkgray) 58%, var(--lightgray));
  background: color-mix(in srgb, var(--highlight) 48%, transparent);
  transform: translateY(-2px);
}

.keep-learning__card:focus-visible {
  outline: 2px solid var(--keep-learning-accent);
  outline-offset: 3px;
}

.keep-learning__icon {
  display: block;
  width: 1.65rem;
  height: 1.65rem;
  margin-bottom: 1.35rem;
  color: var(--darkgray);
  stroke-width: 1.7;
}

.keep-learning__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  color: var(--dark);
  font-family: var(--titleFont);
  font-size: 1.08rem;
  font-weight: 650;
  line-height: 1.25;
}

.keep-learning__arrow {
  flex: none;
  width: 1rem;
  height: 1rem;
  color: var(--gray);
  stroke-width: 1.8;
}

.keep-learning__description {
  display: block;
  margin-top: 0.55rem;
  color: var(--gray);
  font-size: 0.94rem;
  line-height: 1.45;
}

@media all and (max-width: 1149px) {
  .keep-learning {
    width: 100%;
    margin-left: 0;
    transform: none;
  }

  .keep-learning__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media all and (max-width: 800px) {
  .keep-learning {
    width: 100%;
    margin-top: 0.5rem;
    padding: 1.5rem;
    border-radius: 1rem;
  }

  .keep-learning__header {
    margin-bottom: 1.5rem;
  }

  .keep-learning__grid {
    grid-template-columns: 1fr;
  }

  .keep-learning__card {
    min-height: 0;
    padding: 1.35rem;
  }
}
`

export default (() => KeepLearning) satisfies QuartzComponentConstructor
