---
title: Data Security
type: framework
tags:
  - type/framework
  - lifecycle/governance
  - ecosystem/standard
date: 2025-09-12
aliases:
  - 数据安全
standard: GB/T 36073-2025
dcmm_version: "2.0"
publish: true
---

> [!abstract] DCMM 能力域 / Capability Domain
> [[DCMM]] 九大能力域之一。数据安全通过合规、防护与审计保障数据处理活动安全可控。

## 定义

识别数据处理活动适用的法律法规和风险，实施与数据重要程度相匹配的管理与技术措施，并通过审计验证控制的有效性。

## 能力边界

- **负责**：数据合规要求、安全风险和数据保护控制。
- **不替代**：组织整体网络安全、信息安全或法律合规体系。

## 能力项 Capability Items

| 能力项                                                                        | 核心目标                                                   |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [[frameworks/dcmm/capability-items/Data Compliance Management\|数据合规管理]] | 识别并落实数据处理活动相关的法律、监管、合同和内部要求     |
| [[frameworks/dcmm/capability-items/Data Security Protection\|数据安全防护]]   | 按分类分级和风险实施访问控制、加密、脱敏、监测与应急等措施 |
| [[frameworks/dcmm/capability-items/Data Security Audit\|数据安全审计]]        | 独立检查制度与控制执行情况，推动问题整改和持续改进         |

## 建设要点

1. 建立适用要求清单并持续跟踪变化。
2. 开展数据分类分级、风险评估和处理活动审查。
3. 将安全控制嵌入采集、存储、使用、共享、流通和销毁环节。
4. 建立日志留存、异常监测、事件响应、审计与整改闭环。

## 典型产出

- 数据合规义务清单与处理活动台账
- 数据分类分级目录和风险评估报告
- 权限矩阵、防护基线、应急预案和事件记录
- 数据安全审计报告与整改跟踪记录

## 自评问题

- 关键数据处理活动是否有合法、明确且可追溯的依据？
- 安全措施是否与数据等级、使用场景和风险相匹配？
- 审计发现是否落实到责任人、期限和复核结果？

## 关联

- 上级框架：[[DCMM]]
- 协同能力域：[[Data Lifecycle]]、[[Data Assets]]、[[Data Application|Data Application and Circulation]]

## 版本说明

GB/T 36073—2025 将 2018 版的“数据安全策略、数据安全管理、数据安全审计”调整为“数据合规管理、数据安全防护、数据安全审计”。

## 参考资料

- [GB/T 36073—2025《数据管理能力成熟度评估模型》](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=22559F9C7BF9EAC6A3927223FE33CE20)
