---
title: JFlink
aliases:
  - 实时计算开发治理平台
tags:
  - flink
  - cloud
  - jingdong-cloud
  - ide
date: 2025-07-06
draft: false
---
> 产品开通前提：需要主账号开通和JFlink相同地域的对象存储服务

实时计算平台Flink版（JFlink）是[[JingDongCLoud]]在开源 [[Flink Overview]]的基础上,实现的企业级实时数据开发治理平台,是一款企业级全托管的实时计算Flink服务,提供Serverless按需扩缩的弹性能力，计算资源组弹性扩缩

## 数据连接

### 支持的数据源类型

| 支持的数据源                | 运行模式               | 支持版本                           | 实时计算支持类型 |     |     | 单表同步 |     | 分库分表 |     | 整库迁移 |     |
| --------------------- | ------------------ | ------------------------------ | -------- | --- | --- | ---- | --- | ---- | --- | ---- | --- |
|                       |                    |                                | 源表       | 维表  | 目标表 | 源    | 目标  | 源    | 目标  | 源    | 目标  |
| MySQL                 | 流模式（CDC）和批模式（JDBC） | 5.x，8.x                        | √        | √   | √   | √    | √   | √    |     |      |     |
| SQLServer             | 流模式（CDC）和批模式（JDBC） | 2008R2、2012、2014、2016          |          |     |     | √    | √   |      |     |      |     |
| TiDB                  | 流模式（CDC）和批模式（JDBC） | 4.x，5.x，6.x                    | √        | √   | √   | √    | √   |      |     |      |     |
| StarDB                | 流模式（CDC）和批模式（JDBC） |                                | √        | √   | √   | √    | √   |      |     |      |     |
| MongoDB               | 流模式（CDC）           | 3.6，4.0                        |          |     |     | √    |     |      |     |      |     |
| ClickHouse            | 流模式（CDC）和批模式（JDBC） | 23.3.22.32，3.8.15.35，24.3.5.46 |          |     |     |      | √   |      | √   |      |     |
| Redis                 | 流模式（CDC）           | 4.0，5.0                        |          |     | √   |      |     |      |     |      |     |
| ElasticSearch         | 流模式（CDC）和批模式（JDBC） | 6.x，7.x                        |          |     | √   |      |     |      |     |      |     |
| Kafka                 | 流模式（CDC）           | 2.4，2.6                        | √        |     | √   | √    | √   |      | √   |      |     |
| JCW  <br>云原生存算引擎      | 流模式（CDC）和批模式（JDBC） |                                |          |     |     |      | √   |      | √   |      |     |
| StarRocks  <br>实时数据仓库 | 流模式（CDC）和批模式（JDBC） | 3.3                            |          |     |     |      | √   |      | √   |      | √   |
| Hologres              | 流模式（CDC）和批模式（JDBC） |                                | √        |     |     |      |     |      |     | √    |     |
| SelectDB              | 批模式（JDBC）          |                                |          |     |     |      |     |      |     | √    |     |
| AnalyticDB MySQL版     | 批模式（JDBC）          |                                |          |     |     |      |     |      |     | √    |     |

## Session管理
## 实时同步
## 实时计算
## 发布管理
## 运维中心

## Flink Dashboard

### Overview

- Available Task Slots
	- Total Task Slots
	- Task Managers
- Running Jobs
	- Finished
	- Canceled
	- Failed

- Running & Completed Job List
	- job name
	- Start time
	- Duration
	- End time
	- Tasks  ( = Parallelism )
	- Status

### Task Manager

![[content/Cloud Data Solutions/images/JFlink-task-manager.png]]

- Path,ID 
- Data Port
- Last Heartbeat
- All Slots
- Free Slots
- CPU Cores
- Physical MEM
- JVM. Heap Size
- Flink Managed EME

![[content/Cloud Data Solutions/images/JFlink-task-manager-work.png]]
### Job Manager

**Flink Memory Model**

![[content/Cloud Data Solutions/images/JFlink-mem-model.png]]

#### Configuration

##### Configuration

