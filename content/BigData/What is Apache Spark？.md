---
title: "What is Apache Spark？"
aliases:
  - spark-architecture
tags:
  - bigdata
  - spark
  - compute-engine
  - architecture
date: 2026-07-04
draft: true
publish: true
description: Apache Spark 统一分析引擎的架构全景：Core Engine、SQL Catalyst/Tungsten、Spark Connect、Structured Streaming、MLlib、GraphX 与 Declarative Pipelines
language: CN
---

> [!qu] Apache Spark is a unified analytics engine for large-scale data processing, providing high-level APIs in Java, Scala, Python and R, and an optimized engine that supports general execution graphs.

## 概述

Apache Spark 是一个**统一分析引擎**，设计目标是用一套编程模型覆盖批处理、交互式查询、流计算、机器学习和图计算五大场景。与 [[MapReduce]] 逐 Job 落盘不同，Spark 将中间结果保留在内存中（内存计算比 MR 快 10–100×），并通过 DAG（有向无环图）调度器将整个计算流水线编译为最优执行计划。

Spark 项目采用分层模块化架构，核心模块自底向上依次为：

| 层级 | 模块 | 职责 |
|------|------|------|
| **基础设施** | `common/*` (sketch, kvstore, network, unsafe, variant) | 序列化、网络通信、堆外内存、数据结构 |
| **核心引擎** | `core` | RDD 抽象、DAGScheduler、TaskScheduler、BlockManager、Shuffle |
| **SQL 栈** | `sql/api` → `sql/catalyst` → `sql/core` → `sql/hive` | DataFrame/Dataset API、Catalyst 优化器、Tungsten 执行引擎 |
| **流处理** | `sql/core` (Structured Streaming) | 基于 micro-batch/continuous 的增量计算 |
| **机器学习** | `mllib`, `mllib-local` | Pipeline API、分布式算法库 |
| **图计算** | `graphx` | Pregel BSP 模型、图并行算法 |
| **远程连接** | `sql/connect/*` | gRPC 瘦客户端协议（Spark 3.4+） |
| **声明式管道** | `sql/pipelines` | SDP — 声明式 ETL 管道定义 |

> [!info] Spark vs Flink
> Spark 本质是**微批（micro-batch）**引擎，将无界流切分为有限批次处理；[[What is Apache Flink?|Flink]] 本质是**流（stream-first）**引擎，批处理是有界流的特例。两者在延迟（秒级 vs 毫秒级）、状态管理粒度、Exactly-once 实现路径上存在根本差异。


## 运行时架构

Spark 采用经典的 **Master-Worker** 架构，核心角色包括 Driver、Executor 和 Cluster Manager 三者。

### Driver 进程

Driver 是 Spark 应用的主控进程，负责：创建 `SparkContext`（或 `SparkSession`）→ 将用户代码转换为逻辑计划 → 经 Catalyst 优化 → 生成物理计划 → 拆分为 Stage → 提交 Task 到 Executor。Driver 维护两个关键调度器：

- **DAGScheduler**：将逻辑 DAG 按 Shuffle 边界切分为 Stage（`ShuffleMapStage` / `ResultStage`），构建 Stage 依赖树，以宽依赖（Shuffle Dependency）为切分点
- **TaskScheduler**：将 Stage 中的每个 Partition 封装为 Task，通过 `SchedulerBackend` 提交到集群，支持数据本地性（PROCESS_LOCAL → NODE_LOCAL → RACK_LOCAL → ANY）

### Executor 进程

每个 Executor 是一个独立 JVM 进程，负责执行 Task 并管理本地存储。核心组件：

| 组件 | 职责 |
|------|------|
| **TaskRunner** | 反序列化 Task 闭包，执行计算逻辑，向 Driver 汇报状态 |
| **BlockManager** | 管理 RDD 分区的内存/磁盘缓存，提供 Block 的读写和复制服务 |
| **ShuffleManager** | 处理 Shuffle 数据的写出（MapOutput）和拉取（ShuffleBlockResolver） |
| **MemoryManager** | 统一管理执行内存（Execution）和存储内存（Storage），支持动态借用 |

### 集群管理器

| 模式 | 特性 |
|------|------|
| **Standalone** | Spark 内置，轻量部署，Master/Worker 架构 |
| **YARN** | 与 Hadoop 生态集成，支持 client/cluster deploy mode |
| **Kubernetes** | 容器化部署，Pod 作为 Executor，支持动态资源分配 |
| **Local** | 单 JVM 模式，Driver 和 Executor 共用进程，用于开发调试 |


## Core Engine — RDD 与执行模型

### RDD（Resilient Distributed Dataset）

