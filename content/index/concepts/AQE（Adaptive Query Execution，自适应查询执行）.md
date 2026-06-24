---
title: AQE（Adaptive Query Execution，自适应查询执行）
aliases:
description:
tags:
  - index
  - sql
date: 2026-06-01
publishDate: 2026-06-24T23:33
language: EN
draft:
publish: true
---
AQE（Adaptive Query Execution，自适应查询执行）是大数据 SQL 引擎中的一种**运行时动态优化机制**。

它的核心思想是：

传统 SQL 优化器在任务真正执行前，基于统计信息生成一个执行计划；  
AQE 则会在任务执行过程中，根据真实运行时数据量、Shuffle 结果、分区大小等信息，动态调整执行计划。

简单说，AQE 是让 SQL 引擎“边跑边优化”。

---

## **1. 为什么需要 AQE？**

在大数据场景中，SQL 优化器通常会提前生成执行计划，比如：

```sql
SELECT *
FROM orders o
JOIN users u
ON o.user_id = u.id;
```

优化器需要决定：

```text
用 Broadcast Join 还是 Shuffle Join？
Shuffle 分区数是多少？
是否存在数据倾斜？
哪些分区很小，可以合并？
```

问题是：**执行前的统计信息经常不准。**

  

例如：

```text
表的统计信息过期
过滤条件选择率估算错误
某些 key 数据严重倾斜
小表实际比预估更小
Shuffle 后分区大小差异很大
```

所以，执行前生成的计划可能不是最优的。

AQE 就是为了解决这个问题：  
**等一部分任务执行完，拿到真实数据，再动态调整后续执行计划。**

---

## **2. AQE 的核心概念**

传统执行方式类似：

```text
SQL
 ↓
解析
 ↓
逻辑计划
 ↓
优化逻辑计划
 ↓
物理计划
 ↓
直接执行
```

AQE 的执行方式类似：

```text
SQL
 ↓
解析
 ↓
逻辑计划
 ↓
初始物理计划
 ↓
执行一部分 Stage
 ↓
收集运行时统计信息
 ↓
重新优化后续物理计划
 ↓
继续执行
```

也就是说，AQE 会在执行过程中利用真实信息，例如：

```text
Shuffle 后每个分区的大小
Join 两边表的实际数据量
某些 key 是否发生倾斜
某些分区是否过小
```

然后重新选择更合适的执行方式。

---

## **3. AQE 主要解决哪些问题？**

### **3.1 动态调整 Join 策略**

执行前，优化器可能认为某张表很大，所以选择 Sort Merge Join：

```text
orders
  Shuffle
    Sort Merge Join
  Shuffle
users
```

但实际执行后发现：

```text
users 过滤后只有 20MB
```

那么 AQE 可以把 Join 动态改成 Broadcast Hash Join：

```text
orders
   ↓
Broadcast Hash Join  ← users 被广播
```

这样可以减少 Shuffle，提高执行效率。

  

对比：

```text
原计划：
大表 Shuffle + 小表 Shuffle + 排序 + Join

AQE 后：
小表 Broadcast，大表无需按 Join key Shuffle
```

这是 AQE 最常见、最有价值的能力之一。

---

### **3.2 动态合并 Shuffle 小分区**

Spark、Flink、Hive 等引擎中，经常会设置并行度或 Shuffle 分区数。

比如 Spark 默认可能是：

```text
spark.sql.shuffle.partitions = 200
```

但真实数据量可能只有几百 MB。  
如果仍然生成 200 个分区，就会产生大量小任务：

```text
Partition 1   1MB
Partition 2   2MB
Partition 3   0.5MB
...
Partition 200 1MB
```

任务太多会带来：

```text
调度开销大
小文件多
任务启动成本高
资源浪费
```

AQE 可以根据 Shuffle 结果，把小分区合并：

```text
原来：200 个小分区
优化后：20 个较合理分区
```

效果：

```text
减少 task 数量
减少调度开销
提高整体吞吐
降低小文件问题
```

---

### **3.3 动态处理数据倾斜 Join**

数据倾斜是大数据 SQL 中非常常见的问题。

例如：

```sql
SELECT *
FROM order_detail d
JOIN product p
ON d.product_id = p.id;
```

假设某个 `product_id = 1001` 是爆款商品，它的数据远远多于其他 key：

```text
product_id = 1001 → 1亿条
product_id = 1002 → 10万条
product_id = 1003 → 5万条
```

普通 Shuffle Join 后可能变成：

```text
Partition 1: 10MB
Partition 2: 12MB
Partition 3: 15GB   ← 倾斜分区
Partition 4: 9MB
```

结果就是：

```text
大部分 task 很快完成
少数 task 卡很久
整个任务被长尾拖死
```

AQE 可以识别出特别大的 Shuffle 分区，然后把这个倾斜分区拆分成多个小分区：

```text
原来：
Partition 3 = 15GB

拆分后：
Partition 3-1 = 1GB
Partition 3-2 = 1GB
Partition 3-3 = 1GB
...
```

这样可以让多个 task 并行处理热点数据，减少长尾任务。

---

## **4. AQE 的典型优化能力总结**

