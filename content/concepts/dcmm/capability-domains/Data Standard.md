---
title: Data Standard
type: framework
tags:
  - type/framework
  - lifecycle/governance
  - ecosystem/standard
date: 2026-11-21
aliases:
  - 数据标准
standard: GB/T 36073-2025
dcmm_version: "2.0"
publish: true
---

> [!abstract] DCMM 能力域 / Capability Domain
> [[DCMM]] 九大能力域之一。数据标准统一关键数据的业务含义、结构、取值和统计口径。

## 定义

建立并执行覆盖业务术语、主数据、参考数据、数据元和指标数据的标准体系，减少跨部门、跨系统的数据歧义与重复转换。

## 能力边界

- **负责**：数据定义、编码、格式、取值和口径的统一要求。
- **不替代**：数据模型设计、质量问题处置或业务规则审批。

## 能力项 Capability Items

| 能力项                                                        | 核心目标                                       |
| ------------------------------------------------------------- | ---------------------------------------------- |
| [[frameworks/dcmm/capability-items/Business Term\|业务术语]]  | 统一核心业务概念的名称、定义、责任人与使用范围 |
| [[frameworks/dcmm/capability-items/Master Data\|主数据]]      | 统一关键业务实体及其标识、属性和分发规则       |
| [[frameworks/dcmm/capability-items/Reference Data\|参考数据]] | 统一分类、代码、枚举和允许值集合               |
| [[frameworks/dcmm/capability-items/Data Element\|数据元]]     | 规范数据元素的定义、结构、格式、约束和表示方式 |
| [[frameworks/dcmm/capability-items/Indicator Data\|指标数据]] | 统一指标名称、口径、维度、算法、周期和责任主体 |

## 建设要点

1. 建立标准分类、编号、审批、发布、变更和废止流程。
2. 识别标准责任人，并协调业务、数据和技术人员共同评审。
3. 将标准落实到模型、接口、开发和质量检查规则中。
4. 监测标准覆盖率、执行率和冲突解决效率。

## 典型产出

- 数据标准体系、管理办法和标准目录
- 业务术语表、主数据与参考数据标准
- 数据元目录与指标口径库
- 标准映射、落标检查和执行评估报告

## 自评问题

- 同一业务概念在不同部门和系统中是否保持一致？
- 标准变更是否能同步影响模型、接口、指标和质量规则？
- 是否能量化标准的覆盖、执行和问题整改情况？

## 关联

- 上级框架：[[DCMM]]
- 协同能力域：[[Data Architecture]]、[[Data Quality]]、[[Data Governance]]

## 版本说明

GB/T 36073—2025 将 2018 版合并的“参考数据和主数据”拆分为两个独立能力项，因此本域由 4 个能力项扩展为 5 个。

## 参考资料

- [GB/T 36073—2025《数据管理能力成熟度评估模型》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22559F9C7BF9EAC6A3927223FE33CE20)
