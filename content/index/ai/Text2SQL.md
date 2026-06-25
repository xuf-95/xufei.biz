---
title: Text2SQL
aliases:
  - Text to SQL
  - 自然语言转 SQL
tags:
  - ai-agent
  - data-ai
  - semantic-layer
description: Text2SQL 让用户用自然语言生成 SQL，但必须依赖语义层、指标口径、权限和质量约束才能可靠落地。
date: 2026-06-14
publish: true
type: capability
dcmm_domain: 数据应用流通
dama_area:
  - Data Warehousing and BI
  - Metadata Management
cdo_value: 降低数据查询门槛，同时保留指标一致性和安全治理边界。
status: seed
---

## Definition

**Text2SQL** 是将自然语言问题转换为 SQL 查询的能力，常用于 ChatBI、数据分析助手和 Data Agent。

## Business Value

- 降低业务用户取数和探索分析门槛。
- 提升数据分析师和工程师编写 SQL 的效率。
- 与 [[Semantic Layer]]、[[Indicator System]]、[[Metadata Management]] 结合后，可以减少口径错误。

## Architecture / Flow

```mermaid
flowchart LR
  A["User Question"] --> B["Intent / Metric Parsing"]
  B --> C["Semantic Layer"]
  C --> D["SQL Draft"]
  D --> E["Validation / Permission"]
  E --> F["Result / Explanation"]
```

## Commercial Practice

Text2SQL 上线应从受控场景开始：限定数据域、限定指标集合、限定只读权限、要求 SQL 解释和引用证据。复杂分析问题应允许 Agent 先澄清口径。

## Common Pitfalls

- 只把数据库 schema 丢给模型，缺少业务语义和指标口径。
- 不做权限校验和 SQL 安全检查。
- 直接执行生成 SQL，没有人工确认、测试样例或结果解释。

## Interview Answer

Text2SQL 的难点不在 SQL 语法，而在业务语义。真实落地必须依赖语义层、指标体系、元数据、权限和质量规则，否则模型很容易生成语法正确但口径错误的 SQL。

## Links

- part-of:: [[MOC-DATA+AI Agent Map]]
- depends-on:: [[Semantic Layer]]
- depends-on:: [[Metrics Governance]]
- depends-on:: [[Metadata Management]]
- governed-by:: [[Agent Governance]]

