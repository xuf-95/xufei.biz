---
title: Apache Hadoop Overview
aliases:
  - Hadoop
tags:
  - bigdata
  - data-compute
  - hadoop
  - homepage
draft: true
date: 2022-01-24
publish: true
---
# Apache Hadoop Overview

> [!note] 
> The Apache Hadoop software library is a framework that allows for the distributed processing of large data sets across clusters of computers using simple programming models. It is designed to scale up from single servers to thousands of machines, each offering local computation and storage. Rather than rely on hardware to deliver high-availability, the library itself is designed to detect and handle failures at the application layer, so delivering a highly-available service on top of a cluster of computers, each of which may be prone to failures.

Apache Hadoop is an open-source framework for **distributed storage and processing of large datasets** across clusters of commodity hardware. Originating from Google's GFS and MapReduce papers (2003–2004), Hadoop became the foundation of the modern big data ecosystem.

> "Move computation to data, not data to computation." — Core design philosophy of Hadoop

---
## Core Architecture

Hadoop is composed of four primary modules that work together as a unified platform.

```
┌─────────────────────────────────────────────┐
│              Hadoop Ecosystem                │
│                                             │
│   ┌─────────────┐   ┌─────────────────┐    │
│   │    HDFS     │   │   MapReduce     │    │
│   │  (Storage)  │   │  (Processing)   │    │
│   └──────┬──────┘   └────────┬────────┘    │
│          │                   │             │
│   ┌──────┴───────────────────┴──────┐      │
│   │         YARN (Scheduler)        │      │
│   └──────────────────┬──────────────┘      │
│                      │                     │
│   ┌──────────────────┴──────────────┐      │
│   │      Hadoop Common (Utilities)  │      │
│   └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

| Module            | Role                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **[[HDFS]]**      | Distributed file system — splits files into blocks, replicates across nodes |
| **[[MapReduce]]** | Programming model — parallel batch processing of large datasets             |
| **[[Yarn]]**      | Resource manager — allocates CPU/memory, schedules jobs on the cluster      |
| **Hadoop Common** | Shared utilities, RPC, serialisation (Writable), configuration APIs         |

---

## HDFS — Hadoop Distributed File System

HDFS stores files by splitting them into **fixed-size blocks** (default 128 MB) and distributing replicas across DataNodes. This design tolerates hardware failure automatically.

### Key Roles

```
Client
  │
  ▼
NameNode  ←─── stores block metadata (namespace, block locations)
  │
  ├── DataNode 1  [Block A][Block C][Block E]
  ├── DataNode 2  [Block A][Block B][Block D]   ← replica distribution
  └── DataNode 3  [Block B][Block C][Block E]
```

- **NameNode** — single master that manages the file-system namespace and block-to-node mapping. Does **not** store data.
- **DataNode** — worker nodes that physically store blocks and serve read/write requests.
- **Secondary NameNode** — periodically merges the edit log with the fsimage checkpoint. _Not_ a hot standby.

### HDFS Properties

|Property|Default|Notes|
|---|---|---|
|Block size|128 MB|Configurable per file|
|Replication factor|3|Configurable per file|
|Write model|Write-once, read-many|No random writes|
|Rack awareness|Yes|Replicas spread across racks|
|High availability|Optional|Active/Standby NameNode via ZooKeeper|

### HDFS Read Path

1. Client calls `open()` on `DistributedFileSystem`
2. NameNode returns block locations sorted by proximity
3. Client opens a `DFSInputStream` and reads blocks directly from DataNodes
4. On failure, client transparently retries the next replica

### HDFS Write Path

1. Client calls `create()` — NameNode creates a new file entry
2. Client writes data to a **pipeline** of DataNodes (rack-aware selection)
3. Each DataNode forwards data to the next in the pipeline
4. Acknowledgements flow back upstream to the client
5. Client calls `close()` — NameNode finalises block metadata

---

## MapReduce — Distributed Processing Model

MapReduce expresses computation as two user-defined functions applied to key–value pairs across the cluster.

### Execution Phases

```
HDFS Input
    │
    ▼
[InputFormat]  →  InputSplits (1 per ~128 MB)
    │
    ▼
[Mapper × N]   →  map(k, v) → emit(k2, v2)     per record
    │
    ▼
[Combiner]     →  optional local pre-aggregation  (reduces network I/O)
    │
    ▼
[Partitioner]  →  hash(key) % R  →  assigns keys to reducers
    │
    ▼
[Shuffle & Sort]  →  network transfer + k-way merge sort
    │
    ▼
[Reducer × R]  →  reduce(k2, [v2…]) → emit(k3, v3)
    │
    ▼
