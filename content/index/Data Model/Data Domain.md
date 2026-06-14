---
title: Data Domain
aliases:
  - 数据域
  - 主题域
tags:
  - data-model
  - data-architecture
description: 数据域用于按照业务能力和管理边界组织数据资产，是数据架构、建模和治理协同的基本单元。
date: 2026-06-14
publish: true
type: concept
dcmm_domain: 数据架构
dama_area:
  - Data Architecture
  - Data Modeling and Design
cdo_value: 帮助企业按业务能力管理数据资产、责任和价值。
status: seed
---

## Definition

**Data Domain** 是围绕一组稳定业务能力、对象和流程划分的数据管理边界，例如客户域、商品域、交易域、营销域、供应链域。

## Business Value

- 支撑企业数据架构蓝图和主题域建模。
- 明确数据 owner、标准、质量和指标责任边界。
- 是 [[Data Mesh]] 和数据产品化的重要前提。

## Architecture / Flow

```mermaid
flowchart LR
  A["Business Capability"] --> B["Data Domain"]
  B --> C["Entities"]
  C --> D["Models"]
  D --> E["Metrics / Products"]
```

## Commercial Practice

数据域划分应从业务能力、组织责任、主数据对象和核心流程出发，而不是简单按系统或数据库划分。域边界需要随着组织和业务变化定期复盘。

## Common Pitfalls

- 按源系统划分数据域，导致模型和业务能力脱节。
- 域边界过细，治理成本过高。
- 没有明确 owner，导致标准和质量无人负责。

## Interview Answer

数据域是数据架构的基本组织单元。它把业务能力、数据对象、模型、指标和责任人连接起来。好的数据域划分能让数据建模、治理和数据产品建设都有稳定边界。

## Links

- part-of:: [[MOC-数据架构师能力地图]]
- supports:: [[Data Architecture Blueprint]]
- supports:: [[Dimensional Modeling]]
- related:: [[Data Mesh]]

