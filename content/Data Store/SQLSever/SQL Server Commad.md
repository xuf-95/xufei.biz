---
title: SQL Server Commad
date: 2024-03-04
publish: false
draft: true
---
##  DQL

### 查看用户的数据库角色成员身份

```sql
SELECT
	r.name AS RoleName,
	r.type_desc AS RoleType,
	m.name AS MemberName,
	m.type_desc AS MemberType
FROM sys.database_role_members rm
INNER JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
INNER JOIN sys.database_principals m ON rm.member_principal_id = m.principal_id
ORDER BY r.name, m.name;
```

###   查看当前数据库中的所有用户

```sql
SELECT
	name AS UserName,
	type_desc AS UserType,
	create_date,
	default_schema_name,
	authentication_type_desc AS AuthenticationType
FROM sys.database_principals
WHERE type IN ('S', 'E', 'X') -- S:SQL用户, E:External user, X:External group
AND name NOT IN ('dbo', 'guest', 'sys', 'INFORMATION_SCHEMA')
ORDER BY name;
```

```sql
SELECT
	DB_NAME() AS database_name,
	SCHEMA_NAME(t.schema_id) AS schema_name,
	t.name AS table_name,
	SUM(p.rows) AS row_count
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE
	p.index_id IN (0, 1) -- 0=堆表, 1=聚集索引
	AND t.is_ms_shipped = 0 -- 排除系统表
GROUP BY
	t.schema_id,
	t.name
ORDER BY
	schema_name,
	table_name
```


## Reference

- [什么是 SQL Server？ - SQL Server \| Microsoft Learn](https://learn.microsoft.com/zh-cn/sql/sql-server/what-is-sql-server?view=sql-server-ver17)