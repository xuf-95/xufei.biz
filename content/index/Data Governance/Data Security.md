---
title: Data Security
aliases:
  - 数据安全
tags:
  - data-governance
  - data-security
description: 数据安全通过分类分级、权限、脱敏、审计和合规控制，保护数据资产在全生命周期中的安全使用。
date: 2026-06-14
publish: true
type: concept
dcmm_domain: 数据安全
dama_area:
  - Data Security
cdo_value: 在释放数据价值的同时控制合规、泄露和滥用风险。
status: seed
---

## Definition

**Data Security** 是围绕数据采集、存储、处理、共享、应用和销毁建立的安全控制体系。

## Business Value

- 支撑敏感数据合规、最小权限、访问审计和风险追责。
- 为 BI、API、数据产品和 Agent 调用提供安全边界。
- 与 [[Data Standard]]、[[Metadata Management]]、[[Semantic Layer]] 共同定义可用但受控的数据服务。

## Architecture / Flow

```mermaid
flowchart LR
  A["Classification"] --> B["Access Control"]
  B --> C["Masking / Encryption"]
  C --> D["Audit"]
  D --> E["Risk Review"]
```

## Commercial Practice

落地优先从分类分级、敏感字段识别、权限矩阵、脱敏策略、访问审计和共享审批开始。对 Agent 场景，要额外限制工具权限和输出内容。

## Common Pitfalls

- 只有权限审批，没有分类分级和审计。
- 测试环境复制生产敏感数据但缺少脱敏。
- Agent 或 BI 绕过语义层直接查询底层明细表。

## Interview Answer

数据安全不是单一权限系统，而是分类分级、访问控制、脱敏、加密、审计和合规流程的组合。对数据平台来说，安全设计要嵌入元数据、语义层、共享流程和 Agent 工具调用边界。

## Links

- part-of:: [[MOC-DCMM-DAMA 数据治理地图]]
- governed-by:: [[Data Governance Operating Model]]
- supports:: [[Agent Governance]]
- depends-on:: [[Metadata Management]]