RDD 是 Spark 最底层的数据抽象——一个**不可变、分区、可并行计算**的分布式集合。每个 RDD 记录五大属性：

1. **分区列表**（`partitions`）：数据的物理切分单元
2. **计算函数**（`compute`）：作用于每个分区的转换逻辑
3. **依赖关系**（`dependencies`）：对父 RDD 的窄依赖或宽依赖
4. **分区器**（`partitioner`，可选）：KV 类型 RDD 的 Hash/Range 分区策略
5. **首选位置**（`preferredLocations`，可选）：数据本地性提示（如 HDFS Block 位置）

> [!info] 窄依赖 vs 宽依赖
> **窄依赖**（Narrow Dependency）：父 RDD 的每个分区最多被一个子 RDD 分区消费，无需 Shuffle（如 `map`、`filter`、`union`）。窄依赖允许流水线执行（pipelining），多个窄依赖算子在同一个 Task 中链式执行。
>
> **宽依赖**（Wide/Shuffle Dependency）：父 RDD 的一个分区被多个子 RDD 分区消费，必须经过 Shuffle 重分布（如 `reduceByKey`、`groupByKey`、`join`）。宽依赖是 Stage 的切分边界。

### DAG 执行流程

```
用户代码 → RDD Lineage（逻辑 DAG）
        → DAGScheduler 按 ShuffleDependency 切分 Stage
        → 每个 Stage 内部的窄依赖算子 Pipeline 成 TaskSet
        → TaskScheduler 将 Task 分发到 Executor
        → Executor 执行 Task，写出 Shuffle / 返回 Result
```

Stage 之间存在依赖关系：上游 `ShuffleMapStage` 的所有 Task 完成后，下游 Stage 才能启动。DAGScheduler 通过 `MapOutputTracker` 追踪每个 Shuffle Map Task 的输出位置，供下游 Reduce Task 拉取数据。

### Shuffle 子系统

Shuffle 是分布式计算中最昂贵的操作——涉及磁盘 I/O、网络传输和序列化开销。Spark 的 Shuffle 实现（`SortShuffleManager`）核心流程：

**Map 端（写出）**：每个 Map Task 将输出按目标 Partition ID 排序后写入本地磁盘，生成一个数据文件和一个索引文件。合并写入减少了小文件数量（相比早期的 Hash Shuffle，文件数从 M×R 降为 M）。

**Reduce 端（拉取）**：`BlockStoreShuffleReader` 通过 `MapOutputTracker` 获取所有 Map 输出位置，使用 `ShuffleBlockFetcherIterator` 批量拉取远程 Block。拉取过程支持本地短路读取（local read）和远程 Netty 传输。

> [!info] Shuffle 优化要点
> 数据倾斜（Data Skew）是 Shuffle 性能杀手。常见应对策略：预聚合（`combineByKey`）、加盐打散（salting）、广播小表（`broadcast join`）、AQE 自适应倾斜处理（Spark 3.0+）。


## SQL Engine — Catalyst 与 Tungsten

Spark SQL 的核心是 **Catalyst 优化器**和 **Tungsten 执行引擎**，它们将 SQL/DataFrame 操作编译为高效的物理执行计划。

### Catalyst 优化器流水线

SQL 查询经过五个阶段的转换：

| 阶段 | 输入 → 输出 | 核心操作 |
|------|-------------|----------|
| **1. Parsing** | SQL 文本 → Unresolved Logical Plan | ANTLR4 语法解析，生成 AST |
| **2. Analysis** | Unresolved → Resolved Logical Plan | 通过 `Catalog` 解析表名、列名、函数，类型检查 |
| **3. Logical Optimization** | Resolved → Optimized Logical Plan | 谓词下推、列裁剪、常量折叠、子查询消除、join 重排序 |
| **4. Physical Planning** | Logical Plan → Physical Plan | 选择 Join 策略（Broadcast/Sort-Merge/Shuffle Hash）、生成 `SparkPlan` 树 |
| **5. Code Generation** | Physical Plan → RDD[InternalRow] | Whole-Stage CodeGen 将算子融合为单个 Java 方法 |

### Tungsten 引擎

Tungsten 是 Spark SQL 的底层执行引擎，核心优化包括：

- **堆外内存管理**（Off-heap Memory）：绕过 JVM GC，使用 `sun.misc.Unsafe` 直接操作原始内存地址，减少 GC 压力和对象开销
- **缓存感知计算**（Cache-aware Computation）：数据以紧凑二进制格式（`UnsafeRow`）存储，列式布局对 CPU Cache 友好
- **Whole-Stage Code Generation**：将多个物理算子（Filter → Project → Aggregate）融合为一个 Java 方法，消除虚函数调用和中间对象分配，生成的代码接近手写循环性能

