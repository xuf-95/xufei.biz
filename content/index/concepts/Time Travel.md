---
title: Time Travel
aliases:
description:
tags:
  - index
  - lakehouse
  - data-warehouse
date: 2026-06-01
publishDate: 2026-06-14T11:13
language: EN
draft: true
publish: true
summary: Time Travel = 给一张表加上「版本」，让你能查询任意历史时刻的数据快照——本质上就是对数据做 git checkout。
---
## 它解决什么问题

传统数据库做的是**原地更新（in-place update）**：你 `UPDATE` 一行，旧值就被覆盖、永远消失。这在事务系统里没问题，但在数据平台上会带来一连串痛点——误删了找不回、报表口径改了无法复现、想 debug「上周三那份数据长啥样」根本无从查起。

一个最贴切的类比是 **Git**：

- 每次写入 ≈ 一次 `commit`，生成一个带版本号的不可变快照；
- 当前的表 ≈ `HEAD`，只是指向最新一次提交的指针；
- 时间旅行 ≈ `git checkout <版本>`，让指针指回过去任意一帧。

Delta Lake、Apache Iceberg、Apache Hudi、Snowflake 这些湖仓系统，都把这套「版本化」能力做进了存储层。

## 核心原理：不可变 + 元数据指针

时间旅行看着像魔法，底层却只建立在**两条铁律**上：

1. **数据文件不可变。** 每个 [[Apache Parquet|Parquet]] 数据文件一旦写入就永不修改。要「更新」一行，系统不去改原文件，而是写一个**新文件**，并把旧文件标记为「已移除（tombstone / 墓碑）」。旧文件依然静静躺在磁盘上。
2. **元数据指向版本。** 一个独立的**事务日志 / 元数据层**记录「在某个版本，表由哪些文件组成」。当前表 = 最新元数据引用的文件集合；想看历史，只要读一份**旧的元数据**，它指向的就是旧的文件集合。

> [!note] 关键洞见 时间旅行**不是「恢复」被删除的数据，而是从一开始就没真正删除**。每次写入只是「追加新文件 + 一条新的元数据指针」。把数据想象成一卷胶片：每个版本是一帧不可变的画面，「现在」只是指向最后一帧的指针——倒回去随便看哪一帧都行。

## 四种格式怎么落地这套模型

不可变文件 + 版本化元数据是共识，但各家把「元数据层」做成了不同形态：

|系统|元数据形态|时间旅行坐标|备注|
|---|---|---|---|
|**Delta Lake**|有序事务日志（`_delta_log/` 下行分隔 JSON + checkpoint）|版本号 / 时间戳|版本号 = 日志序号，模型最直观|
|**Apache Iceberg**|分层快照树（metadata.json → snapshot → manifest → data）|快照 ID / 时间戳|manifest 带列级统计，裁剪高效|
|**Apache Hudi**|时间线 Timeline（一系列 instant）|instant 时间戳|原生支持 COW / MOR，擅长高频 upsert|
|**Snowflake**|托管的不可变微分区（micro-partition）|时间戳 / offset / statement|完全托管透明；保留期后进入 Fail-safe|

> [!info] Delta Lake 的一次提交长什么样 `_delta_log` 里每个提交是一份**行分隔 JSON**，记录一组原子 action：
> 
> ```json
> {"commitInfo":{"operation":"UPDATE"}}
> {"remove":{"path":"part-0001-….parquet"}}   // 旧文件变墓碑，但未物理删除
> {"add":{"path":"part-0003-….parquet","numRecords":3}}
> ```

## 查询长什么样

两套坐标贯穿所有系统——按**版本号 / 快照 ID**（精确、可复现）或按**时间戳**（贴近业务语义）：

```sql
-- Delta Lake (Spark SQL)
SELECT * FROM users VERSION AS OF 1;
SELECT * FROM users TIMESTAMP AS OF '2025-05-03';
RESTORE TABLE users TO VERSION AS OF 1;     -- 整表回滚

-- Apache Iceberg
SELECT * FROM t FOR SYSTEM_VERSION AS OF 7521...;
SELECT * FROM t FOR SYSTEM_TIME AS OF '2025-05-03 14:20:00';

-- Apache Hudi
SELECT * FROM t TIMESTAMP AS OF '20250503142000';

-- Snowflake
SELECT * FROM users AT(OFFSET => -60);                       -- 60 秒前
SELECT * FROM users AT(TIMESTAMP => '2025-05-03 14:20'::timestamp);
SELECT * FROM users BEFORE(STATEMENT => '<query_id>');       -- 某条语句执行之前
```

## 写入策略：COW vs MOR

既然文件不可变，更新一行时到底要重写多少东西？这就引出两种策略：

- **Copy-on-Write（COW）**：读出整个文件 → 改完整体重写为新文件 → 旧文件变墓碑。**读快**（直接读 Parquet）、**写慢**（写放大大）。适合读多写少的分析场景，是 Delta / Iceberg 的默认行为。
- **Merge-on-Read（MOR）**：更新只**追加增量（delta / delete）文件**，读时再把 base 与 delta 合并。**写快**、**读慢**、需要周期性 compaction。适合高频写入、近实时场景，对应 Hudi MOR 表。

> [!tip] 一句话记忆 COW 把代价交给**写**，MOR 把代价交给**读**——选哪个，取决于你的负载是读重还是写重。

## 代价：天下没有免费的时间旅行

墓碑文件不会自己消失。可回溯的历史越长，磁盘上堆积的旧文件越多。

> [!warning] 清理会破坏可回溯范围 清理操作（Delta 的 `VACUUM`、Iceberg 的 `expire_snapshots`、Hudi 的 `clean`）会**真正从磁盘删除**超出保留窗口的墓碑文件。一旦删掉，对应的早期版本就**无法再时间旅行**了。
> 
> ```text
> VACUUM users RETAIN 168 HOURS
> → 删除 7 天前的墓碑文件 f1、f2
> ✗ SELECT * FROM users VERSION AS OF 0   // 失败：文件已不存在
> ```

几组绕不开的权衡：

- **可回溯窗口 ↔ 存储成本**：留得越久越贵，需按业务定保留期。
- **小文件问题**：高频写产生大量碎片，需要 compaction。
- **并发写入**：靠乐观并发 + 原子提交保证版本线性，冲突时重试。

## 什么时候用

- **误删 / 误改恢复**——一条 `RESTORE` 救回整张表。
- **审计与合规**——任意时刻的数据状态都可追溯。
- **可复现实验 / 训练**——锁定某个版本，结果可重跑。
- **Debug 数据问题**——对比「出问题前后」两个版本的差异。
- **增量回填 / CDC**——基于版本差异做增量处理。

---

> [!example]- 想直观感受？ 我做过一个交互式模拟器，可以亲手 step through 每次写操作，实时看到「逻辑表」与「物理文件」如何分离、墓碑文件如何支撑时间旅行。可以把那个 HTML 作为单独页面托管，或用 iframe 嵌入这篇笔记。

