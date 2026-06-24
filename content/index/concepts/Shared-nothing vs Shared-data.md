---
title: Shared-nothing vs Shared-data
aliases:
description:
tags:
  - index
date: 2026-06-01
publishDate: 2026-06-24T23:51
language: EN
draft:
publish: true
---

## **1. Shared-nothing 是什么？**

**Shared-nothing**，中文可以理解为：**无共享架构**。

它的核心思想是：

每个节点都有自己独立的 CPU、内存、磁盘和数据分片，节点之间不共享存储资源。

也就是说，一个集群里有很多台机器，每台机器只负责自己那一部分数据和计算任务。

```text
Node 1: CPU + Memory + Disk + Data Part A
Node 2: CPU + Memory + Disk + Data Part B
Node 3: CPU + Memory + Disk + Data Part C
```

每个节点相对独立，数据被切分后分布在不同节点上。

---

## **2. Shared-nothing 的典型代表**

很多大数据和 MPP 系统都是 Shared-nothing 架构，例如：

|**系统**|**说明**|
|---|---|
|Greenplum|典型 MPP 数据库|
|ClickHouse|分布式表场景下接近 Shared-nothing|
|StarRocks|MPP 查询引擎|
|Apache Doris|MPP 架构|
|Teradata|经典 MPP 数据库|
|Spark|计算层是 Shared-nothing 思路|
|Hadoop HDFS + MapReduce|数据和计算都分布式|

---

## **3. Shared-nothing 的优点**

### **1）扩展能力强**

因为每个节点都有自己的计算和存储资源，所以可以通过增加节点提升整体能力。

```text
3 台机器不够 → 加到 6 台 → 加到 12 台
```

这就是大数据系统常说的 **scale out 横向扩展**。

---

### **2）适合海量数据处理**

数据被切成多个分片，不同节点可以并行处理。

例如一张 100 亿行订单表：

```text
Node 1 处理 25 亿行
Node 2 处理 25 亿行
Node 3 处理 25 亿行
Node 4 处理 25 亿行
```

最后再把结果汇总。

这就是 MPP、Spark、Flink、Hive 等系统能够处理大数据的基础。

---

### **3）节点之间耦合低**

一个节点主要处理自己的数据，架构相对清晰，不依赖统一共享存储。

---

## **4. Shared-nothing 的缺点**

### **1）数据重分布成本高**

如果查询需要跨节点关联，就会发生网络传输，也就是 **Shuffle**。

例如：

```sql
SELECT *
FROM orders o
JOIN users u
ON o.user_id = u.user_id;
```

如果 `orders` 和 `users` 没有按照同一个 `user_id` 分布在相同节点，就需要把数据重新打散分发。

```text
Node 1 的 orders 需要找 Node 2/3/4 的 users
Node 2 的 orders 也需要找其他节点的 users
```

这会带来很高的网络和计算开销。

---

### **2）数据倾斜问题明显**

如果某些 key 的数据特别多，会导致部分节点压力巨大。

例如某个大客户贡献了 40% 订单量：

```text
Node 1: 1 亿行
Node 2: 1 亿行
Node 3: 1 亿行
Node 4: 10 亿行
```

这时 Node 4 会成为瓶颈，整个任务被它拖慢。

---

### **3）扩缩容和数据均衡复杂**

新增节点后，数据需要重新分布，否则新节点没有数据，无法充分利用。

---

# **5. Shared-data 是什么？**

**Shared-data**，中文可以理解为：**共享数据架构**。

它的核心思想是：

多个计算节点共享同一份底层数据，计算和存储解耦。

也就是说，数据不是绑定在某个计算节点本地，而是放在一个共享存储层中。

```text
Compute Node 1
Compute Node 2
Compute Node 3
        |
        v
Shared Storage / Object Storage / Data Lake
```

计算节点可以弹性增加或减少，但底层数据仍然是同一份。

---

## **6. Shared-data 的典型代表**

|**系统**|**说明**|
|---|---|
|Snowflake|典型计算存储分离架构|
|BigQuery|Serverless 数仓，计算存储分离|
|Databricks Lakehouse|基于对象存储 + 计算集群|
|Trino / Presto|多计算节点读取共享数据源|
|Spark on S3 / OSS / HDFS|计算和数据可以分离|
|Hive on HDFS / OSS|多计算引擎共享同一份表数据|
|MaxCompute|云数仓，计算存储解耦|
|Delta Lake / Iceberg / Hudi|Lakehouse 表格式，支持多引擎共享数据|

