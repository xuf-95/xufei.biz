---
title: Kafka Connect
tags:
  - kafka
  - dataflow
  - connect
date: 2024-01-29
draft: false
---
##  概述

Kafka Connect 是一种用于在 Apache Kafka 和其他系统之间可扩展且可靠地流式传输数据的工具。它使快速定义将大量数据移入和移出 Kafka 的连接器变得简单。Kafka Connect 可以摄取整个数据库或将所有应用服务器的指标收集到 Kafka 主题中，从而使数据可用于低延迟的流处理。导出作业可以将来自 Kafka 主题的数据传送到辅助存储和查询系统或批处理系统以进行离线分析。

Kafka Connect 功能包括：

- **Kafka 连接器的通用框架**——Kafka Connect 标准化了其他数据系统与 Kafka 的集成，简化了连接器的开发、部署和管理
- **分布式和独立模式**- 扩展到支持整个组织的大型集中管理服务或缩减到开发、测试和小型生产部署
- **REST 接口**- 通过易于使用的 REST API 向 Kafka Connect 集群提交和管理连接器
- **自动偏移管理**——只需来自连接器的少量信息，Kafka Connect 就可以自动管理偏移提交过程，因此连接器开发人员无需担心连接器开发中容易出错的部分
- **默认情况下是分布式和可扩展的**——Kafka Connect 建立在现有的组管理协议之上。可以添加更多工作人员来扩展 Kafka Connect 集群。
- **流/批处理集成**——利用 Kafka 的现有功能，Kafka Connect 是连接流和批处理数据系统的理想解决方案

## **运行 Kafka Connect**

Kafka Connect 目前支持两种执行模式：独立（单进程）和分布式

```sh
> bin/connect-standalone.sh config/connect-standalone.properties connector1.properties [connector2.properties ...]
```



## **配置 Connect**

连接器配置是简单的键值映射。对于独立模式，这些是在属性文件中定义的，并在命令行上传递给 Connect 进程。在分布式模式下，它们将包含在创建（或修改）连接器的请求的 JSON 有效负载中。

大多数配置都依赖于连接器，因此此处无法概述。但是，有一些常见的选项：

- name- 连接器的唯一名称。尝试使用相同名称再次注册将失败。
- connector.class- 连接器的 Java 类
- tasks.max- 应为此连接器创建的最大任务数。如果连接器无法达到这种并行度，它可能会创建更少的任务。
- key.converter- （可选）覆盖工作人员设置的默认密钥转换器。
- value.converter- （可选）覆盖工人设置的默认值转换器。

`connector.class`配置支持多种格式：此连接器的类的全名或别名。如果连接器是 org.apache.kafka.connect.file.FileStreamSinkConnector，您可以指定此全名或使用 FileStreamSink 或 FileStreamSinkConnector 使配置更短一些。

接收器连接器还有一些额外的选项来控制它们的输入。每个接收器连接器必须设置以下之一：

`topics`- 以逗号分隔的主题列表，用作此连接器的输入`topics.regex`- 用作此连接器输入的主题的 Java 正则表达式

