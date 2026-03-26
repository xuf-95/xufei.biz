---
title: Kafka Config
tags:
  - kafka
  - config
  - msg
  - dataflow
date: 2024-01-22
draft: true
---

## Broker

| key                         | 服务器默认属性(server.properties)                                                                                                                                                    | value           | 默认  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --- |
| broker.id                   | broker server 的唯一标识,必须唯一, 如果不设置,或者`broker.id`<0 则会自动计算`broker.id`; 相关可以看`broker.id.generation.enable`和 `reserved.broker.max.id` 的配置。                                          | -1              |     |
| reserved.broker.max.id      | `broker.id`能够配置的最大值,同时 `reserved.broker.max.id+1`也是自动创建`broker.id`的最小值。                                                                                                       | 1000            |     |
| broker.id.generation.enable | 允许 server 自动创建`broker.id`。当`broker.id`< 0 并且当前配置是 true,则自动计算`broker.id`，计算逻辑是 `{reserved.broker.max.id} +/brokers/seqid.dataVersion` , 其中的`/brokers/seqid.dataVersion`保证了全局自增 | true            |     |
| log.dir                     | log 数据存放的目录                                                                                                                                                                   | /tmp/kafka-logs |     |
| log.dirs                    | Log 数据存放的目录,比如`/tmp/kafka-logs`. 这个可以用逗号隔开设置多个目录,主要是用来挂载到多个磁盘上的  <br>例如:`/tmp/kafka0,/tmp/kafka1` 。如果没有设置,则使用 `log.dir`的配置                                                    | null            |     |

## Topic

