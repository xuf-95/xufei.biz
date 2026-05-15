---
date: 2022-01-09
aliases:
tags:
  - hadoop
  - hive
  - script
description:
draft: false
publishDate: 2026-03-03T10:55
---
```shell
#!/bin/bash
host=localhost
port=3306
user=bigdata
metastore=metastore
path=/opt/data/
sql="                              
SELECT                                    
        db_name AS "数据库名称",                             
        tbl_name AS "数据表名称",          
        tbl_num_file AS "文件数量",
        tbl_raw_data_size AS "占用空间",
        -- tbl_total_size,type AS "所属用户类型",                   
        create_time AS "创建时间", 
        tbl_transient_lastddl_time AS "修改时间",           
        tbl_type AS "表类型",      
        tbl_comment AS "表描述",   
        col_name AS "字段名称",    
        col_type_name AS "字段类型",            
                SD_ID,             
                COMMENT AS col_comment, 
                COLUMN_NAME AS col_name,
                TYPE_NAME AS col_type_name                  
        FROM (                     
                SELECT             
                        COLUMNS_V2.CD_ID,                   
                        SD_ID,     
                        COMMENT,   
                        COLUMN_NAME,
                        TYPE_NAME  
                FROM $metastore.COLUMNS_V2                
                INNER JOIN $metastore.SDS S ON COLUMNS_V2.CD_ID = S.CD_ID                                                     
        )  tbl_temp                
) col                              
INNER JOIN (                       
        SELECT                     
                tbl.DB_ID,         
                tbl.TBL_ID,        
                tbl.SD_ID,         
                DB_NAME AS db_name,
                TBL_NAME AS tbl_name,   
                tbl_num_file,      
                tbl_raw_data_size, 
                tbl_total_size,    
                tbl_num_row,       
                OWNER AS tbl_owner,
                OWNER_TYPE AS tbl_owner_type,               
                FROM_UNIXTIME(CREATE_TIME) AS create_time,  
                -- IF(tbl_last_modified_time = 0, null,FROM_UNIXTIME(tbl_last_modified_time, '%Y-%m-%d %H:%i:%S')) tbl_last_modi
fied_time,                         
                -- FROM_UNIXTIME(tbl_last_modified_time, '%Y-%m-%d %H:%i:%S') tbl_last_modified_time,                           
                -- IF(tbl_transient_lastddl_time = 0, null,FROM_UNIXTIME(tbl_transient_lastddl_time, '%Y-%m-%d %H:%i:%S')) tbl_t
ransient_lastddl_time,             
                FROM_UNIXTIME(tbl_transient_lastddl_time, '%Y-%m-%d %H:%i:%S') tbl_transient_lastddl_time,                      
                TBL_TYPE AS tbl_type,   
                tbl_comment        
        FROM (                     
                SELECT             
                        TBL_ID,    
                        SUM(IF(tbl_temp.PARAM_KEY = 'numFiles', tbl_temp.PARAM_VALUE, 0)) AS tbl_num_file,                      
                        SUM(IF(tbl_temp.PARAM_KEY = 'rawDataSize', tbl_temp.PARAM_VALUE, 0)) AS tbl_raw_data_size,              
                        SUM(IF(tbl_temp.PARAM_KEY = 'totalSize', tbl_temp.PARAM_VALUE, 0)) AS tbl_total_size,                   
                        SUM(IF(tbl_temp.PARAM_KEY = 'numRows', tbl_temp.PARAM_VALUE, 0))  AS tbl_num_row,                       
                        MAX(IF(tbl_temp.PARAM_KEY = 'transient_lastDdlTime', tbl_temp.PARAM_VALUE,0)) AS tbl_transient_lastddl_t
ime,                               
                        MAX(IF(tbl_temp.PARAM_KEY = 'last_modified_time', tbl_temp.PARAM_VALUE,0)) AS tbl_last_modified_time,   
                        MAX(IF(tbl_temp.PARAM_KEY = 'comment', tbl_temp.PARAM_VALUE, 0)) AS tbl_comment                         
                FROM (             
                        (          
                                SELECT  
                                                Part.TBL_ID,
                                                PP.PARAM_KEY,                                                                   
                                                PP.PARAM_VALUE                                                                  
                                FROM $metastore.PARTITIONS Part                                                               
                                INNER JOIN $metastore.PARTITION_PARAMS PP                                                     
                                ON Part.PART_ID = PP.PART_IDLL  
                        SELECT *   
                        FROM $metastore.TABLE_PARAMS      
                ) tbl_temp         
                GROUP BY tbl_temp.TBL_ID
        ) tbl_base                 
        INNER JOIN $metastore.TBLS tbl
        ON tbl_base.TBL_ID = tbl.TBL_ID 
        INNER JOIN (               
                SELECT DB_ID, Name AS DB_NAME FROM $metastore.DBS -- WHERE NAME='tz_parking'                                  
        ) db_info                  
        ON db_info.DB_ID=tbl.DB_ID 
) tbl                              
ON tbl.SD_ID=col.SD_ID             
ORDER BY db_name,tbl_name          
;                                  
"
result=$(mysql -h $host -P $port -u$user -p -e "$sql" >${path}hive_meta.xls)

```

## hive-batch-export.sh

```shell
#!/bin/bash
rm -rf tablesDDL.txt
for hiveTabName in $(hive -e "show tables 'rcd*';")
do
hive -e "show create table $hiveTabName" >>tablesDDL.txt
echo -e "---------------------------- $hiveTabName table structure generate finished! -------------------------------\n\n">>tablesDDL.txt
done

```