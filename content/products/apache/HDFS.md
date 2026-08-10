---
title: HDFS
type: product
tags:
  - type/product
  - lifecycle/storage
  - latency/batch
  - ecosystem/apache
  - tech/hadoop
  - architecture
aliases:
  - hdfs-architecture
date: 2026-07-04
publish: true
description: HDFS (Hadoop Distributed File System) is a distributed file system designed to run on commodity hardware, providing high-throughput access to application data.
language: CN
---

> [!infobox]
>
> ## HDFS
>
> ### 核心参数
>
> | 项目 | 值 |
> | --- | --- |
> | 默认 Block 大小 | 128 MB |
> | 默认副本数 | 3 |
> | 心跳间隔 | 3 s |
> | 心跳超时检查 | 300 s |
> | 架构模式 | Master-Slave |
> | 协议 | RPC（Protobuf） |
> | REST 接口 | WebHDFS |

> [!qu] HDFS (Hadoop Distributed File System) is a distributed file system designed to run on commodity hardware, providing high-throughput access to application data.

## 概述

[[HDFS]] 是 [[Apache Hadoop Overview|Hadoop]] 生态的核心存储层——一个面向**大规模数据集**的分布式文件系统。其设计哲学是"移动计算到数据所在地，而非移动数据到计算所在地"，在廉价商用硬件上通过**多副本冗余**实现高容错和高吞吐。

与传统文件系统相比，HDFS 做了几个关键取舍：

| 维度 | HDFS 设计选择 | 传统文件系统 |
|------|---------------|-------------|
| **文件大小** | 面向 GB–TB 级大文件 | 支持任意大小 |
| **访问模式** | Write-once, Read-many（一次写入、多次读取） | 随机读写 |
| **延迟** | 高吞吐优先，延迟较高（秒级） | 低延迟优先（毫秒级） |
| **并发写入** | 单写者模型，不支持多客户端并发写同一文件 | 支持并发写 |
| **数据完整性** | Checksum 校验 + 多副本 | 依赖硬件 RAID |

> [!info] 类比理解
> 可以把 HDFS 想象成一个**超大图书馆**：NameNode 是馆长（知道每本书在哪个书架），DataNode 是一排排书架（真正存放书籍），Block 是书被拆成的章节（每章放在不同书架上，且有多份副本分散存放以防火灾）。客户端要读一本书，先问馆长要目录，再直接去对应书架取章节。


## 整体架构

HDFS 采用经典的 **Master-Slave** 架构，核心角色为 NameNode（Master）和 DataNode（Slave），通过 RPC 协议（Protobuf 序列化）通信。

<section class="process-steps-panel" aria-labelledby="hdfs-arch-title">
  <h2 id="hdfs-arch-title">HDFS 核心组件交互</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>Client 发起请求</h3>
        <p>通过 <code>DistributedFileSystem</code> API 发起文件操作，<code>DFSClient</code> 封装底层 RPC 调用和数据流管道。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>NameNode 处理元数据</h3>
        <p><code>FSNamesystem</code> 接收请求，管理命名空间树（文件/目录/权限），协调 <code>BlockManager</code> 进行 Block 分配和副本放置。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>BlockManager 调度副本</h3>
        <p>根据放置策略（Rack-Aware）选择目标 DataNode，维护 Block → DataNode 映射，监控副本冗余度。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">4</span>
      <div class="process-step-body">
        <h3>DataNode 存储数据</h3>
        <p>接收数据块写入本地磁盘（<code>FsDatasetImpl</code>），通过心跳和 Block Report 向 NameNode 汇报状态。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">5</span>
      <div class="process-step-body">
        <h3>Client 直连 DataNode 传输数据</h3>
        <p>读写数据流直接在 Client 和 DataNode 之间传输（<code>DataXceiverServer</code>），不经过 NameNode，避免元数据节点成为吞吐瓶颈。</p>
      </div>
    </li>
  </ol>
