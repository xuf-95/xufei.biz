---
title: Quartz Style Guide
aliases:
  - Quartz 样式使用指南
  - Wiki Style Demo
  - Style Changelog
tags:
  - quartz
  - style-guide
  - digital-garden
description: 记录本站 Quartz 官方样式和自定义样式的使用方式、适用场景、示例代码与维护变更。
date: 2026-06-11
publish: false
draft: true
---

## Purpose

这篇页面是本站的 **样式 Demo + 使用手册 + Changelog**。后续写文章时优先复用这里的结构，让文本、布局、图片、Callout、导航卡片和流程图保持统一。

适用范围：

- 长文教程：用目录、Callout、流程步骤和表格组织信息。
- 技术方案：用双栏、信息框、架构图、对比表和决策块表达取舍。
- Wiki 笔记：用统一的链接、引用、图片标题和元信息提升可读性。
- 首页/专题页：用 Gallery Card、Home Layout 和 Process Steps 做导航。

## Style System Map

当前样式入口在 [[Quartz MKD]] 和 `quartz/styles/custom.scss`，主要由 Quartz 官方基础样式和自定义模块组成。

| 样式模块 | 文件 | 用途 |
| --- | --- | --- |
| Base Typography | `quartz/styles/base.scss` | 标题、正文、链接、表格、代码块、布局基础 |
| Callouts | `quartz/styles/callouts.scss` | 官方 Callout 颜色、折叠、标题和内容结构 |
| Callout Adjustments | `quartz/styles/custom/callout-adjustments.scss` | Callout 宽度、位置、标题、边框和文本控制 |
| Column Callout | `quartz/styles/custom/column-callout.scss` | 用 Callout 组织 2/3 列内容 |
| Caption Callout | `quartz/styles/custom/caption-callout.scss` | 图片说明和小型图注 |
| Infobox Callout | `quartz/styles/custom/infobox-callout.scss` | 类 Wiki 右侧信息框 |
| Home Layout | `quartz/styles/custom/home-layout.scss` | 首页 banner、双栏导航和分区标题 |
| Gallery Card View | `quartz/styles/custom/gallery-card-view.scss` | 文章内卡片导航 |
| Process Steps | `quartz/styles/custom/process-steps.scss` | 步骤式流程面板 |
| Quote Tabs | `quartz/styles/custom/quote-tabs.scss` | Radio tab 切换式引用面板 |
| Image Layouts | `quartz/styles/images-layouts.scss` | 图片卡片、宽图、浮动图、拼贴图 |
| Diagram Components | `quartz/styles/custom/diagram-components.scss` | 架构图、流程图、能力地图和决策图 |
| Sidenotes | `quartz/plugins/transformers/sidenotes.ts` + `quartz/components/scripts/sidenotes.inline.ts` + `quartz/styles/custom.scss` | Markdown 脚注自动变成桌面右侧标注 |

## Writing Defaults

### Text

- 一级标题用于页面主题，正文内从 `##` 开始组织。
- 段落保持短句和短段，技术文章每段只表达一个判断。
- 链接优先使用 Obsidian 双链，例如 [[Bigdata Wiki OS]]、[[Data Architecture]]。
- 行内代码用于字段、命令、文件名、参数，例如 `dcmm_domain`、`npm run quartz build`。

### Links

Quartz 基础样式已经为正文链接加下划线，内部链接有浅色背景。写作时：

- 概念首次出现时加双链。
- 同一个段落不要过度链接。
- 外部链接用于官方文档、论文和工具主页。

### Sidenotes / 右侧标注

右侧标注使用标准 Markdown 脚注语法。桌面端会把脚注复制到正文右侧，正文里的被标注词使用点状下划线，右侧说明默认是低对比灰色；鼠标 hover、键盘 focus 或点击脚注编号时，对应右侧说明会变亮。移动端继续显示为普通底部脚注，避免挤压正文。

示例：Zettelkasten[^style-sidenote-zettel] 和 PARA[^style-sidenote-para] 都适合作为概念首次出现时的轻量补充。

[^style-sidenote-zettel]: Zettelkasten 是卡片盒笔记法，适合给一个概念补充定义、来源或上下文，而不打断正文叙事。

[^style-sidenote-para]: PARA 指 Projects、Areas、Resources、Archives，适合在文章中快速解释缩写，不必展开成完整小节。