[OutputFormat] →  HDFS output  part-r-00000 … part-r-NNNNN
```

### Word Count Example

```java
// Mapper — emit (word, 1) for every token
public class TokenizerMapper
    extends Mapper<Object, Text, Text, IntWritable> {

  private final static IntWritable one = new IntWritable(1);
  private Text word = new Text();

  public void map(Object key, Text value, Context context)
      throws IOException, InterruptedException {
    StringTokenizer itr = new StringTokenizer(value.toString());
    while (itr.hasMoreTokens()) {
      word.set(itr.nextToken());
      context.write(word, one);          // emit (word, 1)
    }
  }
}

// Reducer — sum all 1s for each word
public class IntSumReducer
    extends Reducer<Text, IntWritable, Text, IntWritable> {

  private IntWritable result = new IntWritable();

  public void reduce(Text key, Iterable<IntWritable> values, Context context)
      throws IOException, InterruptedException {
    int sum = 0;
    for (IntWritable val : values) sum += val.get();
    result.set(sum);
    context.write(key, result);          // emit (word, count)
  }
}
```

### Job Configuration

```java
Job job = Job.getInstance(conf, "word count");
job.setJarByClass(WordCount.class);
job.setMapperClass(TokenizerMapper.class);
job.setCombinerClass(IntSumReducer.class);   // local optimisation
job.setReducerClass(IntSumReducer.class);
job.setOutputKeyClass(Text.class);
job.setOutputValueClass(IntWritable.class);
FileInputFormat.addInputPath(job, new Path(args[0]));
FileOutputFormat.setOutputPath(job, new Path(args[1]));
System.exit(job.waitForCompletion(true) ? 0 : 1);
```

### MapReduce Data Types

|Type|Java Equivalent|Description|
|---|---|---|
|`Text`|`String`|UTF-8 serialisable string — used as word key|
|`IntWritable`|`int`|Serialisable integer — used as count value|
|`LongWritable`|`long`|Byte offset key from `TextInputFormat`|
|`NullWritable`|`null`|Placeholder when key or value is not needed|

---

## YARN — Yet Another Resource Negotiator

YARN separates **resource management** from **job scheduling**, allowing Hadoop to run workloads beyond MapReduce (Spark, Flink, Tez, etc.).

### YARN Components

```
ResourceManager (master)
  ├── Scheduler          — allocates Container resources (CPU + RAM)
  └── ApplicationsManager — tracks running applications

NodeManager (per worker node)
  └── ContainerExecutor  — launches and monitors containers

ApplicationMaster (per job)
  └── Negotiates containers from ResourceManager
      Coordinates task execution
      Reports progress