</section>


## NameNode — 元数据中枢

NameNode 是 HDFS 的"大脑"，维护整个文件系统的**命名空间**（Namespace）和 **Block 映射**（BlocksMap）。其核心实现类 `FSNamesystem` 承担六大职责：

| 职责 | 说明 | 核心组件 |
|------|------|----------|
| **命名空间管理** | 文件/目录的创建、删除、重命名、权限控制 | `FSDirectory` |
| **Block 管理** | Block 分配、副本放置、冗余监控、垃圾回收 | `BlockManager` |
| **租约管理** | 文件写入的排他锁，保证单写者语义 | `LeaseManager` |
| **DataNode 管理** | 注册、心跳、退役、维护模式 | `DatanodeManager` |
| **事务日志** | 所有元数据变更写入 EditLog，支持故障恢复 | `FSEditLog` |
| **缓存管理** | 中心化缓存指令，将热数据缓存到 DataNode 内存 | `CacheManager` |

### 元数据持久化

NameNode 的元数据通过两种机制持久化：

- **FSImage**（`fsimage`）：命名空间的完整快照（checkpoint），包含所有文件/目录的 INode 树和 Block 映射
- **EditLog**（`edits`）：自上次 checkpoint 以来的所有元数据变更操作日志

> [!info] Checkpoint 流程
> Secondary NameNode（或 Standby NameNode）定期将 FSImage + EditLog 合并为新的 FSImage，防止 EditLog 无限膨胀。流程：通知 NameNode 滚动日志 → 拉取 FSImage 和旧 EditLog → 内存中回放合并 → 传回新 FSImage → NameNode 切换使用。

### 并发控制

`FSNamesystem` 使用 `FSNLockManager` 实现细粒度读写锁：

- **读操作**（`ls`、`stat`、`getBlockLocations`）：获取读锁，多个读操作可并发执行
- **写操作**（`create`、`mkdir`、`delete`）：获取写锁，排他执行
- **Checkpoint 锁**（`cpLock`）：Standby NameNode checkpoint 操作使用独立锁，不阻塞 Active NameNode 的正常服务
- **锁指标监控**：通过 `dfs.namenode.lock.detailed-metrics.enabled` 开启锁持有时间和竞争分析


## BlockManager — 副本调度引擎

`BlockManager` 是 NameNode 内部负责 **Block 生命周期管理**的核心组件——从 Block 分配、副本放置、冗余监控到垃圾回收的全流程。

### 核心数据结构

| 组件 | 类 | 职责 |
|------|-----|------|
| **Block 映射** | `BlocksMap` | 维护 Block ID → `BlockInfo`（包含副本位置列表）的全局映射 |
| **低冗余队列** | `LowRedundancyBlocks` | 按优先级排列副本数不足的 Block，等待修复调度 |
| **损坏副本表** | `CorruptReplicasMap` | 记录被 Scanner 或 Client 检测到的损坏副本 |
| **待删除队列** | `InvalidateBlocks` | 待通知 DataNode 删除的多余副本 |
| **待重建队列** | `PendingReconstructionBlocks` | 已下发重建指令但尚未完成的 Block |
| **过量副本表** | `excessRedundancyMap` | 超出目标副本数的多余副本，等待清理 |

### 副本放置策略

HDFS 的副本放置策略是**机架感知**（Rack-Aware）的，默认 3 副本的放置规则：

> [!column|3 clean]
>
> > [!tip|no-t] 第 1 副本
> >
> > 放在写入客户端所在的 DataNode（如果客户端不在集群内，则随机选一个负载较低的节点）
>
> > [!tip|no-t] 第 2 副本
> >
> > 放在**不同机架**的一个 DataNode 上（跨机架容错）
>
> > [!tip|no-t] 第 3 副本
> >
> > 放在第 2 副本**同一机架**的另一个 DataNode 上（减少跨机架网络流量）