| key                                     | 服务器默认属性(server.properties)              | value                                                                                                                                                                                                   | 默认                  |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| cleanup.policy                          | log.cleanup.policy                      | 此配置指定要在旧日志段使用的保留策略， 可选项[compact, delete]，默认是 delete,表示直接删除旧数据, compact 表示压缩,一个 topic 的一个分区中,只保留最近的某个 key 对应的 value                                                                                      | delete              |
| compression.type                        | compression.type                        | 指定给定 Topic 的最终压缩类型,它不仅可以配置（'gzip'、'snappy'、'lz4'、'zstd'），还可以配置'uncompressed' 不压缩，和'producer' 保留生产者设置的原始压缩格式                                                                                             | producer            |
| delete.retention.ms                     | log.cleaner.delete.retention.ms         | cleanup.policy 在 compact 模式下 , 墓碑消息的保存时间,墓碑消息是 value 为空的消息，当紧缩线程发现了这个消息，那么紧缩线程会把该 Key 之前的消息都紧缩掉只留下了墓碑消息，这条墓碑消息会被保存 delete.retention.ms 的时间然后再被删除                                                        | 86400000（1 天）       |
| file.delete.delay.ms                    | log.segment.delete.delay.ms             | topic 删除被标记为--delete 文件之后延迟多长时间删除该 Log 文件                                                                                                                                                               | 60000（1 分钟）         |
| flush.messages                          | log.flush.interval.messages             | 调用强制写入数据方法(fsync)的间隔。例如，如果将其设置为 1，我们将在每条消息后进行 fsync；如果是 5，我们将在每 5 条消息后进行 fsync。一般来说，我们建议您不要设置此选项并使用复制来提高持久性，并允许操作系统的后台刷新功能，因为它更有效                                                                       | 9223372036854775807 |
| flush.ms                                | log.flush.interval.ms                   | 调用强制写入数据方法(fsync)的时间间隔。例如, 如果将其设置为 1000，我们将在 1000 毫秒后进行 fsync。一般来说，我们建议您不要设置此选项并使用复制来提高持久性，并允许操作系统的后台刷新功能，因为它更有效                                                                                        | 9223372036854775807 |
| follower.replication.throttled.replicas | follower.replication.throttled.replicas | flowwer 副本限流 格式：分区号:副本 follower 号,分区号:副本 follower 号，例如 0:1,1:1 ,或者可以使用通配符“*”来限制该主题的所有副本，更详细内容请看 [分区副本同步限流机制](https://doc.knowstreaming.com/study-kafka/3-config)                                        | ""                  |
| index.interval.bytes                    | log.index.interval.bytes                | 此设置控制 Kafka 将索引消息添加到其偏移索引的频率。默认设置确保我们大约每 4096 个字节索引一条消息。更多的索引允许读取更接近日志中的确切位置，但会使索引更大。您可能不需要更改此设置。                                                                                                       | 4096                |
| leader.replication.throttled.replicas   | leader.replication.throttled.replicas   | leader 副本限流 格式：分区号:副本 Leader 号，或者可以使用通配符“*”来限制该主题的所有副本                                                                                                                                                  | “”                  |
| max.compaction.lag.ms                   | log.cleaner.max.compaction.lag.ms       | 当 cleanup.policy 在 compact 模式下，一条消息从生产后到被紧缩的时间间隔最大值                                                                                                                                                     | 9223372036854775807 |
| min.compaction.lag.ms                   | log.cleaner.min.compaction.lag.ms       | 当 cleanup.policy 在 compact 模式下，一条消息从生产后到被紧缩的时间间隔最小值                                                                                                                                                     | 0                   |
| min.cleanable.dirty.ratio               | log.cleaner.min.cleanable.ratio         | 当 cleanup.policy 在 compact 模式下，此配置控制日志紧缩器尝试清理日志的评论                                                                                                                                                      | 0.5                 |
| max.message.bytes                       | message.max.bytes                       | 最大的 batch 的 message 大小                                                                                                                                                                                  | 1048588             |
| message.downconversion.enable           | log.message.downconversion.enable       | 此配置控制是否启用消息格式的下转换以满足消费请求。当设置为 时 false，Broker 不会为期望旧消息格式的消费者执行下转换。Broker 对 UNSUPPORTED_VERSION 来自这些旧客户端的消费请求做出错误响应。此配置不适用于复制到追随者可能需要的任何消息格式转换。                                                           | true                |
| min.insync.replicas                     | min.insync.replicas                     | 当生产者的 ack 设置为 all 或者-1 的时候，该值表示的是 ISR 的最少数量。如果 ISR 里面的数量少于此值，则消息的写入会抛异常（NotEnoughReplicas 或 NotEnoughReplicasAfterAppend）；ack=all 保证了所有 ISR 都成功写入, 但是如果 ISR 只有一个的话就退变成了 ack=1 的情况了, 如果要保证高可用, 还需要配置此值>1 | 1                   |
| preallocate                             | log.preallocate                         | 创建新的日志段 Segment 是否需要预先分配文件，如果您再 windows 上使用 kafka，您可能需要设置为 true                                                                                                                                         | false               |
| retention.bytes                         | log.retention.bytes                     | 如果我们使用的是`cleanup.policy=delete`策略，此配置控制分区在丢弃旧的日志段 Segment 之前可以增长到的最大大小，默认情况下，没有大小限制，只有时间限制。注意这个配置是控制分区的大小的。不是整个 Topic 所有分区加起来的大小                                                                        | -1                  |
| retention.ms                            | log.retention.ms                        | 如果我们使用的是`cleanup.policy=delete`策略，日志段 Segment 能够保留的最长时间。只要日志段最近一条消息写入的时间距离当前时间超过了这个值，则该日志段将会被删除，如果设置为-1，则不应用时间限制                                                                                        | 604800000（7 天）      |
| segment.bytes                           | log.segment.bytes                       | 每个日志段 Segment 的最大大小，该值越大，那么 Segment 数量就越小。                                                                                                                                                              | 1073741824(1GB)     |
| segment.index.bytes                     | log.index.size.max.bytes                | 索引文件的大小，我们会预先分配这个索引文件并且仅仅在日志滚动后收缩它，一般您不需要更改此值                                                                                                                                                           | 10485760(10MB)      |
| segment.jitter.ms                       | log.roll.jitter.ms                      | 从计划的段滚动时间中减去的最大随机抖动，以避免雷鸣般的段滚动群                                                                                                                                                                         | 0                   |
| segment.ms                              | log.roll.ms                             | 此配置控制 Kafka 将强制日志滚动的时间段，即使段文件未满，以确保保留可以删除或压缩旧数据。                                                                                                                                                        | 604800000（7 天）      |
| unclean.leader.election.enable          | unclean.leader.election.enable          | 指示是否启用不在 ISR 集中的副本作为最后的选择作为领导者，即使这样做可能会导致数据丢失。                                                                                                                                                          | false               |
## Prodecter
|属性|描述|默认值|
|---|---|---|
|key.serializer|实现 org.apache.kafka.common.serialization.Serializer 接口的键的序列化程序类。||
|value.serializer|org.apache.kafka.common.serialization.Serializer 实现接口的值的序列化程序类。||
|acks|生产者要求 Leader 在决定是否完成请求之前收到的确认数量. 这控制了发送的记录的持久性 可配置的参数如下：  <br>1. `acks=0` 如果为 0, 生产者不会等待服务器的任何确认, 会被立即视为已发送,这种情况下不能保证服务器是否真的已经收到了消息。这个时候`retries`配置不会生效(客户端都不管服务端的返回了,所以客户端一般是不知道有故障的)  <br>2. `acks=1` Leader 会将消息写入到它的本地日志中,但是不会等待所有的 Follower 完全确认就会返回发送成功状态。 这种情况下, 当 Follower 成功同步数据之前 Leader 挂掉了会造成数据丢失。  <br>3.`acks=all` Leader 将等待所有的 ISR 中的副本完成同步之后返回成功状态, 这样子数据就不会丢失,是最高级别的保证。|1|
|bootstrap.servers|用于连接 kafka 集群 初始连接 host/port 列表，此列表仅用于发现集群, 并不强制在这里配置集群所有服务器列表||
|buffer.memory|生产者的消息缓冲区内存大小, 关于缓冲区请看[图解 Kafka Producer 消息缓存模型](https://doc.knowstreaming.com/study-kafka/3-config)|33554432(32M)|
|compression.type|生产者生成的所有数据的压缩类型。默认值为 none（即不压缩）。有效值为 none、gzip、snappy、lz4 或 zstd。|none|
|retries|生产者重试次数,当`max.in.flight.requests.per.connection>1`的情况发生重试可能会导致顺序问题.|2147483647|
|batch.size|每当多个记录被发送到同一个分区的时候,生产者会尝试将消息放到一个 Batch 里面处理减少请求数。这个配置就是控制一个 Batch 的内存大小。具体请看[多图详解 kafka 生产者消息发送过程](https://blog.csdn.net/u010634066/article/details/120887135)|16384|
|client.dns.lookup|控制客户端如何使用 DNS 查找。如果设置为 use_all_dns_ips，则依次连接到每个返回的 IP 地址，直到建立成功的连接。断开连接后，使用下一个 IP。一旦所有 IP 都被使用过一次，客户端会再次从主机名解析 IP（但是，JVM 和操作系统都会缓存 DNS 名称查找）。如果设置为 resolve_canonical_bootstrap_servers_only，则将每个引导地址解析为规范名称列表。在引导阶段之后，它的行为与 use_all_dns_ips. 如果设置为 default（不推荐使用），则尝试连接到查找返回的第一个 IP 地址，即使查找返回多个 IP 地址也是如此。|use_all_dns_ips|
|client.id|生产者客户端 ID||
|connections.max.idle.ms|在此配置指定的毫秒数后关闭空闲连接|540000 (9 minutes)|
|delivery.timeout.ms|最大交付时间, 调用 send()方法后不管是成功还是失败的时间上限。例如重试太多次之后达到次配置时间的时候也会停止重试了。此配置值应该大于等于`request.timeout.ms` 和`linger.ms`总和|120000 (2 minutes). 如果这个值你没有主动设置并且`request.timeout.ms` +`linger.ms` > 120000(默认值) ,那么它最终的值是`request.timeout.ms` +`linger.ms`|
|linger.ms|kafka 生产者会在 Batch 填满或 linger.ms 达到上限时把批次发送出去|0|
|max.block.ms|生产者发送消息过程中,获取元信息的最大超时时间|60000 (1 minute)|
|max.request.size|请求的最大大小（以字节为单位）。此设置将限制生产者在单个请求中发送的记录批次的总数据量，以避免发送大量请求。这实际上也是最大未压缩记录批量大小的上限。请注意，服务器对记录批量大小有自己的上限（如果启用压缩，则在压缩之后），这可能与此不同。|1048576|
|retries|生产者重试次数,当`max.in.flight.requests.per.connection>1`的情况发生重试可能会导致顺序问题.|1048576|
|partitioner.class|生产者分区分配策略, 详情请看:[Kafka 中生产消息时的三种分区分配策略](https://doc.knowstreaming.com/study-kafka/3-config)|org.apache.kafka.clients.producer.internals.DefaultPartitioner|
|receive.buffer.bytes|读取数据时使用的 TCP 接收缓冲区 (SO_RCVBUF) 的大小。如果值为 -1，将使用操作系统默认值。|32768 (32 kb)|
|request.timeout.ms|控制客户端等待请求响应的最长时间。如果在超时之前没有收到响应，客户端将在必要时重新发送请求，或者如果重试次数用尽，则请求失败|30000 (30 seconds)|
|security.protocol||PLAINTEXT|
|send.buffer.bytes|发送数据时使用的 TCP 发送缓冲区 (SO_SNDBUF) 的大小。如果值为 -1，将使用操作系统默认值。|131072 (128 kb)|
|socket.connection.setup.timeout.max.ms|客户端等待建立套接字连接的最长时间。对于每个连续的连接失败，连接设置超时将成倍增加，直至达到此最大值。为避免连接风暴，将对超时应用 0.2 的随机化因子，从而产生低于计算值 20% 到高于 20% 的随机范围。|127000 (127 seconds)|
|socket.connection.setup.timeout.ms|客户端等待套接字连接建立的时间。如果在超时之前没有建立连接，客户端将关闭套接字通道。|10000 (10 seconds)|
|enable.idempotence|是否启动幂等。当设置为 true 时候, 生产者将确保每条消息被最多写入一个副本,如果未 false,生产者由于 Broker 失败等原因重试,可能会写入到多个副本中。注意：启动幂等性的要求`max.in.flight.requests.per.connection<=5` `retries>0`并且 `acks=all` .如果设置了不兼容的值则会抛出异常|false|
|interceptor.classes|生产者拦截器配置,填写全路径类名,可用逗号隔开配置多个,执行顺序就是配置的顺序。||
|max.in.flight.requests.per.connection|客户端能够允许的最大未完成请求(在请求中)的请求数量, 如果该值大于 1, 并且请求发送失败可可能导致消息重排序的风险(如果重试启用的话)|5|
|metadata.max.age.ms|即使我们没有看到任何分区领导层更改以主动发现任何新代理或分区，我们也强制刷新元数据的时间段（以毫秒为单位）|300000 (5 minutes)|
|metadata.max.idle.ms|Topic 的最大空闲时间. 如果一个主题在这么多毫秒内没有被访问过，它就会从缓存中删除。并且下一次对其的访问将强制执行元数据获取请求。|300000 (5 minutes)|
|reconnect.backoff.max.ms|重新连接到反复连接失败的代理时等待的最长时间（以毫秒为单位）。如果提供，每台主机的退避将在每次连续连接失败时呈指数增长，直至达到此最大值。在计算回退增加后，添加 20% 的随机抖动以避免连接风暴。|1000 (1 second)|
|reconnect.backoff.ms|在尝试重新连接到给定主机之前等待的基本时间量。这避免了在紧密循环中重复连接到主机。此退避适用于客户端到代理的所有连接尝试|50|
|retry.backoff.ms|在尝试重试对给定主题分区的失败请求之前等待的时间量。这避免了在某些故障情况下在紧密循环中重复发送请求。|100|

## Consumer
| 属性                            | 描述                                                                                                                                                                                                                                                                                                                                                                                   | 默认                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| key.deserializer              | 实现 org.apache.kafka.common.serialization.Deserializer 接口的键的反序列化器类                                                                                                                                                                                                                                                                                                                    |                                                 |
| value.deserializer            | 实现 org.apache.kafka.common.serialization.Deserializer 接口的值的反序列化器类。                                                                                                                                                                                                                                                                                                                   |                                                 |
| bootstrap.servers             | 用于建立与 Kafka 集群的初始连接的主机/端口对列表。客户端将使用所有服务器，无论此处指定哪些服务器进行引导——此列表仅影响用于发现完整服务器集的初始主机                                                                                                                                                                                                                                                                                                      |                                                 |
| fetch.min.bytes               | 服务器应为获取请求返回的最小数据量。如果可用数据不足，则请求将在响应请求之前等待累积那么多数据。1 字节的默认设置意味着只要有一个字节的数据可用或获取请求超时等待数据到达，就会响应获取请求。将此设置为大于 1 的值将导致服务器等待大量数据累积，这可以以一些额外的延迟为代价提高服务器吞吐量。                                                                                                                                                                                                                                    | 1                                               |
| group.id                      | 标识此消费者所属的消费者组的唯一字符串。                                                                                                                                                                                                                                                                                                                                                                 |                                                 |
| heartbeat.interval.ms         | 使用 Kafka 的 Group 管理设施时，与消费者协调器之间的心跳间隔时间。心跳用于确保消费者的会话保持活跃，并在新消费者加入或离开组时促进重新平衡。该值必须设置为低于 1`session.timeout.ms`，但通常应设置为不高于该值的 1/3。它可以调整得更低，以控制正常重新平衡的预期时间。                                                                                                                                                                                                                              | 3000（3 秒）                                       |
| max.partition.fetch.bytes     | 服务器将返回的每个分区的最大数据量。记录由消费者分批获取。如果 fetch 的第一个非空分区中的第一个记录批大于此限制，则该批仍将返回以确保消费者可以进行。代理接受的最大记录批量大小是通过 message.max.bytes（代理配置）或 max.message.bytes（主题配置）定义的。有关限制消费者请求大小的信息，请参阅 fetch.max.bytes                                                                                                                                                                                                | 1048576（1 MB）                                   |
| session.timeout.ms            | 使用 Kafka 的组管理工具时用于检测客户端故障的超时。客户端定期发送心跳以向代理指示其活跃性。如果在此会话超时到期之前代理未收到任何心跳，则代理将从组中删除此客户端并启动重新平衡。请注意，该值必须在代理配置中由 group.min.session.timeout.ms 和配置的允许范围内 group.max.session.timeout.ms。                                                                                                                                                                                                     | 10000（10 秒）                                     |
| allow.auto.create.topics      | 订阅或分配主题时，允许在代理上自动创建主题。仅当代理允许使用 `auto.create.topics.enable` 代理配置时，才会自动创建订阅的主题。使用早于 0.11.0 的代理时，此配置必须设置为 `false`                                                                                                                                                                                                                                                                       | true                                            |
| auto.offset.reset             | 如果 Kafka 中没有初始偏移量或服务器上不再存在当前偏移量（例如，因为该数据已被删除），可选项：**earliest**：自动将偏移量重置为最早的偏移量 **latest**：自动将偏移量重置为最新的偏移量 **none**：如果没有为消费者组找到先前的偏移量，则向消费者抛出异常 其他任何事情：向消费者抛出异常。                                                                                                                                                                                                                      | latest                                          |
| client.dns.lookup             | 控制客户端如何使用 DNS 查找。如果设置为 use_all_dns_ips，则依次连接到每个返回的 IP 地址，直到建立成功的连接。断开连接后，使用下一个 IP。一旦所有 IP 都被使用过一次，客户端会再次从主机名解析 IP（但是，JVM 和操作系统都会缓存 DNS 名称查找）。如果设置为 resolve_canonical_bootstrap_servers_only，则将每个引导地址解析为规范名称列表。在引导阶段之后，它的行为与 use_all_dns_ips. 如果设置为 default（不推荐使用），则尝试连接到查找返回的第一个 IP 地址，即使查找返回多个 IP 地址也是如此。                                                                           | use_all_dns_ips                                 |
| connections.max.idle.ms       | 在此配置指定的毫秒数后关闭空闲连接。                                                                                                                                                                                                                                                                                                                                                                   | 540000 (9 minutes)                              |
| default.api.timeout.ms        | 指定客户端 API 的超时时间（以毫秒为单位）。此配置用作所有未指定 timeout 参数的客户端操作的默认超时。                                                                                                                                                                                                                                                                                                                            | 60000 (1 minute)                                |
| enable.auto.commit            | 如果为 true，消费者的偏移量将在后台定期提交。                                                                                                                                                                                                                                                                                                                                                            | true                                            |
| exclude.internal.topics       | 是否应从订阅中排除与订阅模式匹配的内部主题。始终可以显式订阅内部主题                                                                                                                                                                                                                                                                                                                                                   | true                                            |
| fetch.max.bytes               | 服务器应为获取请求返回的最大数据量。记录由消费者分批获取，如果获取的第一个非空分区的第一个记录批大于该值，仍然会返回记录批，以确保消费者可以进行。因此，这不是绝对最大值。代理接受的最大记录批量大小是通过 message.max.bytes（代理配置）或 max.message.bytes（主题配置）定义的。请注意，消费者并行执行多个提取。                                                                                                                                                                                                           | 52428800(50MB)                                  |
| group.instance.id             | 最终用户提供的消费者实例的唯一标识符。只允许非空字符串。如果设置，消费者将被视为静态成员，这意味着在任何时候都只允许具有此 ID 的一个实例在消费者组中。这可以与更大的会话超时结合使用，以避免由于暂时不可用（例如进程重新启动）导致的组重新平衡。如果不设置，消费者将作为动态成员加入群组，这是传统的行为                                                                                                                                                                                                                               |                                                 |
| isolation.level               | 控制如何读取以事务方式编写的消息。如果设置为 read_committed，consumer.poll() 将只返回已提交的事务性消息。如果设置为 read_uncommitted（默认值），consumer.poll() 将返回所有消息，甚至是已中止的事务消息。在任一模式下都将无条件返回非事务性消息。消息将始终按偏移顺序返回。因此，在 read_committedmode 下，consumer.poll() 将只返回直到最后一个稳定偏移量 (LSO) 的消息，该偏移量小于第一个打开事务的偏移量。特别是在属于正在进行的交易的消息之后出现的任何消息都将被保留，直到相关交易完成。结果，read_committed 当存在飞行交易时，消费者将无法读取到高水位线。此外，当在 read_committedseekToEnd 方法中将返回 LSO | read_uncommitted                                |
| max.poll.interval.ms          | 使用消费者组管理时调用 poll() 之间的最大延迟。这为消费者在获取更多记录之前可以空闲的时间量设置了上限。如果在此超时到期之前未调用 poll()，则认为消费者失败，组将重新平衡，以便将分区重新分配给另一个成员。对于使用达到此超时的非 null 的消费者 group.instance.id，不会立即重新分配分区。相反，消费者将停止发送心跳，并且分区将在 session.timeout.ms. 这反映了已关闭的静态消费者的行为。                                                                                                                                                            | 300000（5 分钟）                                    |
| max.poll.records              | 在一次 poll() 调用中返回的最大记录数。                                                                                                                                                                                                                                                                                                                                                              | 500                                             |
| partition.assignment.strategy | 支持的分区分配策略的类名称或类类型列表，当使用组管理时，客户端将使用这些策略在消费者实例之间分配分区所有权。除了下面指定的默认类之外，您还可以使用 org.apache.kafka.clients.consumer.RoundRobinAssignor 该类将分区循环分配给消费者。实现该 org.apache.kafka.clients.consumer.ConsumerPartitionAssignor 接口允许您插入自定义分配策略。                                                                                                                                                         | org.apache.kafka.clients.consumer.RangeAssignor |
| receive.buffer.bytes          | 读取数据时使用的 TCP 接收缓冲区 (SO_RCVBUF) 的大小。如果值为 -1，将使用操作系统默认值。                                                                                                                                                                                                                                                                                                                               | 65536（64 千字节）                                   |
| request.timeout.ms            | 配置控制客户端等待请求响应的最长时间。如果在超时之前没有收到响应，客户端将在必要时重新发送请求，或者如果重试次数用尽，则请求失败。                                                                                                                                                                                                                                                                                                                    | 30000（30 秒）                                     |
| security.protocol             | 用于与 Broker 通信的协议。有效值为：PLAINTEXT、SSL、SASL_PLAINTEXT、SASL_SSL。                                                                                                                                                                                                                                                                                                                         | PLAINTEXT                                       |
| auto.commit.interval.ms       | enable.auto.commit 如果设置为 true ，则该值为消费者偏移量自动提交到 Kafka 的频率（以毫秒为单位）                                                                                                                                                                                                                                                                                                                     | 5000 (5 seconds)                                |
| check.crcs                    | 自动检查消费记录的 CRC32。这可确保消息不会发生在线或磁盘损坏。此检查会增加一些开销，因此在寻求极端性能的情况下可能会被禁用。                                                                                                                                                                                                                                                                                                                    | true                                            |
| client.id                     | 发出请求时传递给服务器的 id 字符串。这样做的目的是通过允许将逻辑应用程序名称包含在服务器端请求日志中来跟踪请求的来源，而不仅仅是 ip/port。                                                                                                                                                                                                                                                                                                          |                                                 |
| client.rack                   | 此客户端的机架标识符。这可以是任何字符串值，指示此客户端的物理位置。它对应于代理配置“broker.rack”                                                                                                                                                                                                                                                                                                                              |                                                 |
| fetch.max.wait.ms             | 如果没有足够的数据立即满足 fetch.min.bytes 给出的要求，服务器将在响应 fetch 请求之前阻塞的最长时间。                                                                                                                                                                                                                                                                                                                       | 500                                             |
| interceptor.classes           | 用作拦截器的类列表。实现该 org.apache.kafka.clients.consumer.ConsumerInterceptor 接口允许您拦截（并可能改变）消费者收到的记录。默认情况下，没有拦截器。                                                                                                                                                                                                                                                                              |                                                 |
| metadata.max.age.ms           | 即使我们没有看到任何分区领导层更改以主动发现任何新代理或分区，我们也强制刷新元数据的时间段（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                               | 300000（5 分钟）                                    |
| retry.backoff.ms              | 如果上次更新失败,发起重试的间隔时间                                                                                                                                                                                                                                                                                                                                                                   | 100                                             |

## Zookeeper 

```shell
##zookeeper集群的地址，可以是多个，多个之间用逗号分割 hostname1:port1,hostname2:port2,hostname3:port3
zookeeper.connect = localhost:2181

## ZooKeeper的最大超时时间，就是心跳的间隔，若是没有反映，那么认为已经死了，不易过大
zookeeper.session.timeout.ms=6000

## ZooKeeper的连接超时时间
zookeeper.connection.timeout.ms =6000

## ZooKeeper集群中leader和follower之间的同步实际那
zookeeper.sync.time.ms =2000

# 配置的修改其中一部分配置是可以被每个topic自身的配置所代替，例如
## 新增配置
bin/kafka-topics.sh --zookeeper localhost:2181--create --topic my-topic --partitions1--replication-factor1--config max.message.bytes=64000--config flush.messages=1

## 修改配置
bin/kafka-topics.sh --zookeeper localhost:2181--alter --topic my-topic --config max.message.bytes=128000

## 删除配置 
bin/kafka-topics.sh --zookeeper localhost:2181--alter --topic my-topic --deleteConfig max.message.bytes
```


## Table Reference

- [kafka config by Airtable](https://airtable.com/appQdKixEJqhhqGLU/tblwDGm0Db50AM8Cp/viwlM2mfIgOjtCUhx?blocks=hide)
- [Apache Kafka Configuration](https://kafka.apache.org/documentation/#brokerconfigs)
