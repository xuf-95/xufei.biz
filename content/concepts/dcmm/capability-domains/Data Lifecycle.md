---
title: Data Lifecycle
type: framework
tags:
  - type/framework
  - lifecycle/governance
  - ecosystem/standard
date: 2025-06-05
aliases:
  - 数据生存周期
standard: GB/T 36073-2025
dcmm_version: "2.0"
publish: true
---

> [!abstract] DCMM 能力域 / Capability Domain
> [[DCMM]] 九大能力域之一。数据生存周期管理覆盖从需求提出到数据退役的全过程。

## 定义

对数据需求、设计与开发、运行维护和退役实施端到端管理，使数据在不同阶段满足业务、质量、安全、标准和成本要求。

## 能力边界

- **负责**：贯穿数据产生、加工、运行、变更、归档和退出的过程控制。
- **不替代**：项目管理、软件工程或基础设施运维的全部职责。

## 能力项 Capability Items

| 能力项                                                                           | 核心目标                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [[frameworks/dcmm/capability-items/Data Requirement\|数据需求]]                  | 识别、分析、确认并管理数据相关需求及其变更           |
| [[frameworks/dcmm/capability-items/Data Design and Development\|数据设计与开发]] | 将需求落实为符合架构、标准、质量和安全要求的数据实现 |
| [[frameworks/dcmm/capability-items/Data Operation and Maintenance\|数据运维]]    | 保障生产数据及处理链路稳定、可用、可监控和可恢复     |
| [[frameworks/dcmm/capability-items/Data Retirement\|数据退役]]                   | 按业务、法规和成本要求完成归档、迁移、销毁及影响处置 |

## 建设要点

1. 建立数据需求从提出、评审到验收的可追溯链路。
2. 将架构、标准、质量和安全要求纳入设计开发门禁。
3. 监测数据任务、接口、时效、容量和异常并形成运维闭环。
4. 制定保留期限、归档、迁移和安全销毁规则。

## 典型产出

- 数据需求规格、优先级和追踪矩阵
- 数据设计、开发规范与验收记录
- 运维监控、变更、备份恢复和事件记录
- 数据保留计划、退役方案和销毁证明

## 自评问题

- 数据需求能否追溯到业务目标、实现对象和验收结果？
- 数据变更是否经过影响分析并同步相关标准和元数据？
- 数据归档或销毁是否有审批、证据和恢复或追溯安排？

## 关联

- 上级框架：[[DCMM]]
- 协同能力域：[[Data Architecture]]、[[Data Security]]、[[Data Quality]]

## 参考资料

- [GB/T 36073—2025《数据管理能力成熟度评估模型》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22559F9C7BF9EAC6A3927223FE33CE20)
