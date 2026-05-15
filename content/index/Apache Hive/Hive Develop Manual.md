---
title: Apache Hive Develop Manual
tags:
  - bigdata
  - data-warehouse
  - hive
date: 2022-01-15
draft: false
publish: true
---
## DDL Defined

### Database Operation 

```sql
# 创建数据库
CREATE DATABASE [IF NOT EXISTS] database_name
[COMMENT database_comment]    -- 这个数据库的解释(写一下这个数据库是拿来干什么的)
[LOCATION hdfs_path]          -- 指定存放路径
[WITH DBPROPERTIES (property_name=property_value, ...)];  -- 关于库的属性值  非常鸡肋

# 显示有哪些数据库
show databases;	
# 切换数据库
use 数据库名;	
# 查找emp相关的数据库
show databases like 'db_hive*';
# 查看数据库信息
desc database  数据库名;	
desc database extended 数据库名; # 显示库的详细信息
# 删除空数据库
drop database 数据库名;		
# 删除空数据库（标准写法）
drop database if exists 数据库名;
# 强制删除数据库
drop database 数据库名 cascade;		
```

### Table Operation

```sql
# 展示库中所有的表
show tables;	
# 描述表基本信息
desc `表名`;	
# 描述表详细信息
desc formatted `表名`;  
# 查看表的分区信息
show partitions `表名`;
# 查看建表的语句
show create table `库名`.`表名`;

```

```sql
建表语法 : 
CREATE [EXTERNAL] TABLE [IF NOT EXISTS] table_name   -- EXTERANL: 外部表
[(col_name data_type [COMMENT col_comment], ...)]  -- 列名 列类型 列描述信息  ....
[COMMENT table_comment] -- 表描述信息
[PARTITIONED BY (col_name data_type [COMMENT col_comment], ...)] -- 创建分区表指定分区字段  分区列名  列类型
[CLUSTERED BY (col_name, col_name, ...) -- 创建分桶表指定分桶字段   分桶列名
[SORTED BY (col_name [ASC|DESC], ...)] INTO num_buckets BUCKETS]  -- 指定分桶数
[ROW FORMAT delimited fields terminated by ... ] -- 指定一条数据字段与字段的分割符
[collection items terminated by  ... ] -- 指定集合元素与元素的分割符
[map keys terminated by ... ] -- 指定map的kv的分割符
[STORED AS file_format] -- 指定文件存储格式，默认为 textfile
[LOCATION hdfs_path] -- 指定表在hdfs中对应的路径
[TBLPROPERTIES (property_name=property_value, ...)] -- 指定表的属性
[AS select_statement] -- 基于某个查询建表
```

> [!note] Data Type Standard
> 优先使用定长类型（如 INT, BIGINT），避免滥用 STRING
> 可使用 DECIMAL(p, s) 代替浮点类型以防止精度损失


**管理表（内部表 Table_Type : managed_table）**

```sql
管理表（内部表）-- hive掌握数据生命周期(会伴随着表的删除而删除)  --测试，中间表：

create table if not exists student1 ( -- 创建内部表
id int comment 'id',           
name string comment '姓名') 
comment '学生表' -- 表的注释
partitioned by(statis_date string)  -- 创建分区列，列名为statis_date 数据类型为string
row format delimited fields terminated by '\t'   -- 创建表，字段与字段分隔符号为Tab键盘
STORED as textfile; -- 文件存储格式

# 根据结果创建表[表结构和数据 但是 不带分隔符]
create table student2 as select * from student where 1=1;  

# 模仿一张表[表结构并且 带分隔符]
create table student3 as select * from student where 1=0;
create table student3 like student;   
```

**外部表（Table_Type : external_table）**

```sql
reate external table if not exists dept(   -- 创建外部表
deptno int,
dname string,
loc int)
comment 'qqq表'
row format delimited fields terminated by '\t'     -- 根据空格切分
location '/company/dept';    -- 保存路径
```

**内外部表的相互切换**