| 放置策略 | 实现类 | 适用场景 |
|----------|--------|----------|
| **Default** | `BlockPlacementPolicyDefault` | 标准机架感知放置 |
| **Rack Fault Tolerant** | `BlockPlacementPolicyRackFaultTolerant` | 增强跨机架分散度 |
| **Erasure Coding** | `BlockPlacementPolicyEC` | EC 条带组的分布放置 |

### 冗余监控（RedundancyMonitor）

`RedundancyMonitor` 是一个后台守护线程，持续扫描并维护集群中所有 Block 的副本冗余度：

- **欠副本检测**：副本数低于 `dfs.replication`（默认 3）的 Block 加入 `LowRedundancyBlocks` 队列，按优先级调度复制
- **超副本清理**：副本数超过目标的 Block，选择合适副本删除（优先删除同机架的多余副本）
- **EC 重建**：Erasure Coding 模式下，丢失的数据/校验块通过 `BlockECReconstructionCommand` 调度重建
- **负载均衡**：放置决策考虑 DataNode 当前负载和心跳 `staleInterval`


## DataNode — 数据存储节点

DataNode 是 HDFS 的"手脚"——负责**实际的数据块存储和传输**。每个 DataNode 管理本地磁盘上的多个存储卷（Volume），通过 `FsDatasetImpl` 抽象存储层。

### 存储层次结构

```
DataNode
  └── FsDatasetImpl              # 存储层抽象
       └── FsVolumeList          # 卷列表
            └── FsVolumeImpl     # 单个磁盘卷
                 └── BlockPoolSlice  # 每个 Block Pool 的存储分区
                      ├── current/     # finalized blocks
                      ├── rbw/         # Replica Being Written
                      └── tmp/         # temporary blocks
```

### 副本状态机

DataNode 上的每个 Block 副本经历以下状态转换：

| 状态 | 含义 | 转换条件 |
|------|------|----------|
| **RBW** (Replica Being Written) | 正在写入中 | Client 开始写入 |
| **RWR** (Replica Waiting to be Recovered) | 等待恢复 | DataNode 重启后发现未完成的写入 |
| **RUR** (Replica Under Recovery) | 恢复中 | Lease Recovery 过程中 |
| **TEMPORARY** | 临时副本 | Block 复制或 Balancer 迁移过程中 |
| **FINALIZED** | 已完成 | 写入完成并关闭，不可变 |

### 心跳与 Block Report

DataNode 通过两种机制向 NameNode 汇报状态：

- **心跳**（Heartbeat，默认每 3 秒）：汇报节点存活状态、磁盘容量、负载指标。NameNode 在心跳响应中下发指令（复制/删除/恢复 Block）
- **Block Report**（默认每 6 小时）：完整汇报本节点所有 Block 列表，NameNode 用于校准 `BlocksMap` 映射
- **增量 Block Report**（IBR）：实时汇报 Block 状态变更（新增/删除/完成），避免等待全量 Report 的延迟

> [!warning] 心跳超时
> 如果 NameNode 在 `dfs.namenode.heartbeat.recheck-interval`（默认 300s）+ 10 × 心跳间隔内未收到某 DataNode 的心跳，则判定该节点死亡，将其上所有 Block 标记为欠副本并触发复制。

### 数据完整性

DataNode 通过 `BlockScanner` 和 `VolumeScanner` 持续扫描本地 Block 数据：

- 读取 Block 数据并校验 Checksum（默认 CRC32C，每 512 字节一个校验值）
- 发现损坏数据后通知 NameNode，NameNode 将该副本加入 `CorruptReplicasMap` 并调度新副本复制
- `DirectoryScanner` 定期对比内存中的副本映射与磁盘实际文件，修复不一致


## 数据读写管道

### 写入流程（Write Pipeline）

HDFS 写入采用**流水线复制**（Pipeline Replication）：Client 将数据推送到第 1 个 DataNode，第 1 个 DataNode 转发到第 2 个，第 2 个转发到第 3 个，形成链式管道。

