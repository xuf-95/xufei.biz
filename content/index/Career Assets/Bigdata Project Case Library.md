---
title: Bigdata Project Case Library
aliases:
  - 大数据项目案例库
  - Data Project Case Library
tags:
  - project-case
  - bigdata
  - career
description: 用统一结构沉淀大数据工程、架构、治理和 DATA+AI 项目案例，服务工作复盘、面试和演讲。
date: 2026-06-14
publish: false
type: case-library
status: seed
---

## Definition

**Bigdata Project Case Library** 用于把真实工作经验沉淀为可复用项目资产，强调业务背景、架构方案、工程实现、治理证据、结果指标和复盘。

## Case Structure

```mermaid
flowchart LR
  A["Business Problem"] --> B["Architecture Decision"]
  B --> C["Implementation"]
  C --> D["Governance Evidence"]
  D --> E["Result Metrics"]
  E --> F["Retrospective"]
```

## Case Categories

- 数据架构：湖仓建设、实时数仓、数据中台、[[Data Architecture Blueprint]]。
- 数据治理：元数据、标准、质量、安全、[[Data Governance Operating Model]]。
- 数据建模：主题域、维度建模、指标体系、[[Semantic Layer]]。
- 数据工程：采集同步、调度治理、[[Data Pipeline SLA]]、[[Data Observability]]。
- DATA+AI：[[Text2SQL]]、[[Data Agent Architecture]]、[[Agent Governance]]。

## Case Template

- 背景：业务目标、组织现状、数据痛点。
- 目标：成功指标、SLA、治理要求、交付边界。
- 架构：当前态、目标态、核心链路、关键组件。
- 决策：采用方案、拒绝方案、约束条件。
- 实施：任务拆解、模型设计、质量规则、上线过程。
- 结果：效率、成本、质量、收入、风险控制指标。
- 复盘：问题、改进、可复用经验。

## Evidence Types

- 架构图、数据流图、血缘图。
- 指标口径、数据标准、质量规则。
- ADR、评审记录、上线检查清单。
- 故障复盘、监控截图、业务收益。

## Links

- part-of:: [[MOC-职业资产地图]]
- supports:: [[Bigdata Interview Question Bank]]
- uses:: [[Data Architecture Decision Record]]
- uses:: [[Data Observability]]

