---
title: Obsidian Naming Governance
aliases:
  - Obsidian Tag Governance
  - 知识库命名治理
  - 标签命名规范
tags:
  - type/playbook
  - status/evergreen
description: 规定 Bigdata Wiki OS 中 tags、filename、title、aliases 和双链的命名边界。
date: 2026-06-17
publish: false
---

## Purpose

这篇笔记用于约束 [[Bigdata Wiki OS]] 的命名系统，避免 tag 分散、同义词重复、孤立标签过多，以及 filename、title、aliases、双链各自承担的职责混乱。

核心原则：

- **英文 canonical 名称为主**：`filename`、主双链目标、核心概念名优先使用英文。
- **中文和旧称进入 aliases**：中文名、缩写、旧标题、搜索词都放到 `aliases`。
- **tags 只做页面管理**：tag 用于页面类型、状态和来源，不再承担主题分类。
- **主题关系用双链表达**：概念、工具、架构、技术栈之间的关系用双链、MOC 和关系字段表达。

## Tag Taxonomy

统一使用小写 kebab-case，必要时使用层级 tag。

```yaml
tags:
  - type/concept
  - status/evergreen
```

### Controlled Tags

页面类型：

```text
type/concept
type/moc
type/tool
type/playbook
type/project
type/resource
type/index
```

页面状态：

```text
status/seed
status/draft
status/evergreen
status/review
status/archive
```

来源类型：

```text
source/docs
source/paper
source/book
source/course
```

### Do Not Use Tags For Topics

避免继续新增主题 tag：

```text
#flink
#hadoop
#data-architecture
#olap
#mysql
```

这些主题应使用文件、文件夹、MOC 和双链：

```md
[[Apache Flink]]
[[Apache Hadoop]]
[[Data Architecture]]
[[OLAP]]
[[MySQL]]
```

## Filename, Title, Aliases

推荐 frontmatter：

```yaml
---
title: Apache Flink
aliases:
  - Flink
  - What is Apache Flink?
  - 实时计算引擎
tags:
  - type/concept
  - status/evergreen
---
```

命名职责：

| Field | Role | Rule |
| --- | --- | --- |
| `filename` | 稳定 ID | 使用英文 canonical 名称，例如 `Apache Flink.md` |
| `title` | 页面显示名 | 默认等于 filename 去掉 `.md`，避免 `What is ...` 和 `... Homepage` |
| `aliases` | 搜索和兼容入口 | 放中文名、缩写、旧名、旧标题、常见误写 |
| `tags` | 管理维度 | 只放类型、状态、来源，不放主题 |

### Index Pages

`index.md` 的 `title` 不要都叫 `index`。应使用清晰显示名：

```yaml
title: Data Model Index
tags:
  - type/index
  - status/evergreen
```

### Duplicate Names

如果概念重名，filename 必须加限定词：

```text
Cloud Catalog.md
Concept Catalog.md
```

## Wiki Links

双链指向 canonical filename，显示文本可以本地化。

```md
[[Apache Flink]]
[[Apache Flink|Flink]]
[[Apache Flink|实时计算]]
```

规则：

- 正文首次出现核心概念时加双链。
- 不为了中文显示创建中文重复页面。
- 双链用于表达概念关系，tag 用于管理页面。
- 如果一个词值得长期链接，就应有独立页面；如果只是状态或类型，用 tag。

## Cleanup Order

1. **清理明显误 tag**：例如 `#产生背景`、`#架构设计`、`#select_type`、`#rows`、`#false`、`#HIVE_HOME`。
2. **迁移主题 tag**：例如把 `#flink` 迁移为 `[[Apache Flink]]` 或挂到对应 MOC。
3. **统一 title / filename / aliases**：保留英文 canonical，中文和旧标题进入 aliases。
4. **按主题域分批处理**：例如先处理 `Open BigData / Apache Flink`，不要全库一次性重命名。

## Links

- part-of:: [[Bigdata Wiki OS]]
- used-by:: [[Obsidian Tag Monitor]]
- related:: [[00-Map]]
