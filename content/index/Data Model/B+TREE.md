---
date: 0022-02-12
aliases:
tags:
  - bigdata
  - store
  - storage-structure
  - oltp
  - mysql
  - oracle
description:
draft: false
publishDate: 2025-09-26T15:38
---

# B+TREE

MySQL InnoDB 引擎将数据划分为若干页（page），以页作为磁盘与内存交互的基本单位，页默认的大小为16KB。这样每次磁盘IO至少读取一页数据到内存中或者将内存中一页数据写入磁盘，通过这种方式减少内存与磁盘的交互次数，从而提升性能。page的格式如下图：

![[B+TREE.png]]
MySQL InnoDB 引擎是使用B+Tree，B+Tree的特性是主键索引（又称聚集索引）的叶子节点保存的是真正的数据，而辅助索引（又称二级索引、非聚集索引）叶子节点的数据保存的是通过指向主键索引然后获得数据（也就是只根据辅助索引查询，需要进行一次回表）。

![[mysql-innodb-BTREE.png]]