| **$internal.application.main**                                | com.xx.xx_vip_jx58gKfz                                                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **$internal.flink.version**                                   | v1_17                                                                                                                              |
| **$internal.pipeline.job-id**                                 | 7e9d98f883bf22575                                                                                                                  |
| **akka.ask.timeout**                                          | 120 s                                                                                                                              |
| **blob.server.port**                                          | 6124                                                                                                                               |
| **classloader.check-leaked-classloader**                      | false                                                                                                                              |
| **classloader.resolve-order**                                 | parent-first                                                                                                                       |
| **client.timeout**                                            | 120 s                                                                                                                              |
| **cluster.registration.max-timeout**                          | 300000                                                                                                                             |
| **deployment.timeout**                                        | 180000                                                                                                                             |
| **env.java.opts**                                             | -Dfile.encoding=UTF-8                                                                                                              |
| **env.java.opts.jobmanager**                                  | -Duser.timezone=GMT+08 -XX:+UseG1GC                                                                                                |
| **env.java.opts.taskmanager**                                 | -Duser.timezone=GMT+08 -XX:NewRatio=1 -XX:+UseG1GC                                                                                 |
| **execution.checkpointing.externalized-checkpoint-retention** | RETAIN_ON_CANCELLATION                                                                                                             |
| **execution.checkpointing.interval**                          | 60000                                                                                                                              |
| **execution.checkpointing.max-concurrent-checkpoints**        | 1                                                                                                                                  |
| **execution.checkpointing.min-pause**                         | 1000                                                                                                                               |
| **execution.checkpointing.mode**                              | EXACTLY_ONCE                                                                                                                       |
| **execution.checkpointing.timeout**                           | 60000                                                                                                                              |
| **execution.checkpointing.tolerable-failed-checkpoints**      | 10                                                                                                                                 |
| **execution.checkpointing.unaligned**                         | false                                                                                                                              |
| **execution.shutdown-on-application-finish**                  | false                                                                                                                              |
| **execution.target**                                          | embedded                                                                                                                           |
| **fs.allowed-fallback-filesystems**                           | s3                                                                                                                                 |
| **heartbeat.timeout**                                         | 300000                                                                                                                             |
| **internal.cluster.execution-mode**                           | NORMAL                                                                                                                             |
| **jobmanager.memory.heap.size**                               | 3462817376b                                                                                                                        |
| **jobmanager.memory.jvm-metaspace.size**                      | 268435456b                                                                                                                         |
| **jobmanager.memory.jvm-overhead.max**                        | 429496736b                                                                                                                         |
| **jobmanager.memory.jvm-overhead.min**                        | 429496736b                                                                                                                         |
| **jobmanager.memory.off-heap.size**                           | 134217728b                                                                                                                         |
| **jobmanager.memory.process.size**                            | 4 gb                                                                                                                               |
| **jobmanager.retrieve-taskmanager-hostname**                  | false                                                                                                                              |
| **jobmanager.rpc.address**                                    | work-xxa939.ric-ns-7xx3768-708xx                                                                                                   |
| **jobmanager.rpc.port**                                       | 6123                                                                                                                               |
| **kubernetes.cluster-id**                                     | work-xxa939                                                                                                                        |
| **kubernetes.container.image.ref**                            | jdcloud-bigdataxxeast-2.jcr.service.jdcloud.com/ric/flink-centos8:ric-1.17.2-java8-3.34                                            |
| **kubernetes.internal.jobmanager.entrypoint.class**           | org.apache.flink.kubernetes.entrypoint.KubernetesApplicationClusterEntrypoint                                                      |
| **kubernetes.jobmanager.annotations**                         | flinkdeployment.flink.apache.org/generation:2                                                                                      |
| **kubernetes.jobmanager.cpu.amount**                          | 1.0                                                                                                                                |
| **kubernetes.jobmanager.owner.reference**                     | name:work-xxa939,uid:5aed40ed40c,kind:FlinkDeployment,apiVersion:flink.apache.org/v1beta1,blockOwnerDeletion:true,controller:false |
| **kubernetes.jobmanager.replicas**                            | 1                                                                                                                                  |
| **kubernetes.namespace**                                      | ric-ns-720316413768-708990745464332288                                                                                             |
| **kubernetes.pod-template-file.jobmanager**                   | /tmp/flink_op_generated_podTemplate_852.yaml                                                                                       |
| **kubernetes.pod-template-file.taskmanager**                  | /tmp/flink_op_generated_podTemplate_1131683.yaml                                                                                   |
| **kubernetes.rest-service.exposed.type**                      | ClusterIP                                                                                                                          |
| **kubernetes.service-account**                                | operator-sa-720316413768                                                                                                           |
| **kubernetes.taskmanager.cpu.amount**                         | 1.0                                                                                                                                |
| **metrics.latency.granularity**                               | operator                                                                                                                           |
| **metrics.latency.interval**                                  | 3000                                                                                                                               |
| **metrics.reporter.kafka.auth**                               | true                                                                                                                               |
| **metrics.reporter.kafka.bootstrapServers**                   | kafka-6zdjka-bootstrap.kal2.jdcloud.com:9092                                                                                       |
| **metrics.reporter.kafka.factory.class**                      | org.apache.flink.metrics.kafka.KafkaReporterFactory                                                                                |
| **metrics.reporter.kafka.interval**                           | 60 SECONDS                                                                                                                         |
| **metrics.reporter.kafka.labels**                             | flinlinkjob_restartingTiation,fmrbageCollector_G1_Ol                                                                               |
| **metrics.reporter.kafka.saslJaasConfig**                     | oUGDVE39qID5ZJc7oN7hY5I6jD                                                                                                         |
| **metrics.reporter.kafka.saslMechanism**                      | G16RLyL4PAWJs                                                                                                                      |
| **metrics.reporter.kafka.securityProtocol**                   | 3                                                                                                                                  |
| **metrics.reporter.kafka.topic**                              | jdcloud-ric-prod-metrics-720                                                                                                       |
| **metrics.reporter.kafka.workId**                             | work-68d2017e6a939-17585956                                                                                                        |
| **metrics.reporters**                                         | kafka                                                                                                                              |
| **parallelism.default**                                       | 1                                                                                                                                  |
| **pipeline.classpaths**                                       |                                                                                                                                    |
| **pipeline.jars**                                             | file:/opt/flink/jar/202b-1.0.0-ric.jar                                                                                             |
| **pipeline.name**                                             | work-xxa939                                                                                                                        |
| **restart-strategy.fixed-delay.attempts**                     | 3                                                                                                                                  |
| **restart-strategy.fixed-delay.delay**                        | 30 s                                                                                                                               |
| **restart-strategy.type**                                     | fixed-delay                                                                                                                        |
| **s3.access-key**                                             | JDC_A7B44CB9C24280                                                                                                                 |
| **s3.endpoint**                                               | http://s3-internal.cn-east-2.jdcloud-oss.com                                                                                       |
| **s3.path.style.access**                                      | true                                                                                                                               |
| **s3.secret-key**                                             | ******                                                                                                                             |
| **s3.ssl.enabled**                                            | false                                                                                                                              |
| **security.basic.auth.client.password**                       | ******                                                                                                                             |
| **security.basic.auth.enabled**                               | true                                                                                                                               |
| **security.basic.server.password**                            | ******                                                                                                                             |
| **slot.request.timeout**                                      | 500000                                                                                                                             |
| **sql-gateway.endpoint.rest.security.basic.auth.enabled**     | false                                                                                                                              |
| **state.backend**                                             | rocksdb                                                                                                                            |
| **state.backend.incremental**                                 | true                                                                                                                               |
| **state.checkpoint-storage**                                  | filesystem                                                                                                                         |
| **state.checkpoints.dir**                                     | s3://flink-jd/flink/checkpoints/                                                                                                   |
| **state.checkpoints.num-retained**                            | 1                                                                                                                                  |
| **state.savepoints.dir**                                      | s3://flink-jd/flink/savepoints/                                                                                                    |
| **taskmanager.memory.jvm-overhead.fraction**                  | 0.1                                                                                                                                |
| **taskmanager.memory.managed.fraction**                       | 0.4                                                                                                                                |
| **taskmanager.memory.network.fraction**                       | 0.1                                                                                                                                |
| **taskmanager.memory.process.size**                           | 4 gb                                                                                                                               |
| **taskmanager.numberOfTaskSlots**                             | 1                                                                                                                                  |
| **taskmanager.rpc.port**                                      | 6122                                                                                                                               |
| **web.cancel.enable**                                         | false                                                                                                                              |
| **web.tmpdir**                                                | /tmp/flink-web-6a3e1b14d0c                                                                                                         |

