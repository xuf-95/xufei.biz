---
title: MySQL Snippts
tags:
  - mysql
  - snippets
date: 2022-03-01
draft: false
---

## 创建、删除、查看索引

```mysql
// 创建
ALTER TABLE table_name ADD INDEX index_name (column_list);
ALTER TABLE table_name ADD UNIQUE (column_list);
ALTER TABLE table_name ADD PRIMARY KEY (column_list);
CREATE INDEX index_name ON table_name (column_list);
CREATE UNIQUE INDEX index_name ON table_name (column_list);
CREATE TABLE `pack_group` (
  PRIMARY KEY (`id`),
  UNIQUE `idx_shop_beehive_packable_time` (`shop_id`,`beehive_id`,`packable_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='分组状态表';
// 删除
DROP INDEX index_name ON talbe_name;
ALTER TABLE table_name DROP INDEX index_name;
ALTER TABLE table_name DROP PRIMARY KEY;
// 查看
show index from tblname;
show keys from tblname;

作者：会灰翔的灰机
链接：https://juejin.cn/post/7120408229414174727
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

## 查看事务
```mysql
SELECT
    a.trx_id,
    a.trx_state,
    a.trx_started,
    a.trx_query,
    a.trx_weight,
    a.trx_lock_memory_bytes,
    b.ID,
    b.USER,
    b.DB,
    b.COMMAND,
    b.TIME,
    b.STATE,
    b.INFO,
    c.PROCESSLIST_USER,
    c.PROCESSLIST_HOST,
    c.PROCESSLIST_DB,
    d.SQL_TEXT
FROM
    information_schema.INNODB_TRX a
LEFT JOIN
    information_schema.PROCESSLIST b
ON
    a.trx_mysql_thread_id = b.id
LEFT JOIN
    PERFORMANCE_SCHEMA.threads c
ON
    b.id = c.PROCESSLIST_ID
LEFT JOIN
    PERFORMANCE_SCHEMA.events_statements_current d
ON
    d.THREAD_ID = c.THREAD_ID;
```

## 开窗函数实现
```mysql
SELECT
    *
FROM
    (
        SELECT
            IF(@v_department_id=c.department_id,@rn:=@rn+1,@rn:=1) AS rn,
            @v_department_id:=                                        c.department_id,
            c.department_id,
            c.name,
            c.salary
        FROM
            (
                SELECT
                    b.DEPARTMENT_ID,
                    b.name,
                    SUM(b.SALARY) SALARY
                FROM
                    department a,
                    salary b
                WHERE
                    a.id = b.department_id
                GROUP BY
                    b.DEPARTMENT_ID,
                    b.name) c, (select @v_department_id:=-1) d
        ORDER BY
            c.department_id,
            c.salary DESC) d
WHERE
    d.rn=1;
//试验数据
CREATE TABLE department (id int, name varchar(100)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE salary (department_id int, name varchar(100), salary int) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO department (id, name) VALUES (1, '霸气的部门');
INSERT INTO department (id, name) VALUES (2, '牛皮的部门');
INSERT INTO department (id, name) VALUES (3, '最拽的部门');
INSERT INTO salary (department_id, name, salary) VALUES (1, 'Superman', 1000);
INSERT INTO salary (department_id, name, salary) VALUES (1, 'Superman', 2000);
INSERT INTO salary (department_id, name, salary) VALUES (1, 'spiderman', 3500);
INSERT INTO salary (department_id, name, salary) VALUES (1, 'hulk', 6000);
INSERT INTO salary (department_id, name, salary) VALUES (2, 'Jack', 5000);
INSERT INTO salary (department_id, name, salary) VALUES (2, 'Rose', 3000);
INSERT INTO salary (department_id, name, salary) VALUES (2, 'Tom', 4000);
INSERT INTO salary (department_id, name, salary) VALUES (3, 'Jerry', 2000);
INSERT INTO salary (department_id, name, salary) VALUES (3, 'Harry', 3000);

```



## Data Quality SQl DDL
```mysql
/*
 Navicat Premium Data Transfer

 Source Server         : yt37
 Source Server Type    : MySQL
 Source Server Version : 80023
 Source Host           : 127.0.0.1:3306
 Source Schema         : bigdata-backstage

 Target Server Type    : MySQL
 Target Server Version : 80023
 File Encoding         : 65001

 Date: 24/03/2023 15:06:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for met_quality_task
-- ----------------------------
CREATE TABLE `met_quality_task` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `dw_id` int DEFAULT NULL COMMENT '数仓id',
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '任务名称',
  `task_comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '任务描述',
  `monitor_num` int DEFAULT '0' COMMENT '监测次数',
  `warn_num` int DEFAULT '0' COMMENT '预警次数',
  `rule_id` int DEFAULT NULL COMMENT '绑定规则',
  `bind_tbl` int DEFAULT NULL COMMENT '绑定表',
  `bind_col` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '绑定字段',
  `target_begin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '目标范围起',
  `target_end` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '目标范围始',
  `monitor_freq` int DEFAULT '0' COMMENT '监测频率',
  `create_user` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '创建人',
  `update_user` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '更新人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL  COMMENT '更新时间',
  `status` int DEFAULT '1' COMMENT '状态 1-上线 0-下线',
  `is_delete` tinyint(1) DEFAULT '0' COMMENT '是否删除 1-是 0-否',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='数据质量-质检任务';
```



```mysql
```