```sql
查看是内部表还是外部表 -> Table Type:EXTERNAL_TABLE  # desc formatted `表名`;  

# 把学生表类型修改为外部表[固定写法区分大小写]
alter table 表名 set tblproperties('EXTERNAL'='TRUE');   
# 把学生表类型修改为内部表[固定写法区分大小写]
alter table 表名 set tblproperties('EXTERNAL'='FALSE'); 
```

**修改表**

>[!warning]
>内部表：删除表的时候，内部表的元数据和真实数据会被一起删除
> 外部表 **( 常用 )**：删除表的时候，只删除元数据，不删除真实数据

```sql
alter table 旧表名 rename to 新表名 ;     -- 修改表名
alter table 表 add columns(新列名 新列数据类型);    -- 添加列
alter table 表 change (旧列名 新列名 新列数据类型);       -- 替换列【列的类型只能小改大】

alter table 表 replace columns
(idss int , namess string , type int , createtime  string );   
-- 修改全部列【1:1对应，或增加列】【类型从小到大】

# 删除表
drop table if exit 表名; 

# 清除表  Truncate 只能删除管理表，不能删除外部表中数据
truncate table student;   
```
## DML Operation

##### Load Data Operation

- load 文件导入
- insert 根据查询表结果导入已建立好的表
- as select 根据查询表结果直接新建表
- location hdfs目录上已有文件，建表直接指定改目录

```sql

hive> load data [local] inpath '数据的path' [overwrite] into table 表名 [partition (partcol1=val1,…)];
local		-- 从本地加载数据到hive表；否则从HDFS加载数据到hive表
overwrite	-- 覆盖已有数据，否则追加
inpath -- 数据路径
partition   -- 上传到指定分区

# 从本地加载数据，源文件不变
# 从HDFS加载数据，源文件移动
```

**LOAD DATA**

```sql
# 从本地文件覆盖导入数据
load data local inpath '/usr/tmp/test1.txt' overwrite into table test1;

# 从 hdfs 目录覆盖导入数据
load data inpath '/test1.txt' overwrite into table test2;

# 把本地数据追加到test_1表的2020-12-10分区中
LOAD DATA LOCAL INPATH '/home/admin/test/test.txt' INTO TABLE test_1 PARTITION(dt='2020-12-10')
```

**INSERT DATA**

```sql
INSERT  加载数据  [ 常用于根据某些表查询结果导入 ]

1、把stu2中表数据追加到stu1的20201022分区
insert into table stu1 partition(dt=20201022) select * from stu2; 

2、把stu2中表数据覆盖到stu1的20201022分区
insert overwrite table stu1 partition(dt=20201022) select * from stu2;  

3、基本模式插入（根据单张表查询结果）
insert into table test3 select * from test2;

4、多表（多分区）插入模式（根据多张表查询结果）
hive (default)> from student
              insert overwrite table student partition(month='201707')
              select id, name where month='201709'
              insert overwrite table student partition(month='201706')
              select id, name where month='201709';
```

**AS SELECT**

```sql
# 直接基于查询创建数据表
create table test5 as select * from test4;
```

**SELECT DATA**

```sql
/student4/data.txt   # 此路径下已存在数据

create table student4(id string, name string) 
row format delimited fields terminated by '\t'
location '/student4' ;
```

### Data Export

- insert
- hive -e > 查询结果重新定向
- export 数据迁移

**INSERT DATA**

```sql

# 如果表中的列的值为null,导出到文件中以后通过\N来表示. 

1、导出到 本地文件
insert overwrite local directory '/usr/tmp/export' 
row format delimited fields terminated by '\t' 
select * from test1;

2、导出到 hdfs
insert overwrite directory '/usr/tmp/test' 
row format delimited fields terminated by '\27' 
select * from test1;
```

**HIVE -E**

```sql
hive -e "select * from mydb.student" > /zhj/temp/tb.txt  # 导出到本地
```

**EXPORT** 

```sql
export ：导出 (数据 + 元数据)  一般用于数据迁移

# export 导出到hdfs
export table mydb.student to '/student';

# import 从hdfs导入
import table mydb.student2 from '/student';

-- import 导入必须是export 导出  
```