> [!info] UnsafeRow
> `UnsafeRow` 是 Tungsten 的行级二进制格式：固定长度区域存储 null bitmap + 定长字段值，变长区域存储 String/Binary 数据。整行存储在连续内存块中，支持直接字节比较（无需反序列化）和零拷贝 Shuffle 传输。

### AQE（Adaptive Query Execution）

Spark 3.0 引入的自适应查询执行框架，在运行时根据 Shuffle 统计信息动态调整执行计划：

- **自动合并小分区**（Coalescing Post-Shuffle Partitions）：将过小的 Shuffle 分区合并，减少 Task 数量
- **动态切换 Join 策略**：当一侧数据量运行时发现远小于预估值，自动从 Sort-Merge Join 切换为 Broadcast Hash Join
- **倾斜 Join 优化**（Skew Join Optimization）：检测倾斜分区并将其拆分为多个子分区并行处理


## Spark Connect — gRPC 瘦客户端

Spark Connect（3.4+）引入了**客户端-服务端解耦架构**，通过 gRPC + Protocol Buffers 协议实现远程连接：

```
Client（Python/Scala/Go/Rust）
    ↓  gRPC（Protobuf 序列化的逻辑计划）
Spark Connect Server（SparkSession 内嵌）
    ↓  Catalyst 优化 + 执行
Spark Cluster
```

核心设计理念：

- **瘦客户端**：客户端只负责构建逻辑计划（`Relation` protobuf），不持有 SparkContext，不管理 JVM 类路径
- **版本解耦**：客户端和服务端可以独立升级，通过 protobuf schema 兼容性保证向后兼容
- **多语言原生支持**：Python 客户端不再依赖 Py4J bridge，Go/Rust 客户端可直接对接 gRPC 接口
- **稳定性隔离**：用户代码的 OOM/ClassNotFound 不会影响 Spark Server 进程


## Structured Streaming — 增量计算引擎

Structured Streaming 是 Spark 的流处理引擎，将流数据视为一张**持续追加的无界表**，复用 SQL/DataFrame API 进行增量查询。

### Micro-batch 执行模型

每个 micro-batch 的执行周期：

1. **发现新数据**：Source（如 Kafka Consumer）报告可用 offset 范围
2. **提交 offset 到 WAL**：Write-Ahead Log 持久化本批次的 offset 边界
3. **构建增量 DataFrame**：`getBatch(startOffset, endOffset)` 生成本批次的逻辑计划
4. **Catalyst 优化 + 执行**：与批处理共享优化器和执行引擎
5. **状态更新**：有状态算子（`groupBy().agg()`、`mapGroupsWithState`）读写 StateStore
6. **写出 Sink**：将结果追加到外部存储（Kafka / Delta / JDBC / 文件系统）
7. **提交 checkpoint**：持久化 offset + 状态快照，实现故障恢复

### StateStore 状态管理

有状态流处理的核心是 `StateStore`——一个版本化、可容错的 KV 存储接口。

| Provider | 存储介质 | 性能特性 | 适用场景 |
|----------|----------|----------|----------|
| **HDFSBackedStateStore** | HDFS / 对象存储 | 每次 commit 全量快照，状态量大时 I/O 重 | 默认 Provider，小状态量场景 |
| **RocksDBStateStoreProvider** | 本地 RocksDB + HDFS checkpoint | ~1650–4500ns/row，支持增量 checkpoint | 大状态量生产环境推荐 |

RocksDB Provider 的 checkpoint 策略采用 **Snapshot + Changelog** 混合模式：定期写全量 snapshot（如每 10 个 batch），中间 batch 只写变更日志（changelog）。故障恢复时加载最近 snapshot 后重放 changelog，比全量快照恢复更快。

### TransformWithState（Spark 4.0+）

新一代有状态 API，提供显式的状态原语：

- **ValueState**：单值状态
- **ListState**：列表状态，支持追加和遍历
- **MapState**：KV 映射状态
- **TTL（Time-to-Live）**：状态自动过期清理，避免无限膨胀

> [!info] Exactly-once 语义
> Structured Streaming 通过 **checkpoint + WAL + 幂等 Sink** 实现端到端 Exactly-once。Source offset 和 StateStore 版本在 checkpoint 中原子提交；故障恢复时从最后一个成功 checkpoint 重放，Source 重新读取对应 offset 范围的数据，StateStore 恢复到对应版本。


## MLlib — 分布式机器学习

MLlib 提供基于 DataFrame 的 **Pipeline API**，核心抽象：

