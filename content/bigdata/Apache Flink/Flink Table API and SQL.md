---
title: Flink Table API and SQL
tags:
  - bigdata
  - datastore
  - flink
  - sql
  - demo
date: 2024-02-11
draft: false
---

## Flink SQL是什么？ 

- **声明式 API**：Flink 最高层的AP1，易于使用
- **自动优化**：屏蔽 State 的复杂性，自动做到最优处理
- **流批统一**：一样的SQL，一样的结果
- **应用广泛**：ETL，统计分析，实时报表，实时风控

Flink 本身是批流统一的处理框架，所以Table API 和SQL，就是批流统一的上层处理API
  
1. 基本结构 # 与流式处理的程序结构十分相似
2. 创建 TableEnvironment
3. 配置 TableEnvironment
4. 创建表 # 配置水位线
5. 表的查询 Table API
5. 表的查询 SQL
6. 输出表 # 输出到文件. kafka. ES. mysql



## 基本代码程序结构

### 创建表的执行环境
```java
StreamTableEnvironment tableEnv = ... 
// 创建一张表，用于读取数据
tableEnv.connect(...).createTemporaryTable("inputTable");
// 注册一张表，用于把计算结果输出
tableEnv.connect(...).createTemporaryTable("outputTable");
// 通过 Table API 查询算子，得到一张结果表
Table result = tableEnv.from("inputTable").select(...);
// 通过 SQL查询语句，得到一张结果表
Table sqlResult  = tableEnv.sqlQuery("SELECT ... FROM inputTable ...");
// 将结果表写入输出表中
result.insertInto("outputTable");

```

### 创建 TableEnvironment

创建表的执行环境，需要将 flink 流处理的执行环境传入
StreamTableEnvironment tableEnv = StreamTableEnvironment.create(env);

TableEnvironment 是 flink 中集成 Table API 和 SQL 的核心概念，所有对表的操作都基于 TableEnvironment 
– 注册 Catalog
– 在 Catalog 中注册表
– 执行 SQL 查询
– 注册用户自定义函数（UDF）

### 配置 TableEnvironment
配置老版本 planner 的流式查询
```java
EnvironmentSettings settings = EnvironmentSettings.newInstance() .useOldPlanner()
.inStreamingMode()
.build();
StreamTableEnvironment tableEnv = StreamTableEnvironment .create(env, settings);
```

配置老版本 planner 的批式查询

```java
ExecutionEnvironment batchEnv = ExecutionEnvironment.getExecutionEnvironment; BatchTableEnvironment batchTableEnv = BatchTableEnvironment.create(batchEnv);
```

配置 blink planner 的流式查询
```java
EnvironmentSettings bsSettings = EnvironmentSettings.newInstance() .useBlinkPlanner()
.inStreamingMode()
.build();
StreamTableEnvironment bsTableEnv = StreamTableEnvironment .create(env, bsSettings);
```

配置 blink planner 的批式查询
```java
EnvironmentSettings bbSettings = EnvironmentSettings.newInstance() .useBlinkPlanner()
.inBatchMode()
.build();
TableEnvironment bbTableEnv = TableEnvironment.create(bbSettings);
```


### 开发案例

```Java
package com.atguigu.apitest.tableapi;

import com.atguigu.apitest.beans.SensorReading;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.java.StreamTableEnvironment;
import org.apache.flink.types.Row;


public class TableTest1_Example {
    public static void main(String[] args) throws Exception{
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(1);

        // 1. 读取数据
        DataStreamSource<String> inputStream = env.readTextFile("D:\\Projects\\BigData\\FlinkTutorial\\src\\main\\resources\\sensor.txt");

        // 2. 转换成POJO
        DataStream<SensorReading> dataStream = inputStream.map(line -> {
            String[] fields = line.split(",");
            return new SensorReading(fields[0], new Long(fields[1]), new Double(fields[2]));
        });

        // 3. 创建表环境
        StreamTableEnvironment tableEnv = StreamTableEnvironment.create(env);

        // 4. 基于流创建一张表
        Table dataTable = tableEnv.fromDataStream(dataStream);

        // 5. 调用table API进行转换操作
        Table resultTable = dataTable.select("id, temperature")
                .where("id = 'sensor_1'");

        // 6. 执行SQL
        tableEnv.createTemporaryView("sensor", dataTable);
        String sql = "select id, temperature from sensor where id = 'sensor_1'";
        Table resultSqlTable = tableEnv.sqlQuery(sql);

        tableEnv.toAppendStream(resultTable, Row.class).print("result");
        tableEnv.toAppendStream(resultSqlTable, Row.class).print("sql");

        env.execute();
    }
}

```

```shell
1. 启动flink-sql-client
    ./bin/start-cluster.sh

2. 启动 sql-client
   	./bin/sql-client.sh embedded
```

```sql

CREATE TABLE stock_plate (
  plate_type String,
  plate_name String ,
  blockcode String ,
  jycode String ,
  child_plate_name String,
  child_blockcode String,
  child_jycode String,
  market String,
  code String,
  PRIMARY KEY (code) NOT ENFORCED
) WITH (
  'connector.type' = 'jdbc',
  'connector.url' = 'jdbc:mysql://hadoop102:3306/level1_stock',
  'connector.table' = 'stock_plate',                                         
  'connector.username' = 'root',
  'connector.password' = '123456'
);

CREATE TABLE CustomerStatusChangedEvent(customerId int,
oStatus int,
nStatus int)with('connector.type' = 'kafka',
'connector.version' = 'universal',
'connector.properties.group.id' = 'g2.group1',
'connector.properties.bootstrap.servers' = 'hadoop102:9092,hadoop103:9092',
'connector.properties.zookeeper.connect' = 'hadoop102:2181',
'connector.topic' = 'customer_statusChangedEvent',
'connector.startup-mode' = 'earliest-offset',
'format.type' = 'json');
```



## Reference

- [Apache Flink Documentation | Apache Flink](https://nightlies.apache.org/flink/flink-docs-release-1.14/)