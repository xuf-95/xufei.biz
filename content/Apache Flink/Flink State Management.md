---
date: 2022-01-09
aliases:
tags:
  - flink
  - Real-time
description:
draft: true
publishDate: 2025-09-26T11:51
---
## Checking Pointing

### Core Components

#### CheckpointCoordinator
| Responsibility          | Implementation                                           |
| ----------------------- | -------------------------------------------------------- |
| Trigger Management      | `triggerCheckpoint()`, `startCheckpointScheduler()`      |
| Acknowledgment Handling | `receiveAcknowledgeMessage()`, `receiveDeclineMessage()` |
| State Management        | `pendingCheckpoints`, `completedCheckpointStore`         |
| Failure Handling        | `abortPendingCheckpoints()`, `CheckpointFailureManager`  |
| Periodic Scheduling     | `ScheduledTrigger`, `currentPeriodicTrigger`             |
|                         |                                                          |

#### PendingCheckpoint

#### CheckpointPlan and Planning
| Component                         | Purpose                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `DefaultCheckpointPlanCalculator` | Calculates which tasks to trigger/wait for                  |
| `CheckpointPlan`                  | Contains lists of tasks to trigger, wait for, and commit to |
| `VertexFinishedStateChecker`      | Handles checkpointing with finished tasks                   |
|                                   |                                                             |

## State Persistence

### Checkpointing 

### Unaligned Checkpointing

### State Backends

### Exactly Once VS At Least Once

## References

- [有状态流处理 \| Apache Flink](https://nightlies.apache.org/flink/flink-docs-release-2.1/zh/docs/concepts/stateful-stream-processing/)
- 