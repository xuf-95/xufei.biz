---
title: Spark SQL
tags:
  - spark-sql
  - Spark
date: 2022-01-25
draft: false
---
Spark SQL is the module within Apache Spark that provides structured data processing capabilities. This document provides a technical overview of Spark SQL's architecture, explaining how SQL queries and DataFrame operations are parsed, analyzed, optimized, and executed within the Spark framework. For information about the user-facing APIs, see [Apache Spark Overview](https://deepwiki.com/apache/spark/1-apache-spark-overview).

## Core Components of Spark SQL

Spark SQL's architecture consists of several key components that work together to process structured data:

![[Core Components of Spark SQL.png]]

## SQL Parsing

The parsing phase converts SQL text into an unresolved logical plan. Spark SQL uses ANTLR4 for parsing SQL statements:

