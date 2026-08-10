---
title: Data Architecture
type: framework
tags:
  - type/framework
  - lifecycle/governance
  - ecosystem/standard
date: 2025-09-30
aliases:
  - 数据架构
publish: true
standard: GB/T 36073-2025
dcmm_version: "2.0"
---

> [!abstract] DCMM 能力域 / Capability Domain
> [[DCMM]] 九大能力域之一。数据架构定义数据如何组织、分布、集成和被理解。

## 定义

围绕数据模型、数据分布、集成共享和元数据建立组织级蓝图与约束，使数据在不同业务、系统和平台之间保持一致、可发现和可复用。

## 能力边界

- **负责**：数据结构、布局、流转与语义描述的整体设计。
- **不替代**：应用架构、技术架构的全部职责或具体系统开发。

## 能力项 Capability Items

| 能力项                                                                            | 核心目标                                             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [[frameworks/dcmm/capability-items/Data Model\|数据模型]]                         | 用统一方法表达业务对象、关系、规则与数据结构         |
| [[frameworks/dcmm/capability-items/Data Distribution\|数据分布]]                  | 明确数据的来源、存储位置、权威来源和流转路径         |
| [[frameworks/dcmm/capability-items/Data Integration and Sharing\|数据集成与共享]] | 建立可控、可复用的数据交换和共享机制                 |
| [[frameworks/dcmm/capability-items/Metadata Management\|元数据管理]]              | 管理业务、技术和管理元数据，支持检索、理解与影响分析 |

## 建设要点

1. 建立与业务架构一致的企业级数据模型。
2. 识别权威数据源并形成数据分布与流向视图。
3. 统一集成规范、接口契约和共享服务方式。
4. 建设元数据采集、维护、血缘和影响分析能力。

## 典型产出

- 数据架构原则、蓝图和演进路线
- 概念、逻辑和物理数据模型
- 数据分布图、数据流向图和权威数据源清单
- 集成规范、共享目录、元数据目录与血缘关系

## 自评问题

- 关键数据是否存在跨系统冲突或不清晰的权威来源？
- 模型、分布、接口和元数据是否随系统变化同步维护？
- 架构约束是否进入项目设计评审和上线验收？

## 关联

- 上级框架：[[DCMM]]
- 协同能力域：[[Data Standard]]、[[Data Lifecycle]]、[[Data Assets]]

## 参考资料

- [GB/T 36073—2025《数据管理能力成熟度评估模型》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22559F9C7BF9EAC6A3927223FE33CE20)
