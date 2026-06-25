---
title: Data Architecture HomePage
description: 数据架构 - DCMM 能力域之一
tags:
  - data-architecture
  - dcmm
  - design
publish: false
---

## 数据架构概述

数据架构定义了组织的数据资产结构、分布和流转方式，是数据管理的技术蓝图。

## 架构模式

### 经典架构
- [[../Lambda Architecture]] - 批流一体架构
- [[../what is Kappa Architecture?]] - 纯流式架构
- [[../Flow-Batch Architecture]] - 流批融合架构
- [[../Lake-DataWarehouse Architecture]] - 湖仓一体架构
- [[../Serverless Architecture]] - 无服务器架构

### 架构分层
```
┌─────────────────────────────────────┐
│      应用层 (BI, API, 服务)         │
├─────────────────────────────────────┤
│      数据服务层 (SQL, OLAP)         │
├─────────────────────────────────────┤
│      数据计算层 (Batch + Stream)    │
├─────────────────────────────────────┤
│      数据存储层 (Lake + Warehouse)  │
├─────────────────────────────────────┤
│      数据采集层 (CDC + Ingestion)   │
└─────────────────────────────────────┘
```

## 物理架构

### 数据存储
- [[../Data Warehouse]] - 数据仓库
- [[../Data Lake]] - 数据湖
- [[../Lakehouse]] - 湖仓一体

### 实时湖仓
基于 [[Apache Paimon]] 的流式湖仓架构：
- 统一批流存储
- LSM 结构支持
- CDC 实时入湖

## 相关内容

- [[Bigdata Wiki OS]] - 面向大数据全栈工程师、数据架构师与未来 CDO/CDAO 的个人知识图谱系统规划
- [[MOC-Data Architecture Map]] - 数据架构师能力地图
- [[MOC-DCMM-DAMA Map]] - DCMM、DAMA 与治理能力地图
- [[CDO]] - CDO/CDAO 视角下的数据战略和商业价值
- [[Metadata Management]] - 元数据、血缘、目录和治理上下文
- [[Semantic Layer]] - 指标、维度、权限和 Agent 查询语义层
- [[电商数据中台业务知识手册]] - 面向数据架构、数据中台和建模的电商业务知识沉淀
- [[../01-Governance/|数据治理]] - 治理框架
- [[../08-Infrastructure/|基础设施]] - 技术选型
- [[../../Data Store/|数据存储]]
