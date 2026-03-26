---
title: Flow-Batch Architecture
tags:
  - data-architecture
  - data-warehouse
  - streaming
  - batch
date: 2024-12-21
draft: false
publishDate: 2026-03-26T14:26:00
---
## **概述**

> 核心思想： **使用统一计算引擎处理流数据和批数据，并通过 Lakehouse 实现统一存储**

流批一体架构（Flow-Batch Architecture）是现代大数据平台中的一种核心架构模式，其目标是通过统一的计算引擎、统一的数据模型以及统一的数据存储体系，同时处理实时数据（Streaming）和离线数据（Batch）

在该架构中：

- **Batch（批处理）被视为 Streaming（流处理）的特殊情况**
- 有界数据集（Bounded Data）使用批处理
- 无界数据流（Unbounded Data）使用流处理

通过统一处理模型，流批一体架构解决了传统架构中**实时计算与离线计算割裂的问题**。

目前主流的流批一体计算引擎包括：

- [Apache Flink](chatgpt://generic-entity?number=0)
- [Apache Spark](chatgpt://generic-entity?number=1)
## **背景：传统大数据架构的问题**

在早期的大数据平台中，企业通常采用 **[[Lambda Architecture]] 架构**

其核心结构包含三个层：

1. **Batch Layer（批处理层）**
2. **Speed Layer（实时处理层）**
3. **Serving Layer（查询服务层）**

典型技术栈：
|**层**|**技术**|
|---|---|
|Batch|Hive / Spark|
|Speed|[[Storm]] / [[Flink]]|
|Serving|[[HBase]] / [[Elasticsearch]]|

这种架构存在明显问题：

1. 同一业务逻辑需要开发两套实现： 一套实时计算；一套离线计算
2. 数据一致性困难：实时结果与离线结果可能出现偏差
3. **运维成本高**：需要维护多套计算系统

## **流批一体的核心思想**

> **Batch = Bounded Stream**

```shell
数据源 → 统一计算引擎 → 统一存储 → 查询服务
```

在该模式下：

- 实时计算和离线计算使用同一引擎
- 数据写入同一数据湖或数据仓库
- 查询服务统一对外提供接口

## **典型流批一体数据链路**

```
业务系统
   │
   ▼
Kafka
   │
   ▼
Flink / Spark
   │
   ▼
Iceberg / Hudi 数据湖
   │
   ▼
OLAP 查询引擎
   │
   ▼
BI / Dashboard
```

查询层通常使用 [Trino](chatgpt://generic-entity?number=8) 用于实现，实时查询、OLAP 分析、BI 报表