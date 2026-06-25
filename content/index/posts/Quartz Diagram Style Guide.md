---
title: Quartz Diagram Style Guide
aliases:
  - Quartz 图表样式指南
  - Diagram Components
  - Architecture Diagram Style Guide
tags:
  - quartz
  - style-guide
  - diagram
description: 记录本站架构图、流程图、能力地图和设计图的 HTML 组件写法，作为 Mermaid 之外的可维护视觉方案。
date: 2026-06-11
publish: false
draft: true
---

## Purpose

这篇页面用于承接比 Mermaid 更美观、但仍然可维护的图形表达。它不替代 Mermaid，而是补充四类场景：

- 架构分层图：表达系统分层、数据平台、治理控制面。
- 数据流图：表达从源系统到消费层的链路。
- 能力地图：表达角色能力、治理能力、Agent 能力。
- 决策图：表达架构选型、设计取舍和方案对比。

> [!tip]
> Mermaid 适合快速表达结构，HTML diagram component 适合正式方案、教程、演讲和高频复用页面。

## Design Rules

生成或手写图形 HTML 时，遵守这些规则：

1. 只写局部 HTML fragment，不写完整 `html/head/body`。
2. 不写 `<style>` 和 `<script>`，可复用样式放到 `quartz/styles/custom/diagram-components.scss`。
3. class 统一使用 `wiki-diagram-` 前缀，避免污染 Quartz 全站样式。
4. 使用 Quartz CSS 变量：`var(--light)`、`var(--dark)`、`var(--darkgray)`、`var(--lightgray)`、`var(--secondary)`。
5. 复杂交互图才考虑 iframe 或 Quartz component；普通图不要引入外部 CDN。

## Claude / AI Prompt Contract

当使用 Claude frontend-design 或其他前端生成工具时，建议直接使用这段约束：

```text
Generate only a self-contained HTML fragment for Quartz Markdown.
Do not include html/head/body/script/style tags.
Use classes prefixed with wiki-diagram-.
Use existing classes from diagram-components.scss where possible.
Use CSS variables: var(--light), var(--dark), var(--darkgray), var(--lightgray), var(--secondary), var(--tertiary), var(--highlight).
No Tailwind, no external CDN, no inline styles unless absolutely necessary.
The component must be responsive and work in dark mode.
```

## Architecture Layers

适合数据平台、湖仓架构、Agent 架构、治理架构等分层表达。

<section class="wiki-diagram wiki-diagram-architecture" aria-labelledby="arch-layer-demo">
  <span class="wiki-diagram-kicker">Architecture</span>
  <h2 class="wiki-diagram-title" id="arch-layer-demo">Bigdata Wiki OS Reference Architecture</h2>
  <div class="wiki-diagram-layers">
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Experience</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node is-accent">
          <span class="wiki-diagram-node-title">Obsidian</span>
          <span class="wiki-diagram-node-text">Writing, linking, local graph</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Quartz</span>
          <span class="wiki-diagram-node-text">Publishing and navigation</span>
        </div>
      </div>
    </div>
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Knowledge</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">MOC</span>
          <span class="wiki-diagram-node-text">Maps of content</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Concept Cards</span>
          <span class="wiki-diagram-node-text">Definitions and links</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Case Notes</span>
          <span class="wiki-diagram-node-text">Project evidence</span>
        </div>
      </div>
    </div>
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Governance</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">DCMM</span>
          <span class="wiki-diagram-node-text">Capability maturity</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">DAMA</span>
          <span class="wiki-diagram-node-text">Knowledge domains</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">CDO Lens</span>
          <span class="wiki-diagram-node-text">Business value</span>
        </div>
      </div>
    </div>
  </div>
  <p class="wiki-diagram-caption">Use this layout when layers are more important than exact arrows.</p>
</section>

