---
title: Hive Deploy Manual
tags:
  - hadoop
  - database
  - deploy
  - hive
date: 2022-01-22
draft: true
publish: true
---
##  Hive Install

```bash
cd /opt/software
# 上传 apache-hive-3.1.2-bin.tar.gz
tar -zxvf /opt/software/apache-hive-3.1.2-bin.tar.gz -C /opt/module/
cd /opt/module
mv apache-hive-3.1.2-bin/ hive

# 配置环境变量 
vim /etc/profile.d/my_env.sh

#HIVE_HOME
export HIVE_HOME=/opt/module/hive
export PATH=$PATH:$HIVE_HOME/bin

# 环境初始化
source /etc/profile.d/my_env.sh

# 删除冲突jar	
cd /opt/module/hive/lib
mv log4j-slf4j-impl-2.10.0.jar log4j-slf4j-impl-2.10.0.jar.bak

# Hive元数据配置到MySQL
cp /opt/software/mysql-connector-java-5.1.38.jar /opt/module/hive/lib/

# 配置Metastore到MySQL cd $HIVE_HOME/conf	新建hive-site.xml文件
vim hive-site.xml

```

```xml title="hive-site.xml"
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>javax.jdo.option.ConnectionURL</name>
        <value>jdbc:mysql://hadoop102:3306/metastore?useSSL=false&amp;createDatabaseIfNotExist=true&amp;useUnicode=true&amp;characterEncoding=UTF-8</value>
    </property>

    <property>
        <name>javax.jdo.option.ConnectionDriverName</name>
        <value>com.mysql.jdbc.Driver</value>
    </property>

    <property>
        <name>javax.jdo.option.ConnectionUserName</name>
        <value>root</value>
    </property>

    <property>
    	 <!-- mysql密码 -->
        <name>javax.jdo.option.ConnectionPassword</name>
        <value>123456</value>
    </property>

    <property>
        <name>hive.metastore.warehouse.dir</name>
        <value>/user/hive/warehouse</value>
    </property>

    <property>
        <name>hive.metastore.schema.verification</name>
        <value>false</value>
    </property>

    <property>
    <name>hive.server2.thrift.port</name>
    <value>10000</value>
    </property>

    <property>
        <name>hive.server2.thrift.bind.host</name>
        <value>hadoop102</value>
    </property>

    <property>
        <name>hive.metastore.event.db.notification.api.auth</name>
        <value>false</value>
    </property>
    

	 <!-- 指定hiveserver2连接的host -->
    <property>
        <name>hive.server2.thrift.bind.host</name>
        <value>hadoop102</value>
    </property>

    <!-- 指定hiveserver2连接的端口号 -->
    <property>
        <name>hive.server2.thrift.port</name>
        <value>10000</value>
    </property>

</configuration>
```


```bash
# 初始化元数据库 新建Hive元数据库
mysql -uroot -p123456
mysql> CREATE DATABASE metastore DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
mysql> quit;


# 初始化Hive元数据库
[root@hadoop102 software]$ schematool -initSchema -dbType mysql -verbose

# 修改hive源数据库部分表的编码格式支持中文  mysql -uroot -p123456 ; use metastore;
alter table COLUMNS_V2 modify column COMMENT varchar(256) character set utf8;
alter table TABLE_PARAMS modify column PARAM_VALUE varchar(4000) character set utf8;
alter table PARTITION_PARAMS  modify column PARAM_VALUE varchar(4000) character set utf8;
alter table PARTITION_KEYS  modify column PKEY_COMMENT varchar(4000) character set utf8;
alter table  INDEX_PARAMS  modify column PARAM_VALUE  varchar(4000) character set utf8;

# 启动hive客户端
[root@hadoop102 hive]$ bin/hive

# 启动beeline客户端 首先开启 iveserver2
[root@hadoop102 hive]$ bin/hive --service hiveserver2 # 此窗口不能再操作,重新开启窗口
[root@hadoop102 hive]$ hiveserver2 # 此窗口不能再操作,重新开启窗口
# 等待一分钟
[root@hadoop102 hive]$ bin/beeline -u jdbc:hive2://hadoop102:10000 -n root 
```
## Configuring Hive

> [Configuring Hive](https://cwiki.apache.org/confluence/display/Hive/AdminManual+Configuration)
> [[Hive Deploy Manual]]

## **运维**

#### 元数据管理

- Hive Metastore 建议使用 MySQL/PostgreSQL
- 定期备份 Metastore 数据库
- 与 Apache Atlas / Data Catalog 整合实现血缘与权限管理
#### 作业调度与监控

- 使用 Airflow / Azkaban / Oozie 调度 Hive SQL
- 建立任务 SLA、自动重试、报警机制
- HiveServer2 可配合 Prometheus + Grafana 监控连接数、延迟、查询耗时


#### **数据安全与访问控制**

- 启用 Ranger 或 Sentry 管理权限
- 支持行列级访问控制与审计日志
- HiveServer2 支持 Kerberos + LDAP 认证

#### **常见故障排查**

| **问题** | **原因**          | **解决方式**         |
| ------ | --------------- | ---------------- |
| 查询慢    | 缺乏统计信息          | 执行 ANALYZE TABLE |
| 元数据异常  | Metastore DB 异常 | 检查 Hive 服务和数据库连接 |
| 小文件过多  | 数据倾斜            | 合并小文件或增加 reducer |


## Reference

- [Installing Hive](https://cwiki.apache.org/confluence/display/Hive/AdminManual+Installation)
- [Setting Up Metastore](https://cwiki.apache.org/confluence/display/Hive/AdminManual+Metastore+Administration) [Hive Schema Tool](https://cwiki.apache.org/confluence/display/Hive/Hive+Schema+Tool)
- [Setting Up Hive Web Interface](https://cwiki.apache.org/confluence/display/Hive/HiveWebInterface)
- [Setting Up Hive Server](https://cwiki.apache.org/confluence/display/Hive/AdminManual+SettingUpHiveServer) ([JDBC](https://cwiki.apache.org/confluence/display/Hive/HiveJDBCInterface), [ODBC](https://cwiki.apache.org/confluence/display/Hive/HiveODBC), [Thrift](https://cwiki.apache.org/confluence/display/Hive/HiveServer), [HiveServer2](https://cwiki.apache.org/confluence/display/Hive/Setting+Up+HiveServer2))
- [Hive Replication](https://cwiki.apache.org/confluence/display/Hive/Replication)
- [Hive on Spark: Getting Started](https://cwiki.apache.org/confluence/display/Hive/Hive+on+Spark%3A+Getting+Started)
