---
title: "Local File Report Agent"
aliases:
  - File Report Agent
  - 本地文件报告 Agent
tags:
  - ai
  - agent
  - Project
date: 2026-05-19
draft: false
publish: true


---

## 项目目标

做一个最小可运行的 AI Agent 学习项目：

> 读取本地文件，提取摘要，可选调用搜索，生成 Markdown 报告，并保存执行记忆。

这个项目不追求复杂框架，而是把 Agent 最核心的能力跑通：

- Planning：先拆解任务。
- Tool Calling：把读文件、搜索、写报告都当成工具动作。
- Memory：记录步骤、观察结果和产物。
- Verification：生成报告后做最小校验。
- Report：输出可读的 Markdown 结果。

示例代码在：

```bash
examples/local_report_agent/local_report_agent.py
```

## 总体架构

```mermaid
flowchart TB
    User["用户目标"] --> Agent["FileReportAgent"]

    Agent --> Planner["Planner<br/>生成执行计划"]
    Agent --> Memory["AgentMemory<br/>记录步骤 / 观察 / 产物"]
    Agent --> Tools["Tool Layer"]

    Tools --> ReadFile["read_files<br/>读取本地文件"]
    Tools --> Summarize["summarize_documents<br/>摘要与关键词"]
    Tools --> Search["search_web<br/>可选网页搜索"]
    Tools --> WriteReport["write_report<br/>写入 Markdown"]
    Tools --> Verify["verify_report<br/>校验报告结构"]

    ReadFile --> Memory
    Summarize --> Memory
    Search --> Memory
    WriteReport --> Report["report.md"]
    Verify --> Memory

    Memory --> MemoryFile["memory.json"]
    Report --> User
```

## 执行流程

```mermaid
flowchart TD
    Start["输入目标与文件路径"] --> Plan["生成计划"]
    Plan --> Read["读取本地文件"]
    Read --> Summarize["抽取摘要 / 关键词 / 统计信息"]
    Summarize --> SearchCheck{"是否提供搜索 Query？"}

    SearchCheck -- "是" --> Search["调用 DuckDuckGo Instant Answer API"]
    SearchCheck -- "否" --> Report["生成 Markdown 报告"]

    Search --> Report
    Report --> Verify["校验报告必要章节"]
    Verify --> Pass{"是否通过？"}

    Pass -- "是" --> Persist["保存 memory.json"]
    Pass -- "否" --> Error["抛出错误并停止"]

    Persist --> Done["输出 report.md"]
```

## 数据链路

```mermaid
flowchart LR
    Files["本地 Markdown / TXT 文件"] --> Reader["File Reader"]
    Reader --> RawText["原始文本"]
    RawText --> Summary["摘要器"]
    RawText --> Keywords["关键词提取"]

    Query["可选搜索 Query"] --> WebSearch["Web Search Tool"]
    WebSearch --> WebObservations["搜索观察结果"]

    Summary --> ReportBuilder["Report Builder"]
    Keywords --> ReportBuilder
    WebObservations --> ReportBuilder

    ReportBuilder --> Markdown["Markdown Report"]
    AgentSteps["执行步骤"] --> Memory["Memory JSON"]
    Markdown --> Verifier["Verifier"]
    Verifier --> Memory
```

## 如何运行

只跑本地文件总结：

```bash
python3 examples/local_report_agent/local_report_agent.py \
  examples/local_report_agent/sample.md \
  --no-search
```

带搜索补充：

```bash
python3 examples/local_report_agent/local_report_agent.py \
  examples/local_report_agent/sample.md \
  --query "AI Agent tool calling memory planning"
```

默认输出：

```text
examples/local_report_agent/out/report.md
examples/local_report_agent/out/memory.json
```

## 代码结构

```mermaid
flowchart TB
    Main["main / argparse"] --> Agent["FileReportAgent.run"]
    Agent --> Plan["plan"]
    Agent --> Read["read_files"]
    Agent --> Summarize["summarize_documents"]
    Agent --> Search["search_web"]
    Agent --> Generate["generate_report"]
    Agent --> Verify["verify_report"]
    Agent --> Persist["write_memory"]

    Summarize --> Helpers["tokenize / extract_keywords / summarize_text"]
    Generate --> Memory["AgentMemory.steps"]
    Persist --> Json["memory.json"]
```

## 可以继续扩展的方向

- 把 `summarize_text` 替换成真实 LLM 调用。
- 把工具注册表抽出来，改成 `tool_name + arguments` 的统一调用协议。
- 把 `memory.json` 换成 SQLite 或向量数据库。
- 给报告增加引用、置信度和失败重试记录。
- 增加测试：验证空文件、中文文件、多文件、搜索失败等场景。