```

### Job Submission Flow

1. Client submits job to **ResourceManager**
2. RM launches an **ApplicationMaster** in a container on a NodeManager
3. AM requests containers from RM's Scheduler
4. RM allocates containers on available NodeManagers
5. AM launches mapper/reducer tasks inside those containers
6. AM reports completion back to RM

### YARN Scheduling Policies

|Scheduler|Behaviour|
|---|---|
|**FIFO**|Simple queue — first submitted runs first|
|**Capacity**|Multiple queues with guaranteed capacity fractions|
|**Fair**|All running jobs share resources equally over time|

---

## Hadoop Ecosystem — Key Tools

Hadoop is a platform, not a complete solution. These projects extend it:

|Tool|Layer|Purpose|
|---|---|---|
|**Hive**|SQL|HiveQL → MapReduce/Tez — SQL on HDFS|
|**Pig**|Scripting|Pig Latin dataflow language for ETL|
|**HBase**|Storage|Columnar NoSQL on top of HDFS (random read/write)|
|**Spark**|Processing|In-memory DAG engine — 10–100× faster than MapReduce|
|**Flink**|Processing|Streaming-first distributed engine|
|**Sqoop**|Ingest|Bulk import/export between RDBMS and HDFS|
|**Flume**|Ingest|Streaming log ingestion into HDFS|
|**Oozie**|Orchestration|Workflow scheduler for Hadoop jobs|
|**ZooKeeper**|Coordination|Distributed configuration and leader election|
|**Ambari**|Operations|Cluster management and monitoring UI|

---

## Fault Tolerance

Hadoop is designed to run on **commodity hardware** that fails regularly.

### HDFS Fault Tolerance

- DataNode heartbeats every 3 seconds to NameNode
- Missing heartbeat after 10 minutes → node declared dead
- NameNode triggers re-replication of under-replicated blocks
- Checksums on every block detect silent corruption
- Rack-aware placement ensures 1 replica survives a full rack failure

### MapReduce Fault Tolerance

- YARN monitors task containers via heartbeat
- Failed task → automatically retried on a different node (default 4 attempts)
- Failed ApplicationMaster → YARN restarts it; tasks may be re-run
- Speculative execution: slow tasks are duplicated on idle nodes

---

## Deployment Modes

|Mode|Description|Use case|
|---|---|---|
|**Local**|Single JVM, no HDFS|Unit testing, development|
|**Pseudo-distributed**|Single machine, all daemons run as separate processes|Integration testing|
|**Fully-distributed**|Multi-node cluster, production HDFS|Production|
|**Cloud (EMR / Dataproc / HDInsight)**|Managed Hadoop on cloud VMs|Production, elastic scaling|

---

## Configuration Files

|File|Controls|
|---|---|
|`core-site.xml`|`fs.defaultFS` — NameNode URI|
|`hdfs-site.xml`|Replication factor, block size, data directories|
|`mapred-site.xml`|MapReduce framework (`yarn`), memory settings|
|`yarn-site.xml`|ResourceManager address, NodeManager memory/vCPUs|
|`hadoop-env.sh`|`JAVA_HOME`, heap sizes for daemons|

---

## Key Design Decisions & Trade-offs

### What Hadoop does well

- **Batch processing** of petabyte-scale datasets
- **Fault tolerance** on cheap commodity hardware
- **Write-once, read-many** workloads (log analysis, ETL, archival)
- **Linear horizontal scaling** — add nodes to increase capacity

### Hadoop limitations

|Limitation|Better alternative|
|---|---|
|High latency (minutes–hours per job)|Apache Spark (seconds), Apache Flink (milliseconds)|
|No random writes in HDFS|HBase, Apache Kudu|
|Complex operational overhead|Cloud-managed services (EMR, Dataproc)|
|MapReduce verbosity|Spark (Scala/Python/SQL), Hive|
|Real-time streaming|Apache Flink, Apache Kafka Streams|

---

## Quick Reference — Important Defaults

```
HDFS block size           128 MB      (dfs.blocksize)
HDFS replication          3×          (dfs.replication)
Map output buffer         100 MB      (mapreduce.task.io.sort.mb)
Map spill threshold       80%         (mapreduce.map.sort.spill.percent)
Default reducers          1           (mapreduce.job.reduces)
Max map task retries      4           (mapreduce.map.maxattempts)
Max reduce task retries   4           (mapreduce.reduce.maxattempts)
NodeManager memory        8192 MB     (yarn.nodemanager.resource.memory-mb)
Container min memory      1024 MB     (yarn.scheduler.minimum-allocation-mb)
```

---

## References

- [Apache Hadoop Official Documentation](https://hadoop.apache.org/docs/current/)
- [HDFS Architecture Guide](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)
- [MapReduce Tutorial](https://hadoop.apache.org/docs/current/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html)
- [YARN Architecture](https://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html)
- Google GFS Paper (2003) — Ghemawat et al.
- Google MapReduce Paper (2004) — Dean & Ghemawat
- [HADOOP2-wiki ](https://cwiki.apache.org/confluence/display/HADOOP2/Home) old version [Hadoop](https://cwiki.apache.org/confluence/display/HADOOP)
- [Apache Hadoop](https://hadoop.apache.org/) office website
- [Hadoop Java Versions](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)
- [Monitoring Hadoop performance](https://www.datadoghq.com/blog/monitor-hadoop-metrics?ref=awesome) - Guide to monitoring Hadoop, with an overview of Hadoop architecture, and native methods for metrics collection.
- [Hadoop 性能调优](https://www.jianshu.com/p/0d63985ca80d) 
- [如何为Hadoop集群选择正确的硬件](https://bigdata.evget.com/post/1969.html) 11/17
- [大数据学习之路05——Hadoop原理与架构解析](https://cloud.tencent.com/developer/article/1431491) 05/19 High Quality
- [Hadoop分别启动namenode,datanode,secondarynamenode等服务](https://blog.csdn.net/xiaozelulu/article/details/80386771) 05/18
- [2006](http://static.googleusercontent.com/external_content/untrusted_dlcp/research.google.com/en//archive/bigtable-osdi06.pdf) - **Google** - Bigtable: A Distributed Storage System for Structured Data.
- [2004](http://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf) - **Google** - MapReduce: Simplied Data Processing on Large Clusters.
- [2003](http://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf) - **Google** - The Google File System.

## Download

- [Apache Hadoop Download Home ](https://hadoop.apache.org/releases.html) 
	- latest version [3.4.1 Mirrors](https://www.apache.org/dyn/closer.cgi/hadoop/common/hadoop-3.4.1/hadoop-3.4.1-src.tar.gz) at 2024 Oct 18
	- 3.4.0  2024 Mar 17
	- 3.3.6  2023 Jun 23
## Documents

- [3.5.0 Latest Version](https://apache.github.io/hadoop/)
- [3.4.1 Stable Version](https://hadoop.apache.org/docs/stable/)
