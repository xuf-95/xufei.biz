---
title: "What's Apache Paimon?"
aliases:
  - Apache Paimon
  - Paimon
  - Streaming Data Lake Storage
description: Apache Paimon 是面向统一批流、实时更新、湖仓存储和多引擎计算的数据湖表格式与存储系统概览。
tags:
  - store
  - data-lake
  - lakehouse
  - apache
  - paimon
date: 2026-06-14
publishDate: 2026-06-14T00:00
language: CN
draft: false
publish: true
---

> [!infobox]
>
> ## Apache Paimon
>
> ### Meta
>
> | Item | Value |
> | --- | --- |
> | Type | Streaming data lake storage |
> | Core | Snapshot, Manifest, Table, Catalog |
> | Engines | Flink, Spark, Hive, Trino, Presto, Doris, StarRocks |
> | Strength | Batch + Streaming + CDC + Time Travel |
> | Source | [DeepWiki Overview](https://deepwiki.com/apache/paimon/1-overview) |

## Definition

Apache Paimon 是一个面向 [[Data Lake]] / [[Lakehouse]] 场景的表格式与存储系统。它把数据文件、快照、元数据清单、Catalog 和读写提交协议组织成一个统一的 Lake Format，让同一份表可以被 [[Apache Flink]]、[[Spark]]、Hive、Trino、Presto、[[Apache Doris]]、[[What's StarRocks|StarRocks]] 等计算引擎访问。

> [!summary]
> 如果用一句话描述：Paimon 试图把实时数据湖变成一个可更新、可回放、可治理、可被多引擎共享的表存储层。

官方文档把 Paimon 定位为统一批处理、流处理和多模态 AI 的 Data Lake Platform；DeepWiki 的 Overview 更偏代码视角，强调 ACID transaction、snapshot isolation、batch/streaming 统一和多计算引擎集成。

## Why It Matters

传统数据湖格式更擅长批量追加和离线分析；实时场景会遇到更新、删除、CDC、增量消费、并发提交和小文件治理等问题。Paimon 的价值在于把这些能力放在表存储层处理，而不是让每个计算引擎各做一套。

> [!column|3 clean]
>
> > [!tip] Realtime Lake
> >
> > Primary Key Table、LSM、merge engine 和 changelog producer 支撑高频更新、CDC 入湖和流式读取。
>
> > [!example] Lakehouse Table
> >
> > Snapshot、manifest、schema evolution 和 time travel 让数据湖表具备版本化、可追溯和多引擎共享能力。
>
> > [!summary] Engineering Boundary
> >
> > Catalog 管元数据入口，TableWrite 写数据文件，TableCommit 原子提交，SnapshotReader 决定读取哪个版本。

## Architecture

<section class="wiki-diagram wiki-diagram-architecture" aria-labelledby="paimon-architecture">
  <span class="wiki-diagram-kicker">Architecture</span>
  <h2 class="wiki-diagram-title" id="paimon-architecture">Apache Paimon Logical Layers</h2>
  <div class="wiki-diagram-layers">
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Compute</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node is-accent">
          <span class="wiki-diagram-node-title">Flink</span>
          <span class="wiki-diagram-node-text">Streaming read, streaming write, CDC pipelines</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Spark</span>
          <span class="wiki-diagram-node-text">Batch SQL, DataFrame, structured streaming</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Query Engines</span>
          <span class="wiki-diagram-node-text">Hive, Trino, Presto, Doris, StarRocks</span>
        </div>
      </div>
    </div>
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Metadata</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Catalog</span>
          <span class="wiki-diagram-node-text">FileSystem, Hive, REST, JDBC</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Snapshot</span>
          <span class="wiki-diagram-node-text">Table version and time travel entry</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Manifest</span>
          <span class="wiki-diagram-node-text">Tracks file additions and deletions</span>
        </div>
      </div>
    </div>
    <div class="wiki-diagram-layer">
      <div class="wiki-diagram-layer-label">Storage</div>
      <div class="wiki-diagram-layer-items">
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Data Files</span>
          <span class="wiki-diagram-node-text">Parquet, ORC, Avro</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">LSM Store</span>
          <span class="wiki-diagram-node-text">Primary key update and compaction</span>
        </div>
        <div class="wiki-diagram-node">
          <span class="wiki-diagram-node-title">Changelog</span>
          <span class="wiki-diagram-node-text">Incremental change stream for consumers</span>
        </div>
      </div>
    </div>
  </div>
  <p class="wiki-diagram-caption">Paimon sits between compute engines and object / distributed storage, making table state explicit through snapshots and manifests.</p>
</section>

## Core Concepts

| Concept | What It Means | Why It Matters |
| --- | --- | --- |
| Table | 数据访问的核心抽象，包括 schema、partition、bucket、options 和 file store | 计算引擎看到的是表，不需要直接理解底层文件组织 |
| Snapshot | 某一时刻的表状态，记录 schema 和 manifest list | 支撑 time travel、增量读取、rollback 和一致性读 |
| Manifest | 记录数据文件、changelog 文件的新增和删除 | Reader 通过 manifest 找到应该扫描的文件集合 |
| Catalog | 数据库和表的元数据入口 | 支撑 FileSystem、Hive Metastore、REST、JDBC 等管理方式 |
| Primary Key Table | 支持基于主键的 upsert / delete / merge | 面向 CDC、订单状态、用户画像等实时更新场景 |
| Append Table | 追加写入为主的表类型 | 适合日志、明细事实、事件流和离线批量导入 |
| System Table | 以表形式暴露元数据 | 可以查询 snapshots、partitions、tags、audit log 等内部状态 |

## Read And Write Path

<section class="process-steps-panel" aria-labelledby="paimon-write-flow">
  <h2 id="paimon-write-flow">Write Commit Flow</h2>
  <ol class="process-steps">
    <li class="process-step">
      <span class="process-step-marker">1</span>
      <div class="process-step-body">
        <h3>TableWrite</h3>
        <p>写入端接收 records，缓冲后生成临时数据文件或 changelog 文件，并产出 commit message。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">2</span>
      <div class="process-step-body">
        <h3>Conflict Check</h3>
        <p>提交阶段检查并发写入是否修改同一 partition、bucket 或相同文件范围，避免提交覆盖。</p>
      </div>
    </li>
    <li class="process-step">
      <span class="process-step-marker">3</span>
      <div class="process-step-body">
        <h3>TableCommit</h3>
        <p>提交端原子更新 metadata，生成新的 snapshot，让读者通过新版本看到一致的表状态。</p>
      </div>
    </li>
  </ol>
</section>

读取路径反过来：`SnapshotReader` 先确定要读的 snapshot，再通过 manifest list / manifest file 找到数据文件，并结合 partition、bucket、filter pushdown、deletion vector 等条件生成 scan plan。

> [!info]
> Paimon 的一致性核心不在单个 Parquet / ORC 文件，而在“写文件 + 原子提交 snapshot metadata”的协议上。文件可以先写出，只有 snapshot 成功发布后才成为表的可见状态。

## Table Types

| Table Type | Fit For | Key Mechanism | Notes |
| --- | --- | --- | --- |
| Append Table | 日志、事件明细、批量追加事实表 | Append-only files, incremental scan, compaction | 模型简单，适合高吞吐写入 |
| Primary Key Table | CDC、订单状态、维表、用户画像 | LSM, merge engine, changelog producer | 支持 upsert/delete，但要关注 bucket、compaction 和 merge 语义 |
| Multimodal Table | AI / 非结构化数据湖 | Blob storage, vector search, full-text search | 官方 master 文档已把它作为新方向呈现 |

## Catalog And Metadata

DeepWiki Overview 把 Catalog 层拆成四类常见实现：

- `FileSystemCatalog`：元数据直接放在文件系统目录里，部署简单。
- `HiveCatalog`：对接 Hive Metastore，便于进入已有 Hadoop / Hive 生态。
- `RESTCatalog`：通过远程 REST 服务管理元数据，适合集中化管理。
- `JdbcCatalog`：通过关系型数据库管理元数据。

> [!warning]
> Catalog 只是元数据入口，不等于数据存储本身。真正的数据文件仍在对象存储、HDFS 或其他文件系统中；Catalog 负责定位和管理表。

## Typical Use Cases

> [!column|2 clean]
>
> > [!example] CDC Lake Ingestion
> >
> > MySQL、PostgreSQL、Kafka、MongoDB、Pulsar 等 CDC 数据进入 Paimon Primary Key Table，保留更新语义并提供流式 changelog。
>
> > [!example] Unified Batch And Stream
> >
> > Flink 负责实时写入，Spark 或 Trino 负责离线分析，同一张表通过 snapshot 保持一致视图。
>
> > [!example] Query Acceleration
> >
> > Doris、StarRocks、Trino、Presto 等引擎可以读取 Paimon 表，将湖上数据接入交互式分析。
>
> > [!example] Data Governance
> >
> > Snapshot、tag、branch、system table 和 audit log 帮助定位版本、审计变更、回溯数据。

## Compare With Other Lake Formats

| Dimension | Paimon | Iceberg / Hudi / Delta Lake |
| --- | --- | --- |
| Design Center | 实时更新、批流统一、多引擎湖表 | 都支持湖仓表格式，但各自侧重不同 |
| Streaming Update | Primary Key Table + LSM + changelog 是核心能力 | Hudi 强 CDC / upsert，Iceberg 和 Delta 也在增强流式能力 |
| Metadata Model | Snapshot + manifest + catalog | Iceberg 也使用 snapshot / manifest，Delta 使用 transaction log |
| Compute Integration | Flink、Spark、Hive、Trino、Presto、Doris、StarRocks 等 | 取决于格式和引擎生态成熟度 |
| Best Fit | Flink 实时写入、CDC 入湖、湖上实时更新表 | 需要结合团队已有计算引擎和治理体系选型 |

## Practical Notes

1. 如果业务主要是日志追加和离线分析，先从 Append Table 开始，避免过早引入主键表复杂度。
2. 如果来源是 CDC，重点检查 primary key、bucket、merge engine、changelog producer 和 compaction 配置。
3. 如果要多引擎读取，先确认目标引擎对 Paimon 版本、Catalog 类型和数据类型的兼容性。
4. 如果用于生产湖仓，必须监控 snapshot expiration、compaction、小文件、schema evolution 和 system table 指标。

## Interview Answer

Apache Paimon 是 Apache 生态中的实时数据湖存储系统。它通过 snapshot、manifest、catalog 和原子提交协议管理湖上表状态，同时支持 append table、primary key table、changelog、time travel、schema evolution 和多引擎访问。它特别适合 CDC 入湖、Flink 实时写入、Spark / Trino / Doris / StarRocks 多引擎查询，以及需要批流统一的数据湖仓场景。

## Links

- source:: [DeepWiki - apache/paimon Overview](https://deepwiki.com/apache/paimon/1-overview)
- official:: [Apache Paimon Documentation](https://paimon.apache.org/docs/master/)
- official:: [Paimon Basic Concepts](https://paimon.apache.org/docs/master/concepts/basic-concepts)
- related:: [[Data Lake]]
- related:: [[Lakehouse]]
- related:: [[Apache Doris]]
- related:: [[What's StarRocks]]
- related:: [[Apache Hive]]
