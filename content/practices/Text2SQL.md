---
title: Text2SQL
type: practice
tags:
  - type/practice
  - ecosystem/ai
  - agentic
  - semantic-layer
aliases:
  - Text to SQL
  - 自然语言转 SQL
  - NL2SQL
description: Text2SQL 让用户用自然语言生成 SQL，但必须依赖语义层、指标口径、权限和质量约束才能可靠落地。
date: 2026-06-14
publish: true
dcmm_domain: 数据应用流通
dama_area:
  - Data Warehousing and BI
  - Metadata Management
cdo_value: 降低数据查询门槛，同时保留指标一致性和安全治理边界。
status: growing
---

## Definition

**Text2SQL** 是将自然语言问题转换为可执行 SQL 查询的能力。它是 ChatBI、数据分析助手和 Data Agent 的核心模块。

Text2SQL 的难度不在 SQL 语法——frontier 模型在简单 schema 上的语法正确率已经很高——而在**业务语义对齐**：模型必须理解「月活跃用户」背后的口径定义、应该 JOIN 哪张表、用哪个日期字段过滤、对哪些维度做聚合。语法正确但口径错误的 SQL，比报错更危险，因为它返回的数字"看起来合理"。

## Business Value

- **降低取数门槛**：业务用户无需掌握 SQL 即可完成探索分析，减少对数据分析师的排队依赖。
- **提升开发效率**：即使对分析师和工程师，自然语言也可以加速 SQL 初稿编写，特别是面对不熟悉的 schema 时。
- **口径一致性**：与 [[Semantic Layer]]、[[Indicator System]]、[[Metrics Governance]] 结合后，模型生成的 SQL 被约束在已定义的指标口径内，而非凭 schema 自由发挥。
- **审计与可追溯**：生成的 SQL 可留痕，配合权限校验和 [[Metadata Management]]，形成可审计的查询通道。

## Architecture / Flow

一个生产级 Text2SQL 系统通常包含五个阶段：

```mermaid
flowchart LR
  A["User Question"] --> B["Schema Linking"]
  B --> C["Semantic Context\nInjection"]
  C --> D["SQL Generation\n(+ Few-shot)"]
  D --> E["Validation &\nSelf-Correction"]
  E --> F["Result + Explanation"]
```

### Schema Linking

Schema Linking 是将自然语言中的实体映射到数据库的表和列。可以类比为"翻译前先查字典"——先确定用户说的"订单日期"对应 `orders.created_at` 还是 `orders.shipped_at`，再动手写 SQL。

常见做法：

- **列举候选再裁剪**：先把完整 schema 提供给模型做初筛，识别相关表和列，再用裁剪后的 schema 生成 SQL。PET-SQL 提出用"先生成草稿 SQL → 反向提取涉及的表列"来做 schema linking。
- **Embedding 检索**：对表名、列名、列注释做 embedding，用户问题做向量检索召回 top-k 相关列。适合 schema 很大（数百张表）的场景。
- **缩写与别名映射**：建立业务术语 → 物理列名的映射字典（如"GMV" → `order_fact.gross_merchandise_value`），避免模型猜测或幻觉列名。

### Semantic Context Injection

裸 schema 不够。模型还需要：

- **指标口径定义**：从 [[Semantic Layer]] 或 [[Indicator System]] 拉取指标的计算公式、过滤条件和粒度约束。
- **值枚举**：对 `status` 等枚举字段告诉模型合法取值（如 `'active'`, `'churned'`），避免模型编造过滤值。
- **业务规则**：如"退款订单不计入 GMV"、"测试账号需排除"。
- **Few-shot 示例**：DIN-SQL 和 DAIL-SQL 证明，精选的 few-shot 示例（问题+SQL 对）能大幅提升准确率。DAIL-SQL 进一步提出动态选择与当前问题最相似的示例，兼顾质量和 token 量。

### SQL Generation

主流生成策略：

- **单次生成**：直接 prompt → SQL。简单快速，适合低复杂度查询。
- **分解生成（Decomposition）**：将复杂问题拆解为子问题，分别生成子查询再组装。DIN-SQL 将任务分为 schema linking → 问题分解 → SQL 生成 → 自我修正四个模块。
- **多候选 + 投票（Self-Consistency）**：生成 N 条候选 SQL，执行后对比结果，取一致性最高的输出。

### Validation & Self-Correction

生成的 SQL 不能直接执行——需要经过验证循环，类似于代码生成后的"编译 + 单测"：

- **语法校验**：dry-run 或 EXPLAIN，捕获语法和类型错误。
- **执行反馈修正**：运行 SQL，若报错则将错误信息回传模型重新生成。SQL-of-Thought 引入了基于错误分类（taxonomy-guided）的修正策略，而非简单重试，在 Spider 上达到 91.59% 执行准确率。
- **结果合理性检查**：返回结果为空、行数异常、数值量级不合理时触发告警或二次确认。
- **权限与安全**：校验查询是否越权访问字段或表，拦截写操作（DELETE/UPDATE/DROP）。

## Benchmark & Accuracy Landscape

