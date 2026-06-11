---
title: MOC-数据架构师能力地图
aliases:
  - Data Architect Capability Map
tags:
  - data-architecture
  - moc
  - cdo
description: 面向数据架构师的能力地图，连接战略、架构、建模、治理、平台、数据产品和商业价值。
date: 2026-06-11
publish: true
---

## Scope

这张地图用于从数据架构师视角组织知识：既覆盖技术架构，也覆盖治理体系、数据资产、组织协同和 CDO/CDAO 视角的商业价值。

## Core Concepts

- [[Data Architecture]]
- [[DCMM]]
- [[DAMA-DMBOK]]
- [[CDO]]
- [[Data Warehouse]]
- [[Data Lake]]
- [[Lakehouse]]
- [[Data Agent Architecture]]

## Architecture View

```mermaid
flowchart TB
  S["Data Strategy"] --> A["Data Architecture"]
  A --> M["Data Modeling"]
  A --> P["Data Platform"]
  A --> G["Data Governance"]
  M --> V["Metrics / Semantic Layer"]
  P --> E["Engineering Delivery"]
  G --> Q["Quality / Standard / Security"]
  V --> B["BI / Data Product / AI Agent"]
```

## Capability Areas

- Strategy: [[CDO]]、数据战略、数据资产化、业务价值指标。
- Architecture: [[Data Warehouse]]、[[Data Lake]]、[[Lakehouse]]、[[Lambda Architecture]]、[[Kappa Architecture]]。
- Modeling: [[Dimensional Modeling]]、[[E-R Model]]、[[Indicator System]]、[[Semantic Layer]]。
- Governance: [[DAMA-DMBOK]]、[[DCMM]]、[[Metadata Management]]、[[Data Standard]]、[[Data Quality]]。
- AI: [[Data Agent Architecture]]、[[Text2SQL]]、[[RAG]]、[[Agent Governance]]。

## Practices

- 通过业务目标反推数据域、主题域、指标体系和平台能力。
- 用架构决策记录沉淀技术选型取舍。
- 用 DCMM/DAMA 映射把项目经验转化为治理能力证据。
- 为 AI Agent 明确语义层、质量、权限和审计边界。

## Questions

- 数据架构师和大数据工程师的职责边界是什么？
- 如何在湖仓一体、实时数仓、Data Mesh 之间做取舍？
- 如何证明数据治理不是成本中心，而是业务增长和风险控制能力？
- CDO/CDAO 为什么关心语义层、元数据和数据质量？

## Outputs

- 企业数据架构蓝图
- 数据治理能力评估表
- 指标体系和语义层方案
- CDO/CDAO 视角演讲稿

## Links

- part-of:: [[Bigdata Wiki OS]]
- related:: [[MOC-DCMM-DAMA 数据治理地图]]
- related:: [[MOC-DATA+AI Agent 地图]]