- **Transformer**：输入 DataFrame → 输出 DataFrame（如 `VectorAssembler`、训练好的 `Model`）
- **Estimator**：输入 DataFrame → `fit()` → 输出 Transformer/Model（如 `LogisticRegression`、`RandomForestClassifier`）
- **Pipeline**：将多个 Transformer 和 Estimator 串联为 DAG，统一调用 `fit()` 和 `transform()`
- **Evaluator**：评估模型指标（`BinaryClassificationEvaluator`、`RegressionEvaluator`）
- **CrossValidator / TrainValidationSplit**：超参调优，结合 `ParamGrid` 进行网格搜索

MLlib 内置算法覆盖分类、回归、聚类、协同过滤、特征工程、统计检验等领域。底层通过 BLAS/LAPACK 加速线性代数运算，大规模数据集上利用 RDD 分区并行训练。


## GraphX — 图并行计算

GraphX 基于 RDD 实现了属性图（Property Graph）抽象，核心数据结构为 `Graph[VD, ED]`，其中 `VD` 为顶点属性、`ED` 为边属性。

关键 API：

- **`mapVertices` / `mapEdges`**：对顶点/边属性进行转换
- **`subgraph`**：按条件过滤生成子图
- **`joinVertices`**：将外部 RDD 数据关联到图顶点
- **`aggregateMessages`**：沿边发送消息并在顶点聚合（图计算核心原语）
- **`Pregel` API**：BSP（Bulk Synchronous Parallel）模型的迭代图计算框架，支持自定义顶点程序（vprog）、消息发送（sendMsg）和消息合并（mergeMsg）

内置算法：PageRank、Connected Components、Triangle Counting、Shortest Paths、Label Propagation。


## Declarative Pipelines（SDP）

Spark 4.0 引入的声明式管道框架（Spark Declarative Pipelines），允许用户以**声明式**方式定义 ETL 管道：

- **`@table`**：声明一个物化表，指定 schema 和物化策略
- **`@view`**：声明一个虚拟视图（仅查询时计算）
- **`@expect`**：数据质量约束（如 `@expect("positive_amount", "amount > 0")`）
- **Flow**：定义数据如何从 Source 流向 Target，支持 Append / Complete 模式

SDP 将管道定义与执行引擎解耦——用户只描述"要什么数据"，系统自动解析依赖关系、确定执行顺序和增量更新策略。类似于 dbt 的 SQL-first 模型，但原生集成在 Spark 生态中，支持 Python 和 SQL 两种声明方式。


## 部署与资源管理

### SparkSubmit 提交流程

```bash
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --num-executors 100 \
  --executor-memory 8g \
  --executor-cores 4 \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.shuffle.partitions=200 \
  myapp.jar
```

`SparkSubmit` 根据 `--master` 参数选择集群管理器，在 **client** 模式下 Driver 运行在提交机器，在 **cluster** 模式下 Driver 运行在集群节点中。

### 动态资源分配

启用 `spark.dynamicAllocation.enabled=true` 后，Spark 根据待执行 Task 数量动态增减 Executor：

- 有 pending Task 时请求新 Executor（按指数增长：1 → 2 → 4 → 8...）
- Executor 空闲超过 `spark.dynamicAllocation.executorIdleTimeout`（默认 60s）后释放
- 需配合 External Shuffle Service 使用，避免释放 Executor 时丢失 Shuffle 数据


## 性能调优要点

| 维度 | 关键参数 / 策略 |
|------|-----------------|
| **内存** | `spark.executor.memory`、`spark.memory.fraction`（默认 0.6）、`spark.memory.storageFraction`（默认 0.5）|
| **并行度** | `spark.sql.shuffle.partitions`（默认 200）、`spark.default.parallelism`、AQE 自动合并 |
| **Shuffle** | 预聚合（`reduceByKey` 优于 `groupByKey`）、Broadcast Join、倾斜处理 |
| **序列化** | `spark.serializer=org.apache.spark.serializer.KryoSerializer`（比 Java 序列化快 10×） |
| **数据格式** | 列式存储（Parquet/ORC）+ 谓词下推 + 列裁剪 |
| **GC 调优** | G1GC（`-XX:+UseG1GC`）、减少长生命周期对象、堆外内存 |
| **代码** | 避免 `collect()` 大数据集、缓存复用 RDD（`persist()`）、避免 UDF（优先使用内置函数利用 Tungsten CodeGen）|


## Reference

- [Apache Spark Official Documentation](https://spark.apache.org/docs/latest/)
- [DeepWiki — Apache Spark](https://deepwiki.com/apache/spark)
- [Spark性能优化指南——高级篇 - 美团技术团队](https://tech.meituan.com/2016/05/12/spark-tuning-pro.html)
- [SparkInternals — JerryLead](https://github.com/JerryLead/SparkInternals)
