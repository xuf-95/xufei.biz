---
title: Link Icon Test
date: 2026-04-28
tags:
  - quartz
  - test
  - links
publish: true
description: A manual test page for Gwern-style external link icon detection, including organization, domain, filetype, and fallback cases.
---

This page is used to manually verify the external link icon system.

Expected behavior:

- known organizations should render stable short labels or custom icons
- known domains should render their mapped suffixes
- file links like PDF and ZIP should prefer file-type labels
- unknown domains should fall back to an automatically generated short suffix
- internal links such as [[posts/index]] should not show any external-link suffix

## Organization Rules

- [GitHub](https://github.com/)
- [Quartz](https://quartz.jzhao.xyz/)
- [Obsidian](https://obsidian.md/)
- [Wikipedia](https://en.wikipedia.org/wiki/Hypertext)
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page)
- [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)
- [DeepMind](https://deepmind.google/)
- [W3C](https://www.w3.org/)
- [Medium](https://medium.com/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [Microsoft Learn](https://learn.microsoft.com/en-us/)

## Domain Rules

- [Google Docs](https://docs.google.com/document/u/0/)
- [Google Scholar](https://scholar.google.com/)
- [OSS Insight](https://ossinsight.io/)
- [Next OSS Insight](https://next.ossinsight.io/)
- [Zhihu](https://www.zhihu.com/)
- [Zhihu Redirect](https://link.zhihu.com/?target=https%3A%2F%2Fexample.com)
- [CSDN](https://blog.csdn.net/)
- [Cnblogs](https://www.cnblogs.com/)

## File Type Rules

- [Sample PDF](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)
- [Sample ZIP](https://github.com/jackyzha0/quartz/archive/refs/heads/v4.zip)
- [Sample JSON](https://api.github.com/repos/jackyzha0/quartz)
- [Sample CSV](https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv)
- [Sample PNG](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)
- [Sample MP3](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3)
- [Sample MP4](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)
- [Sample JavaScript](https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js)

## Fallback Rules

- [Brookings](https://www.brookings.edu/)
- [The Economist](https://www.economist.com/)
- [Boing Boing](https://boingboing.net/)
- [Know Your Meme](https://knowyourmeme.com/)
- [Worrydream](https://worrydream.com/)
- [Data Engineering Wiki](https://dataengineering.wiki/Index)
- [Visual Paradigm](https://www.visual-paradigm.com/features/)
- [Ververica](https://www.ververica.com/)

## Mixed Cases

- [GitHub repo archive ZIP](https://github.com/jackyzha0/quartz/archive/refs/heads/v4.zip)
- [DeepMind PDF](https://storage.googleapis.com/deepmind-media/AlphaFold/AlphaFoldNaturePaper.pdf)
- [Wikipedia image file](https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png)
- [OpenAI API docs](https://platform.openai.com/docs/overview)
- [Unknown PDF](https://example.com/files/whitepaper.pdf)

## Internal Control

- [[posts/index|Internal link should not show any external suffix]]
- [[bigdata/index|Another internal link without external icon]]