```markdown
Zettelkasten[^style-sidenote-zettel] 和 PARA[^style-sidenote-para]

[^style-sidenote-zettel]: 这里写右侧标注内容。

[^style-sidenote-para]: 这里写另一个右侧标注内容。
```

使用规则：

- 把脚注紧贴在要标注的词后面，例如 `Zettelkasten[^note]`。
- 右侧标注适合短解释、来源、补充背景；超过两三句话时改用 Callout 或正文小节。
- 桌面端底部脚注会隐藏，移动端仍保留底部脚注。
- 中文长句里如果需要精确下划线，建议在目标词前后留出自然分隔，例如空格、标点或行内代码。

### Tables

表格适合用于能力矩阵、方案对比、字段说明和 Changelog。

| 场景 | 推荐结构 | 示例 |
| --- | --- | --- |
| 工具对比 | 维度 / 方案 A / 方案 B / 结论 | Doris vs StarRocks |
| 治理清单 | 能力项 / 规则 / 证据 / 责任人 | 数据质量规则 |
| 样式记录 | 日期 / 变更 / 文件 / 影响 | 本页 Changelog |

## Callout Patterns

### 基础 Callout

> [!info]
> 用于解释背景、概念补充和上下文说明。本站 Callout 使用左边框和轻背景，适合长文中的信息分层。

> [!tip]
> 用于最佳实践、写作建议和可复用经验。

> [!warning]
> 用于风险、限制、兼容性问题和容易误用的样式。

> [!example]
> 用于展示模板、语法片段和使用案例。

```markdown
> [!tip]
> 这里写建议内容。
```

### Callout Metadata

自定义 metadata 可以控制位置、宽度、标题、边框和文本。

| Metadata | 效果 | 推荐场景 |
| --- | --- | --- |
| `left` / `right` | 左/右浮动 | 小图注、旁注 |
| `center` | 居中 | 重点说明 |
| `wsmall` / `wmed` / `wtall` | 百分比宽度 | 控制 Callout 宽度 |
| `static` | 使用固定像素宽度 | 需要稳定宽度的示意块 |
| `no-title` / `no-t` | 隐藏标题 | 嵌入式说明 |
| `no-icon` / `no-i` | 隐藏图标 | 更简洁的正文提示 |
| `clean` | 移除边框和背景 | 卡片内嵌、图文组合 |
| `txt-c` / `ttl-c` | 内容/标题居中 | 标语、指标块 |

```markdown
> [!info|right wsmall]
> 右侧小型补充说明。
```

> [!info|right wsmall]
> 这是一个右侧浮动小提示。移动端会自动变成全宽，避免正文挤压。

正文继续流动时，浮动 Callout 会让短补充更像边注。长内容不建议浮动，应保持全宽。

> [!info|clear]
> `clear` 用于结束浮动影响，让后续内容重新占满正文宽度。

### Column Callout

用于把同一层级的观点、方案或能力项并列展示。适合“概念 / 实践 / 产出”这类结构。

> [!column|3 clean]
>
> > [!tip] Concept
> >
> > 解释核心概念和边界，避免长篇堆叠。
>
> > [!example] Practice
> >
> > 写商业落地、工具组合和工程实施方式。
>
> > [!summary] Output
> >
> > 明确最后能产出什么文档、图、脚本或检查清单。

```markdown
> [!column|3 clean]
>
> > [!tip] Concept
> > 内容
>
> > [!example] Practice
> > 内容
>
> > [!summary] Output
> > 内容
```

### Caption Callout

用于图片下方的轻量说明。适合技术架构图、截图、数据图和产品图。

```markdown
> [!caption]
>
> ![[image.png|wsmall]]
>
> 图片说明。
```

### Infobox

用于文章开头的右侧摘要信息。适合技术组件、项目案例、标准规范和工具介绍。

> [!infobox]
>
> ## Style Token
>
> ### Meta
>
> | Item | Value |
> | --- | --- |
> | Type | Guide |
> | Status | Active |
> | Owner | Wiki |

```markdown
> [!infobox]
>
> ## Article Title
>
> ### Meta
>
> | Item | Value |
> | --- | --- |
> | Status | Draft |
```

## Gallery Card View

用于专题页或长文开头的导航卡片。卡片有 hover 状态和右侧箭头，适合引导读者跳转。

