---
date: 2023-12-31
aliases:
tags:
  - bigdata
  - cloud
description:
draft: false
publishDate: 2025-09-25T21:47
---
### How to start up CDC ?

```bash
-- 1. 检查当前数据库CDC状态
SELECT name, is_cdc_enabled 
FROM sys.databases 
WHERE name = ${DD_NAME};

-- 2. 如果未启用，启用CDC
USE 你的数据库名;
GO

EXEC sys.sp_cdc_enable_db;
GO

-- 3. 为表启用CDC
EXEC sys.sp_cdc_enable_table
    @source_schema = N'${schema_name}',
    @source_name   = N'${table_name}',
    @role_name     = NULL,
    @supports_net_changes = 1;

-- 4. 验证
SELECT name, is_cdc_enabled 
FROM sys.databases 
WHERE name =   ${DD_NAME};
```

