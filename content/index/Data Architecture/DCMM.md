---
title: DCMM
aliases:
  - 数据管理能力成熟度评估模型
  - dcmm
  - Data management capability maturity assessment model
tags:
  - data-architecture
  - data-goverance
  - data-integration
  - data-compute
  - data-visual
  - data-lifecycle
  - data-strategy
draft: false
date: 2024-12-01
publish: true
---

## DCMM Overview

**DCMM (数据管理能力成熟度评估模型 - Data Management Capability Maturity Assessment Model)** is China's national standard **GB/T 36073-2018** for evaluating data management capabilities. It provides a systematic framework to help organizations assess and improve their data management maturity.

### Key Characteristics

- **Standard**: GB/T 36073-2018 "Data management capability maturity assessment model"
- **Update**: DCMM 2.0 (GB/T 36073-2025) released December 2025, effective July 2026
- **Structure**: 8 core capability domains, 28 process areas, 445 capability standards
- **DCMM 2.0**: Expands to 9 capability domains and 33 process areas, adds Data Assets domain
- **Purpose**: Guide organizations in developing comprehensive data management capabilities
- **Application**: Enterprise data management assessment and certification

### Official Resources

- [Official Assessment Platform](https://www.dcmm-cfeii.com/) - Certification queries, self-assessment tools
- [Certification Authority](http://www.dcmm.org.cn/) - Standards and announcements

---

## Five Maturity Levels

DCMM classifies data management capability maturity into five levels, from low to high:

| Level | Name | Description |
|-------|------|-------------|
| **Level 1** | 初始级 (Initial) | Basic data management with ad-hoc processes |
| **Level 2** | 受管理级 (Managed) | Defined processes and project-level management |
| **Level 3** | 稳健级 (Robust) | Standardized processes across organization |
| **Level 4** | 量化管理级 (Quantitatively Managed) | Measurable, data-driven management |
| **Level 5** | 优化级 (Optimizing) | Continuous optimization and innovation |

---

## Eight Capability Areas

The DCMM framework comprises **8 core capability domains**:

### 1. 数据战略 (Data Strategy)
- Strategic planning and alignment
- Data policy development
- Resource allocation and investment

### 2. 数据治理 (Data Governance)
- Governance structure and organization
- Roles and responsibilities
- Data stewardship and accountability

### 3. 数据架构 (Data Architecture)
- Data model design
- Data distribution and integration
- Technical architecture

### 4. 数据标准 (Data Standards)

The Data Standards capability area ensures data consistency and usability across the organization through standardized definitions, formats, and management practices. It comprises **four key capability items**:

#### 4.1 业务术语 (Business Terminology)
- **Definition**: Approved descriptions of business concepts within the organization
- **Components**:
  - Chinese name (中文名称)
  - English name (英文名称)
  - Term definition (术语定义)
  - Business context and usage examples
- **Purpose**: Ensure consistent business language across departments and systems
- **Key Activities**:
  - Terminology collection and standardization
  - Cross-departmental review and approval
  - Maintenance and version control
  - Integration with system development

#### 4.2 参考数据和主数据 (Reference Data & Master Data)
- **Reference Data**: Basic data used for classification, coding, and identification
  - Examples: Country codes, industry classifications, status codes
  - Characteristics: Relatively stable, shared across systems
- **Master Data**: Core business entity critical data
  - Examples: Customer, product, supplier, employee data
  - Characteristics: High-value, frequently accessed, shared across applications
- **Management Focus**:
  - Unified identification and coding rules
  - Data source management (single source of truth)
  - Data synchronization and consistency
  - Change control and impact analysis

#### 4.3 数据元 (Data Elements)
- **Definition**: The smallest unit of data with specific meaning
- **Components**:
  - Object class (e.g., "Customer")
  - Property (e.g., "Name")
  - Representation (e.g., "Text string")
- **Standardization Requirements**:
  - Naming conventions
  - Data type definitions
  - Length and format specifications
  - Value range constraints
- **Purpose**: Foundation for data standardization and system integration

#### 4.4 指标数据 (Indicator Data)
- **Definition**: Data used to measure specific targets or objects in business analysis
- **Components**:
  - Indicator name (指标名称)
  - Time dimension (时间维度)
  - Numerical value (数值)
  - Calculation methodology
  - Business context and thresholds
- **Examples**:
  - Financial indicators: Revenue, profit margin, ROI
  - Operational indicators: Order fulfillment rate, customer satisfaction
  - Strategic indicators: Market share, brand awareness
- **Management Requirements**:
  - Unified calculation definitions
  - Data source traceability
  - Verification and validation processes
  - Regular review and updates

#### Data Standards Management Process
1. **Planning**: Identify standardization requirements and priorities
2. **Development**: Create standards through collaborative processes
3. **Review**: Validate standards with business and technical stakeholders
4. **Approval**: Formalize standards through governance processes
5. **Implementation**: Apply standards in systems and processes
6. **Maintenance**: Update standards to reflect business changes
7. **Compliance**: Monitor adherence and enforce standards

#### Business Value
- **Consistency**: Unified data language across the organization
- **Integration**: Foundation for system integration and data sharing
- **Quality**: Reduced data ambiguity and errors
- **Efficiency**: Streamlined data management and communication
- **Analytics**: Reliable basis for business intelligence and decision-making

### 5. 数据质量 (Data Quality)
- Quality rules and metrics
- Data quality assessment
- Quality improvement processes

### 6. 数据安全 (Data Security)
- Security policies and controls
- Access management
- Data privacy and compliance

### 7. 数据应用 (Data Application)
- Data analytics and BI
- Data services and APIs
- Value creation from data

### 8. 数据生存周期 (Data Lifecycle)
- Data collection and creation
- Storage and maintenance
- Archival and disposal

---

## Benefits of DCMM Assessment

- **Identify gaps**: Discover current data management status and existing problems
- **Benchmark comparison**: Compare with industry averages and best practices
- **Targeted improvement**: Receive specific guidance for capability enhancement
- **Digital transformation**: Support organizational data-driven transformation
- **Government incentives**: Access to subsidies and certifications (varies by region)
- **Market recognition**: Demonstrate data management capabilities to stakeholders

---

## Current Trends (2024-2026)

### DCMM 2.0 Update (2025-2026)
- **New Standard**: GB/T 36073-2025 released December 2025, effective July 2026
- **Major Enhancement**: Expansion from 8 to 9 capability domains with addition of **Data Assets** domain
- **Capability Items**: Increased from 28 to 33 process areas
- **Strategic Focus**: Covers full data lifecycle from "resource → asset → element" transformation
- **Market Alignment**: Supports data要素市场化配置 reform and data asset accounting

### 2024-2025 Adoption Patterns
- **Financial services**: Banks and institutions actively pursuing DCMM certification
- **Regional subsidies**: Multiple Chinese provinces offer financial incentives (¥100K-¥500K)
- **Integration**: Growing alignment with international data management frameworks (DAMA-DMBOK)
- **Enterprise adoption**: Increasing recognition as critical benchmark for digital transformation
- **Government requirements**: DCMM certification becoming prerequisite for certain contracts and projects

---

## Related Concepts

- [[DAMA-DMBOK]] - International data management framework
- [[Data Governance]] - Organizational data management practices
- [[Data Maturity Model]] - General maturity assessment approaches

---

## References

### Official Resources
- [DCMM Official Assessment Platform](https://www.dcmm-cfeii.com/) - Certification queries, self-assessment tools
- [DCMM Certification Authority](http://www.dcmm.org.cn/) - Standards and announcements
- GB/T 36073-2018 National Standard (Data management capability maturity assessment model)
- GB/T 36073-2025 National Standard (DCMM 2.0, effective July 2026)

### Data Standards Resources
- [DCMM Data Standards Process Areas](https://www.q-ing.com.cn/industry-news/2001.html) - DCMM Level 2 data standards requirements
- [Understanding DCMM Data Standards](https://zhuanlan.zhihu.com/p/650853317) - Comprehensive guide to business terminology, reference data, master data, data elements, and indicator data
- [DCMM Complete Interpretation](https://zhuanlan.zhihu.com/p/611997675) - Full framework overview with 8 capability domains and 28 process areas

### DCMM 2.0 Update
- [DCMM 2.0 National Standard Upgrade](https://zhuanlan.zhihu.com/p/1997339599136104994) - First inclusion of "Data Assets" domain, effective July 2026