<nav class="gallery-card-view" aria-label="Style guide demos">
  <a class="gallery-card internal" href="/index/Data%20Architecture/Bigdata%20Wiki%20OS">
    <span class="gallery-card-title">Bigdata Wiki OS</span>
    <span class="gallery-card-subtitle">Knowledge graph and wiki operating system</span>
  </a>
  <a class="gallery-card internal" href="/index/00-Map/MOC-DATA%2BAI%20Agent%20%E5%9C%B0%E5%9B%BE">
    <span class="gallery-card-title">DATA+AI Agent</span>
    <span class="gallery-card-subtitle">Agent architecture and governance map</span>
  </a>
  <a class="gallery-card internal" href="/index/Data%20Model/Semantic%20Layer">
    <span class="gallery-card-title">Semantic Layer</span>
    <span class="gallery-card-subtitle">Metrics, dimensions and Text2SQL context</span>
  </a>
  <a class="gallery-card internal" href="/index/Data%20Governance/DAMA-DMBOK">
    <span class="gallery-card-title">DAMA-DMBOK</span>
    <span class="gallery-card-subtitle">International data management framework</span>
  </a>
</nav>

```html
<nav class="gallery-card-view" aria-label="Featured links">
  <a class="gallery-card internal" href="/index/Data%20Architecture/Bigdata%20Wiki%20OS">
    <span class="gallery-card-title">Bigdata Wiki OS</span>
    <span class="gallery-card-subtitle">Knowledge graph and wiki operating system</span>
  </a>
</nav>
```

## Process Steps

用于展示流程、方法论、实施路线和运维步骤。

<section class="process-steps-panel" aria-labelledby="style-process-title">
  <h2 id="style-process-title">Article Styling Workflow</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>Choose the article type</h3>
        <p>先判断文章是概念卡、架构方案、项目案例、教程还是 Changelog。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>Apply the structure</h3>
        <p>用标题、Callout、表格、图和卡片把内容分层，不依赖大段文字硬堆。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>Verify in Quartz</h3>
        <p>运行 <code>npm run quartz build</code>，确认 Markdown、Mermaid 和 HTML 片段能被正确解析。</p>
      </div>
    </li>
  </ol>
</section>

## Quote Tabs

Quote Tabs 适合在专题页中对比不同角色视角。目前样式绑定了三个固定 id：`qt-cursor`、`qt-lovable`、`qt-cognition`。如果未来要支持更多 tab，需要扩展 `quote-tabs.scss`。

<div class="qt-wrap">
  <input class="qt-radio" type="radio" name="style-tabs" id="qt-cursor" checked>
  <input class="qt-radio" type="radio" name="style-tabs" id="qt-lovable">
  <input class="qt-radio" type="radio" name="style-tabs" id="qt-cognition">
  <div class="qt-bar" role="tablist" aria-label="Style perspectives">
    <label for="qt-cursor">Engineer</label>
    <label for="qt-lovable">Architect</label>
    <label for="qt-cognition">CDO</label>
  </div>
  <div class="qt-panels">
    <div class="qt-panel qt-panel-cursor">
      <blockquote>工程师视角关注代码块、步骤、故障排查和可执行命令。</blockquote>
      <div class="qt-attribution">Use process steps and warning callouts.</div>
    </div>
    <div class="qt-panel qt-panel-lovable">
      <blockquote>架构师视角关注边界、组件关系、取舍和演进路线。</blockquote>
      <div class="qt-attribution">Use diagrams, tables and decision callouts.</div>
    </div>
    <div class="qt-panel qt-panel-cognition">
      <blockquote>CDO 视角关注业务价值、风险控制、指标和组织协同。</blockquote>
      <div class="qt-attribution">Use value maps and governance checklists.</div>
    </div>
  </div>
</div>

## Image Layouts

图片布局建议按用途选择，不要随意混用。

| 用途 | Class / 写法 | 说明 |
| --- | --- | --- |
| 普通图片 | `![[image.png]]` | 默认圆角、最大宽度自适应 |
| 控制尺寸 | `![[image.png\|wsmall]]` | 使用 alt metadata 控制宽度 |
| 居中图 | `![[image.png\|center wmed]]` | 适合架构图 |
| 右浮动图 | `![[image.png\|right wsmall]]` | 适合人物、产品截图、小图 |
| 宽幅图 | `.image-layout-bleed` | 适合视觉主图或大图 |
| 图片卡片 | `.image-layout-card` | 适合多图对比 |
| 拼贴图 | `.image-layout-mosaic` | 适合图库或作品集 |

