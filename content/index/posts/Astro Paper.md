---
title: Astro Paper PRD
date: 2024-01-09
aliases:
tags:
  - posts
description: A minimal, responsive and SEO-friendly Astro blog theme.
draft: true
publishDate: 2026-05-09T10:05
publish:
---
## AstroPaper 📄

[AstroPaper - Vercel](http://vercel.com/templates/astro/astro-paper)

AstroPaper is a minimal, responsive, accessible and SEO-friendly Astro blog theme. This theme is designed and crafted based on [my personal blog](https://satnaing.dev/blog).

Read [the blog posts](https://astro-paper.pages.dev/posts/) or check [the README Documentation Section](https://vercel.com/templates/astro/astro-paper#-documentation) for more info.

### 🔥 Features

- [x]  type-safe markdown
- [x]  super fast performance
- [x]  accessible (Keyboard/VoiceOver)
- [x]  responsive (mobile ~ desktops)
- [x]  SEO-friendly
- [x]  light & dark mode
- [x]  fuzzy search
- [x]  draft posts & pagination
- [x]  sitemap & rss feed
- [x]  followed best practices
- [x]  highly customizable
- [x]  dynamic OG image generation for blog posts [#15](https://github.com/satnaing/astro-paper/pull/15) ([Blog Post](https://astro-paper.pages.dev/posts/dynamic-og-image-generation-in-astropaper-blog-posts/))

_Note: I've tested screen-reader accessibility of AstroPaper using VoiceOver on Mac and TalkBack on Android. I couldn't test all other screen-readers out there. However, accessibility enhancements in AstroPaper should be working fine on others as well._

### ✅ Lighthouse Score

[](https://pagespeed.web.dev/report?url=https%3A%2F%2Fastro-paper.pages.dev%2F&form_factor=desktop)

### 🚀 Project Structure

Inside of AstroPaper, you'll see the following folders and files:

```
/
├── public/
│   ├── pagefind/ # auto-generated when build
│   ├── favicon.svg
│   └── astropaper-og.jpg
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   ├── data/
│   │   └── blog/
│   │       └── some-blog-posts.md
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   ├── utils/
│   ├── config.ts
│   ├── constants.ts
│   ├── content.config.ts
│   ├── env.d.ts
│   └── remark-collapse.d.ts
└── astro.config.ts
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory.

All blog posts are stored in `src/data/blog` directory.

### 📖 Documentation

Documentation can be read in two formats_ _markdown_ & _blog post_.

- Configuration - markdown [blocked] | [blog post](https://astro-paper.pages.dev/posts/how-to-configure-astropaper-theme/)
- Add Posts - markdown [blocked] | [blog post](https://astro-paper.pages.dev/posts/adding-new-posts-in-astropaper-theme/)
- Customize Color Schemes - markdown [blocked] | [blog post](https://astro-paper.pages.dev/posts/customizing-astropaper-theme-color-schemes/)
- Predefined Color Schemes - markdown [blocked] | [blog post](https://astro-paper.pages.dev/posts/predefined-color-schemes/)

### 💻 Tech Stack

Main Framework - [Astro](https://astro.build/)  
Type Checking - [TypeScript](https://www.typescriptlang.org/)  
Styling - [TailwindCSS](https://tailwindcss.com/)  
UI/UX - [Figma Design File](https://www.figma.com/community/file/1356898632249991861)  
Static Search - [FuseJS](https://pagefind.app/)  
Icons - [Tablers](https://tabler-icons.io/)  
Code Formatting - [Prettier](https://prettier.io/)  
Deployment - [Cloudflare Pages](https://pages.cloudflare.com/)  
Illustration in About Page - [https://freesvgillustration.com](https://freesvgillustration.com/)  
Linting - [ESLint](https://eslint.org/)

### 👨🏻‍💻 Running Locally

You can start using this project locally by running the following command in your desired directory:

```
# pnpmpnpm create astro@latest --template satnaing/astro-paper
# npmnpm create astro@latest -- --template satnaing/astro-paper
# yarnyarn create astro --template satnaing/astro-paper
# bunbun create astro@latest -- --template satnaing/astro-paper
```

Then start the project by running the following commands:

```
# install dependencies if you haven't done so in the previous step.pnpm install
# start running the projectpnpm run dev
```

As an alternative approach, if you have Docker installed, you can use Docker to run this project locally. Here's how:

```
# Build the Docker imagedocker build -t astropaper .
# Run the Docker containerdocker run -p 4321:80 astropaper
```

### Google Site Verification (optional)

You can easily add your [Google Site Verification HTML tag](https://support.google.com/webmasters/answer/9008080#meta_tag_verification&zippy=%2Chtml-tag) in AstroPaper using an environment variable. This step is optional. If you don't add the following environment variable, the google-site-verification tag won't appear in the HTML `<head>` section.

```
# in your environment variable file (.env)PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

> See [this discussion](https://github.com/satnaing/astro-paper/discussions/334#discussioncomment-10139247) for adding AstroPaper to the Google Search Console.

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

> _Note!_ For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

|Command|Action|
|---|---|
|`pnpm install`|Installs dependencies|
|`pnpm run dev`|Starts local dev server at `localhost:4321`|
|`pnpm run build`|Build your production site to `./dist/`|
|`pnpm run preview`|Preview your build locally, before deploying|
|`pnpm run format:check`|Check code format with Prettier|
|`pnpm run format`|Format codes with Prettier|
|`pnpm run sync`|Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync).|
|`pnpm run lint`|Lint with ESLint|
|`docker compose up -d`|Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.|
|`docker compose run app npm install`|You can run any command above into the docker container.|
|`docker build -t astropaper .`|Build Docker image for AstroPaper.|
|`docker run -p 4321:80 astropaper`|Run AstroPaper on Docker. The website will be accessible at `http://localhost:4321`.|

> _Warning!_ Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).

### ✨ Feedback & Suggestions

If you have any suggestions/feedback, you can contact me via [my email](mailto:contact@satnaing.dev). Alternatively, feel free to open an issue if you find bugs or want to request new features.