|**能力**|**解决的问题**|**典型效果**|
|---|---|---|
|动态 Join 策略切换|预估错误导致 Join 方式不合理|Sort Merge Join 改 Broadcast Join|
|合并 Shuffle 小分区|分区过多、任务过碎|减少 task 数量|
|拆分倾斜 Shuffle 分区|数据倾斜、长尾 task|缓解 Join 倾斜|
|动态调整并行度|初始并行度不合理|提高资源利用率|
|利用运行时统计信息|静态统计信息不准|执行计划更贴近真实数据|

---

## **5. AQE 在 Spark SQL 中的理解**

在 Spark SQL 中，AQE 是非常典型的优化能力。

开启参数一般是：

```properties
spark.sql.adaptive.enabled=true
```

常见相关参数有：

```properties
spark.sql.adaptive.coalescePartitions.enabled=true
spark.sql.adaptive.skewJoin.enabled=true
spark.sql.autoBroadcastJoinThreshold=10MB
spark.sql.adaptive.autoBroadcastJoinThreshold=...
spark.sql.shuffle.partitions=200
```

Spark AQE 的核心依赖是：

```text
Shuffle 阶段边界
运行时统计信息
QueryStage
AdaptiveSparkPlanExec
```

可以理解为：

```text
Spark 先把一个 SQL 拆成多个 QueryStage。
每个 Stage 执行完成后，会产生真实统计信息。
AQE 根据这些统计信息，重新优化后续 Stage 的执行计划。
```

---

## **6. 一个简单例子**

假设有 SQL：

```sql
SELECT *
FROM fact_order f
JOIN dim_user d
ON f.user_id = d.user_id
WHERE d.country = 'CN';
```

执行前优化器可能认为：

```text
dim_user 很大，不能广播
```

所以选择：

```text
SortMergeJoin
```

初始计划：

```text
fact_order Shuffle by user_id
dim_user   Shuffle by user_id
SortMergeJoin
```

但是实际执行时发现：

```text
dim_user WHERE country = 'CN' 后只有 5MB
```

AQE 会动态调整：

```text
BroadcastHashJoin
```

优化后：

```text
dim_user 过滤后广播到每个 Executor
fact_order 不需要再和 dim_user 双边 Shuffle
直接本地 Join
```

这样性能通常会明显提升。

---

## **7. AQE 和 CBO 的区别**

你前面问过 CBO，这里可以顺便对比一下。

|**对比项**|**CBO**|**AQE**|
|---|---|---|
|全称|Cost-Based Optimizer|Adaptive Query Execution|
|优化时机|执行前|执行中|
|依赖信息|表统计信息、列统计信息、基数估算|运行时真实统计信息|
|主要作用|生成更优初始执行计划|动态修正执行计划|
|典型问题|统计信息不准会误判|依赖 Shuffle 边界和执行反馈|
|关系|静态优化|动态优化|

可以这样理解：

```text
CBO：考试前根据模拟成绩制定策略
AQE：考试过程中根据真实题目难度调整答题策略
```

在现代 SQL 引擎中，比较理想的是：

```text
RBO + CBO + AQE
```

也就是：

```text
规则优化 + 成本优化 + 运行时自适应优化
```

---

## **8. AQE 的优点**

AQE 的优点主要有：

```text
降低对统计信息准确性的依赖
自动优化 Join 策略
缓解数据倾斜
减少 Shuffle 小任务
提升 SQL 执行稳定性
减少人工调参成本
```

尤其是在真实业务中，数据经常变化：

```text
今天订单量暴增
某个活动商品成为热点
某些维度过滤后突然变小
某些分区数据不均匀
```

AQE 对这种不确定性非常有价值。

---

## **9. AQE 的局限性**

AQE 不是万能的。

它也有一些限制：

```text
不是所有优化都能在运行时动态修改
通常依赖 Shuffle 边界，只有 Stage 之间才能重新优化
不能完全替代良好的数据建模和分区设计
严重数据倾斜仍然可能需要业务侧加盐、预聚合、拆热点 key
运行时重新优化本身也有一定开销
```

比如下面这种情况：

```text
某个 key 占全表 80%
```

AQE 可以缓解，但不一定彻底解决。  
这时可能还要结合：

```text
热点 key 单独处理
加盐 Join
预聚合
Broadcast 小表
维度表缓存
分桶表
```

---

## **10. 面试表达方式**

如果面试官问：

你了解 AQE 吗？

可以这样回答：

AQE 是 Adaptive Query Execution，自适应查询执行。它是在 SQL 执行过程中，根据运行时收集到的真实统计信息，对后续物理执行计划进行动态调整的一种优化机制。传统 CBO 主要依赖执行前的表统计信息，但这些统计信息可能不准确，所以 AQE 会在 Shuffle Stage 执行完成后，根据真实的分区大小、数据量、Join 两边大小等信息，重新优化执行计划。典型优化包括动态将 Sort Merge Join 转换为 Broadcast Hash Join、合并小的 Shuffle 分区、拆分倾斜分区来缓解数据倾斜。它可以减少 Shuffle、降低长尾任务、提升 SQL 执行稳定性，但它不能完全替代合理的数据建模、分区设计和倾斜治理。

---

## **11. 一句话总结**

**AQE 是大数据 SQL 引擎在运行时基于真实数据反馈动态优化执行计划的能力，主要用于优化 Join、Shuffle 分区和数据倾斜问题，是 CBO 之后更进一步的动态优化机制。**