---

## **7. Shared-data 的优点**

### **1）计算和存储解耦**

存储可以独立扩展，计算也可以独立扩展。

```text
数据越来越多 → 扩存储
查询越来越多 → 扩计算
```

这很适合云数仓、湖仓一体和 Serverless 架构。

---

### **2）弹性好**

计算节点可以按需启动和释放。

例如白天查询多，开 20 个计算节点；晚上查询少，缩到 2 个节点。

这对云原生数据平台非常重要。

---

### **3）多引擎共享同一份数据**

同一份数据可以被多个计算引擎读取：

```text
Spark 负责 ETL
Flink 负责实时写入
Trino 负责交互式查询
ClickHouse / StarRocks 负责加速分析
```

底层数据可以统一放在：

```text
S3 / OSS / HDFS / Iceberg / Delta Lake / Hudi
```

这就是湖仓一体架构的重要基础。

---

## **8. Shared-data 的缺点**

### **1）共享存储可能成为瓶颈**

所有计算节点都访问同一个存储系统，如果存储吞吐不够，就会影响整体性能。

```text
Compute 1 \
Compute 2  ---> Shared Storage 压力过大
Compute 3 /
```

---

### **2）一致性和元数据管理更复杂**

多个引擎同时读写同一份数据时，需要解决：

```text
事务一致性
并发写入
Schema 演进
小文件问题
元数据膨胀
快照管理
```

所以才会有 Iceberg、Delta Lake、Hudi 这类表格式。

---

### **3）性能可能不如本地数据亲和**

Shared-nothing 中，数据在本地磁盘，计算可以靠近数据。

Shared-data 中，数据通常在远端存储，比如对象存储，访问延迟和网络成本更高。

---

# **9. 核心对比**

|**对比项**|**Shared-nothing**|**Shared-data**|
|---|---|---|
|中文理解|无共享架构|共享数据架构|
|数据位置|分布在各个节点本地|放在统一共享存储|
|计算和存储|通常绑定较紧|解耦|
|扩展方式|加节点，同时扩计算和存储|计算、存储可独立扩展|
|性能特点|本地性好，并行能力强|弹性好，多引擎共享|
|主要瓶颈|Shuffle、数据倾斜、重分布|存储吞吐、元数据、一致性|
|典型系统|Greenplum、Doris、StarRocks、ClickHouse|Snowflake、BigQuery、Databricks、Trino、Lakehouse|
|适合场景|高性能 MPP 查询、大规模并行处理|云数仓、数据湖、湖仓一体、多引擎共享|

---

# **10. 一个形象类比**

## **Shared-nothing**

像多个厨师各自有自己的厨房、食材和锅。

```text
厨师 A：自己的厨房 + 自己的食材
厨师 B：自己的厨房 + 自己的食材
厨师 C：自己的厨房 + 自己的食材
```

优点是每个人可以并行做饭，速度快。

缺点是如果 A 需要 B 的食材，就要互相搬来搬去，成本高。

---

## **Shared-data**

像多个厨师共用一个大型中央仓库。

```text
厨师 A \
厨师 B  ---> 中央食材仓库
厨师 C /
```

优点是食材统一管理，厨师可以随时增减。

缺点是如果所有厨师同时去仓库拿东西，仓库可能堵住。

---

# **11. 在大数据架构中的演进趋势**

早期大数据系统更偏向 **Shared-nothing**：

```text
Hadoop / MPP / 本地分布式存储
```

核心目标是：

```text
把数据切开，分布到多个节点，并行计算
```

后来云数仓和湖仓一体更偏向 **Shared-data**：

```text
对象存储 + 弹性计算 + 开放表格式
```

核心目标变成：

```text
存储统一，计算弹性，多引擎共享
```

现在很多系统其实是**混合架构**。

例如 StarRocks、ClickHouse、Doris 传统上偏 Shared-nothing，但也开始支持湖仓查询、对象存储、计算存储分离。

---

# **12. 一句话总结**

**Shared-nothing** 强调：

数据和计算分布在各个节点上，通过分片实现高性能并行计算。

**Shared-data** 强调：

多个计算节点共享同一份数据，计算和存储解耦，适合云原生和湖仓一体。

简单记：

```text
Shared-nothing = 每个节点管自己的数据，适合高性能 MPP
Shared-data    = 多个计算节点共享一份数据，适合云数仓 / 数据湖 / 湖仓一体
```