## DQL QUERY

> [!note] 
> - 统一使用小写关键字，便于版本兼容
> - 避免使用 SELECT *，明确列名
> - WHERE 子句中禁止复杂函数计算（会导致全表扫描）
> - JOIN 顺序建议小表在前，大表在后
> - 推荐显式使用 **CBO（Cost-Based Optimizer）**


```mermaid
graph LR
    A[from] --> B[join on]
    B --> C[where]
    C --> D[group by]
    D --> E[select 聚合函数]
    E --> F[having]
    F --> G[order by]
    G --> H[limit ]
```

```sql
SELECT [ALL | DISTINCT] select_expr, select_expr, ...    
-- ALL一般都省略， DISTINCT去重[group by优化]
  FROM table_reference        -- 来自哪张表
  [WHERE where_condition]     -- 筛选
  [GROUP BY col_list]		  -- 分组
  [HAVING col_list]			  -- 分组后筛选
  [ORDER BY col_list]         -- 全局排序
  [CLUSTER BY col_list			-- 分区排序
  | 
   [DISTRIBUTE BY col_list] 	-- 分区
   [SORT BY col_list]			-- 区内排序
  ]
 [LIMIT number]               -- 分页[显示多少行]
```

### **常用内置函数汇总**

#### **字符串函数**

| **函数**                          | **示例** | **说明** |
| ------------------------------- | ------ | ------ |
| concat(str1, str2, ...)         | 拼接字符串  |        |
| substr(str, start, len)         | 截取子串   |        |
| split(str, regex)               | 分割字符串  |        |
| regexp_replace(str, regex, rep) | 正则替换   |        |
| upper(str) / lower(str)         | 大小写转换  |        |

#### **日期与时间函数**

| **函数**                 | **示例** | **说明** |
| ---------------------- | ------ | ------ |
| current_date()         | 当前日期   |        |
| unix_timestamp()       | 当前时间戳  |        |
| from_unixtime(ts, fmt) | 时间戳转日期 |        |
| date_add(date, n)      | 日期加减   |        |
| datediff(end, start)   | 日期差    |        |
#### **聚合函数**

| **函数**              | **示例**  | **说明** |
| ------------------- | ------- | ------ |
| count(col)          | 计数      |        |
| sum(col)            | 求和      |        |
| avg(col)            | 平均值     |        |
| max(col) / min(col) | 最大最小值   |        |
| collect_set(col)    | 去重聚合为数组 |        |
####  **窗口函数（Hive 2.1+ 支持完整 ANSI SQL）**

```sql
SELECT user_id,
       sum(amount) OVER (PARTITION BY user_id ORDER BY dt ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS week_amount
FROM orders;
```

```sql
-- 常用聚合函数  <多进一出>
select count(*) from emp;		-- 求总行数
select max(sal) from emp;		-- 求最大工资
select min(sal) from emp;		-- 求最小工资
select sum(sal) from emp;		-- 求工资总和
select avg(sal) from emp;		-- 求平均工资
```

```sql
-- limit 用法
select * from emp limit 5;			-- 取前5行，第1行到第5行  把0省略
select * from emp limit 2,4;		-- 从第3行开始取4行，从第3行到第6行
select * from emp limit 2,-1;		-- 从第3行取到末尾
```

 
### GROUP BY

> group by 通常和聚合函数一起使用 【多进一出】,having 对分组结果的过滤

```sql
-- 求每个部门每个工种的最大工资
select
t.deptno,
t.job,
max(t.sal) max_sal			   -- 此列别名为max_sal
from mydb.emp t				    -- 表别名为t
group by t.deptno, t.job;     -- 代码美化
```

>[!note] having 与 where 不同点
	- where 后面不能写分组函数，而 having 后面可以使用分组函数
	- having 只用于 group by 分组统计语句
	- 分组之前用where 分组之后用having

### LIKE AND RLIKE

- LIKE：使用LIKE运算选择类似的值；选择条件可以包含字符或数字
	- % : 代表零个或多个字符(任意个字符)
	- _ : 代表一个字符