##### JVM

| **version** | Java HotSpot(TM) 64-Bit Server VM - Oracle Corporation - 1.8/25.411-b09                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **arch**    | amd64                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **options** | -Xmx3462817376 -Xms3462817376 -XX:MaxMetaspaceSize=268435456 -Dfile.encoding=UTF-8 -Duser.timezone=GMT+08 -XX:+UseG1GC -Dlog.file=/opt/flink/log/flink--kubernetes-application-0-work-68d20306fb4f5d5917e6a939-8464dc65bc-6lv72.log -Dlog4j.configuration=file:/opt/flink/conf/log4j-console.properties -Dlog4j.configurationFile=file:/opt/flink/conf/log4j-console.properties -Dlogback.configurationFile=file:/opt/flink/conf/logback-console.xml |
|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
##### Classpath

|                                                             |
| ----------------------------------------------------------- |
| /opt/flink/lib/flink-cep-1.17.2.jar                         |
| /opt/flink/lib/flink-connector-files-1.17.2.jar             |
| /opt/flink/lib/flink-csv-1.17.2.jar                         |
| /opt/flink/lib/flink-httpbasic-auth-1.17.x-1.0.0.1.jar      |
| /opt/flink/lib/flink-jd-catalog-1.17.x-1.0.0.1.jar          |
| /opt/flink/lib/flink-jdufs-1.17.x-1.0.0.1.jar               |
| /opt/flink/lib/flink-json-1.17.2.jar                        |
| /opt/flink/lib/flink-log-appender-1.17.x-1.0.0.1-shaded.jar |
| /opt/flink/lib/flink-scala_2.12-1.17.2.jar                  |
| /opt/flink/lib/flink-table-api-java-uber-1.17.2.jar         |
| /opt/flink/lib/flink-table-planner-loader-1.17.2.jar        |
| /opt/flink/lib/flink-table-runtime-1.17.2.jar               |
| /opt/flink/lib/log4j-1.2-api-2.17.1.jar                     |
| /opt/flink/lib/log4j-api-2.17.1.jar                         |
| /opt/flink/lib/log4j-core-2.17.1.jar                        |
| /opt/flink/lib/log4j-slf4j-impl-2.17.1.jar                  |
| /opt/flink/lib/flink-dist-1.17.2.jar                        |

### Reference

- [产品概述--实时计算平台Flink版-帮助文档-京东云](https://docs.jdcloud.com/cn/jflink/introduction)