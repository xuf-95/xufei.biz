---
title: Apache HBase
publish: true
date: 2026-07-10
tags:
  - NoSQL
  - bigdata
---

Apache HBase is an open-source, distributed, column-oriented NoSQL database built on top of HDFS. It provides random, real-time read/write access to very large datasets — billions of rows × millions of columns — while maintaining strong consistency guarantees.

HBase is modeled after Google's Bigtable paper and is part of the Apache Hadoop ecosystem. It excels at sparse data storage and is widely used for time-series data, messaging platforms, and online analytical workloads that require low-latency access to massive tables.

## Architecture

![[hbase-cluster-architecture.svg]]


An HBase cluster consists of three core components:

**HMaster** handles DDL operations (create/alter/drop tables), region assignment, load balancing across RegionServers, and failover recovery. It does not sit in the data read/write path — clients talk directly to RegionServers for data operations.

**RegionServer** is the workhorse. Each RegionServer hosts multiple Regions (horizontal slices of a table, split by row key range). Within each Region:

- **WAL (Write Ahead Log)** — an append-only log on HDFS that ensures durability before data enters the MemStore
- **MemStore** — a sorted in-memory write buffer, one per Column Family per Region
- **BlockCache** — an LRU read cache that keeps frequently accessed HFile blocks in memory

**ZooKeeper** maintains cluster state: it tracks which RegionServers are alive, stores the location of the `hbase:meta` table (the region-to-server mapping), and coordinates HMaster election.

The client first contacts ZooKeeper to discover where `hbase:meta` lives, reads `hbase:meta` to locate the Region responsible for the target row key, then communicates directly with that RegionServer. This three-hop lookup is cached on the client side.

## Data Model

  <figure class="image-layout-bleed" style="--image-layout-width: 70%">
    <img src="hbase-data-model.svg" alt="Scaled viewport wide image layout" />
    <figcaption></figcaption>
  </figure>

HBase's data model is a **sparse, distributed, persistent, multi-dimensional sorted map**. The map is indexed by:

```
(RowKey, Column Family:Qualifier, Timestamp) → Value
```

**Table** — a collection of rows, distributed across the cluster as Regions.

**Row** — identified by a unique byte-array RowKey. Rows are sorted lexicographically by RowKey, which is the only index. Row key design is critical: it determines data locality and Region split boundaries.

**Column Family** — a physical grouping of columns declared at table creation time. All columns in a family are stored together on disk (same set of HFiles). Each family can have independent configurations for compression, block size, TTL, and versioning.

**Column Qualifier** — the column name within a family. Qualifiers are dynamic — different rows can have entirely different qualifiers within the same family. This is what makes HBase "schema-less" at the column level.

**Cell** — the intersection of a row, column family, qualifier, and timestamp. HBase keeps multiple versions of each cell, sorted by timestamp descending (newest first). The number of versions retained is configurable per column family.

The dashed empty cells in the diagram illustrate **sparsity** — rows do not need values in every column. No storage is consumed for absent cells, unlike RDBMS where NULL columns still occupy space.

## Read and Write Path

![[hbase-read-write-path.svg]]

### Write Path

1. Client sends a `Put` to the RegionServer hosting the target Region
2. The mutation is appended to the **WAL** on HDFS (ensures durability in case of RegionServer crash)
3. After the WAL write succeeds, the data is written to the **MemStore** (in-memory sorted buffer)
4. An acknowledgement is returned to the client

When the MemStore reaches a configurable threshold (`hbase.hregion.memstore.flush.size`, default 128 MB), it is flushed to disk as a new **HFile** (StoreFile) on HDFS. The flush is per-Region — all MemStores in the same Region flush together.

### Read Path

1. Client sends a `Get` or `Scan` to the RegionServer
2. A **StoreScanner** is created that merges data from two sources:
   - **MemStore** — contains the most recent, unflushed writes
   - **BlockCache / HFiles** — cached and on-disk data
3. The scanner returns the merged result with the most recent version of each cell

The BlockCache (LRU by default, with optional off-heap BucketCache) keeps hot HFile blocks in memory to avoid repeated HDFS reads.

### Compaction

Over time, MemStore flushes create many small HFiles per Store. Compaction is a background process that merges them:

- **Minor compaction** — merges a small number of adjacent HFiles into a larger one. Fast and lightweight; runs frequently.
- **Major compaction** — merges all HFiles in a Store into a single HFile. Also physically removes deleted cells (`Delete` markers) and expired cells (TTL). More expensive; typically scheduled during off-peak hours.

## When to Use HBase

HBase is a good fit when:

- You have **billions of rows** and need low-latency random reads/writes
- Your access pattern is **key-based** (get by row key, scan a row key range)
- You need **strong consistency** rather than eventual consistency
- Your data is **sparse** — wide tables where most cells are empty
- You need **versioning** — automatic timestamped cell history

HBase is **not** a good fit when:

- You need SQL joins, secondary indexes, or complex queries (consider Phoenix on top of HBase, or a relational database)
- Your dataset is small enough to fit on a single server
- You need full ACID transactions across multiple rows (HBase offers single-row atomicity only)

## Key Configurations

| Parameter | Default | Purpose |
| --- | --- | --- |
| `hbase.hregion.memstore.flush.size` | 128 MB | MemStore flush threshold per Region |
| `hbase.regionserver.global.memstore.size` | 0.4 (40% of heap) | Total MemStore limit before forced flush |
| `hbase.hstore.compactionThreshold` | 3 | Min HFiles to trigger minor compaction |
| `hbase.hregion.max.filesize` | 10 GB | Region split threshold |
| `hfile.block.cache.size` | 0.4 (40% of heap) | BlockCache memory allocation |
| `hbase.column.max.version` | 1 | Cell versions to retain per column family |

## References

- [Apache HBase Reference Guide](https://hbase.apache.org/book.html) — official documentation
- [HBase Architecture (Chapter 9)](https://hbase.apache.org/book.html#architecture) — detailed architecture deep-dive
- [Bigtable: A Distributed Storage System for Structured Data](https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/) — the original Google paper that inspired HBase



  