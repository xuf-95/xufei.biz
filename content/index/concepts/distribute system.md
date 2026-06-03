---
title: "distribute system"
tags:
  - bigdata
  - distribute
  - system
date: 2022-01-25
draft: true
publish: false


---
在分布式数据库中建表时，部分表可以通过设置合理的分区和分桶，实现数据均匀分布和查询性能提升。数据均匀分布是指数据按照一定规则划分为子集，并且均衡地分布在不同节点上。查询时能够有效裁剪数据扫描量，最大限度地利用集群的并发性能，从而提升查询性能。

在分布式数据库中，常见的数据分布方式有如下几种：Round-Robin、Range、List 和 Hash

## 参考

- https://docs.starrocks.io/zh/docs/table_design/data_distribution/
