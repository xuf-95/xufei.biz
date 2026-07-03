---
title: CBO（Cost-Based Optimizer）
aliases:
  - CBO
description:
tags:
  - index
date: 2026-06-01
publishDate: 2026-06-24T23:21
language: EN
draft:
publish: true
---
## **1. CBO 是什么？**

**CBO = Cost-Based Optimizer，基于代价的优化器。**

它的核心思想是：

对同一条 SQL，可能存在多种执行计划。CBO 会根据表统计信息、列统计信息、数据分布、过滤率、Join 基数、I/O、CPU、网络 Shuffle 等成本估算，选择“预估代价最低”的执行计划。

举个简单例子：

```sql
SELECT *
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN city c ON u.city_id = c.id
WHERE c.name = 'Hangzhou';
```

这条 SQL 至少有多种执行方式：

```text
方案 A：orders JOIN users JOIN city
方案 B：city 过滤后 JOIN users，再 JOIN orders
方案 C：users JOIN city 后，再 JOIN orders
方案 D：某个小表 broadcast，避免 shuffle
```

CBO 会估算：

```text
每张表多大？
过滤后剩多少行？
Join 后结果有多大？
是否需要 Shuffle？
是否适合 Broadcast Join？
哪个 Join 顺序代价最低？
```

然后选择一个更优的执行计划。

---

## **2. CBO 和 RBO 的区别**

大数据 SQL 优化器里经常会对比 **RBO** 和 **CBO**。

|**类型**|**全称**|**核心依据**|**特点**|
|---|---|---|---|
|RBO|Rule-Based Optimizer|固定规则|比如谓词下推、列裁剪、常量折叠|
|CBO|Cost-Based Optimizer|统计信息 + 代价模型|根据数据规模和分布动态选择计划|

例如：

```sql
SELECT name FROM user WHERE age > 30;
```

RBO 会做：

```text
只读取 name、age 两列，而不是全表所有列  → 列裁剪
把 age > 30 尽量下推到数据源读取阶段 → 谓词下推
```

而 CBO 更进一步：

```text
age > 30 过滤后还有多少数据？
这个表是否适合 Broadcast？
Join 顺序是否应该调整？
是否需要重分区？
```

所以可以这样理解：

**RBO 是“按照经验规则优化”；CBO 是“根据数据代价算账”。**

---

## **3. CBO 依赖哪些统计信息？**

CBO 的效果高度依赖统计信息。常见统计信息包括：

|**统计信息**|**作用**|
|---|---|
|表行数|估算扫描量、Join 输入量|
|表大小|估算 I/O 成本|
|分区数量|判断分区裁剪效果|
|列基数 NDV|估算 Join / Group By 后的数据量|
|最大值 / 最小值|估算过滤范围|
|Null 数量|估算过滤率|
|直方图 Histogram|更精细地判断数据分布|
|文件大小 / 文件数量|估算扫描与调度成本|
|分桶 / 排序信息|判断是否可以减少 Shuffle|

在 Spark、Hive、Trino 等系统里，通常要通过类似下面的命令收集统计信息：

```sql
ANALYZE TABLE table_name COMPUTE STATISTICS;
ANALYZE TABLE table_name COMPUTE STATISTICS FOR COLUMNS col1, col2;
```

Spark 官方文档也说明，`ANALYZE TABLE` 收集的统计信息会存入 catalog，并被查询优化器用于生成更好的执行计划。 

---

## **4. CBO 在大数据里主要优化什么？**

### **4.1 Join 顺序优化**

这是 CBO 最核心的场景之一。

比如三张表：

```text
fact_order：10 亿行
dim_user：1000 万行
dim_city：300 行
```

如果先让大表和大表 Join，代价很高。

  

更合理的是：

```text
先过滤 / Join 小维表 dim_city
再关联 dim_user
最后关联 fact_order
```

Trino 官方文档中也明确提到，它会使用 connector 提供的表统计信息来估算不同 Join 顺序的成本，并自动选择成本最低的 Join 顺序。 

---