<section class="process-steps-panel" aria-labelledby="write-pipeline-title">
  <h2 id="write-pipeline-title">写入管道流程</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>Client 请求创建文件</h3>
        <p>调用 <code>DistributedFileSystem.create()</code>，NameNode 在命名空间中创建文件条目，分配 Lease（写入排他锁）。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>请求分配 Block</h3>
        <p>Client 调用 <code>addBlock()</code> RPC，BlockManager 按放置策略选择 3 个 DataNode，返回 <code>LocatedBlock</code>（Block ID + DataNode 列表）。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>建立 Pipeline</h3>
        <p>Client 与第 1 个 DataNode 建立 TCP 连接，第 1 个连接第 2 个，第 2 个连接第 3 个，形成 <code>DN1 → DN2 → DN3</code> 链式管道。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">4</span>
      <div class="process-step-body">
        <h3>流式写入 + ACK 反向传播</h3>
        <p>数据以 Packet（默认 64KB）为单位沿 Pipeline 流式传输。每个 DataNode 写入本地后向上游发送 ACK，当 Client 收到所有 DataNode 的 ACK 后确认该 Packet 写入成功。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">5</span>
      <div class="process-step-body">
        <h3>关闭文件</h3>
        <p>所有 Block 写完后，Client 调用 <code>complete()</code>，NameNode 确认最小副本数（<code>dfs.namenode.replication.min</code>，默认 1）满足后提交文件。</p>
      </div>
    </li>
  </ol>
</section>

> [!info] Pipeline 容错
> 如果 Pipeline 中某个 DataNode 故障，Client 会关闭当前 Pipeline，将已写入的 Block 标记为当前长度，向 NameNode 请求新的 DataNode 替换故障节点，重建 Pipeline 继续写入。已成功写入的 Packet 不会重传。

### 读取流程

读取流程相对简单：Client 向 NameNode 请求文件的 Block 位置列表 → 按照**数据本地性优先**（先读本节点、再读同机架、最后跨机架）直连 DataNode 读取 → 读取时校验 Checksum → 发现损坏则通知 NameNode 并自动切换到其他副本。


## Erasure Coding（纠删码）

HDFS 3.0+ 引入 Erasure Coding（EC），用更低的存储开销（约 1.5× vs 副本的 3×）实现同等或更高的容错能力。

> [!info] 类比理解
> 副本策略好比给每个文件复印 3 份——简单可靠但浪费纸张。纠删码好比 RAID 5/6——把数据切成条带（Strip），计算校验块（Parity），丢失任意几块都能通过数学运算恢复，代价是恢复时需要计算。

| 对比维度 | 3 副本 | RS(6,3) EC |
|----------|--------|------------|
| **存储开销** | 3× | 1.5× |
| **容错能力** | 任意丢 2 个副本 | 任意丢 3 块（数据或校验） |
| **写入性能** | Pipeline 链式写入 | 条带化并行写入 |
| **恢复开销** | 简单复制 | 需计算（CPU 密集） |
| **适用场景** | 热数据（频繁访问） | 冷/温数据（低访问频次） |

EC 使用 `BlockInfoStriped` 管理条带化 Block 组，`BlockPlacementPolicyEC` 负责条带块的分布放置（确保条带内的块分散在不同机架）。


## Federation 联邦架构

单 NameNode 架构面临两个瓶颈：**命名空间容量**受限于单机内存（每个 INode 约 150 字节，10 亿文件需约 150 GB 内存），**吞吐瓶颈**所有元数据请求都打到单点。

HDFS Federation 通过**多个独立 NameNode** 水平扩展命名空间：

- 每个 NameNode 管理一个独立的 **Namespace Volume**（命名空间卷）
- 所有 NameNode 共享底层 DataNode 存储池
- DataNode 同时向所有 NameNode 注册和汇报，每个 NameNode 对应一个 **Block Pool**

