---
title: Kafka API
tags:
  - kafka
  - api
date: 2024-01-23
draft: false
---
## Producer API

> 应用程序将数据流发送到 Kafka 集群中的主题

```xml
<dependency>
	<groupId>org.apache.kafka</groupId>
	<artifactId>kafka-clients</artifactId>
	<version>2.7.2</version>
</dependency>
```

## Consumer API

> 应用程序从 Kafka 集群中的主题中读取数据流

```xml
<dependency>
	<groupId>org.apache.kafka</groupId>
	<artifactId>kafka-clients</artifactId>
	<version>2.7.2</version>
</dependency>
```
##  Stream API

> 应用程序从 Kafka 集群中的主题中读取数据流

```xml
<dependency>
	<groupId>org.apache.kafka</groupId>
	<artifactId>kafka-streams</artifactId>
	<version>2.7.2</version>
</dependency>
```

要使用 Kafka Streams DSL for Scala for Scala 2.13


```xml
<dependency>
	<groupId>org.apache.kafka</groupId>
	<artifactId>kafka-streams-scala_2.13</artifactId>
	<version>2.7.2</version>
</dependency>
```

## Connect API

 允许实现连接器，这些连接器不断地从某个源数据系统拉入 Kafka 或从 Kafka 推送到某个接收器数据系统。 许多 Connect 用户不需要直接使用此 API，但他们可以使用预构建的连接器，而无需编写任何代码

## Admin API

> Admin API 支持管理和检查主题、代理、acls 和其他 Kafka 对象

```xml
<dependency>
	<groupId>org.apache.kafka</groupId>
	<artifactId>kafka-clients</artifactId>
	<version>2.7.2</version>
</dependency>
```