### **4.2 Join 算法选择**

CBO 可以帮助判断使用哪种 Join：

|**Join 类型**|**适用场景**|
|---|---|
|Broadcast Hash Join|一张表很小，可以广播到各个节点|
|Shuffle Hash Join|两边数据都需要按 key 分区|
|Sort Merge Join|大表 Join 大表，适合已排序或需要排序场景|
|Bucket Join|两表按相同 key 分桶，减少 Shuffle|

Spark SQL 的 CBO 对多 Join 查询尤其有用，Databricks 文档也提到，Spark SQL 可以使用 CBO 改进查询计划，尤其适合多 Join 查询。 

---

### **4.3 谓词选择率估算**

例如：

```sql
WHERE city = '杭州'
```

如果 `city = '杭州'` 只过滤出 1% 的数据，那么优化器应该尽早执行这个过滤条件。

如果过滤条件几乎不过滤数据，那它的优化价值就不大。

---

### **4.4 Shuffle 成本估算**

在大数据系统里，Shuffle 往往是最贵的操作之一。

CBO 会尝试减少：

```text
网络传输
磁盘落盘
跨节点数据交换
大分区倾斜
无效重分区
```

Trino 里甚至有 cost-based partitioning 相关优化，用来判断是否需要对已经分区的 stage 输出重新分区。 

---

### **4.5 聚合与排序优化**

例如：

```sql
SELECT user_id, count(*)
FROM orders
GROUP BY user_id;
```

CBO 会考虑：

```text
user_id 的基数有多大？
聚合后数据会缩小多少？
是否可以做 partial aggregation？
是否需要两阶段聚合？
是否会产生数据倾斜？
```

---

## **5. 哪些大数据产品或组件用到了 CBO？**

下面是重点。

### **5.1 Apache Hive**

Hive 是大数据领域最典型的 CBO 使用者之一。

Hive 的 CBO 基于 Apache Calcite 引入，主要用于：

```text
Join 重排序
谓词下推
列裁剪
聚合优化
Join 算法选择
子查询优化
```

Apache Hive 官方文档提到，Calcite 是一个开源的 cost-based query optimizer，并且 Hive 使用 Calcite 引入 CBO。 

  

Hive 中常见相关配置：

```sql
set hive.cbo.enable=true;
set hive.compute.query.using.stats=true;
set hive.stats.fetch.column.stats=true;
set hive.stats.fetch.partition.stats=true;
```

统计信息收集：

```sql
ANALYZE TABLE order_detail COMPUTE STATISTICS;
ANALYZE TABLE order_detail COMPUTE STATISTICS FOR COLUMNS user_id, sku_id;
```

---

### **5.2 Apache Spark SQL / Catalyst Optimizer**

Spark SQL 的优化器叫 **Catalyst Optimizer**。

Catalyst 里面既有 RBO，也支持 CBO。

Spark SQL CBO 常见能力：

```text
Join Reorder
Broadcast Join 判断
过滤率估算
基数估算
统计信息传播
物理计划选择
```

Spark 官方文档中，`ANALYZE TABLE` 的统计信息会被 query optimizer 使用。 

  

常见配置：

```sql
set spark.sql.cbo.enabled=true;
set spark.sql.cbo.joinReorder.enabled=true;
set spark.sql.statistics.histogram.enabled=true;
```

常见分析命令：

```sql
ANALYZE TABLE orders COMPUTE STATISTICS;
ANALYZE TABLE orders COMPUTE STATISTICS FOR COLUMNS user_id, order_status;
```

Spark 还有一个很重要的运行时优化机制：**AQE，Adaptive Query Execution**。Spark 官方文档说明，AQE 会利用运行时统计信息选择更高效的查询执行计划。 

  

你可以这样区分：

```text
CBO：执行前，根据元数据和统计信息优化
AQE：执行中，根据真实运行时数据动态调整
```

---

### **5.3 Apache Flink SQL**

Flink SQL 的优化器也大量基于 **Apache Calcite**。

Flink SQL 中的优化主要包括：

