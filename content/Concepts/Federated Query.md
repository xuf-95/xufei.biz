---
title: Federated Query
aliases:
  - AQ
description: Federated Query（联邦查询）是一种让你在不搬迁、不复制数据**的情况下，直接跨多个数据源执行 SQL 查询的能力。
tags:
  - concepts
date: 2026-06-01
publishDate: 2026-06-20T22:54
language: EN
draft:
publish: true
---

Federated Query 是一种跨多个异构数据源进行统一 SQL 查询的能力。它不要求先把所有数据同步到统一数仓，而是通过查询引擎和 Connector 直接访问 [[MySQL]]、[[Hive]]、Iceberg、[[Kafka]]、Elasticsearch 等系统。查询引擎会解析 SQL，生成执行计划，并尽可能把过滤、列裁剪、聚合等操作下推到源系统，然后拉取部分结果，在查询层完成 Join、聚合和排序。

它的优点是接入快、减少数据复制、适合临时分析和跨源探索；缺点是性能不稳定、网络开销大、跨源 Join 成本高、源库压力大、治理复杂。所以它通常不能完全替代 ETL/ELT，而是作为数据仓库、湖仓架构中的补充查询能力。

## **Simple Example**

假设你有：

- MySQL：存储用户表 `users`
- Hive：存储订单明细表 `orders`
- Elasticsearch：存储用户行为日志 `logs`

```sql
SELECT
    u.user_id,
    u.name,
    COUNT(o.order_id) AS order_count,
    COUNT(l.event_id) AS event_count
FROM mysql_db.users u
LEFT JOIN hive_db.orders o
    ON u.user_id = o.user_id
LEFT JOIN es_db.logs l
    ON u.user_id = l.user_id
GROUP BY u.user_id, u.name;
```

> 1. 从 MySQL 读取 users
> 2. 从 Hive 读取 orders
> 3. 从 Elasticsearch 读取 logs
> 4. 在查询引擎中做 Join / Aggregation
> 5. 返回最终结果

>![info] 核心思想
>Compute moves to data when possible, and only necessary data is transferred

