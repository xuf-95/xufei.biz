---
title: Infrastructure
description: 技术基础设施 - 大数据组件总览
tags:
  - infrastructure
  - technology
  - stack
publish: false
---

## 技术基础设施概述

大数据技术栈的计算、存储、集成、调度等核心组件。

## 技术分类

### 计算引擎
| 引擎 | 类型 | 特点 | 延迟 | 吞吐 |
|------|------|------|------|------|
| [[Apache Hadoop]] | 批处理 | 成熟稳定 | 高 | 高 |
| [[Apache Spark Overview]] | 批流一体 | 生态丰富 | 中 | 高 |
| [[Apache Flink]] | 流计算 | 状态管理 | 低 | 高 |
| [[What is Apache Storm?]] | 流计算 | 低延迟 | 极低 | 中 |

### 存储系统
- [[../../Data Store/]] - 数据存储总览
- [[../Apache Paimon]] - 实时湖仓存储
- [[../../Data Store/MySQL/]] - 关系数据库
- [[../../Data Store/Clickhouse/]] - 分析数据库

### 数据集成
#### 消息队列
- [[../What is Apache Kafka?]] - 分布式消息系统
- [[Apache Pulsar]] - 云原生消息系统
- [[Apache Flume]] - 日志采集

#### 数据同步
- [[../../Data Integration & Schedule/CDC]] - 变更数据捕获
- [[Apache Nifi]] - 数据流自动化

### 调度系统
- [[Apache Airflow]] - 工作流调度
- [[Apache DolphinScheduler]] - 分布式调度

### 治理工具
- [[Apache Atlas]] - 元数据管理
- 数据血缘
- 数据质量

## 技术选型

### 实时计算选型树
```
需求：实时计算
├─ 超低延迟 (< 1s)
│  ├─ 简单聚合 → [[Spark Streaming]]
│  └─ 复杂计算 → [[Apache Flink]]
├─ 低延迟 (1-10s)
│  └─ 批流一体 → [[Apache Spark Overview]]
└─ 准实时 (> 10s)
   └─ 批处理 → [[Apache Hadoop]]
```

### 存储选型决策
```
数据特征 → 存储选择
├─ 结构化高频更新 → OLTP (MySQL)
├─ 结构化分析查询 → OLAP (ClickHouse, StarRocks)
├─ 半结构化/海量 → Data Lake (Iceberg, Paimon)
└─ 实时查询 → Lakehouse (Paimon)
```

## 相关内容

- [[../02-Architecture/|数据架构]] - 架构设计
- [[../07-Lifecycle/|数据生命周期]] - 数据流转
- [[../../cloud data/|云数据平台]]