| Benchmark | 特点 | SOTA（2025） |
|-----------|------|-------------|
| Spider 1.0 | 200+ 数据库，学术标准 | ~91% 执行准确率（SQL-of-Thought） |
| BIRD | 强调 schema 细节与外部知识 | ~72% 执行准确率（Arctic-Text2SQL-R1-32B） |
| Spider 2.0 | 企业级复杂 schema（平均~800 列），多步骤 | ~21% 成功率 |

关键观察：Spider 1.0 的高分容易造成"已经解决"的错觉。BIRD 和 Spider 2.0 更贴近真实场景——schema 复杂度一上来，准确率断崖式下降。这也是为什么生产系统不能只靠模型，必须叠加 Semantic Layer 和 Schema Linking。

## Semantic Layer 的作用

2026 年的基准测试表明，在已建模的数据域上，Semantic Layer 路径的准确率显著高于裸 Text2SQL：Claude Sonnet 从 90.0%（裸 text-to-SQL）提升到 98.2%（经 semantic layer）。更重要的区别在于**失败模式**：

- Semantic Layer 的失败通常是**拒绝回答**（"该问题不在已建模范围内"）——安全的失败。
- 裸 Text2SQL 的失败通常是**自信地返回错误数字**——危险的失败。

生产建议：用 Text2SQL 做探索和灵活查询，用 Semantic Layer 做需要口径确定性的指标查询，二者互补而非替代。

## Agentic Text2SQL

2025 年以来，Text2SQL 从"单次 prompt → SQL"演进为 **Agentic 多步骤工作流**，可以类比为从"直接翻译"变成"带反复校对的翻译流程"：

- **多 Agent 协作**：MAC-SQL 和 SQLFixAgent 使用多个 Agent（decomposer / generator / validator / corrector）协作完成生成和修正。
- **执行反馈循环**：Agent 执行候选 SQL，观察错误或空结果集，基于反馈重写查询。SIRIUS-SQL 在多候选生成的基础上引入执行反馈锚定。
- **工具调用**：Agent 可以调用 schema 查询工具、数据字典 API、示例数据采样等辅助工具来补充上下文，而非依赖一次性 prompt 注入所有信息。
- **多轮澄清**：对模糊问题（如"最近的销售数据"——最近是多久？哪个产品线？），Agent 先向用户提问澄清口径，再生成 SQL。

## Commercial Practice

Text2SQL 上线应从受控场景开始，逐步扩大：

1. **限定数据域**：先在一个已充分建模的 subject area（如订单域、用户域）上线，而非开放全库。
2. **限定指标集合**：初期只允许查询已定义指标，对未建模问题返回"暂不支持"而非勉强生成。
3. **只读权限**：Text2SQL 连接的数据库账号必须是只读的，且通过视图屏蔽敏感字段。
4. **SQL 解释与引用**：返回结果时附带生成的 SQL 和引用的指标定义，让用户可验证。
5. **人工确认机制**：对关键业务指标查询，要求用户确认 SQL 后再执行，或提供"结果校验"功能。
6. **渐进开放**：积累查询日志和修正记录，用于 few-shot 示例和微调，逐步扩展可查询范围。

## Common Pitfalls

### 1. 裸 Schema 幻觉

只把数据库 DDL 丢给模型，缺少业务语义。模型会编造列名（hallucinate column names）、猜错 JOIN 关系、用错过滤字段。研究表明，在 35 张表规模的 schema 上，裸 Text2SQL 产生大量"沉默错误"——语法正确但结果错误。

### 2. 过滤条件错误（WRONG_FILTER）

这是最常见的失败模式，占失败案例的 54.6%。典型场景：用户说"已完成的订单"，模型过滤 `status = 'completed'` 但实际值是 `status = 'done'`。解法：在 prompt 中注入枚举值或通过 schema 注释暴露合法取值。

### 3. 不做权限校验

生成的 SQL 可能查询到用户无权访问的字段（如薪资、PII），必须在执行前做字段级权限校验。

### 4. 缺少执行前验证

直接执行生成的 SQL，没有 dry-run、结果合理性检查或人工确认。一条意外的全表扫描可能拖垮生产库。

### 5. Demo 与生产的鸿沟

3-5 张表的 demo 效果很好，但搬到企业级 schema（数百张表、上千列）时准确率骤降。Spider 2.0 的 21% 成功率说明了这个差距。

## Interview Answer

Text2SQL 的难点不在 SQL 语法生成——frontier 模型在 Spider 1.0 上已经做到 90%+ 准确率。真正的难点在三个层面：一是 **Schema Linking**，如何在大规模 schema 中精准定位相关表列；二是**业务语义对齐**，模型必须知道指标口径、枚举值、业务规则，否则会生成语法正确但口径错误的 SQL；三是**生产工程**，包括权限校验、执行验证、结果解释和 self-correction 循环。真实落地的路径是：先建好 [[Semantic Layer]] 和 [[Indicator System]]，在受控数据域上线，配合 few-shot 示例和执行反馈循环逐步扩展，而非试图用一个大模型直连全库。

## Links

- depends-on:: [[Semantic Layer]]
- depends-on:: [[Metrics Governance]]
- depends-on:: [[Metadata Management]]
- depends-on:: [[Indicator System]]
- related:: [[Data Agent Architecture]]
