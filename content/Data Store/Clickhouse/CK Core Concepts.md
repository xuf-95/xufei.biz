---
date: 2024-01-09
aliases:
tags:
  - bigdata
  - data-store
description:
draft: false
publishDate: 2025-10-21T09:41
---

### CK 中是如何进行部分合并的

#### 查看合并级别及存储行数

```sql
SELECT  
	name,  
	level,  
	rows  
FROM system.parts  
WHERE (database = '${DB_NAME}') AND (`table` = '${TB_NAME}') AND active  
ORDER BY name ASC;
```

> [!note] V24.10中。新增了合并仪表板的监控仪表板，通过方框的形式展示合并大小


#### 并发合并

> [!quote]+ 单个 CK服务器使用多个后台并发线程进行并发部分合并
>>[!info] 增加CPU和RAM可以增加后台合并的吞吐量
>


###