```html
<section class="wiki-diagram wiki-diagram-architecture" aria-labelledby="arch-title">
  <span class="wiki-diagram-kicker">Architecture</span>
  <h2 class="wiki-diagram-title" id="arch-title">Architecture Title</h2>
  <div class="wiki-diagram-layers">
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Layer</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Node</span>
          <span class="wiki-diagram-node-text">Description</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Data Flow

适合数据采集、实时数仓、RAG、Agent tool chain 等链路表达。

<section class="wiki-diagram wiki-diagram-flow" aria-labelledby="data-flow-demo">
  <span class="wiki-diagram-kicker">Data Flow</span>
  <h2 class="wiki-diagram-title" id="data-flow-demo">From Source to Agent</h2>
  <div class="wiki-diagram-flow-track">
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Source</span>
      <span class="wiki-diagram-node-text">Docs, logs, tables</span>
    </div>
    <div class="wiki-diagram-arrow">→</div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Compile</span>
      <span class="wiki-diagram-node-text">Extract concepts and links</span>
    </div>
    <div class="wiki-diagram-arrow">→</div>
    <div class="wiki-diagram-node is-accent">
      <span class="wiki-diagram-node-title">Wiki</span>
      <span class="wiki-diagram-node-text">Markdown graph</span>
    </div>
    <div class="wiki-diagram-arrow">→</div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Agent</span>
      <span class="wiki-diagram-node-text">Answer, query, report</span>
    </div>
  </div>
  <p class="wiki-diagram-caption">Use this layout when direction and transformation are the main story.</p>
</section>

```html
<section class="wiki-diagram wiki-diagram-flow" aria-labelledby="flow-title">
  <h2 class="wiki-diagram-title" id="flow-title">Flow Title</h2>
  <div class="wiki-diagram-flow-track">
    <div class="wiki-diagram-node"><span class="wiki-diagram-node-title">Source</span></div>
    <div class="wiki-diagram-arrow">→</div>
    <div class="wiki-diagram-node"><span class="wiki-diagram-node-title">Target</span></div>
  </div>
</section>
```

## Capability Map

适合角色能力、知识域、产品能力和治理能力总览。

<section class="wiki-diagram wiki-diagram-capability" aria-labelledby="capability-demo">
  <span class="wiki-diagram-kicker">Capability Map</span>
  <h2 class="wiki-diagram-title" id="capability-demo">Data Architect Core Capabilities</h2>
  <div class="wiki-diagram-capability-grid">
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Strategy</span>
      <span class="wiki-diagram-node-text">Business value and roadmap</span>
    </div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Governance</span>
      <span class="wiki-diagram-node-text">DCMM, DAMA, policy</span>
    </div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Modeling</span>
      <span class="wiki-diagram-node-text">Metrics and semantic layer</span>
    </div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Platform</span>
      <span class="wiki-diagram-node-text">Lakehouse and serving</span>
    </div>
    <div class="wiki-diagram-hub">
      <div>
        <span class="wiki-diagram-node-title">Data Architect</span>
        <span class="wiki-diagram-node-text">Connects engineering, governance and value</span>
      </div>
    </div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">AI</span>
      <span class="wiki-diagram-node-text">Agent-ready data context</span>
    </div>
  </div>
  <p class="wiki-diagram-caption">Use this layout when the central role or product matters most.</p>
</section>

## Decision Matrix

适合对比 Mermaid、HTML 组件、SVG、iframe 和 Quartz component。

<section class="wiki-diagram wiki-diagram-decision" aria-labelledby="decision-demo">
  <span class="wiki-diagram-kicker">Decision</span>
  <h2 class="wiki-diagram-title" id="decision-demo">Diagram Rendering Choice</h2>
  <div class="wiki-diagram-decision-grid">
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">Mermaid</span>
      <span class="wiki-diagram-node-text">Best for fast, source-controlled logic diagrams.</span>
      <ul class="wiki-diagram-node-list">
        <li>Low maintenance</li>
        <li>Plain visual style</li>
      </ul>
    </div>
    <div class="wiki-diagram-node is-accent">
      <span class="wiki-diagram-node-title">HTML Component</span>
      <span class="wiki-diagram-node-text">Best for polished pages and reusable visual systems.</span>
      <ul class="wiki-diagram-node-list">
        <li>Matches site theme</li>
        <li>Needs CSS discipline</li>
      </ul>
    </div>
    <div class="wiki-diagram-node">
      <span class="wiki-diagram-node-title">iframe</span>
      <span class="wiki-diagram-node-text">Best for complex interactive diagrams.</span>
      <ul class="wiki-diagram-node-list">
        <li>Strong isolation</li>
        <li>Harder to search</li>
      </ul>
    </div>
  </div>
</section>

## When To Use What

| Need | Recommended Format | Notes |
| --- | --- | --- |
| Quick flow or dependency graph | Mermaid | Best for rough notes and evolving design |
| Polished architecture page | HTML diagram component | Use classes from `diagram-components.scss` |
| Highly custom static visual | SVG asset | Store asset and caption it |
| Interactive demo | iframe or Quartz component | Avoid inline scripts in Markdown |
| Generated visual from Claude | HTML fragment + custom SCSS | Do not paste full standalone HTML |

## Maintenance Changelog

| Date | Change | Files | Notes |
| --- | --- | --- | --- |
| 2026-06-11 | Add reusable diagram components | `quartz/styles/custom/diagram-components.scss` | Architecture, flow, capability, decision layouts |
| 2026-06-11 | Add diagram style guide | `content/index/Posts/Quartz Diagram Style Guide.md` | Demo page for future diagrams |

## Links

- related:: [[Quartz Style Guide]]
- supports:: [[Bigdata Wiki OS]]
- supports:: [[Data Agent Architecture]]