- RLIKE子句：是Hive中这个功能的一个扩展，其可以通过 'Java的正则表达式' 这个更强大的语言来指定匹配条件

```sql
  -- 名字开头待S
  select * from emp where ename like 'S%';
  select * from emp where ename rlike '^S';
  -- 名字末尾带S
  select * from emp where ename like '%S';
  select * from emp where ename rlike 'S$';
  -- 名字中带S
  select * from emp where ename like '%S%';
  select * from emp where ename rlike '[S]';
```

### Sort

#### ORDER BY

> [!summary] 全局排序 order by  ，只有一个Reducer

```sql
select * from emp
order by sal  [desc];            -- 按照sal升序  asc：升序[可省略]  desc：降序

select ename, sal*2 twosal from emp order by twosal;  -- 按照列别名排序
select * from emp order by deptno , sal ;         -- 按照多列排序
```

#### SORT BY

> [!summary] 
> - Reduce内部排序  sort by 【不单独使用】 
> - reducer产生一个排序文件。每个Reducer内部进行排序  根据哈希值排序

```sql
set mapreduce.job.reduces=3;   -- 设置reduce的个数
set mapreduce.job.reduces;     -- 查看reduce的个数
select * from emp sort by deptno;    -- 系统内置分3个reduce，每个reduce里升序    【不单独使用】
```

#### DISTRIBUTE BY

> [!summary] distribute by的分区规则是根据分区字段的 **hash值**与 **reduce** 的个数进行 **取模** 后，**余数相同** 的分到一个区

```sql
set mapreduce.job.reduces=3;		-- 设置三个分区

select
empno,
ename,
sal,
deptno
from emp 
distribute by deptno sort by sal;     -- 首先按照deptno的值的余数升序，然后按照sal里升序

30 mod 3 = 0    -- 分区1
10 mod 3 = 1	-- 分区2
20 mod 3 = 2	-- 分区3
50 mod 3 = 2	-- 分区3
```
#### CLUSTER BY

```sql
et mapreduce.job.reduces=3;		-- 设置三个分区

select * from emp
cluster by deptno;  -- 只能是升序
-------等价
select * from emp 
distribute by deptno sort by deptno [desc];    -- 分三区，余数先排序，再排里面数值排序
```

## 分区表和分桶表

### 分区表

- 分区表就是分 **目录**
- 防止暴力扫描，分区列相当与伪列

```sql
-- 创建分区表
create table dept_partition(
deptno int,
dname string, 
loc string)
comment 'dept分区表'
partitioned by (day string)    -- 创建分区列名为day
row format delimited fields terminated by '\t'; -- 安装tab键分隔

-- 上传数据的分区表中
load data local inpath '/zhj/dept_20200401.log' into table mydb.dept_partition partition(day='20200401');
load data local inpath '/zhj/dept_20200402.log' into table mydb.dept_partition partition(day='20200402');
load data local inpath '/zhj/dept_20200403.log' into table mydb.dept_partition partition(day='20200403');

-- 查询
show partitions dept_partition;   -- 查看表中有多少个分区
select * from dept_partition ; -- 查询全部数据
select * from dept_partition where day = '20200402';  -- 查询20200402分区里的内容
```

**Change Partition Table**

```sql
alter table dept_partition add partition(day='20200404')   -- 增加单个分区

alter table dept_partition add partition(day='20200405') partition(day='20200406');  -- 增加多个分区，无,

alter table dept_partition drop partition (day='20200406');   -- 删除分区

alter table dept_partition drop partition (day='20200404'), partition(day='20200405');  -- 删除多个分区，有,
```

**分区表多级分区**

```sql
create table dept_partition2(
deptno int, 
dname string,
loc string)
comment '部门二级分区表'
partitioned by (day string, hour string)
row format delimited fields terminated by '\t';

load data local inpath '/zhj/dept_20200401_11.log' into table
dept_partition2 partition(day='20200401', hour='11'); 		-- 加载数据到分区

select * from dept_partition2 
where day = '20200401' and hour = '11';  -- 查询20200401的hour为11的内容

alter table dept_partition2 drop partition(day='20200401',hour='11');  -- 删除二级分区
```

