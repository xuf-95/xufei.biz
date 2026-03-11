---
title: Apache Kafka Overview
aliases:
  - Kafka
  - 卡夫卡
tags:
  - Overview
date: 2023-10-04
---
## 定义

Kafka 由`Scala`和`Java`编写，Kafka是一种`高吞吐量`的分布式`发布-订阅`消息系统，默认端口: 9092：
- `消息队列（mq）` : 消息的传输过程中保存消息的容器，把要传输的数据放在队列中
- `发布/订阅`：消息的发布者不会将消息直接发送给特定的订阅者，而是将发布的消息分为不同的类别，订阅者只接收感兴趣的消息
## Version

| 版本      | 核心亮点                                     |
| ------- | ---------------------------------------- |
| **3.0** | 强化交付保障，升级 ZooKeeper                      |
| **3.6** | Tiered Storage 支持                        |
| **3.7** | MSK 支持 KRaft，多 broker 扩展                 |
| **3.8** | 压缩级别配置、JBOD、预览 rebalance 协议              |
| **3.9** | 动态 KRaft quorum，淘汰 ZooKeeper             |
| **4.0** | 完全 KRaft，Queue 模式，rebalance 协议完善，多项现代化更新 |
## API

Kafka拥有三个非常重要的角色特性

- 消息系统：与传统的消息队列或者消息系统类似
- 存储系统：可以把消息持久化到磁盘，有较好的容错性
- 流式处理平台：可以在流式记录产生时就进行处理
## 基础架构

A Kafka broker is a server process that handles client requests, stores and replicates messages, and participates in cluster coordination. Each broker runs a set of core components, each implemented as a class or subsystem in the codebase.

![[content/bigdata/images/kafka-broker-architecture.png]]__***High-Level Broker Component Diagram***__

## **Kafka支持的主要应用场景**

- **削峰填谷**：所谓的“削峰填谷”就是指缓冲上下游瞬时突发流量，使其更平滑
- **解耦** ：即允许独立的扩展或修改两边的处理过程，只要确保它们遵守同样的接口约束
- **异步通信**：即允许把一个消息放入队列，但并不立即处理它们，然后再需要的时候才去处理它们
## Kafka Stream

Kafka Streams is a client library for building applications and microservices, where the input and output data are stored in Kafka clusters. It combines the simplicity of writing and deploying standard Java and Scala applications on the client side with the benefits of Kafka's server-side cluster technology.

<iframe width="615" height="346" src="https://www.youtube.com/embed/ni3XPsYC5cQ" title="Introduction to Kafka Streams" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Demo Code

```java title="Java8+"
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.common.utils.Bytes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.state.KeyValueStore;

import java.util.Arrays;
import java.util.Properties;

public class WordCountApplication {

    public static void main(final String[] args) throws Exception {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "wordcount-application");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker1:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, String> textLines = builder.stream("TextLinesTopic");
        KTable<String, Long> wordCounts = textLines
            .flatMapValues(textLine -> Arrays.asList(textLine.toLowerCase().split("\\W+")))
            .groupBy((key, word) -> word)
            .count(Materialized.<String, Long, KeyValueStore<Bytes, byte[]>>as("counts-store"));
        wordCounts.toStream().to("WordsWithCountsTopic", Produced.with(Serdes.String(), Serdes.Long()));

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();
    }

}
```

## 总体模块划分（server 侧）

```sql
kafka/
 ├─ server/           # Broker 主流程：网络、协议分发、Replica 管理、协调器等
 ├─ storage/          # 日志存储：Log/Segment/Index/records 压缩与保留
 ├─ raft/             # KRaft 实现：Raft 日志、投票、快照、Controller
 ├─ controller/       # 元数据控制器（KRaft），分区/副本状态机
 ├─ zookeeper/        # 兼容旧架构（如仍使用 ZK）
 ├─ network/          # SocketServer/Reactor/Selector/Quota
 ├─ coordinator/      # GroupCoordinator/TxnCoordinator（消费组与事务）
 ├─ common/clients/   # 通用协议、Record 格式、压缩等（客户端与服务端共用）
 └─ tools/            # 维护工具
```

