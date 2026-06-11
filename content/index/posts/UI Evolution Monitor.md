---
title: UI Evolution Monitor
aliases:
  - UI 自动监视
  - Quartz UI Audit
  - UI Evolution
tags:
  - quartz
  - ui
  - monitoring
  - style-guide
description: 记录本站 UI 样式、布局和页面视觉质量的自动监视方式，支撑后续 Quartz 页面持续演进。
date: 2026-06-11
publish: true
draft: false
---

## Purpose

**UI Evolution Monitor** 用来把样式演进变成可验证流程。每次新增样式、调整布局或生成图形组件后，都要通过构建和 UI 审计，避免页面出现断链、样式未接入、HTML 片段未渲染、关键页面缺内容等问题。

当前监视分两层：

1. **Build Check**：确认 Quartz 能成功解析 Markdown、SCSS、HTML 片段并生成静态页面。
2. **UI Audit**：检查关键页面和样式组件是否进入构建产物，识别常见 UI 集成风险。

## Commands

```bash
npm run quartz build
npm run ui:audit
```

`ui:audit` 会读取 `public/` 里的构建产物，所以必须先执行 Quartz build。

## Current Coverage

`scripts/ui-audit.mjs` 当前覆盖这些关键页面：

| Page | Coverage |
| --- | --- |
| Home | Bigdata Wiki OS、Style Guide、Diagram Style Guide 入口 |
| Quartz Style Guide | 样式系统地图、Callout、Changelog |
| Quartz Diagram Style Guide | `wiki-diagram-*` 图形组件 |
| Bigdata Wiki OS | MOC 和 DATA+AI 入口 |
| Data Agent Architecture | Agent、语义层、元数据入口 |

## What It Catches

- 关键页面没有生成。
- 必要标题、入口或 class 没进入 HTML。
- `diagram-components.scss` 没有被 `custom.scss` 引入。
- `wiki-diagram-*` 样式组件缺失。
- 页面中出现明显渲染异常 token：`undefined`、`NaN`、`[object Object]`。
- 页面出现空 `href`。
- HTML 里残留未解析的 `[[wikilink]]`。
- 单页 inline style 数量异常偏多。

## What It Does Not Catch Yet

- 真实浏览器中的像素级重叠。
- 移动端点击体验。
- 暗色模式视觉细节。
- 截图对比和视觉回归。
- Lighthouse 性能和可访问性评分。

这些需要后续接入 Playwright 或浏览器截图工具。当前仓库没有新增 Playwright 依赖，先保持轻量、无新依赖。

## Evolution Roadmap

### Phase 1: Static UI Audit

- Build check.
- Generated HTML smoke test.
- Custom component presence check.
- Key page content check.

### Phase 2: Browser Layout Audit

- 桌面、平板、移动视口截图。
- 检查横向滚动、元素重叠、空白组件。
- 检查暗色模式和 Reader Mode。

### Phase 3: Visual Regression

- 保存基线截图。
- 对比关键页面差异。
- 只对 Style Guide、Diagram Guide、Bigdata Wiki OS、首页做视觉基线。

### Phase 4: Design Review Loop

- 每次新增样式后更新 [[Quartz Style Guide]] 和 [[Quartz Diagram Style Guide]]。
- 每次视觉问题修复后在本页记录 Changelog。
- 对高频模式沉淀为 `quartz/styles/custom/*.scss`。

## Changelog

| Date | Change | Evidence |
| --- | --- | --- |
| 2026-06-11 | 新增 `scripts/ui-audit.mjs` | `npm run ui:audit` |
| 2026-06-11 | 新增 `ui:audit` npm script | `package.json` |
| 2026-06-11 | 当前审计结果 PASS | 0 errors, 0 warnings |

## Links

- related:: [[Quartz Style Guide]]
- related:: [[Quartz Diagram Style Guide]]
- supports:: [[Bigdata Wiki OS]]