```html
<figure class="image-layout-feature is-contained">
  <img src="/static/example.png" alt="Architecture diagram">
  <figcaption>架构图说明。</figcaption>
</figure>
```

## Home Layout

首页样式使用 `.home-two-col-section`、`.home-col-left`、`.home-col-right` 和 `.home-col-title`。适合首页或专题索引，不建议在普通文章中大量使用。

```html
<div class="home-two-col-section">
  <div class="home-col-left">
    <h3 class="home-col-title">Architecture</h3>
    <ul>
      <li>[[Data Architecture]]</li>
      <li>[[Lakehouse]]</li>
    </ul>
  </div>
  <div class="home-col-right">
    <h3 class="home-col-title">AI</h3>
    <ul>
      <li>[[Data Agent Architecture]]</li>
      <li>[[RAG]]</li>
    </ul>
  </div>
</div>
```

## Diagram Components

当 Mermaid 不够美观，优先使用 [[Quartz Diagram Style Guide]] 中的 `wiki-diagram-*` 组件。它们适合正式方案、教程和演讲页面，样式统一沉淀在 `quartz/styles/custom/diagram-components.scss`。

推荐边界：

- 快速逻辑图继续用 Mermaid。
- 高质量架构图、流程图、能力地图用 HTML diagram component。
- 复杂交互图再考虑 iframe 或 Quartz component。

## Article Templates

### Concept Note

```markdown
## Definition

## Why It Matters

## Architecture / Flow

## Commercial Practice

## Common Pitfalls

## Interview Answer

## Links
```

### Architecture Note

```markdown
## Context

## Problem

## Forces

## Solution

## Reference Architecture

## Trade-offs

## Governance Checkpoints

## AI Enablement
```

### Changelog Note

```markdown
## Changelog

| Date | Change | Files | Notes |
| --- | --- | --- | --- |
| 2026-06-11 | Add style guide | `content/index/Posts/Quartz Style Guide.md` | Demo and usage rules |
```

## Style Changelog

| Date | Change | Files | Impact |
| --- | --- | --- | --- |
| 2026-06-20 | 新增 Sidenotes 右侧标注说明 | `content/index/Posts/Quartz Style Guide.md` | 记录脚注转右侧标注的写法和交互规则 |
| 2026-06-11 | 新增样式使用指南和 Demo 页面 | `content/index/Posts/Quartz Style Guide.md` | 为后续文章提供统一样式参考 |
| 2026-06-11 | 新增 Diagram Components 规范 | [[Quartz Diagram Style Guide]] | 为架构图、流程图和能力地图提供 HTML 组件方案 |
| 2026-06-11 | 新增 UI 自动监视入口 | [[UI Evolution Monitor]] | 用 `npm run ui:audit` 检查关键页面和样式组件 |
| 2026-06-11 | 记录已有样式模块清单 | `quartz/styles/custom.scss` | 明确当前可复用模块 |
| 2026-06-03 | 新增图片布局测试样式 | `quartz/styles/images-layouts.scss` | 支持宽图、卡片、拼贴和浮动图片 |
| 2026-05-26 | 维护 Quartz Markdown 样式实验页 | [[Quartz MKD]] | 记录 Callout、Gallery Card、Process Steps 等示例 |

## Maintenance Rules

后续新增或修改样式时，同步维护三件事：

1. 在本页 `Style Changelog` 增加一行记录。
2. 在对应 Demo 小节补一个最小可复制示例。
3. 运行 `npm run quartz build`，确认 Markdown、SCSS 和 HTML 片段能正常构建。
4. 运行 `npm run ui:audit`，确认关键页面和样式组件进入构建产物。

> [!warning]
> 不要在单篇文章里写大量 inline style。优先把可复用布局沉淀到 `quartz/styles/custom/*.scss`，再在本文补充用法。

## Links

- related:: [[Quartz MKD]]
- related:: [[Quartz Diagram Style Guide]]
- related:: [[UI Evolution Monitor]]
- supports:: [[Bigdata Wiki OS]]
- supports:: [[MOC-BigData Map]]
