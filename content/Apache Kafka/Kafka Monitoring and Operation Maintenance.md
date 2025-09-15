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


## Reference

- [kafka-console-producersh](https://doc.knowstreaming.com/study-kafka/6-operation#618-topic-%E7%9A%84%E5%8F%91%E9%80%81-kafka-console-producersh)
