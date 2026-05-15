---
title: Apache Spark Overview
tags:
  - bigdata
  - sec-index
date: 2022-01-12
draft: false
description: Micro-batch
publish: true
---
## Introduction

Apache Spark is a unified analytics engine for large-scale data processing. It provides high-level APIs in [[Java]], [[Scala]], [[Python]], and R, and an optimized engine that supports general execution graphs. Spark powers a stack of libraries including SQL and [[DataFrames]], MLlib for machine learning, GraphX for graph processing, and Structured Streaming for stream processing.

## Architecture Overview

Spark's architecture is built around a distributed computing engine with a layered design that separates:

- User-facing APIs (SparkSession, DataFrame, RDD)
- Execution planning and optimization
- Task scheduling and execution
- Resource management and deployment


## Core Module Structure

The module structure follows a layered approach where higher-level modules depend on core infrastructure, and specialized modules extend base functionality.

## Build System Integration

Spark supports both Maven and SBT build systems, with configuration synchronized between the two. The build system is designed to handle Spark's complex module dependencies and provide consistent builds across different environments.

### Key Build Properties

| Property               | Value   | Purpose                            |
| ---------------------- | ------- | ---------------------------------- |
| `java.version`         | 17      | Target JVM version                 |
| `java.minimum.version` | 17.0.11 | Minimum required JDK version       |
| `scala.version`        | 2.13.16 | Scala compiler version             |
| `scala.binary.version` | 2.13    | Scala binary compatibility version |
| `hadoop.version`       | 3.4.1   | Hadoop client compatibility        |
| `hive.version`         | 2.3.10  | Hive compatibility version         |
| `protobuf.version`     | 4.29.3  | Protocol Buffer version            |
| `arrow.version`        | 18.3.0  | Apache Arrow compatibility version |
### Module Compilation Order

1. **Common modules**: `common/sketch`, `common/kvstore`, `common/network-common`, `common/network-shuffle`, `common/unsafe`, `common/utils`, `common/variant`, `common/tags`
2. **Core engine**: `core`
3. **SQL stack**: `sql/api`, `sql/catalyst`, `sql/core`, `sql/hive`, `sql/pipelines`
4. **Specialized modules**: `mllib`, `mllib-local`, `streaming`, `graphx`
5. **Connectors**: `connector/avro`, `connector/protobuf`, `connector/kafka-0-10`
6. **Connect system**: `sql/connect/shims`, `sql/connect/common`, `sql/connect/server`, `sql/connect/client/jvm`
7. **Assembly**: `assembly`, `examples`, `repl`, `launcher`
### Build Tools

Spark's build system includes several tools to help with development:

- **Maven**: Primary build tool with `build/mvn` wrapper script
- **SBT**: Alternative build tool with `build/sbt` wrapper script
- **Docker image tools**: `bin/docker-image-tool.sh` for building container images
- **Distribution packaging**: `dev/make-distribution.sh` for creating release packages

## Spark SQL

Spark SQL is the module within Apache Spark that provides structured data processing capabilities. This document provides a technical overview of Spark SQL's architecture, explaining how SQL queries and DataFrame operations are parsed, analyzed, optimized, and executed within the Spark framework. For information about the user-facing APIs, see [Apache Spark Overview](https://deepwiki.com/apache/spark/1-apache-spark-overview).

### Core Components of Spark SQL

Spark SQL's architecture consists of several key components that work together to process structured data:

![[content/bigdata/images/sparksql-core-components.png]]

### SQL Parsing

The parsing phase converts SQL text into an unresolved logical plan. Spark SQL uses ANTLR4 for parsing SQL statements:


## Core Processing Components

he fundamental data abstraction in Spark is the Resilient Distributed Dataset (RDD), which represents an immutable, partitioned collection of elements that can be operated on in parallel. RDDs are implemented in the core module and provide:

- Fault tolerance through lineage information (tracking how an RDD was derived)
- Control over partitioning to optimize data placement
- In-memory caching for fast reuse
- A rich set of operations (transformations and actions)