### 启动与主循环
#### Broker 启动

- 入口：`kafka.Kafka`（`main`）→ `KafkaServer`
- 核心步骤：加载配置 → 日志目录检查 → 网络层 `SocketServer` 启动 → `ReplicaManager` 启动 → 协调器（Group/Txn）→ 控制器客户端（ZK 或 KRaft）初始化 → 接受请求。
#### 网络与请求分发

- **关键类**
    - `SocketServer` / `KafkaRequestHandlerPool`
    - `Processor`（NIO 线程）+ `RequestChannel`
    - `KafkaApis`：**协议分发中心**（handleProduce/handleFetch/handleJoinGroup/...）
- **要点**
    - **Reactor** 模型：Acceptor → 多个 Processor（Selector）→ 请求队列 → 多个 Handler 线程执行业务。
    - **零拷贝**：发送 `.log` 文件时可使用 `transferTo`
### 存储子系统（Log）

#### 数据结构

- **Log/LogSegment**
    - `Log`: 分区在磁盘的抽象；包含多个 `LogSegment`
    - `LogSegment`: 三元组文件
        - `.log`（RecordBatch 流）
        - `.index`（offset → 文件位置稀疏索引）
        - `.timeindex`（timestamp → 文件位置）
- **Record & RecordBatch**
    - 批为单位（压缩/CRC/魔数），含 `baseOffset`、`producerId/epoch/sequence`（用于幂等/事务）
- **Offset 边界**
    - LEO（log end offset）
    - HW（high watermark，同步副本可见的最高 offset）
#### 写入路径（Produce）

```mathematica
KafkaApis.handleProduce
  → ReplicaManager.appendRecords()
    → Partition.appendRecordsToLeader()
      → Log.append()
        → 当前 segment 追加（可能 roll）
        → 更新 LEO/索引/时间索引
  → 等待副本复制达成acks条件（ISR 达到 → 提升 HW）

```
#### 读取路径（Fetch）

```pgsql
KafkaApis.handleFetch
  → ReplicaManager.fetchMessages()
    → Partition.readRecords()
      → Log.read()
        → 索引定位（offset/time），从 .log 顺序读（可能零拷贝）
  → 返回 RecordBatch（可带压缩）
```


### 维护任务

- **保留与清理**
    - 基于时间/大小的保留：`log.cleaner`/`log.retention.*`
    - **Log Compaction**：按 key 保留“最新值”（`LogCleaner` 后台线程：从源 segment 合并成新的 compacted 段）
- **Segment 滚动**
    - 触发条件：大小/时间/批次首时间戳跨越等
### 复制与一致性

#### 副本角色与 ISR

- **Leader/Follower**：`ReplicaManager` 维护
- **ISR（in-sync replicas）**：满足追赶与滞后阈值的副本集合
- **高水位 HW**：最慢 ISR 的 LEO → 读一致性依据（只对 HW 以内可见）

## 消息队列的两种模式

两种类型的消息传递模式可用：

- 点、对点模式(一对一) : 一个生产者+一个消费者+一个topic，会删除数据 `不常用`。消费者主动拉取数据，消息收到后清除消息
- 发布-订阅模式(多对多) : 多个生产者+多个消费者+多个topic/相互独立，不会删除数据  
## 消息队列对比表

