---
title: "Dinky"
aliases:
  - dinky-platform
  - apache-dinky
  - dinky-ide
description: Apache Dinky - 开源实时计算平台，基于Apache Flink构建的一站式实时数据开发、部署和运维平台
tags:
  - flink
  - real-time
  - data-platform
  - ide
  - streaming
date: 2024-01-09
publishDate: 2026-05-18T16:45
draft: false
publish: true


---

# Dinky - Apache Flink 实时计算平台

**Dinky** 是基于 Apache Flink 内核构建的开源实时计算平台，提供实时应用的作业开发、数据调试及运行监控能力，助力企业实现高效实时数据开发、部署和运维。

## 核心特性

### 1. 流批一体架构
- **Flink 内核驱动**: 基于 Apache Flink 作为计算引擎，支持流批一体化处理
- **数据湖仓融合**: 支持数据湖架构的流批一体化处理能力
- **框架扩展性**: 可连接多种 OLAP 框架和数据湖系统

### 2. 全功能开发体验
#### Flink SQL 开发
- **敏捷开发**: 提供完整的 Flink SQL 开发体验
- **智能提示**: 语法自动补全和代码智能提示
- **可视化调试**: 实时数据流调试和可视化展示
- **SQL 优化**: 智能查询优化和性能分析

#### Flink Jar 开发
- **传统开发**: 支持传统的 Flink Jar 包开发模式
- **混合开发**: SQL + Jar 混合开发模式
- **依赖管理**: 自动化的依赖包管理和版本控制
- **代码质量**: 代码质量检测和性能分析

### 3. 部署与运维
#### 一站式平台
- **作业管理**: 完整的作业生命周期管理
- **实时监控**: 实时作业监控和告警机制
- **日志管理**: 集中化的日志收集和分析
- **性能监控**: 作业性能指标监控和分析

#### 多环境支持
- **本地开发**: 开发环境快速搭建和调试
- **生产部署**: 生产环境一键部署和运维
- **云原生**: 容器化部署和微服务架构支持

### 4. 集成能力
#### 生态集成
- **OLAP 集成**: 支持多种 OLAP 框架（ClickHouse, Doris, StarRocks 等）
- **数据湖**: 支持数据湖架构（Hudi, Iceberg, Delta Lake 等）
- **CDC 支持**: 完整的 CDC 数据同步能力
- **消息队列**: 集成主流消息队列系统

#### 外部系统对接
- **数据库**: 支持多种数据库的实时同步
- **存储系统**: 支持多种存储系统的数据读写
- **监控告警**: 集成监控系统进行告警
- **权限管理**: 完整的用户权限管理

## 架构设计

### 整体架构
```
┌─────────────────────────────────────┐
│           用户界面 (Web UI)           │
├─────────────────────────────────────┤
│          核心服务层                   │
│  ├─────────┬─────────┬─────────┬────┤
│  │ 作业管理 │ 实时调试 │ 监控告警 │  │
│  │  部署    │  运行    │  分析    │  │
│  └─────────┴─────────┴─────────┴────┤
├─────────────────────────────────────┤
│            引擎服务层                 │
│  ┌─────────┬─────────┬─────────┬────┤
│  │ Flink   │ 集群管理 │ 资源调度 │  │
│  │  SQL    │   集群   │   管理   │  │
│  └─────────┴─────────┴─────────┴────┤
├─────────────────────────────────────┤
│            数据存储层                 │
│  ┌─────────┬─────────┬─────────┬────┤
│  │  元数据  │  作业信息 │ 日志数据 │  │
│  │  管理    │   存储   │   存储   │  │
│  └─────────┴─────────┴─────────┴────┤
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 前端组件
- **开发界面**: 基于 Web 的图形化开发界面
- **监控面板**: 实时作业监控面板
- **配置管理**: 可视化配置管理界面
- **权限控制**: 用户角色和权限管理界面

#### 2. 后端组件
- **作业管理服务**: 作业提交、停止、重启等操作
- **任务调度服务**: 任务调度和资源分配
- **监控分析服务**: 性能监控和数据分析
- **元数据服务**: 元数据管理和版本控制

#### 3. 引擎集成
- **Flink 集成**: Flink 作业管理和执行
- **Kubernetes 集成**: K8s 环境下的 Flink 运行
- **集群管理**: 多集群管理和负载均衡
- **资源管理**: 资源分配和性能优化

## 部署方式

### 1. 本地部署
```bash
# 1. 创建数据库
mysql -u root -p < sql/dinky-mysql.sql

# 2. 配置 application.yml
# 修改数据库连接信息

# 3. 启动服务
./bin/dinky-all.sh
```

### 2. Docker 部署
```bash
# 单机部署
docker run -d -p 8888:8888 --name dinky-server dinky/dinky:latest

# Docker Compose 部署
docker-compose up -d
```

### 3. Kubernetes 部署
```bash
# 1. 安装 Helm
helm install dinky ./helm-chart/dinky/

# 2. 或使用 Kubectl
kubectl apply -f k8s/dinky-deployment.yaml
```

### 4. 集群部署
- 支持多节点集群部署
- 支持 HA 高可用部署
- 支持负载均衡和故障转移

## 开发功能

### 1. Flink SQL 开发
```sql
-- 示例：实时数据统计
CREATE TABLE source_table (
    id STRING,
    name STRING,
    event_time TIMESTAMP(3),
    temperature DOUBLE
) WITH (
    'connector' = 'kafka',
    'topic' = 'temperature-events',
    'properties.bootstrap.servers' = 'localhost:9092',
    'format' = 'json'
);

