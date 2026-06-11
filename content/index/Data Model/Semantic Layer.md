---
title: Semantic Layer
aliases:
  - 语义层
  - Metrics Semantic Layer
tags:
  - data-model
  - semantic-layer
  - bi
  - ai-agent
description: 语义层把底层数据模型封装为业务可理解、指标一致、权限可控的语义接口。
date: 2026-06-11
publish: true
type: concept
dcmm_domain: 数据应用流通
dama_area:
  - Data Warehousing and BI
status: seed
---

## Definition

**Semantic Layer** 是位于数据模型和消费工具之间的业务语义抽象层，用统一的维度、指标、口径、权限和查询接口屏蔽底层表结构复杂度。

## Business Value

- 让 BI、报表、Ad-hoc、API 和 ChatBI 使用同一套指标口径。
- 降低业务用户理解底层表结构的成本。
- 为 Text2SQL 和 [[Data Agent Architecture]] 提供可靠上下文。

## Architecture

```mermaid
flowchart LR
  A["Warehouse / Lakehouse"] --> B["Semantic Layer"]
  B --> C["Metrics"]
  B --> D["Dimensions"]
  B --> E["Permissions"]
  B --> F["BI / API / Text2SQL / Agent"]
```

## Commercial Practice

语义层应优先覆盖高频、核心、跨团队使用的指标和维度。它需要和 [[Indicator System]]、[[Data Standard]]、[[Metadata Management]]、权限体系和质量规则一起设计。

## Interview Answer

语义层解决的是“业务问题和物理表之间缺少稳定翻译层”的问题。没有语义层，Text2SQL 容易生成看似正确但口径错误的 SQL；有语义层后，AI Agent 可以基于指标、维度、过滤条件和权限边界生成更可信的查询。

## Links

- part-of:: [[MOC-DATA+AI Agent 地图]]
- depends-on:: [[Indicator System]]
- depends-on:: [[Metadata Management]]
- governed-by:: [[Data Standard]]
- enables:: [[Data Agent Architecture]]
