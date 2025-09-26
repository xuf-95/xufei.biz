---
title: Column-oriented Storage 
aliases:
  - 列示存储
  - col-storage
tags:
  - olap
  - data-warehouse
date: 2024-05-19
draft: false
---
## Background 

列式存储（Column-oriented Storage）并不是一项新技术，最早可以追溯到 1983 年的论文 Cantor。然而，受限于早期的硬件条件和使用场景，主流的事务型数据库（OLTP）大多采用行式存储，直到近几年分析型数据库（OLAP）的兴起，列式存储这一概念又变得流行。

总的来说，列式存储的优势一方面体现在存储上能节约空间、减少 IO，另一方面依靠列式数据结构做了计算上的优化。本文中着重介绍列式存储的数据组织方式，包括数据的布局、编码、压缩等。在下一篇文章中将介绍计算层以及 DBMS 整体架构设计。

## Col-oriented Storage Develop

## col-oriented VS cell-oriented


## Refrence

- [about Column-oriented Storage](https://ericfu.me/columnar-storage-overview-storage/#%E4%BB%80%E4%B9%88%E6%98%AF%E5%88%97%E5%BC%8F%E5%AD%98%E5%82%A8)