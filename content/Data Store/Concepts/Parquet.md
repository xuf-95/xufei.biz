---
title: Parquet
aliases:
  - Parquet 列示存储
tags:
  - data-store
  - storage-format
  - col-storage
date: 2023-06-12
draft: true
---
Apache Parquet是Hadoop生态圈中一种新型列式存储格式，它可以兼容Hadoop生态圈中大多数计算框架(Hadoop、Spark等)，被多种查询引擎支持(Hive、Impala、Drill等)，并且它是语言和平台无关的。Parquet最初是由Twitter和Cloudera(由于Impala的缘故)合作开发完成并开源，2015年5月从Apache的孵化器里毕业成为Apache顶级项目，能够与Parquet配合的组件有： 

- 查询引擎: [[Apache Hive]], Impala, Pig, Presto, Drill, Tajo, HAWQ, IBM Big SQL

- 计算框架: [[MapReduce]], [[Spark]], Cascading, Crunch, Scalding, Kite

- 数据模型: Avro, Thrift, Protocol Buffers, POJOs

### 组件

- 存储格式(storage format)：定义了Parquet内部的数据类型、存储格式等。
- 对象模型转换器(object model converters)：这部分功能由parquet-mr项目来实现，主要完成外部对象模型与Parquet内部数据类型的映射
- 对象模型(object models)：

对象模型可以简单理解为内存中的数据表示，Avro, Thrift, Protocol Buffers, Hive SerDe, Pig Tuple, Spark SQL InternalRow等这些都是对象模型。Parquet也提供了一个example object model 帮助大家理解。

例如parquet-mr项目里的parquet-pig项目就是负责把内存中的Pig Tuple序列化并按列存储成Parquet格式，以及反过来把Parquet文件的数据反序列化成Pig Tuple。

这里需要注意的是Avro, Thrift, Protocol Buffers都有他们自己的存储格式，但是Parquet并没有使用他们，而是使用了自己在parquet-format项目里定义的存储格式。所以如果你的应用使用了Avro等对象模型，这些数据序列化到磁盘还是使用的parquet-mr定义的转换器把他们转换成Parquet自己的存储格式。

