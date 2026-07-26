---
title: "Flink Codebase Architecture"
aliases:
  - Flink 源码架构
  - Flink Internal Architecture
tags:
  - flink
  - architecture
  - streaming
  - bigdata
description: 基于 DeepWiki 对 Apache Flink 源码的分析，从架构、运行时、状态管理、SQL、连接器和部署六个维度总结 Flink 的内部实现。
date: 2026-07-03
publish: true
draft: true
---

> [!infobox]
>
> ## Apache Flink
>
> ### Meta
>
> | Item | Value |
> | --- | --- |
> | Type | Source Code Architecture |
> | Scope | Runtime Internals |
> | Source | [DeepWiki](https://deepwiki.com/apache/flink) |
> | Repo | [apache/flink](https://github.com/apache/flink) |
> | Build | Maven Multi-Module |
> | Language | Java / Scala / Python |

## Overview

Apache Flink 是一个分布式流处理框架，专为有界和无界数据流上的有状态计算而设计。本文从**源码视角**梳理 Flink 的内部架构，覆盖运行时、作业执行、流处理、状态管理、Table/SQL、连接器和部署等核心子系统。

想象一个快递分拣中心：**JobManager** 是调度中心，负责规划路线和分配包裹；**TaskManager** 是分拣员，负责实际搬运；**Checkpoint** 则像定期拍照存档，万一出错可以从照片恢复现场。整个 Flink 的架构就是围绕这三个角色展开的。

> [!tip]
> 本文关注 Flink 源码内部实现，适合需要理解 Flink 运行时行为、调试生产问题或参与社区贡献的工程师。关于 Flink 的使用入门，参见 [[ApacheFlink|Apache Flink]]。

<nav class="gallery-card-view" aria-label="Flink architecture sections">
  <a class="gallery-card internal" href="#高层架构">
    <span class="gallery-card-title">高层架构</span>
    <span class="gallery-card-subtitle">Client → JobManager → TaskManager</span>
  </a>
  <a class="gallery-card internal" href="#作业执行系统">
    <span class="gallery-card-title">作业执行</span>
    <span class="gallery-card-subtitle">Dispatcher、Scheduler、ExecutionGraph</span>
  </a>
  <a class="gallery-card internal" href="#流处理引擎">
    <span class="gallery-card-title">流处理引擎</span>
    <span class="gallery-card-subtitle">StreamTask、Mailbox、Network Stack</span>
  </a>
  <a class="gallery-card internal" href="#状态管理与容错">
    <span class="gallery-card-title">状态与容错</span>
    <span class="gallery-card-subtitle">Checkpoint、State Backend、DSTL</span>
  </a>
</nav>

## 高层架构

Flink 采用经典的 **Master-Worker** 架构。**JobManager** 充当 Master，负责作业调度、资源协调和容错管理；**TaskManager** 充当 Worker，执行实际的数据处理任务。

> [!column|3 clean]
>
> > [!info] Client
> >
> > 负责将用户程序（DataStream / Table API）转换为 `JobGraph`，通过 REST 接口提交给 `Dispatcher`。对应类：`RestfulGateway`、`ClusterClientJobClientAdapter`。
>
> > [!info] JobManager
> >
> > 集群的中央协调点，通过 `ClusterEntrypoint` 启动。内部包含三个核心组件：`Dispatcher`（作业提交入口）、`ResourceManager`（资源管理）、`JobMaster`（单个作业的执行管理）。
>
> > [!info] TaskManager
> >
> > 执行任务的工作进程。通过 `TaskManagerRunner` 启动，核心是 `TaskExecutor`，管理 Slot 分配和任务执行。每个 TaskManager 提供多个 Slot 作为资源隔离单元。

### 核心运行时组件映射

| 系统概念 | 代码实体 | 所属模块 |
| --- | --- | --- |
| 集群入口 | `ClusterEntrypoint` | `flink-runtime` |
| 作业提交 | `Dispatcher` | `flink-runtime` |
| 资源协调 | `ResourceManager` | `flink-runtime` |
| Worker 进程 | `TaskManagerRunner` | `flink-runtime` |
| 任务容器 | `TaskExecutor` | `flink-runtime` |
| 指标注册 | `MetricRegistryImpl` | `flink-runtime` |

## Maven 模块结构

Flink 源码是一个包含 40+ 模块的 Maven 多模块项目。可以把它类比成一栋大楼的不同楼层——每层负责一个独立的功能域，但通过电梯（依赖关系）互相连通。

| 类别 | 模块 | 职责 |
| --- | --- | --- |
| Core APIs | `flink-core-api`、`flink-core` | 类型系统、序列化、配置 |
| Runtime | `flink-runtime`、`flink-runtime-web` | 作业执行、调度、网络栈 |
| Streaming | `flink-streaming-java`、`flink-datastream` | DataStream API、算子 |
| Table/SQL | `flink-table`（多个子模块） | Table API、SQL 解析、优化、执行 |
| State | `flink-state-backends`、`flink-dstl` | HashMapStateBackend、RocksDB、ForSt、Changelog |
| Connectors | `flink-connectors`、`flink-formats` | Kafka、JDBC、文件系统、Avro、Parquet |
| Python | `flink-python` | PyFlink API、Py4J Bridge、Beam 集成 |
| Deployment | `flink-kubernetes`、`flink-yarn` | 集群部署与资源管理 |
| Distribution | `flink-dist` | 二进制打包与发布 |

## 作业执行系统

作业执行系统负责 Flink 作业从提交到完成的完整生命周期管理。这个过程可以类比成餐厅的点单流程：客人（Client）下单，前台（Dispatcher）接单分配，厨师长（JobMaster）协调各厨师（Task）并行工作。

<section class="process-steps-panel" aria-labelledby="job-exec-title">
  <h2 id="job-exec-title">作业提交流程</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>Client 构建 JobGraph</h3>
        <p>用户程序通过 DataStream / Table API 编写，Client 将其转换为 <code>JobGraph</code>（算子链、并行度、资源需求的逻辑描述）。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>Dispatcher 接收并持久化</h3>
        <p><code>Dispatcher</code> 检查作业是否已在终态，如果不是则持久化 <code>ExecutionPlan</code>，启动 <code>JobManagerRunner</code>。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>构建 ExecutionGraph</h3>
        <p><code>DefaultExecutionGraphBuilder</code> 将 <code>JobGraph</code> 转换为可执行的 <code>ExecutionGraph</code>，分解为并行的 <code>ExecutionVertex</code>，每个 Vertex 通过 <code>Execution</code> 对象跟踪状态。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">4</span>
      <div class="process-step-body">
        <h3>Slot 分配与任务部署</h3>
        <p><code>ResourceManager</code> 匹配 <code>ResourceRequirements</code> 与可用 Slot，<code>DefaultExecutionDeployer</code> 通过 <code>TaskDeploymentDescriptorFactory</code> 将任务分发到 TaskManager。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">5</span>
      <div class="process-step-body">
        <h3>任务执行与监控</h3>
        <p>TaskManager 上的 <code>TaskExecutor</code> 在 Slot 中运行任务，通过 Metrics 系统上报指标，<code>CheckpointCoordinator</code> 协调容错快照。</p>
      </div>
    </li>
  </ol>
</section>

### 调度器

Flink 提供两种核心调度器实现：

> [!column|2 clean]
>
> > [!example] AdaptiveScheduler
> >
> > Flink 的主要调度器实现，能根据可用资源**动态调整作业并行度**。通过有限状态机运转：`Created` → `WaitingForResources` → `CreatingExecutionGraph` → `Executing` → `Restarting`。适合流处理场景，支持自动扩缩容。
>
> > [!example] DefaultScheduler
> >
> > 传统调度器，使用提交时确定的**固定并行度**。提供确定性调度行为，主要用于批处理和静态并行度的流作业。内部通过 `FailoverStrategy` 和 `RestartBackoffTimeStrategy` 协调失败任务的重启。

### 部署模式

| 模式 | 特点 | 适用场景 |
| --- | --- | --- |
| Application Mode | 用户 `main()` 在集群上执行，`Dispatcher` 直接管理应用生命周期 | 生产环境、隔离性要求高 |
| Session Mode | 多个作业共享一个长期运行的集群 | 开发调试、短作业频繁提交 |

## 流处理引擎

流处理引擎是 Flink 最核心的执行层。如果说作业执行系统是"管理层"，那流处理引擎就是"车间"——真正处理数据的地方。

### StreamTask 生命周期

`StreamTask` 是流算子的执行容器[^streamtask]，遵循明确的状态转换：

[^streamtask]: `StreamTask` 是 Flink 流处理的核心抽象，每个 TaskManager Slot 中运行一个 StreamTask 实例，内部包含一个或多个链式算子。

| 状态 | 说明 |
| --- | --- |
| `CREATED` | Task 对象在 TaskManager 上实例化 |
| `DEPLOYING` | 网络和资源环境正在建立 |
| `INITIALIZING` | 通过 `TaskStateManager` 恢复状态并初始化算子 |
| `RUNNING` | 主 Mailbox 循环处理数据和事件 |
| `FINISHED` | 所有输入处理完成，任务成功结束 |

### Mailbox 执行模型

Flink 用 Mailbox 模型替代了传统的多线程锁机制。可以类比成一个秘书的收件箱——所有事务（数据处理、Timer 触发、Checkpoint）都被包装成"信件"放入队列，由**单一主线程**按优先级依次处理，从根本上避免了并发竞争。

> [!info]
> Mailbox 的三个关键角色：**Main Thread** 执行 Mailbox 循环；**MailboxExecutor** 提供优先级队列；**异步线程**（网络线程、Async I/O）通过入队"信件"触发主线程动作。

### 网络栈与数据交换

任务间的数据交换通过 Netty 网络栈完成。上游任务写入 `ResultPartitionWriter`，下游任务从 `InputGate` 消费。根据 `RuntimeExecutionMode` 的不同（`STREAMING` vs `BATCH`），分区行为也不同：流模式使用流水线（Pipelined）分区，批模式使用阻塞（Blocking）分区。

### DataStream API v2

新一代 DataStream API 位于 `flink-datastream-api` 模块，提供了更精细的流分区抽象（如 `KeyedPartitionStream`）和改进的类型安全。新的 `Sink` v2 接口通过 `SupportsCommitter` 和 `SupportsWriterState` 支持 Exactly-Once 语义。

## 状态管理与容错

状态管理是 Flink 实现 Exactly-Once 保证的基石。如果说流处理引擎是"车间"，那状态管理就是"保险柜"——确保即使车间着火，所有重要数据都能恢复。

### Checkpoint 机制

Flink 的核心容错机制是 **Checkpoint**[^checkpoint]：周期性地对整个应用状态做一致性快照。`CheckpointCoordinator` 协调所有任务同步捕获状态并写入持久存储。故障恢复时，从最近的成功 Checkpoint 恢复所有算子状态。

[^checkpoint]: Checkpoint 使用 Chandy-Lamport 分布式快照算法的变体，通过 Barrier 对齐确保一致性，支持 `EXACTLY_ONCE` 和 `AT_LEAST_ONCE` 两种模式。

> [!warning]
> Checkpoint 的关键配置参数直接影响系统稳定性。`execution.checkpointing.interval` 过短会增加系统负担，过长则故障恢复时丢失更多进度。生产环境建议根据状态大小和吞吐量调优。

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `execution.checkpointing.interval` | 无 | Checkpoint 触发间隔 |
| `execution.checkpointing.mode` | `EXACTLY_ONCE` | 一致性保证级别 |
| `execution.checkpointing.timeout` | 10 min | 超时后 Checkpoint 中止 |
| `execution.checkpointing.max-concurrent-checkpoints` | 1 | 最大并发 Checkpoint 数 |

### State Backend 对比

State Backend 决定了状态在运行时如何存储，以及 Checkpoint 时如何持久化。可以类比成存储介质的选择：内存（快但容量小）、SSD（平衡）、远程文件系统（大但有延迟）。

| Backend | 存储位置 | 适用场景 | 特点 |
| --- | --- | --- | --- |
| `HashMapStateBackend` | JVM 堆内存 | 小状态、低延迟 | 快速，受 RAM 限制 |
| `EmbeddedRocksDBStateBackend` | 本地磁盘（RocksDB） | 大状态、内存敏感 | 支持增量 Checkpoint |
| `ForStStateBackend` | 远程文件系统（实验性） | 存算分离架构 | SST 文件存于 HDFS/S3 |

> [!tip]
> 关于 Flink State 的生产调优和 Remote State 探索，参见 Flink State Management。

### Changelog State Backend 与 DSTL

Changelog State Backend 是一种高级状态后端，配合分布式状态事务日志（DSTL）工作。传统 Checkpoint 每次写入完整状态快照，Changelog 模式只记录**状态变更增量**到持久化日志，大幅降低 Checkpoint 耗时。这就像日记本——不需要每天重新抄写全部内容，只记录今天发生了什么变化。

### 高可用与故障恢复

Flink 通过 `HighAvailabilityServices` 实现高可用：

> [!column|3 clean]
>
> > [!summary] Leader 选举
> >
> > `Dispatcher` 和 `ResourceManager` 通过 Leader 选举服务选出主节点，支持 ZooKeeper 和 Kubernetes 两种实现。
>
> > [!summary] 作业恢复
> >
> > `Dispatcher` 启动时从 `JobResultStore` 恢复作业状态。`CompletedCheckpoint` 存储在持久存储（S3/HDFS）中，确保 Master 故障后可恢复。
>
> > [!summary] 失败管理
> >
> > `CheckpointFailureManager` 跟踪连续失败次数，超过 `tolerableCpFailureNumber` 阈值时触发作业 Failover。

## Table API 与 SQL

`flink-table` 模块族提供 SQL 查询处理和 Table API。内部将 Table 程序翻译和优化为 Flink 流水线执行。

### SQL 函数系统

所有内置函数集中定义在 `BuiltInFunctionDefinitions` 中，涵盖标量函数（`TYPE_OF`、`IF_NULL`、`ARRAY_APPEND`、`MAP_KEYS`）和聚合函数（`SUM`、`AVG`、`COLLECT`）。

> [!info]
> Flink SQL 同时支持流模式和批模式执行。通过 Catalog 管理元数据（支持 Hive Metastore 集成），Materialized Table 提供物化视图能力。关于 Flink SQL 的使用细节，参见 [[FlinkTableAPIAndSQL]]。

## 连接器框架

Flink 通过可插拔的连接器架构对接外部系统。

| 连接器 | 模块 | 特点 |
| --- | --- | --- |
| Kafka | `flink-connector-kafka` | 支持 Exactly-Once（两阶段提交） |
| File System | `flink-connector-files` | 支持 HDFS、S3、本地文件系统 |
| JDBC | `flink-connector-jdbc` | 关系型数据库读写 |
| Hive | `flink-connector-hive` | Hive Catalog 与数据读写集成 |

Sink v2 框架通过 `SinkWriter` → `Committer` 的两阶段协议实现 Exactly-Once 语义：Writer 预写数据并生成 Committable，Checkpoint 成功后 Committer 原子提交。

> [!tip]
> 关于 Flink CDC 连接器的使用，参见 [[FlinkCDC]]。

## 部署与运维

### 部署目标

| 部署方式 | 模块 | 技术 |
| --- | --- | --- |
| Kubernetes | `flink-kubernetes` | Fabric8 Kubernetes Client |
| YARN | `flink-yarn` | Hadoop YARN ResourceManager |
| Standalone | `flink-dist` | 独立集群脚本 |

### 监控与指标

Flink 提供完善的 Metrics 系统，通过 `RuntimeContext` 的 `MetricGroup` 注册指标：

| 指标类型 | 用途 | 示例 |
| --- | --- | --- |
| `Counter` | 事件计数 | `numRecordsIn`、`numRecordsOut` |
| `Gauge` | 瞬时值 | 内存使用量、队列长度 |
| `Histogram` | 值分布 | 延迟分布 |
| `Meter` | 平均吞吐量 | 每秒处理记录数 |

### PyFlink

`flink-python` 模块通过 Py4J Bridge 提供 Python 语言绑定，支持 DataStream 和 Table API。UDF 执行依赖 Apache Beam（2.54.0–2.61.0），Vectorized UDF 通过 PyArrow 实现列式数据传输。

## Common Pitfalls

> [!warning]
> 基于源码分析，以下是常见的认知误区和生产问题：

| 问题 | 原因 | 建议 |
| --- | --- | --- |
| Checkpoint 超时 | 状态过大或 Barrier 对齐耗时长 | 考虑使用 RocksDB + 增量 Checkpoint，或启用 Unaligned Checkpoint |
| 内存溢出 | `HashMapStateBackend` 状态超出堆内存 | 大状态场景切换到 `EmbeddedRocksDBStateBackend` |
| 任务恢复慢 | 远程状态下载耗时 | 启用 Local Recovery（`StateRecoveryOptions.LOCAL_RECOVERY`） |
| 反压导致吞吐下降 | 下游处理能力不足 | 检查 Metrics 中的 `idleTimeMsPerSecond`，调整并行度或优化算子逻辑 |

## Links

- related:: [[ApacheFlink|Apache Flink]]
- related:: Flink State Management
- related:: [[FlinkTableAPIAndSQL]]
- related:: [[FlinkCDC]]
- source:: [DeepWiki: apache/flink](https://deepwiki.com/apache/flink)
- source:: [GitHub: apache/flink](https://github.com/apache/flink)
