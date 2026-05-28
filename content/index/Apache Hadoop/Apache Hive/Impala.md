---
title: Impala
tags:
  - hadoop
  - hive
  - query-engine
date: 2022-02-27
draft: true
publish: false
---
> [!info] **即席查询**
impala 是 cloudera 提供的一款高效率的 sql 查询工具，基于 hive 并使用**内存**进行计算，没有使用 MapReduce 进行并行计算。提供**实时的查询** 效果，官方测试性能比 hive 快 10 到 100 倍。

## Impala 架构

主要分为三个模块

**impala-catalog**：主节点，主要用于我们的impala的元数据信息的保存，放在内存以及磁盘当中

**impala-state-store**：主节点 ，状态存储区，主要用于存储我们impala的sql语句执行的一些进度，状态信息等等

**impala-server**：从节点，启动这个服务，产生一个impalad的进程，主要用于执行我们sql语句的。官方建议所有的impala-server与我们的datanode安装在一起，便于使用hadoop的一个短路读取的特性
### impala-shell 外部命令

```shell
# 进入impala交互命令行当中 默认root用户
impala-shell -u hive

# 刷新元数据
impala-shell -r

# 刷新数据字典缓存
[hadoop103:21000] default> invalidate metadata;

# 执行SQL文件
impala-shell -f news.sql

# 刷新某张表的数据 在impala交互环境下
refresh dbname.tablename 

# 执行sql里的脚本，然后导出到output.txt
impala-shell -f news.sql -B -o output.txt
# 执行sql里的脚本，查询执行失败时继续执行，然后导出到output4.txt
impala-shell -c -f news.sql -B -o output4.txt
# 执行sql里的脚本，然后导出到output.txt，并且指定分隔符
impala-shell -f news.sql -B -o output1.txt --output_delimiter='#'
# 执行sql里的脚本，然后导出到output.txt，附加列名
impala-shell -f news.sql -B -o output2.txt --print_header

# 查询最近一次查询的底层信息 【优化】
profile
```

### impala 内部命令

```shell
# 创建数据库
CREATE DATABASE IF NOT EXISTS `database_name` COMMENT '新库';

# 删除库
DROP database IF EXISTS `sample` cascade;

# 建表
CREATE TABLE IF NOT EXISTS `my_db`.`student`(name STRING, age 
INT, contact INT);

# 查看表的信息
Describe `table_name`;
desc formatted `table_name`;

# 支持sql
DDL==>>创建数据库、删除数据库、查询数据库
DDL==>>创建内外部表、创建分区表、数据导入load和insert、增加分区、删除分区、查看分区
DML==>>数据导入、数据导出、数据查询
支持创建函数，支持压缩(不支持ORC格式)

```