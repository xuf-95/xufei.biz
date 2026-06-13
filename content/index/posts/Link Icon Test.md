---
title: "Link Icon Test"
date: 2026-04-28
tags:
  - quartz
  - test
  - links
publish: false
description: A manual test page for automatic external favicon resolution, protocol handling, file links, and internal-link controls.
draft: true


---

This page is used to manually verify the automatic external favicon system.

Expected behavior:

- every `http` or `https` external link should render the site's default favicon through the favicon resolver
- icons should render as the original favicon, without custom background, border, or shadow
- file links like PDF, ZIP, JSON, CSV, image, audio, and video should still use the site's favicon
- non-web protocols should keep the text fallback and should not attempt to load `/favicon.ico`
- internal links such as [[content/index/Posts/index]] should not show any external-link suffix

## Resolver Reliability Cases

- [GitHub](https://github.com/)
- [GitHub Repository ZIP](https://github.com/jackyzha0/quartz/archive/refs/heads/v4.zip)
- [Medium](https://medium.com/)
- [Medium Engineering](https://medium.engineering/)
- [Nerd Fitness](https://www.nerdfitness.com/)
- [SRT 2 VIDEO](http://srt.ksawerykomputery.pl/)
- [The Economist](https://www.economist.com/)
- [Brookings](https://www.brookings.edu/)

## Colored Organization Favicons

- [Quartz](https://quartz.jzhao.xyz/)
- [Obsidian](https://obsidian.md/)
- [Wikipedia](https://en.wikipedia.org/wiki/Hypertext)
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page)
- [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)
- [DeepMind](https://deepmind.google/)
- [W3C](https://www.w3.org/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [Microsoft Learn](https://learn.microsoft.com/en-us/)

## Domain And Subdomain Favicons

- [Google Docs](https://docs.google.com/document/u/0/)
- [Google Scholar](https://scholar.google.com/)
- [OSS Insight](https://ossinsight.io/)
- [Next OSS Insight](https://next.ossinsight.io/)
- [Zhihu](https://www.zhihu.com/)
- [Zhihu Column](https://zhuanlan.zhihu.com/p/611997675)
- [Zhihu Redirect](https://link.zhihu.com/?target=https%3A%2F%2Fexample.com)
- [CSDN](https://blog.csdn.net/)
- [Cnblogs](https://www.cnblogs.com/)
- [O'Reilly Radar](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)

## File Links Should Still Use Site Favicons

- [Sample PDF](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)
- [Sample ZIP](https://github.com/jackyzha0/quartz/archive/refs/heads/v4.zip)
- [Sample JSON](https://api.github.com/repos/jackyzha0/quartz)
- [Sample CSV](https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv)
- [Sample PNG](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)
- [Sample MP3](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3)
- [Sample MP4](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)
- [Sample JavaScript](https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js)
- [DeepMind PDF](https://storage.googleapis.com/deepmind-media/AlphaFold/AlphaFoldNaturePaper.pdf)
- [Unknown PDF](https://example.com/files/whitepaper.pdf)

## Fallback Domain Favicons

- [Boing Boing](https://boingboing.net/)
- [Know Your Meme](https://knowyourmeme.com/)
- [Worrydream](https://worrydream.com/)
- [Data Engineering Wiki](https://dataengineering.wiki/Index)
- [Visual Paradigm](https://www.visual-paradigm.com/features/)
- [Ververica](https://www.ververica.com/)
- [Estuary](https://estuary.dev/)
- [Darebee](https://darebee.com/)
- [Lofi Cafe](https://www.lofi.cafe/)
- [Apartment Therapy](https://www.apartmenttherapy.com/)

## Text Alias Edge Cases

- [go](https://go.dev/)
- [R](https://www.r-project.org/)
- [A very long link title that should not be used as the visible icon label](https://example.org/articles/long-title)
- [中文链接标题](https://www.zhihu.com/)
- [https://github.com/jackyzha0/quartz](https://github.com/jackyzha0/quartz)
- [OpenAI API docs](https://platform.openai.com/docs/overview)

## Non-Web Protocol Control

- [ChatGPT entity link](chatgpt://generic-entity?number=0)
- [Mail link](mailto:hello@example.com)
- [Telephone link](tel:+1234567890)

## Internal Control

- [[content/index/Posts/index|Internal link should not show any external suffix]]
- [[content/index/Open BigData/index|Another internal link without external icon]]
