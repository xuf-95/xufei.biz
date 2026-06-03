---
title: "personal life record info"
tags:
  - pkm
  - note
date: 2025-06-14
draft: true
publish: false


---

![[content/posts/images/pr-er.png]]


### MySQL DDL

```bash

-- V1.0
-- 时间维度表
CREATE TABLE dim_date (
    date_id INT PRIMARY KEY COMMENT '日期ID (YYYYMMDD)',
    full_date DATE NOT NULL COMMENT '完整日期',
    year SMALLINT NOT NULL COMMENT '年份',
    quarter TINYINT NOT NULL COMMENT '季度 (1-4)',
    month TINYINT NOT NULL COMMENT '月份 (1-12)',
    week TINYINT NOT NULL COMMENT '年内周数 (1-53)',
    day_of_week TINYINT NOT NULL COMMENT '星期几 (1=周一,7=周日)',
    is_holiday BOOLEAN DEFAULT 0 NOT NULL COMMENT '是否节假日',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    INDEX idx_full_date (full_date),
    INDEX idx_year_month (year, month)
) ENGINE=InnoDB COMMENT '时间维度表';

-- 个人乘车信息表
CREATE TABLE fact_transport (
    transport_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '乘车ID',
    date_id INT NOT NULL COMMENT '日期ID',
    vehicle_type VARCHAR(20) NOT NULL COMMENT '交通工具类型',
    start_location VARCHAR(50) COMMENT '出发地',
    end_location VARCHAR(50) COMMENT '目的地',
    cost DECIMAL(10,2) COMMENT '费用',
    distance_km DECIMAL(6,2) COMMENT '距离(公里)',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_vehicle_type (vehicle_type)
) ENGINE=InnoDB COMMENT '乘车信息表';

-- 饮食记录表
CREATE TABLE fact_diet (
    diet_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '饮食ID',
    date_id INT NOT NULL COMMENT '日期ID',
    meal_type VARCHAR(10) NOT NULL COMMENT '餐别',
    food_items TEXT NOT NULL COMMENT '食物清单',
    calories INT COMMENT '卡路里',
    location VARCHAR(50) COMMENT '用餐地点',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_meal_type (meal_type)
) ENGINE=InnoDB COMMENT '饮食记录表';

-- 健身运动记录表
CREATE TABLE fact_exercise (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '运动ID',
    date_id INT NOT NULL COMMENT '日期ID',
    activity_type VARCHAR(20) NOT NULL COMMENT '运动类型',
    duration_min INT NOT NULL COMMENT '时长(分钟)',
    calories_burned INT COMMENT '消耗卡路里',
    equipment VARCHAR(50) COMMENT '使用器材',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_activity (activity_type)
) ENGINE=InnoDB COMMENT '健身运动表';

-- 购物记录表
CREATE TABLE fact_shopping (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '购物ID',
    date_id INT NOT NULL COMMENT '日期ID',
    item_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    category VARCHAR(30) NOT NULL COMMENT '商品类别',
    quantity INT NOT NULL COMMENT '数量',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',
    store VARCHAR(50) COMMENT '商店名称',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_category (category)
) ENGINE=InnoDB COMMENT '购物记录表';

-- 消费记录表
CREATE TABLE fact_expense (
    expense_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '消费ID',
    date_id INT NOT NULL COMMENT '日期ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    payment_method VARCHAR(20) NOT NULL COMMENT '支付方式',
    expense_type VARCHAR(30) NOT NULL COMMENT '消费类型',
    description TEXT COMMENT '详细描述',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_expense_type (expense_type)
) ENGINE=InnoDB COMMENT '消费记录表';

-- 学习记录表
CREATE TABLE fact_learning (
    learning_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '学习ID',
    date_id INT NOT NULL COMMENT '日期ID',
    content_type VARCHAR(20) NOT NULL COMMENT '内容类型',
    title VARCHAR(100) NOT NULL COMMENT '标题/书名',
    duration_min INT COMMENT '时长(分钟)',
    rating TINYINT COMMENT '评分 (1-5)',
    notes TEXT COMMENT '笔记/感想',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    INDEX idx_content_type (content_type)
) ENGINE=InnoDB COMMENT '学习记录表';

-- 每日事实表
CREATE TABLE fact_daily_summary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '汇总ID',
    date_id INT NOT NULL COMMENT '日期ID',
    total_transport INT DEFAULT 0 COMMENT '当日乘车次数',
    total_calories INT DEFAULT 0 COMMENT '当日摄入总卡路里',
    total_exercise_min INT DEFAULT 0 COMMENT '当日运动总时长',
    total_expense DECIMAL(10,2) DEFAULT 0 COMMENT '当日消费总额',
    learning_hours DECIMAL(4,1) DEFAULT 0 COMMENT '当日学习时长(小时)',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录修改时间',
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    UNIQUE KEY unique_date (date_id)
) ENGINE=InnoDB COMMENT '每日汇总表';
```
