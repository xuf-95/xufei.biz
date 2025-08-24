---
title: Apache Hadoop
aliases:
  - Hadoop
tags:
  - bigdata
  - data-compute
  - hadoop
  - apache
draft: false
date: 2022-01-24
---

> [!note] The Apache Hadoop software library is a framework that allows for the distributed processing of large data sets across clusters of computers using simple programming models. It is designed to scale up from single servers to thousands of machines, each offering local computation and storage. Rather than rely on hardware to deliver high-availability, the library itself is designed to detect and handle failures at the application layer, so delivering a highly-available service on top of a cluster of computers, each of which may be prone to failures.

Hadoop是一个由Apache基金会所开发的分布式系统基础架构。用户可以在不了解分布式底层细节的情况下，开发分布式程序。充分利用集群的威力进行高速运算和存储。Hadoop实现了一个分布式文件系统（ **Distributed File System**），其中一个组件是[[HDFS]]（Hadoop Distributed File System）。HDFS有高容错性的特点，并且设计用来部署在低廉的（low-cost）硬件上；而且它提供高吞吐量（high throughput）来访问应用程序的数据，适合那些有着超大数据集（large data set）的应用程序。HDFS放宽了（relax）POSIX的要求，可以以流的形式访问（streaming access）文件系统中的数据。Hadoop的框架最核心的设计就是：HDFS和MapReduce。HDFS为海量的数据提供了存储，而[[MapReduce]]则为海量的数据提供了计算。

Hadoop得以在大数据处理应用中广泛应用得益于其自身在数据提取、变形和加载(ETL)方面上的天然优势。Hadoop的分布式架构，将大数据处理引擎尽可能的靠近存储，对例如像ETL这样的批处理操作相对合适，因为类似这样操作的批处理结果可以直接走向存储。Hadoop的MapReduce功能实现了将单个任务打碎，并将碎片任务(Map)发送到多个节点上，之后再以单个数据集的形式加载(Reduce)到数据仓库里。

## Modules

- **Hadoop Common**: The common utilities that support the other Hadoop modules.
- [[HDFS]] **Hadoop Distributed File System**
- [[MapReduce]]  A YARN-based system for parallel processing of large data sets.
- [[Hadoop Yarn]] A framework for job scheduling and cluster resource management.

## Related projects

- [[Apache Hive]]
- [[Apache HBase]]
- [[Apache Spark]]
- [[ZooKeeper]]
- [Apache Ambari](https://ambari.apache.org/) is aimed at making Hadoop management simpler by developing software for provisioning, managing, and monitoring Apache Hadoop clusters. Ambari provides an intuitive, easy-to-use Hadoop management web UI backed by its RESTful APIs

## Download

- [Apache Hadoop Download Home ](https://hadoop.apache.org/releases.html) 
	- latest version [3.4.1 Mirrors](https://www.apache.org/dyn/closer.cgi/hadoop/common/hadoop-3.4.1/hadoop-3.4.1-src.tar.gz) at 2024 Oct 18
	- 3.4.0  2024 Mar 17
	- 3.3.6  2023 Jun 23
## Documents

- [3.5.0 Latest Version](https://apache.github.io/hadoop/)
- [3.4.1 Stable Version](https://hadoop.apache.org/docs/stable/)
## Reference

- [HADOOP2-wiki ](https://cwiki.apache.org/confluence/display/HADOOP2/Home) old version [Hadoop](https://cwiki.apache.org/confluence/display/HADOOP)
- [Apache Hadoop](https://hadoop.apache.org/) office website
- [Hadoop Java Versions](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)
- [Monitoring Hadoop performance](https://www.datadoghq.com/blog/monitor-hadoop-metrics?ref=awesome) - Guide to monitoring Hadoop, with an overview of Hadoop architecture, and native methods for metrics collection.
- [Hadoop 性能调优](https://www.jianshu.com/p/0d63985ca80d) 
- [如何为Hadoop集群选择正确的硬件](https://bigdata.evget.com/post/1969.html) 11/17
- [大数据学习之路05——Hadoop原理与架构解析](https://cloud.tencent.com/developer/article/1431491) 05/19 High Quality
- [Hadoop分别启动namenode,datanode,secondarynamenode等服务](https://blog.csdn.net/xiaozelulu/article/details/80386771) 05/18

![[apache-hadoop.png|center]]