CREATE TABLE sink_table (
    window_start TIMESTAMP(3),
    window_end TIMESTAMP(3),
    avg_temperature DOUBLE,
    count BIGINT
) WITH (
    'connector' = 'jdbc',
    'url' = 'jdbc:mysql://localhost:3306/dinky',
    'table-name' = 'temperature_stats'
);

-- 实时聚合查询
INSERT INTO sink_table
SELECT
    TUMBLE_START(event_time, INTERVAL '5' MINUTE) as window_start,
    TUMBLE_END(event_time, INTERVAL '5' MINUTE) as window_end,
    AVG(temperature) as avg_temperature,
    COUNT(*) as count
FROM source_table
GROUP BY TUMBLE(event_time, INTERVAL '5' MINUTE);
```

### 2. CDC 开发
```java
// 基于 Flink CDC 的数据同步
public class CdcSourceFunction extends RichSourceFunction<ChangeEvent> {
    private final String databaseUrl;
    private final String username;
    private final String password;
    private final String[] tableNames;

    @Override
    public void open(Configuration parameters) {
        // 初始化 CDC 客户端
    }

    @Override
    public void run(SourceContext<ChangeEvent> ctx) {
        // 开始 CDC 数据消费
    }

    @Override
    public void cancel() {
        // 停止 CDC 数据消费
    }
}
```

### 3. 调试功能
- **数据流可视化**: 实时查看数据流和处理状态
- **性能分析**: 作业性能瓶颈分析和优化建议
- **错误诊断**: 自动错误诊断和修复建议
- **日志分析**: 智能日志分析和问题定位

## 运维管理

### 1. 作业管理
- **作业提交**: 支持多种提交方式（提交模式、会话模式）
- **作业监控**: 实时监控作业运行状态
- **作业重启**: 支持作业自动重启和手动重启
- **作业停止**: 安全停止作业和资源释放

### 2. 资源管理
- **资源分配**: 动态资源分配和调整
- **负载均衡**: 智能负载均衡和任务调度
- **内存管理**: 内存使用监控和优化
- **网络优化**: 网络流控和反压处理

### 3. 监控告警
- **实时监控**: CPU、内存、网络等资源监控
- **性能指标**: 作业吞吐量、延迟等性能指标
- **告警规则**: 自定义告警规则和阈值
- **通知机制**: 多渠道告警通知（邮件、短信、微信等）

## 应用场景

### 1. 实时数据分析
- **实时报表**: 实时业务指标监控和报表生成
- **实时大屏**: 实时数据可视化大屏展示
- **异常检测**: 实时异常检测和预警
- **用户画像**: 实时用户行为分析和画像构建

### 2. 数据同步与集成
- **数据库同步**: 实时数据库同步和复制
- **数据集成**: 多源数据实时集成和治理
- **ETL 处理**: 实时数据清洗和转换
- **数据质量**: 实时数据质量监控和治理

### 3. 实时应用开发
- **实时推荐**: 实时推荐系统构建
- **实时风控**: 实时风险控制和反欺诈
- **实时搜索**: 实时搜索和索引更新
- **实时广告**: 实时广告竞价和投放

## 2024 年更新与特性

### 1. 新版本特性
- **Flink 2.0 支持**: 完全支持 Flink 2.0 的新特性
- **AI 能力**: 集成 AI 和机器学习能力
- **物化视图**: 支持物化视图和自动刷新
- **性能优化**: 大幅提升性能和稳定性

### 2. 生态系统扩展
- **更多集成**: 支持更多数据源和系统
- **云原生**: 更好的云原生部署和运维
- **多语言**: 支持 SQL、Python、Java 等多种语言
- **API 接口**: 完善的 API 接口和扩展能力

### 3. 开发体验
- **可视化**: 更丰富的可视化功能
- **调试工具**: 更强大的调试和分析工具
- **文档完善**: 更完善的文档和教程
- **社区支持**: 更活跃的社区和支持

## 相关资源

### 官方资源
- [官方网站](https://www.dinky.org.cn/)
- [GitHub 仓库](https://github.com/DataLinkDC/dinky)
- [Gitee 镜像](https://gitee.com/DataLinkDC/Dinky)
- [官方文档](https://www.dinky.org.cn/docs/)

### 部署文档
- [常规部署指南](https://www.dinky.org.cn/docs/1.0/deploy_guide/normal_deploy/)
- [编译部署指南](https://www.dinky.org.cn/docs/1.0/deploy_guide/compile_deploy/)
- [Docker 部署指南](https://www.dinky.org.cn/docs/1.0/deploy_guide/docker_deploy/)
- [Kubernetes 部署指南](https://www.dinky.org.cn/docs/1.0/deploy_guide/k8s_deploy/)

### 学习资源
- [快速开始教程](https://www.dinky.org.cn/docs/1.0/quick_start/)
- [开发指南](https://www.dinky.org.cn/docs/1.0/dev_guide/)
- [最佳实践](https://www.dinky.org.cn/docs/1.0/best_practices/)
- [故障排查](https://www.dinky.org.cn/docs/1.0/troubleshooting/)

---

## 相关主题

- [[Apache Flink]] - Flink 核心概念和架构
- [[Flink SQL]] - Flink SQL 使用和优化
- [[Flink CDC]] - Flink CDC 数据同步
- [[实时计算]] - 实时计算技术栈
- [[数据湖]] - 数据湖架构和治理