```text
逻辑计划优化
物理计划优化
Join 重排序
谓词下推
投影下推
MiniBatch 聚合优化
维表 Join 优化
流批统一 SQL 优化
```

Flink 比较特殊，因为它既支持批处理 SQL，也支持流处理 SQL。

  

在批 SQL 里，CBO 的作用更接近 Hive / Spark / Trino。

  

在流 SQL 里，优化器还要考虑：

```text
状态大小
状态访问成本
Watermark
窗口聚合
更新流 changelog
MiniBatch
Retraction
Join 状态保留时间
```

所以 Flink SQL 的优化不仅是“算一次 SQL 多快”，还要考虑“长期运行的流任务状态成本”。

---

### **5.4 Trino / Presto**

Trino 是交互式分布式 SQL 查询引擎，CBO 用得非常典型。

主要优化：

```text
Join Reordering
Join Distribution 选择
Broadcast / Partitioned Join 选择
Predicate Pushdown
Aggregation Pushdown
Limit Pushdown
TopN Pushdown
Cost-based Partitioning
```

Trino 官方文档明确提到，它支持 statistics-based optimizations，查询要利用这些优化，需要表的统计信息；这些统计信息由 connector 提供给 query planner。 

  

Trino 的 CBO 特点是：

```text
它不是只优化 Hive 表，而是依赖不同 connector 提供统计信息
例如 Hive、Iceberg、Delta Lake、JDBC、MySQL、PostgreSQL 等 connector
```

---

### **5.5 Apache Calcite**

Apache Calcite 不是一个完整的大数据计算引擎，而是一个通用 SQL 解析与优化框架。

很多大数据系统会基于 Calcite 构建自己的 SQL 优化器。

Calcite 官方介绍中提到，它可以把查询表示成关系代数，通过规划规则转换，并按照 cost model 进行优化。 

常见使用 Calcite 的系统包括：

```text
Apache Hive
Apache Flink
Apache Drill
Apache Druid
Apache Kylin
部分 OLAP / 联邦查询系统
```

可以把 Calcite 理解成：

很多大数据 SQL 引擎背后的“优化器基础设施”。

---

### **5.6 Apache Doris**

Apache Doris 是 MPP 架构的实时数仓 / OLAP 数据库。

Doris 新优化器中也有 CBO 思想，主要用于：

```text
Join Reorder
Join 类型选择
谓词下推
物化视图改写
聚合下推
Runtime Filter
分区裁剪
Tablet 裁剪
```

Doris 这类 MPP 数据库尤其依赖 CBO，因为它要决定：

```text
数据在哪些 BE 节点扫描？
是否需要 Shuffle？
Join 是 colocate、broadcast 还是 shuffle？
是否命中物化视图？
```

---

### **5.7 StarRocks**

StarRocks 也是典型 MPP OLAP 数据库，优化器中大量使用 CBO。

常见场景：

```text
Join Reorder
Broadcast Join / Shuffle Join / Colocate Join 选择
物化视图透明改写
谓词下推
分区裁剪
Tablet 裁剪
聚合下推
Runtime Filter
Pipeline 执行计划优化
```

StarRocks 面向高并发、低延迟分析查询，所以 CBO 的价值很大。

  

例如一条多表 Join 的 BI 查询，优化器会决定：

```text
哪张表先 Join？
小表是否广播？
是否可以使用 Colocate Join？
是否可以命中同步 / 异步物化视图？
是否可以把聚合下推到 Scan 阶段？
```

---

### **5.8 ClickHouse**

ClickHouse 传统上更偏向极致列式存储、向量化执行、稀疏索引、分区裁剪和数据跳过索引，早期并不是典型“强 CBO”路线。

但在现代 ClickHouse 中，优化器也在不断增强，包括：

```text
谓词下推
Projection 选择
索引裁剪
分区裁剪
PREWHERE 优化
Join 算法选择
查询计划优化
```

ClickHouse 的优化风格和 Hive / Spark / Trino 不太一样。

可以这样表达：

