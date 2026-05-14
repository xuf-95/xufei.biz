---
title: Bigdata Wiki 图谱设计方案
description: 基于 DCMM 和 DAMA 框架的知识图谱设计
publish: false
---

# Bigdata Wiki 图谱设计方案

## 设计原则

基于以下框架和参考：
- **DCMM**: 8 大能力域 + 28 个过程域
- **DAMA-DMBOK**: 10 个数据管理知识领域
- **Data Engineering Vault**: 1000+ 互联概念的知识图谱模式
- **FFA 2024**: 实时湖仓最佳实践

---

## 总体架构

```
bigdata/
├── 00-Strategy/          # 数据战略
├── 01-Governance/        # 数据治理  
├── 02-Architecture/      # 数据架构
├── 03-Standards/         # 数据标准
├── 04-Quality/           # 数据质量
├── 05-Security/          # 数据安全
├── 06-Application/       # 数据应用
├── 07-Lifecycle/         # 数据生存周期
├── 08-Infrastructure/    # 技术基础设施
└── 09-Practices/         # 最佳实践
```

---

## 域结构详解

### 00-Strategy (数据战略)
- 数据战略规划
- 组织与角色
- 投资与ROI
- [[DCMM中的数据战略]]

### 01-Governance (数据治理)
- 治理框架
- 数据所有权
- 数据管家
- [[Apache Atlas]] (元数据管理)

### 02-Architecture (数据架构)

#### 架构模式
- [[Lambda Architecture]]
- [[what is Kappa Architecture?]]
- [[Flow-Batch Architecture]]
- [[Lake-DataWarehouse Architecture]]
- [[Serverless Architecture]]

#### 逻辑架构
- 数据建模
- 维度建模
- 3NF vs 星型模式

#### 物理架构
- [[Data Warehouse]]
- [[Data Lake]]
- [[Lakehouse]]

### 03-Standards (数据标准)
- 业务术语
- 主数据管理
- 参考数据
- 数据元
- 指标定义

### 04-Quality (数据质量)
- 质量维度
- 质量评估
- 质量规则
- 质量监控

### 05-Security (数据安全)
- 访问控制
- 数据加密
- 数据脱敏
- 合规管理

### 06-Application (数据应用)
- BI分析
- 数据服务
- [[Data Visual]]
- 自助分析

### 07-Lifecycle (数据生存周期)
- 数据采集
- 数据存储
- 数据处理
- 数据归档
- 数据销毁

### 08-Infrastructure (技术基础设施)

#### 计算引擎
- [[Apache Hadoop]]
- [[Apache Spark Overview]]
- [[Apache Flink]]
- [[What is Apache Storm?]]

#### 存储系统
- [[Data Store]]
- [[Apache Paimon]]

#### 数据集成
- [[What is Apache Kafka?]]
- [[Apache Pulsar]]
- [[Apache Flume]]
- [[Apache Nifi]]

#### 调度系统
- [[Apache Airflow]]
- [[Apache DolphinScheduler]]

#### 治理工具
- [[Apache Atlas]]

### 09-Practices (最佳实践)
- [[Docker Deploy Bigdata Cluster]]
- 实时湖仓实践
- [[Data indicator system build]]

---

## 双向链接模式

### 模式 1: 层级导航
```markdown
## 父页面
### 子主题
- [[子页面1]]
- [[子页面2]]

## 子页面
### 导航
🔙 [[../|返回上级]]
```

### 模式 2: 相关概念
```markdown
## 相关概念
- [[概念A]]: 关系描述
- [[概念B]]: 关系描述
```

### 模式 3: 技术对比
```markdown
| 特性 | [[Flink]] | [[Spark]] |
|------|-----------|----------|
| 延迟 | 低 | 中 |
```

### 模式 4: 流程关联
```markdown
## 数据流程
[[数据源]] → [[CDC]] → [[Kafka]] → [[Flink]] → [[数据湖仓]]
```

---

## 页面模板

### 技术组件页面模板
```markdown
---
title: 组件名称
tags: [技术类别, 子类别]
aliases: [别名]
related: [相关组件1, 相关组件2]
publish: true
---

## 概述
[组件定义和核心价值]

## 核心特性
- 特性1
- 特性2

## 架构
[架构图和说明]

## 应用场景
- 场景1 → [[相关技术]]
- 场景2 → [[相关技术]]

## 与其他技术对比
| 对比项 | 本技术 | [[技术A]] | [[技术B]] |
|--------|--------|----------|----------|
| 维度1 | 值 | 值 | 值 |

## 最佳实践
- 实践1
- 实践2

## 参考资料
- [官方文档](链接)
- [[相关概念]]

## 相关页面
- [[上级分类]]
- [[相关技术1]]
- [[相关技术2]]
```

### 概念页面模板
```markdown
---
title: 概念名称
tags: [concept, 领域]
related: [相关概念]
publish: true
---

## 定义
[概念定义]

## 背景
[为什么需要这个概念]

## 核心要素
- 要素1 → [[相关技术]]
- 要素2 → [[相关技术]]

## 应用场景
- 场景1
- 场景2

## 延伸阅读
- [[深入概念1]]
- [[深入概念2]]

## 相关链接
- [[上级概念]]
- [[同级概念]]
- [[下级概念]]
```

---

## 实施计划

### Phase 1: 结构重组
1. 创建新的目录结构
2. 迁移现有页面到新位置
3. 更新所有内部链接

### Phase 2: 链接优化
1. 为每个页面添加"相关页面"区块
2. 建立交叉引用链接
3. 添加返回导航链接

### Phase 3: 内容完善
1. 补充缺失的概念页面
2. 统一页面模板
3. 添加架构图和流程图

### Phase 4: 持续维护
1. 定期审查孤立页面
2. 更新过时链接
3. 补充新内容

---

## 成功指标

- **连接度**: >90% 页面有双向链接
- **可达性**: 从任意页面 3 步内到达核心页面
- **完整性**: 覆盖 DCMM 8 大域
- **可维护性**: 新页面可快速集成到图谱
