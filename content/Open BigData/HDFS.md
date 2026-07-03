---
title: HDFS
tags:
  - hadoop
  - database
  - distribute
  - file-system
date: 2022-01-25
draft: false
publish: true
---

Hadoop分布式文件系统（HDFS）是Hadoop生态系统的一部分，是一个高度可靠性、高吞吐量的分布式文件系统，专为存储大规模数据集而设计。

**HDFS的优点包括**：

- 高容错性：HDFS通过在多个节点上保存数据来提供容错性，即使某个节点宕机，也不会影响数据的可用性。
- 高可扩展性：HDFS可以在多个节点上存储PB级别的数据，支持水平扩展，可以根据需要增加更多的节点。
- 高吞吐量：HDFS的设计目标是高吞吐量的数据访问，因此它能够高效地处理大量数据。
- 低成本：HDFS是基于廉价的硬件构建的，因此它的成本相对较低。
- 大数据集：TB、PB
- 简单的文件模型：一次写入、多次读取
- 流数据读写：不支持随机读写的操作

**HDFS的缺点包括**：

- 低延迟：HDFS不适合需要低延迟的应用程序，因为它的设计目标是高吞吐量而不是低延迟。
- 适用范围：HDFS适用于大数据存储和处理，但不适用于一些小规模的数据存储和处理场景。
- 不支持多写：HDFS不支持多个客户端同时写入同一文件，因此在某些情况下可能会出现性能问题。
## HDFS 架构

主从（Master/Slave）结构模型，一个HDFS集群包括**一个名称节点（NameNode）**和**若干个数据节点（DataNode）**

## HDFS 存储机制

冗余存储，牺牲时间换空间，**多副本方式** 存储，一个数据块的多个副本，会分布存储到不同的数据节点上

- **Block**：HDFS中的存储单元是每个数据块block，HDFS默认的最基本的存储单位是64M的数据块。和普通的文件系统相同的是，HDFS中的文件也是被分成64M一块的数据块存储的。不同的是，在HDFS中，如果一个文件大小小于一个数据块的大小，它是不需要占用整个数据块的存储空间的。 
- **NameNode**：元数据节点。该节点用来管理文件系统中的命名空间，是master。其将所有的为了见和文件夹的元数据保存在一个文件系统树中，这些信息在硬盘上保存为了命名空间镜像（namespace image）以及修改日志（edit log），后面还会讲到。此外，NameNode还保存了一个文件包括哪些数据块，分布在哪些数据节点上。然而，这些信息不存放在硬盘上，而是在系统启动的时候从数据节点收集而成的。 
- **DataNode**：数据节点，是HDFS真正存储数据的地方。客户端（client）和元数据节点（NameNode）可以向数据节点请求写入或者读出数据块。此外，DataNode需要周期性的向元数据节点回报其存储的数据块信息。 
- **Secondary NameNode**:从元数据节点。从元数据节点并不是NameNode出现问题时候的备用节点，它的主要功能是周期性的将NameNode中的namespace image和edit log合并，以防log文件过大。此外，合并过后的namespace image文件也会在Secondary NameNode上保存一份，以防NameNode失败的时候，可以恢复。 
- **edit log**：修改日志，当文件系统客户端client进行写操作的时候，我们就要把这条记录放在修改日志中。在记录了修改日志后，NameNode则修改内存中的数据结构。每次写操作成功之前，edit log都会同步到文件系统中。
- **fsimage**：命名空间镜像，它是内存中的元数据在硬盘上的checkpoint。当NameNode失败的时候，最新的checkpoint的元数据信息就会从fsimage加载到内存中，然后注意重新执行修改日志中的操作。而Secondary NameNode就是用来帮助元数据节点将内存中的元数据信息checkpoint到硬盘上的。
- **checkpoint的过程如下**：Secondary NameNode通知NameNode生成新的日志文件，以后的日志都写到新的日志文件中。Secondary NameNode用http get从NameNode获得fsimage文件及旧的日志文件。Secondary NameNode将fsimage文件加载到内存中，并执行日志文件中的操作，然后生成新的fsimage文件。Secondary NameNode将新的fsimage文件用http post传回NameNode。NameNode可以将旧的fsimage文件及旧的日志文件，换为新的fsimage文件和新的日志文件(第一步生成的)，然后更新fstime文件，写入此次checkpoint的时间。这样NameNode中的fsimage文件保存了最新的checkpoint的元数据信息，日志文件也重新开始，不会变的很大了。

### 多副本的优势

- 保证数据的可靠性
- 加快数据传输速度
- 容易检查错误数据
### 数据存放策略

- 数据读取
- 数据存放
- 数据复制

### 数据容错与备份分析



## HDFS 数据读写过程

