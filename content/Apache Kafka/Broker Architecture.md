---
title: Broker Architecture
tags:
  - mq
  - distribute
date: 2024-01-25
draft: false
---

## Broker System Overview

A Kafka broker is a server process that handles client requests, stores and replicates messages, and participates in cluster coordination. Each broker runs a set of core components, each implemented as a class or subsystem in the codebase.

![[Broker Architecture.png]]__***High-Level Broker Component Diagram***__

Key code entities:

- BrokerServer (main orchestrator)
- ReplicaManager (partition/replica management)
- LogManager (log storage)
- GroupCoordinator (consumer group management)
- TransactionCoordinator (transactional messaging)
- ShareCoordinator (share group management)
- SocketServer (network I/O)
- KafkaApis (request dispatch)
- KRaftMetadataCache (metadata view)
- ForwardingManager (controller request forwarding)
- SharePartitionManager (share partition state)
- AutoTopicCreationManager (automatic topic creation)
- ClientMetricsManager (client metrics collection)
- AlterPartitionManager (partition state changes)
- BrokerLifecycleManager (broker registration and state)
- GroupConfigManager (group configuration management)
- FetchManager (fetch session management)
- QuotaManagers (quota enforcement)

```
```