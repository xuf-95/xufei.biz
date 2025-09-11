---
title: Docker Deploy Bigdata Cluster.md
tags:
  - bigdata
  - hadoop
  - apache
date: 2025-01-25
draft: false
---

## Basic Environment Plan

### version

| 软件         | 版本                                    |
| ---------- | ------------------------------------- |
| Hadoop     | hadoop-2.10.1.tar.gz                  |
| Hive       | apache-hive-2.3.1-bin.tar.gz          |
| Kafka      | kafka_2.12-2.0.0.tgz                  |
| Zookeeper  | apache-zookeeper-3.5.7-bin.tar.gz     |
| Hbase      | hbase-2.4.9-bin.tar.gz                |
| Java       | jdk-8u202-linux-arm64-vfp-hflt.tar.gz |
| Scala      | scala-2.12.15.tgz                     |
| Spark      | spark-3.3.2-bin-without-hadoop.tgz    |
| Hudi       | hudi-release-0.13.0.zip               |
| Doris      | apache-doris-1.2.6-bin-arm64.tar.xz   |
| Flink      | flink-1.16.0-bin-scala_2.12.tgz       |
| Clickhouse | clickhouse-23.7.3.14-1                |

### service

| 节点           | 组件列表                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| hadoop-node1 | namenode \| dataname \| resourcemanager \| nodemanager \| hive \| spark \| flink \| fe be \| clickhouse |
| Hadoop-node2 | datanode \|nodemanager \| mysql \| zookeeper \| hive \| hive.metastore \| hbase \| fe be \| clickhouse  |
| Hadoop-node3 | datanode \|nodemanager \| kafka \| hive \| fe be \|clichhouse                                           |