| 特性维度  | Kafka                        | Pulsar                      | RabbitMQ              | ActiveMQ            | NATS       | Redis Streams   | AWS Kinesis     | Google Pub/Sub |
| ----- | ---------------------------- | --------------------------- | --------------------- | ------------------- | ---------- | --------------- | --------------- | -------------- |
| 架构模型  | 分布式日志，Broker 负责存储和消费         | 存储（BookKeeper）与计算（Broker）分离 | 基于 AMQP，Exchange 路由消息 | 基于 JMS，传统 Broker 模型 | 轻量级，基于订阅发布 | 基于 Redis 内部数据结构 | 托管服务，分片存储       | 托管服务，全球分布式     |
| 消息存储  | 持久化日志，分区存储                   | BookKeeper 持久化日志            | 队列存储，支持持久化            | 队列存储，支持持久化          | 默认内存，可持久化  | Redis AOF / RDB | 托管存储（24h~7d 保留） | 托管存储（7d 保留）    |
| 吞吐量   | 极高（百万级 TPS）                  | 极高（百万级 TPS）                 | 中等（十万级 TPS）           | 中等（万级 TPS）          | 高（十万级 TPS） | 中等（十万级 TPS）     | 高，按分片扩展         | 高，自动扩展         |
| 延迟    | 低（ms 级）                      | 低（ms 级）                     | 较低（ms~几十 ms）          | 较高（>10ms）           | 极低（µs 级）   | 低（ms 级）         | ms~秒级           | ms~秒级          |
| 消息模型  | 流式（分区日志）                     | 同时支持流式 & 队列                 | 队列 + 发布订阅             | 队列 + 发布订阅           | 发布订阅       | 流式结构            | 流式事件            | 发布订阅           |
| 扩展性   | 高，分区水平扩展                     | 更高，支持无限水平扩展                 | 一般，集群扩展有限             | 较差                  | 高，支持集群     | 一般（依赖 Redis 集群） | 自动扩展            | 全球级扩展          |
| 典型场景  | 大数据、日志采集、流计算                 | 云原生、多租户、大规模流处理              | 企业应用解耦、订单系统           | 传统企业应用、JMS 场景       | 微服务通信、IoT  | 小规模数据流、轻量实时处理   | AWS 内大数据、日志流    | 跨区域分布式消息       |
| 运维复杂度 | 中等，需要 Zookeeper（新版本可选 KRaft） | 较高，需要管理 BookKeeper          | 低                     | 低                   | 低          | 低               | 无需运维            | 无需运维           |

### Business Example
 
![[Apache Kafka.png]]_**Kafka at LinkedIn**_