## 自定义
### HIVE posexplode 时间区间拆分成单独行

```sql
select tf.*,t.*, date_add(start_date,pos) 
from (
  select 'a' as a, '2018-11-01' as start_date, '2018-12-01' as end_date 
) t 
lateral view posexplode(split(space(datediff(end_date,start_date)),' ')) tf as pos,val limit 5000
```

### 自定义字符串反转函数

```java
public class ReverseUDF extends UDF {
    public Text evaluate(Text str) {
        if (str == null) return null;
        return new Text(new StringBuilder(str.toString()).reverse().toString());
    }
}
```

**注册并使用**

```sql
ADD JAR /user/hive/udf/udf-tools.jar;
CREATE TEMPORARY FUNCTION reverse_str AS 'com.company.hive.udf.ReverseUDF';
SELECT reverse_str(name) FROM user_info;
```

### 使用Hive SQL创建日期维度表

## **性能优化**

#### **查询优化策略**

| **优化点**    | **说明**        | **配置项**                                         |
| ---------- | ------------- | ----------------------------------------------- |
| 启用 CBO 优化器 | 根据表统计信息生成执行计划 | set hive.cbo.enable=true;                       |
| 分区剪裁       | 查询自动过滤分区      | set hive.optimize.pruner=true;                  |
| 动态分区       | 动态生成目标分区      | set hive.exec.dynamic.partition.mode=nonstrict; |
| 启用并行执行     | 同时执行多个 Stage  | set hive.exec.parallel=true;                    |
| 小文件合并      | 减少 HDFS 小文件   | set hive.merge.mapfiles=true;                   |
#### **MapReduce / Tez / Spark 优化**

- 调整并行度：set mapreduce.job.reduces = N;
- 使用 Tez 引擎：set hive.execution.engine=tez;
- 对 JOIN 进行 Map Join 优化: set hive.auto.convert.join=true;

#### **表存储格式优化**

```sql
CREATE TABLE dwd_user_order (
    user_id BIGINT,
    order_id STRING,
    amount DECIMAL(10,2),
    dt STRING
)
STORED AS ORC
TBLPROPERTIES ("orc.compress"="SNAPPY");
```
#### **统计信息收集**

```sql
ANALYZE TABLE dwd_user_order COMPUTE STATISTICS;
ANALYZE TABLE dwd_user_order COMPUTE STATISTICS FOR COLUMNS user_id, amount;
```
## Hive 数据倾斜

> [!question] 
> Map阶段同一Key数据分发给一个reduce，当一个key数据过大时就倾斜了

### 数据倾斜的表现

- 由于数据分布不均匀，造成数据大量的集中到一点，造成数据热点
- 任务进度长时间维持在 99%或者 100%的附近，查看任务监控页面，发现只有少量 reduce 子任务未完成，因为其处理的数据量和其他的 reduce 差异过大

```sql
# 采用中间临时表优化
with as 用法:性能优化，解决数据倾斜


with t1 as(   # 一次分析，多次使用，提供性能的优化，达到了“少读”的目标
select        # with as 属于一次性的，而且必须要和其他sql一起使用才可以！
  u.userkey,  # 这里必须要整体作为一条sql查询，即with as语句后不能加分号，不然会报错。
  o.*
from user_info u
left join user_order o
on u.idno = o.idno
where u.idno is not null )
# 是可以把where条件写在后面的，hive会进行谓词下推，先执行where条件在执行 left join

select
  a.userkey,
  a.idno,
  a.phone,
  a.name,
  b.user_active_at,
  c.intend_commodity,
  c.intend_rank,
  d.order_num,
  d.order_amount
from user_info a
left join user_active b on a.userkey = b.userkey
left join user_intend c on a.phone = c.phone
left join t1 d on a.userkey = d.userkey;
```


## Refrence

- https://www.cnblogs.com/DavonC/p/13868389.html
- 

 ![[Apache Hive.png|300|700]]