ClickHouse 更强调列式存储、向量化执行、数据跳过和工程级执行优化；CBO 思想存在，但它不是传统 Hadoop SQL 引擎那种以复杂 Join Reorder 为核心的 CBO 代表。

---

### **5.9 Apache Impala**

Impala 是 Cloudera 体系里的 MPP SQL 引擎，也使用 CBO 思想。

典型优化：

```text
Join 顺序
Broadcast / Partitioned Join
Runtime Filter
Scan 范围裁剪
聚合下推
统计信息驱动的执行计划选择
```

Impala 中统计信息也非常重要，缺少统计信息时，Join 顺序和 Join 策略可能不理想。

---

### **5.10 MaxCompute / Hologres / AnalyticDB 等云数仓**

阿里云 MaxCompute、Hologres、AnalyticDB，华为 DWS，腾讯云 DLC / CDW，AWS Redshift，Google BigQuery，Snowflake 等云数仓产品，本质上也都有类似 CBO 的优化能力。

这些系统通常会根据：

```text
表大小
分区信息
列统计信息
数据分布
文件布局
Join Key 分布
物化视图
索引 / 排序键
运行时反馈
```

来选择执行计划。

  

云数仓里的 CBO 往往还会结合：

```text
自动统计信息收集
自动物化视图改写
自动分区裁剪
自动 Join 策略选择
自动资源调度
```

---

## **6. 典型组件总结表**

|**产品 / 组件**|**是否使用 CBO**|**优化器 / 相关框架**|**典型优化**|
|---|---|---|---|
|Hive|是|Calcite CBO|Join 重排、谓词下推、聚合优化|
|Spark SQL|是|Catalyst + CBO + AQE|Join Reorder、Broadcast 判断、运行时自适应|
|Flink SQL|是|Calcite|流批 SQL 优化、Join、聚合、状态优化|
|Trino / Presto|是|自研优化器|Join 顺序、Join 分布、Pushdown|
|Calcite|是|优化器框架|关系代数、规则优化、代价优化|
|Impala|是|自研优化器|Join 策略、Runtime Filter|
|Doris|是|新优化器 CBO|MPP Join、物化视图、Runtime Filter|
|StarRocks|是|CBO 优化器|Join Reorder、MV 改写、Colocate Join|
|ClickHouse|部分具备|Query Analyzer / Planner|分区裁剪、索引跳过、Join 算法|
|MaxCompute|是|云数仓优化器|分区裁剪、Join 优化、执行计划优化|
|Hologres|是|PostgreSQL 系 + MPP 优化|Join、索引、分布式执行|
|BigQuery / Snowflake / Redshift|是|云数仓 CBO|Join、Scan、MV、资源调度|

---

## **7. 面试中怎么回答 CBO？**

你可以这样回答：

CBO 是 Cost-Based Optimizer，也就是基于代价的优化器。它会根据表统计信息、列统计信息、数据分布、过滤选择率、Join 基数、I/O 成本、CPU 成本和网络 Shuffle 成本，为同一条 SQL 枚举多个候选执行计划，然后选择预估代价最低的计划。

在大数据中，CBO 主要用于 Join 顺序调整、Broadcast Join / Shuffle Join 选择、谓词下推、聚合优化、分区裁剪、物化视图改写等场景。Hive 的 CBO 基于 Apache Calcite，Spark SQL 在 Catalyst 中支持 CBO，并且结合 AQE 做运行时自适应优化；Trino、Flink SQL、Impala、Doris、StarRocks、MaxCompute、Hologres 等也都有类似的 CBO 能力。

CBO 的效果依赖统计信息，如果统计信息缺失或过期，优化器可能会选择错误的 Join 顺序或 Join 策略，导致 Shuffle 过大、数据倾斜或者查询变慢。

---

## **8. 一句话总结**

**CBO 就是 SQL 引擎的大脑：它不只是按固定规则改写 SQL，而是基于统计信息和代价模型，计算哪种执行方式最便宜，然后选择最优或近似最优的执行计划。**