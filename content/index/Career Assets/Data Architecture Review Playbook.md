---
title: Data Architecture Review Playbook
aliases:
  - 数据架构评审手册
  - Architecture Review Playbook
tags:
  - architecture-review
  - data-architecture
  - playbook
description: 数据架构评审手册用于检查架构方案是否覆盖业务目标、数据流、治理、安全、可靠性和演进路线。
date: 2026-06-14
publish: true
type: playbook
status: seed
---

## Definition

**Data Architecture Review Playbook** 是数据架构方案评审清单，用于在设计、上线和复盘阶段识别关键风险。

## Review Flow

```mermaid
flowchart LR
  A["Business Goal"] --> B["Architecture Scope"]
  B --> C["Data Flow / Model"]
  C --> D["Governance / Security"]
  D --> E["SLA / Observability"]
  E --> F["Decision / Follow-up"]
```

## Review Checklist

### Business And Scope

- 是否明确业务目标、核心用户和成功指标？
- 是否定义当前态、目标态、过渡态？
- 是否说明不做什么，以及边界为什么这样划分？

### Architecture

- 是否有 [[Data Architecture Blueprint]]？
- 是否识别核心 [[Data Domain]]、系统边界和数据流？
- 是否记录关键 [[Data Architecture Decision Record]]？

### Governance

- 是否定义 [[Metadata Management]]、[[Data Lineage]]、[[Data Quality]] 和 [[Data Security]] 要求？
- 是否明确 owner、steward、审批流程和责任矩阵？
- 是否有 [[Data Contract]] 或接口变更约束？

### Reliability

- 是否定义 [[Data Pipeline SLA]]？
- 是否设计 [[Data Observability]]、告警分级和故障恢复？
- 是否说明容量、成本、性能和扩展风险？

### DATA+AI

- 如果接入 Agent，是否设计 [[Agent Governance]]？
- [[Text2SQL]] 是否依赖 [[Semantic Layer]]、指标体系和权限控制？
- Agent 输出是否可解释、可审计、可人工确认？

## Review Output

- 通过、带风险通过、退回修改。
- 决策记录、风险清单、后续动作、责任人和日期。

## Links

- part-of:: [[MOC-职业资产地图]]
- uses:: [[Data Architecture Blueprint]]
- uses:: [[Data Contract]]
- uses:: [[Agent Governance]]

