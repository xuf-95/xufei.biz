---
title: "Redis"
tags:
  - database
  - kv
date: 2024-10-18
draft: true
publish:


---

## 架构演变

单机莫模式 -- AOF -- RDF -- 混合集群 -- 哨兵模式 -> 分片模式 

### 哨兵模式

![[redis_哨兵模式.png]]


## 
```shell
    keys * # 查看当前库所有key    (匹配：keys *1)
    exists <key> # 判断某个key是否存在 1：存在 2：不存在
    type <key> # 查看你的key的value是什么类型
    del <key>	# 删除指定的key数据
    unlink <key>  # 根据value选择非阻塞删除 仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
    expire <key> 60   # 60秒钟：为给定的key设置过期时间
    ttl <key> # 查看还有多少秒过期，-1表示永不过期，-2表示已过期
    set ke1 xiaofang # 添加数据 key为ke1 value为小芳 
```

## Redis 发布和订阅
```shell
# Redis 发布订阅 (pub/sub) 是一种消息通信模式：发送者 (pub) 发送消息，订阅者 (sub) 接收消息。

1、打开一个客户端订阅channel1  -> SUBSCRIBE channel1
2、打开另一个客户端，给channel1发布消息hello -> publish channel1 hello
```


## 事务 - 锁



## Refrence

- [Redis for AI ](https://redis.io/redis-for-ai/)
- [Redis Official](https://redis.io/)