- 2019-05-17 [快手万亿级别Kafka集群应用实践与技术演进之路](https://www.infoq.cn/article/Q0o*QzLQiay31MWiOBJH) 涉及 Kafka 使用场景以及Kafka 的 5 点重要改进：平滑扩容、Mirror 集群化、资源隔离、cache 改造以及消费智能限速

## Kafka Monitoring and Operation Maintenance

### 优雅关机

```xml
controlled.shutdown.enable=true
```

**Leader 自均衡**
```xml
auto.leader.rebalance.enable=true
```
### Broker 退役

Broker 退役，先将该 Broker 上的数据迁移到其他 Broker 上(关于迁移情况下面的分区副本重分配部分)，然后直接下线就行了。

### 启动kafka集群

```shell
#! /bin/bash

case $1 in
"start"){
    for i in bigdata101 bigdata102 bigdata103
    do
        echo " --------启动 $i Kafka-------"
        ssh $i "/opt/apps/kafka/bin/kafka-server-start.sh -daemon /opt/apps/kafka/config/server.properties "
    done
};;
"stop"){
    for i in bigdata101 bigdata102 bigdata103
    do
        echo " --------停止 $i Kafka-------"
        ssh $i "/opt/apps/kafka/bin/kafka-server-stop.sh stop"
    done
};;
esac
```


## Reference

- [The Log](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) : What every software engineer should know about real-time data's unifying abstraction - By Jay PKreps 201311
- [Bufstream](https://medium.com/data-engineer-things/bufstream-stream-kafka-messages-to-iceberg-tables-in-minutes-6c60c470e67f) 几分钟内将 Kafka 消息传输到 Iceberg
- [Monitoring Kafka Performance Metrics | Datadog](https://www.datadoghq.com/blog/monitoring-kafka-performance-metrics/)
- [Apache Kafka](https://kafka.apache.org/books-and-papers) include Books and Papers
- [What is Apache Kafka](https://bell-sw.com/blog/a-guide-to-event-streaming-with-apache-kafka/)
- [Know Streaming](https://knowstreaming.com/) Kafka实时流运行平台，提供运维管控、监控告警、资源治理、多活容灾等核心场景
- [Apache Kafka ](https://medium.com/data-engineer-things/apache-kafka-overview-b04c4ab8ef49) Overview. The terminology and the architecture. | by Vu Trinh | Data Engineer Things
- [源码的一些介绍](http://www.heartthinkdo.com/?p=2006#12)
- [Kafka原理](https://www.cnblogs.com/metoy/p/4452124.html)
- [Jmx's Blog](https://jiamaoxiang.top/2020/09/08/%E9%9D%A2%E8%AF%95-Kafka%E5%B8%B8%E8%A7%81%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93/)
- [kafka-console-producersh](https://doc.knowstreaming.com/study-kafka/6-operation#618-topic-%E7%9A%84%E5%8F%91%E9%80%81-kafka-console-producersh)
### Resource  

- Books ：[2170922-EB-I\_Heart\_Logs.pdf](https://assets.confluent.io/m/48c5ed8540ec1f7e/original/2170922-EB-I_Heart_Logs.pdf?_gl=1*rzw9o1*_gcl_au*MTA0NTQwODY3OC4xNzI4NjE2MDMzLjIwNDM1MDgzMjEuMTcyODYxNjUyNi4xNzI4NjE2NTI1*_ga*MTgxMDc0MjE0Ni4xNzI4NjE2MDM3*_ga_D2D3EGKSGD*MTcyODYxNjAzNi4xLjEuMTcyODYxNjUyNy41OC4wLjA.&_ga=2.264712591.1058057393.1728616037-1810742146.1728616037)
- Paper List：[KSQL: Streaming SQL Engine for Apache Kafka](https://openproceedings.org/2019/conf/edbt/EDBT19_paper_329.pdf) 
- Projects list：[Apache Projects Directory](https://projects.apache.org/)
- Presentation：[Keynote Session | Kafka Summit London 2024](https://www.confluent.io/events/kafka-summit-london-2024/keynote-session/)

### Kafka Tools

- [KAFKA EAGLE](https://www.kafka-eagle.org/#) short name EFAK (Eagle For Apache Kafka， previously known as Kafka Eagle) is A DISTRIBUTED AND HIGH-PERFORMANCE KAFKA MONITORING SYSTEM By Mr Smartloli.

![[EFKA.png]]_***EFKA Dashboard UI***_

- [KnowStreaming](https://doc.knowstreaming.com/product/1-brief-introduction) 是一套云原生的 Kafka 管控平台，脱胎于众多互联网内部多年的 Kafka 运营实践经验，专注于 Kafka 运维管控、监控告警、资源治理、多活容灾等核心场景，在用户体验、监控、运维管控上进行了平台化、可视化、智能化的建设，提供一系列特色的功能，极大地方便了用户和运维人员的日常使用，让普通运维人员都能成为 Kafka 专家

- [CMAK](https://github.com/yahoo/CMAK) is a tool for managing Apache Kafka clusters

![[EMAK.png]]_***EMAK***_


![[public/bigdata/images/kafka-logo-readme-dark.svg]]


### Question

- Kafka是如何保障数据不丢失的？
    
- 如何解决Kafka数据丢失问题？
    
- Kafka可以保障永久不丢失数据吗？
    
- 如何保障Kafka中的消息是有序的？
    
- 如何确定Kafka主题的分区数量？
    
- 如何调整生产环境中Kafka主题的分区数量？
    
- 如何重平衡Kafka集群？
    
- 如何查看消费者组是否存在滞后消费？
