---
title: "IMPLEMENTATION"
description: 知识图谱重构的分阶段实施计划
publish: false
draft: true


---

# Bigdata Wiki 重构实施计划

## 当前进度

### ✅ 已完成
- [x] 设计新的目录结构 (00-Strategy 到 09-Practices)
- [x] 创建核心域索引页面
- [x] 更新主 index.md 导航结构
- [x] 建立基础设施技术栈分类

### 🔄 进行中
- [ ] 创建剩余域索引页面
- [ ] 迁移现有页面到新结构
- [ ] 添加双向链接

### 📋 待办
- [ ] 补充缺失的概念页面
- [ ] 统一页面模板
- [ ] 添加架构图和流程图

---

## 目录结构映射

### 现有 → 新结构映射

| 现有路径 | 新位置 | 状态 |
|---------|--------|------|
| `DCMM.md` | `00-Strategy/DCMM.md` | 待迁移 |
| `DCMM中的数据战略.md` | `00-Strategy/` | ✅ 已链接 |
| `Apache Atlas.md` | `01-Governance/` | 待迁移 |
| `Lambda Architecture.md` | `02-Architecture/patterns/` | 待迁移 |
| `what is Kappa Architecture?.md` | `02-Architecture/patterns/` | 待迁移 |
| `Flow-Batch Architecture.md` | `02-Architecture/patterns/` | 待迁移 |
| `Lake-DataWarehouse Architecture.md` | `02-Architecture/patterns/` | 待迁移 |
| `Serverless Architecture.md` | `02-Architecture/patterns/` | 待迁移 |
| `Data Warehouse.md` | `02-Architecture/physical/` | 待迁移 |
| `Data Lake.md` | `02-Architecture/physical/` | 待迁移 |
| `Lakehouse.md` | `02-Architecture/physical/` | 待迁移 |
| `Apache Hadoop/` | `08-Infrastructure/compute/` | 待迁移 |
| `Apache Flink/` | `08-Infrastructure/compute/` | 待迁移 |
| `Apache Hive/` | `08-Infrastructure/compute/` | 待迁移 |
| `What is Apache Kafka?.md` | `08-Infrastructure/integration/` | 待迁移 |
| `Apache Pulsar.md` | `08-Infrastructure/integration/` | 待迁移 |
| `Apache Flume.md` | `08-Infrastructure/integration/` | 待迁移 |
| `Apache Nifi.md` | `08-Infrastructure/integration/` | 待迁移 |
| `Apache Airflow.md` | `08-Infrastructure/scheduling/` | 待迁移 |
| `Apache DolphinScheduler.md` | `08-Infrastructure/scheduling/` | 待迁移 |
| `Apache Paimon.md` | `08-Infrastructure/storage/` | 待迁移 |
| `Data Visual/` | `06-Application/` | 待迁移 |
| `concepts/` | `09-Practices/concepts/` | 待迁移 |

---

## 双向链接检查清单

### 核心概念页面
每个技术页面应包含以下链接区块：

```markdown
## 相关技术
- [[同类技术1]]: 对比说明
- [[相关技术2]]: 集成方式

## 应用场景
- [[场景1相关技术]]
- [[场景2相关技术]]

## 架构关联
- [[所属架构模式]]
- [[上下游技术]]
```

### 跨域链接
- 架构模式 → 技术选型
- 技术组件 → 应用场景
- 概念 → 实现技术
- 最佳实践 → 涉及技术

---

## 优先级任务

### P0 - 核心结构
1. 完成所有域索引页面创建
2. 更新主页导航链接
3. 建立核心技术的双向链接

### P1 - 内容迁移
1. 迁移架构模式页面
2. 迁移计算引擎页面
3. 迁移存储系统页面
4. 迁移数据集成页面

### P2 - 内容完善
1. 补充缺失的概念页面
2. 添加技术对比表格
3. 添加架构流程图

### P3 - 优化提升
1. 统一页面模板
2. 添加更多交叉链接
3. 优化导航路径

---

## 成功指标

- [ ] >90% 页面有双向链接
- [ ] 从任意页面 3 步到达核心页面
- [ ] 覆盖 DCMM 8 大能力域
- [ ] 每个技术页面有对比表格
- [ ] 每个架构页面有技术选型树

---

## 下一步行动

1. **创建剩余域索引**
   - 01-Governance/index.md
   - 03-Standards/index.md
   - 04-Quality/index.md
   - 05-Security/index.md
   - 06-Application/index.md
   - 07-Lifecycle/index.md
   - 09-Practices/index.md

2. **建立核心技术链接**
   - 为每个技术组件添加"相关技术"区块
   - 建立技术对比表格
   - 添加架构关联链接

3. **迁移现有内容**
   - 按映射表迁移页面
   - 更新所有内部链接
   - 验证链接正确性
