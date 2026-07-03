---
title: Obsidian Tag Monitor
aliases:
  - Tag Monitor
  - 标签监控面板
  - Dataview Tag Dashboard
tags:
  - type/index
  - status/review
description: 使用 Obsidian Dataview 监控 tag 分布、孤立 tag、命名异常和缺失 frontmatter。
date: 2026-06-17
publish: false
---

## Purpose

这个页面用于在 Obsidian 中监控 [[Obsidian Naming Governance]] 的执行情况。它不负责批量修改笔记，只负责暴露问题。

> [!warning]
> 这些查询依赖 Obsidian Dataview 插件；Quartz 发布页面不会执行 Dataview 查询。

## Tag Distribution

监控所有 tag 的分组数量。

```dataview
TABLE WITHOUT ID tag AS Tag, length(rows) AS Count
FROM ""
FLATTEN file.etags AS tag
GROUP BY tag
SORT length(rows) DESC
```

## Single-Use Tags

监控低频孤立 tag。优先检查这些 tag 是否应该删除、合并或迁移为双链。

```dataview
TABLE WITHOUT ID tag AS Tag, length(rows) AS Count, rows.file.link AS Files
FROM ""
FLATTEN file.etags AS tag
GROUP BY tag
WHERE length(rows) <= 1
SORT tag ASC
```

## Watch One Tag

监控某个单独 tag。把 `#status/review` 替换成你要观察的 tag。

```dataview
TABLE file.link AS Note, file.mtime AS Updated
FROM ""
WHERE contains(file.etags, "#status/review")
SORT file.mtime DESC
```

## Title And Filename Drift

监控 `title` 与 `filename` 不一致的页面。这里不是全部错误，但需要人工判断是否应把旧标题移入 `aliases`。

```dataview
TABLE file.name AS Filename, title AS Title, aliases AS Aliases
FROM ""
WHERE title AND title != file.name
SORT file.folder ASC, file.name ASC
```

## Missing Tags

监控缺少 `tags` 的页面。

```dataview
TABLE file.link AS Note, title AS Title
FROM ""
WHERE !tags
SORT file.folder ASC, file.name ASC
```

## Index Title Cleanup

监控 `title = index` 的页面。每个 `index.md` 应改成明确标题，例如 `Data Model Index`。

```dataview
TABLE file.link AS Note, file.folder AS Folder, aliases AS Aliases
FROM ""
WHERE title = "index"
SORT file.folder ASC
```

## Suspect Tags For First Cleanup

第一轮优先人工检查这些明显误 tag。

```dataview
TABLE file.link AS Note, file.etags AS Tags
FROM ""
WHERE contains(file.etags, "#产生背景")
   OR contains(file.etags, "#架构设计")
   OR contains(file.etags, "#select_type")
   OR contains(file.etags, "#rows")
   OR contains(file.etags, "#false")
   OR contains(file.etags, "#HIVE_HOME")
SORT file.folder ASC, file.name ASC
```

## Topic Tags To Migrate

主题 tag 应逐步迁移为双链、MOC 或关系字段。

```dataview
TABLE file.link AS Note, file.etags AS Tags
FROM ""
WHERE contains(file.etags, "#flink")
   OR contains(file.etags, "#hadoop")
   OR contains(file.etags, "#data-architecture")
   OR contains(file.etags, "#olap")
   OR contains(file.etags, "#mysql")
SORT file.folder ASC, file.name ASC
```

## Links

- part-of:: [[Bigdata Wiki OS]]
- governed-by:: [[Obsidian Naming Governance]]
- related:: [[00-Map]]
