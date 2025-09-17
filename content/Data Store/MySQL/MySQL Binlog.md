---
title: MySQL Binlog
tags:
  - cdc
date: 2023-10-14
---
### mysql 开启binlog功能

```shell
#################################################
# mysql 开启 binlog
vim /etc/my.cnf

server-id=1
log-bin=mysql-bin
binlog_format=row
binlog-do-db=cdc_test

systemctl restart mysqld # 重启mysql

create database cdc_test;

CREATE TABLE cdc_test.user_info(
id VARCHAR(200) PRIMARY KEY,
NAME VARCHAR(200),
sex VARCHAR(200));

INSERT INTO cdc_test.user_info VALUES ('1001','AA','0');
INSERT INTO cdc_test.user_info VALUES ('1002','BB','0');
INSERT INTO cdc_test.user_info VALUES ('1003','CC','0');

```