Key RDD implementations include:

- `ParallelCollectionRDD`: Created from in-memory collections
- `HadoopRDD`: Reads data from HDFS and other Hadoop-supported storage systems
- `MapPartitionsRDD`: Result of map-like operations on other RDDs
- `ShuffledRDD`: Result of operations that require redistributing data

### SQL Engine Implementation
### Storage and State Management

|Component|Implementation|Purpose|Performance|
|---|---|---|---|
|**BlockManager**|`core/src/main/scala/storage/BlockManager.scala`|In-memory and disk block storage for RDDs|Fastest for ephemeral data|
|**StateStore**|`sql/core/execution/streaming/state/`|Streaming state management interface|Abstract provider interface|
|**RocksDBStateStore**|`sql/core/execution/streaming/state/RocksDBStateStoreProvider.scala`|Persistent state storage using RocksDB|~1650-4500ns per row (depending on configuration)|
|**HDFSBackedStateStore**|`sql/core/execution/streaming/state/HDFSBackedStateStoreProvider.scala`|HDFS-backed state storage|Durable but slower than RocksDB|
|**InMemoryStateStore**|`sql/core/execution/streaming/state/StateStore.scala`|In-memory state storage|~780ns per row (fastest)|


## Data Source Architecture

Spark provides a pluggable data source architecture through the **DataSource V2 API**, allowing integration with various storage systems and file formats.

### Data Source API

### Built-in Connectors

The codebase includes several production-ready connectors:

- **Avro Support**: Apache Avro file format integration
- **Protocol Buffers**: Protobuf serialization support
- **JDBC Sources**: Database connectivity with specific dialects for MySQL, PostgreSQL, Oracle, etc.
- **Kafka Integration**: Real-time data streaming from Apache Kafka
- **File Formats**: Parquet, ORC, JSON, CSV, and other formats
### Compression Codecs

Spark supports multiple compression codecs for efficient data storage and transfer:

| Codec      | Implementation          | Performance Characteristics                     |
| ---------- | ----------------------- | ----------------------------------------------- |
| **Snappy** | `org.xerial.snappy`     | Good balance of speed and compression ratio     |
| **LZ4**    | `net.jpountz.lz4`       | Very fast compression/decompression             |
| **ZSTD**   | `com.github.luben.zstd` | High compression ratio with configurable levels |
| **GZIP**   | Java built-in           | High compression ratio but slower               |
| **LZF**    | `com.ning.compress.lzf` | Fast compression for legacy support             |

## Deployment and Resource Management

Spark applications are launched through the `SparkSubmit` class, which handles different cluster manager integrations:

### Cluster Manager Support

| Manager        | Module                                   | Configuration            |
| -------------- | ---------------------------------------- | ------------------------ |
| **Standalone** | `core/src/main/scala/deploy/`            | Built-in cluster manager |
| **YARN**       | `resource-managers/yarn/`                | Hadoop YARN integration  |
| **Kubernetes** | `resource-managers/kubernetes/`          | Container orchestration  |
| **Local Mode** | `core/src/main/scala/SparkContext.scala` | Single-machine execution |
### Assembly and Distribution

The [assembly/pom.xml28-360](https://github.com/apache/spark/blob/95a96891/assembly/pom.xml#L28-L360) module creates the final distribution package, including all necessary JARs and dependencies. The assembly process handles dependency shading and classpath management for different deployment scenarios.

## Spark Performance Tunning

- [Spark性能优化指南——高级篇 - 美团技术团队](https://tech.meituan.com/2016/05/12/spark-tuning-pro.html)
- [Spark对数据倾斜的八种处理方法 \| Peripateticism \| IT瘾](https://itindex.net/detail/57899-spark-%E6%95%B0%E6%8D%AE-%E6%96%B9%E6%B3%95)
- [Spark性能优化指南——基础篇（转载） - shishanyuan - 博客园](https://www.cnblogs.com/shishanyuan/p/8454323.html)