---
title: Data Quality
type: framework
tags:
  - type/framework
  - lifecycle/governance
  - ecosystem/standard
date: 2025-03-06
aliases:
  - 数据质量
standard: GB/T 36073-2025
dcmm_version: "2.0"
publish: true
---

> [!abstract] DCMM 能力域 / Capability Domain
> [[DCMM]] 九大能力域之一。数据质量通过需求、检查、分析和提升形成持续改进闭环。

## 定义

根据业务场景明确数据质量要求，持续发现和分析质量问题，推动责任方完成整改并预防问题复发，使数据保持适用、可信和可控。

## 能力边界

- **负责**：质量要求、规则、监测、分析、整改和预防。
- **不替代**：数据标准定义、源系统业务控制或数据责任人的最终责任。

## 能力项 Capability Items

| 能力项                                                                      | 核心目标                                     |
| --------------------------------------------------------------------------- | -------------------------------------------- |
| [[frameworks/dcmm/capability-items/Data Quality Requirement\|数据质量需求]] | 将业务期望转化为可度量的质量维度、规则和目标 |
| [[frameworks/dcmm/capability-items/Data Quality Check\|数据质量检查]]       | 按规则持续检测数据并记录质量结果             |
| [[frameworks/dcmm/capability-items/Data Quality Analysis\|数据质量分析]]    | 评估问题影响、识别根因并确定整改优先级       |
| [[frameworks/dcmm/capability-items/Data Quality Improvement\|数据质量提升]] | 完成整改、验证效果并通过源头治理预防复发     |

## 建设要点

1. 从关键业务流程和使用场景识别质量需求。
2. 建立覆盖完整性、准确性、一致性、及时性等维度的规则。
3. 明确问题分派、根因分析、整改、验证和关闭流程。
4. 将高频问题的控制措施前移到数据产生和变更环节。

## 典型产出

- 数据质量需求与规则库
- 质量监测任务、评分看板和问题台账
- 根因分析、影响评估和整改方案
- 质量报告、改进复盘和预防控制措施

## 自评问题

- 质量目标是否根据业务用途和风险等级差异化设置？
- 问题是否能追溯到责任主体、源系统和产生环节？
- 改进是否减少了同类问题的重复发生？

## 关联

- 上级框架：[[DCMM]]
- 协同能力域：[[Data Standard]]、[[Data Architecture]]、[[Data Governance]]

## 参考资料

- [GB/T 36073—2025《数据管理能力成熟度评估模型》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22559F9C7BF9EAC6A3927223FE33CE20)