### Router-Based Federation（RBF）

RBF 在 Federation 之上增加了**路由层**（`RouterRpcServer`），对客户端提供统一的命名空间视图：

```
Client
  ↓
Router（RouterRpcServer）
  ↓  路由表（Mount Table）映射路径到 NameNode
NameNode-1（/user）    NameNode-2（/data）    NameNode-3（/tmp）
  ↓                      ↓                      ↓
            共享 DataNode 存储池
```

客户端无需感知底层有多少个 NameNode，Router 根据路径前缀自动路由到正确的 NameNode。


## 高可用（HA）

HDFS HA 通过 **Active-Standby NameNode** 消除单点故障：

| 组件 | 职责 |
|------|------|
| **Active NameNode** | 处理所有客户端请求 |
| **Standby NameNode** | 实时同步 EditLog，维护最新的命名空间副本，随时准备切换 |
| **JournalNode**（QJM 模式） | 共享 EditLog 存储——Active 写入，Standby 读取。基于多数派（Quorum）协议保证一致性 |
| **ZKFailoverController**（ZKFC） | 通过 [[ZooKeeper]] 监控 NameNode 健康状态，触发自动故障转移 |
| **Fencing** | 防止脑裂——切换时确保旧 Active 不再接受写入（SSH fencing / Shell fencing） |

> [!warning] 脑裂防护
> HA 切换的关键风险是**脑裂**（Split-Brain）：两个 NameNode 同时认为自己是 Active。HDFS 通过 Fencing 机制（强制 kill 旧 Active 进程 + JournalNode 的 epoch 隔离）确保同一时刻只有一个 Active NameNode 可以写入 EditLog。


## 关键配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `dfs.blocksize` | 128 MB | Block 大小，大文件建议 256 MB |
| `dfs.replication` | 3 | 默认副本数 |
| `dfs.namenode.replication.min` | 1 | 文件关闭所需的最小副本数 |
| `dfs.namenode.handler.count` | 10 | NameNode RPC 服务线程数，生产环境建议 100+ |
| `dfs.datanode.handler.count` | 10 | DataNode 数据传输线程数 |
| `dfs.namenode.heartbeat.recheck-interval` | 300000 ms | 心跳超时检查间隔 |
| `dfs.namenode.redundancy.interval.seconds` | 3 s | 冗余监控扫描间隔 |
| `dfs.block.invalidate.limit` | 1000 | 每次心跳响应中最多下发的删除指令数 |
| `dfs.namenode.safemode.threshold-pct` | 0.999 | 安全模式阈值（99.9% 的 Block 汇报后退出安全模式） |


## WebHDFS REST API

HDFS 提供 RESTful HTTP 接口（WebHDFS），允许非 Java 客户端通过标准 HTTP 访问文件系统：

```bash
# 读取文件
curl -i "http://<namenode>:9870/webhdfs/v1/user/data/file.txt?op=OPEN"

# 创建文件
curl -i -X PUT "http://<namenode>:9870/webhdfs/v1/user/data/file.txt?op=CREATE"

# 列出目录
curl -i "http://<namenode>:9870/webhdfs/v1/user/data/?op=LISTSTATUS"
```

WebHDFS 支持所有文件系统操作（CRUD + 权限 + 快照），并通过 HTTP 重定向将数据传输直接路由到 DataNode，避免 NameNode 成为数据传输瓶颈。


## Reference

- [Apache Hadoop HDFS Documentation](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)
- [DeepWiki — HDFS Architecture](https://deepwiki.com/apache/hadoop/3-hdfs-architecture)
- [HDFS Architecture Guide](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)
- [HDFS Federation](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/Federation.html)
- [HDFS High Availability](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HDFSHighAvailabilityWithQJM.html)
- [HDFS Erasure Coding](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HDFSErasureCoding.html)
