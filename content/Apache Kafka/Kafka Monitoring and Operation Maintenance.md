---
title: Kafka Monitoring and Operation Maintenance
tags:
  - kafka
  - monitoring
  - operation-maintenance
date: 2024-01-29
draft: false
---
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

- [kafka-console-producersh](https://doc.knowstreaming.com/study-kafka/6-operation#618-topic-%E7%9A%84%E5%8F%91%E9%80%81-kafka-console-producersh)
