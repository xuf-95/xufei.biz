# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm ci

# Local development (build + serve with hot reload)
npx quartz build --serve

# Build for production
npx quartz build

# Type check + prettier check
npm run check

# Format code
npm run format

# Run tests
npm test

# Build with bundle size analysis
npx quartz build --bundleInfo
```

**Requirements**: Node >= 22, npm >= 10.9.2

## Architecture

This is a **Quartz v4** static site generator that publishes Markdown/Obsidian notes as a website (xufei.biz — a data engineering digital garden).

### Two user-facing config files

- **`quartz.config.ts`**: Site-wide config — theme colors, typography, analytics, ignored patterns, and the plugin pipeline
- **`quartz.layout.ts`**: Page layout — which components appear in header, footer, left/right sidebars, and before/after body for content pages vs. list pages

### Plugin pipeline (`quartz/plugins/`)

Three plugin types process every content file in sequence:

1. **Transformers** (`transformers/`): Operate on markdown/HTML AST — parse frontmatter, resolve wikilinks, add syntax highlighting, generate ToC, handle LaTeX, etc.
2. **Filters** (`filters/`): Decide which pages are published. Currently uses `ExplicitPublish` — **only pages with `publish: true` in their frontmatter are built and served**.
3. **Emitters** (`emitters/`): Generate output files — HTML pages, RSS feed, sitemap, OG images, folder/tag index pages, static assets.

Each plugin is a factory function returning an object with `name` + handler methods. See `quartz/plugins/types.ts` for the interfaces.

### Components (`quartz/components/`)

Preact components used as layout building blocks. Each component can have:
- A `.tsx` file (server-side render to static HTML)
- A `.inline.ts` file in `scripts/` (client-side JS bundled separately)
- A `.scss` file in `styles/` (scoped styles)

The render pipeline in `renderPage.tsx` assembles components from `quartz.layout.ts` into full HTML pages.

### Content (`content/`)

Obsidian-flavored Markdown files. Folder structure:
- `Open BigData/` — big data tech notes (Flink, Spark, Hive, Kafka, etc.)
- `Open BigData/Data Architecture/` — architecture patterns and blueprints
- `Open BigData/Data Governance/` — DAMA, DCMM, data quality, lineage
- `Open BigData/Cloud/` — Alibaba Cloud / MaxCompute notes
- `Posts/` — general posts and personal writing
- `AI/` — AI and agent-related content

Folders `private/`, `templates/`, `.obsidian/`, and `drafts/*` are excluded from builds.

### Publishing frontmatter

Pages must explicitly opt in to be published:
```yaml
---
publish: true
---
```

Without `publish: true`, pages are excluded by the `ExplicitPublish` filter even if `draft` is set to `false`.
