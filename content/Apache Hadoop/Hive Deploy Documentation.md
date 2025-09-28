---
title: Hive Deploy Documentation
tags:
  - hadoop
  - database
  - deploy
date: 2022-01-22
draft: false
---
##  Hive Install

```bash
cd /opt/software
# 上传 apache-hive-3.1.2-bin.tar.gz
tar -zxvf /opt/software/apache-hive-3.1.2-bin.tar.gz -C /opt/module/
cd /opt/module
mv apache-hive-3.1.2-bin/ hive

# 配置环境变量 vim /etc/profile.d/my_env.sh
#HIVE_HOME
export HIVE_HOME=/opt/module/hive
export PATH=$PATH:$HIVE_HOME/bin

# 环境初始化
source /etc/profile.d/my_env.sh

# 删除冲突jar	cd /opt/module/hive/lib
mv log4j-slf4j-impl-2.10.0.jar log4j-slf4j-impl-2.10.0.jar.bak

# Hive元数据配置到MySQL
cp /opt/software/mysql-connector-java-5.1.38.jar /opt/module/hive/lib/

# 配置Metastore到MySQL cd $HIVE_HOME/conf	新建hive-site.xml文件
vim hive-site.xml

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

## Hive UDF

**函数类型**

- 用户名脱敏: 李佳奇 -> 乐勒蹲
- 证件号脱敏
- 通信地址: 奇数转为X : 上海市浦东新区经济开发区 -> 上X市浦X新X经X开X区
- 通讯号码: 后六位转换
- Email地址: 统一指定邮箱 bianxing@bian.xing
- IP: 取模实现
- DNS: 取模实现
- 密钥: 统一编写 "8888888"


## Resources

- [Installing Hive](https://cwiki.apache.org/confluence/display/Hive/AdminManual+Installation)
- [Setting Up Metastore](https://cwiki.apache.org/confluence/display/Hive/AdminManual+Metastore+Administration) [Hive Schema Tool](https://cwiki.apache.org/confluence/display/Hive/Hive+Schema+Tool)
- [Setting Up Hive Web Interface](https://cwiki.apache.org/confluence/display/Hive/HiveWebInterface)
- [Setting Up Hive Server](https://cwiki.apache.org/confluence/display/Hive/AdminManual+SettingUpHiveServer) ([JDBC](https://cwiki.apache.org/confluence/display/Hive/HiveJDBCInterface), [ODBC](https://cwiki.apache.org/confluence/display/Hive/HiveODBC), [Thrift](https://cwiki.apache.org/confluence/display/Hive/HiveServer), [HiveServer2](https://cwiki.apache.org/confluence/display/Hive/Setting+Up+HiveServer2))
- [Hive Replication](https://cwiki.apache.org/confluence/display/Hive/Replication)
- [Hive on Spark: Getting Started](https://cwiki.apache.org/confluence/display/Hive/Hive+on+Spark%3A+Getting+Started)
