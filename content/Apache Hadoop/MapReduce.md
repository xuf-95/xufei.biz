---
title: MR
tags:
  - datastore
  - hadoop
  - framework
date: 2022-01-26
draft: false
---
> [!info] MapReduce 下文简称：MR
>  [[Hadoop|Hadoop]] MR是Google [MapReduce](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)的开源实现；同理Google的MR运行在GFS上，Hadoop MR运行在[[HDFS]] 上

MR的处理流程包括两个步骤：Map和Reduce。Map步骤会将输入的数据进行处理，转换成键值对的形式；Reduce步骤会对Map处理后的键值对进行归并和汇总。MR通过分布式处理大量数据，可以显著提高数据处理效率

**MR的优点包括**

- 分布式计算：MR的分布式计算模型可以在集群中多台计算机上同时处理数据，加速计算速度。
- 容错性：MR可以处理节点失效的情况，保证数据不会丢失。
- 可伸缩性：MR可以根据需要添加更多计算节点，以满足不断增长的数据处理需求。

**MR的缺点包括**

- 代码复杂：编写MR程序需要一定的编程技巧，代码较为复杂
- 低效性：MR在处理小规模数据时效率较低，因为它需要启动很多进程来处理数据
- 实时性差：MR不适用于实时数据处理，因为数据处理需要多个步骤和较长的处理时间

## MR 整个执行流程

### map阶段两个步骤

​	第一步：读取文件，解析成key,value对

​	第二步：自定义map逻辑，接收k1   v1  转换成新的k2   v2输出

### shuffle阶段四个步骤

#### map阶段shuffle

​	第三步：分区	

​	第四步：排序

​	第五步：规约

#### reduce阶段的shuffle

​	第六步：分组

### reduce阶段两个步骤

​	第七步：自定义reduce逻辑

​	第八步：输出数据

## 自定义inputformat合并小文件

- 上传之前的合并。文件都给合并到了一起分不开，只适用于同一类型的文件
- 上传之后的合并。已经有了大量的小文件再hdfs上面了，可以通过自定义inputformat实现文件的读取，然后将文件输出成sequenceFile类型的
- 我们将文件转换成sequenceFile之后，我们到时候读取的时候,使用SequenceFileInputFormat来读取，这个文件就又会读取成一个个的文件
- 使用har归档文件

## MR的组件功能

第一步：读取文件  自定义 inputformat实现小文件的合并

第二步：自动mapper

第三步：自定义分区，不同的数据划分到不同的reduce里面去

	​将相同key发送到同一个reduce里面去。相同key合并，value形成一个集合

第四步：排序  二级排序

第五步：规约  优化组件

第六步：分组 就差这一步没有自定义  有默认值，不用我们管，但是我们如果需要自定义也可以自定义

	将相同key，合并，value形成一个集合

第七步：自定义reduce

第八步：自定义输出 自定义输出实现文件输出不同的文件夹里面去

### mapTask的运行机制

​	第一步：读取文件，解析成key,value对

​	第二步：自定义map逻辑  接收k1    v1   转换成k2   v2
	
	k2,v2写入到环形缓冲区  ==》  100M的内存   ===》  分区，排序，规约   ===》  80%  ==》  开始溢写，将80M的文件dump到磁盘里面去   ==》  磁盘里面产生很多小文件   ==》mapTaks结束以后  ==》  产生临时小文件进行合并成为一个大文件  等待reduceTask来拉取数据

### redcueTask的运行机制

maptask结束之后，reduceTask开始启动   ==》 启动线程去每个maptask里面拉取属于自己的数据，分区的标记  ==》拷贝过来的数据存储在三个地方，内存，磁盘，内存+磁盘   ==》 分组的过程，排序的过程（reduceTask内部的排序）  ==》 调用reduce逻辑  ==》  数据输出

## MR当中虚拟内核的概念

根据我们服务器的实体机的CPU的配置，设置对应的虚拟内核的个数

i5   ==>  8 个虚拟内核

i7  8带处理器  ==》  16个虚拟内核

默认一个内核虚拟出来8个虚拟内核



## MR 当中的序列化以及反序列化

在mr当中没有沿用java的序列化方法，而是使用hadoop当中自带的Writable接口来实现序列化的功能

Text   LongWritable   IntWritable   这些基本类型都实现了序列化

如果要实现序列化，那我们就实现writable接口即可

如果既要序列化，也要进行排序，实现WritableComparable接口即可

二次排序：如果第一列相等，那么就对第二列进行排序

注意：在hadoop当中，默认Text   LongWritable   IntWritable  这些类型都是按照字典顺序进行排序的，默认排序规则是作用在key2上面，需要对谁排序，你就把谁当做key2即可

## MR 调优

### 资源相关的一些参数

以下调整参数都在mapred-site.xml这个配置文件当中有

// 以下参数是在用户自己的mr应用程序中配置就可以生效

(1) MR.map.memory.mb: 一个Map Task可使用的资源上限（单位:MB），默认为1024。如果Map Task实际使用的资源量超过该值，则会被强制杀死。

(2) MR.reduce.memory.mb: 一个Reduce Task可使用的资源上限（单位:MB），默认为1024。如果Reduce Task实际使用的资源量超过该值，则会被强制杀死。

(3) mapred.child.java.opts  配置每个map或者reduce使用的内存的大小，默认是200M

(4) MR.map.cpu.vcores: 每个Map task可使用的最多cpu core数目, 默认值: 1

(5) MR.reduce.cpu.vcores: 每个Reduce task可使用的最多cpu core数目, 默认值: 1

//shuffle性能优化的关键参数，应在yarn启动之前就配置好

(6)MR.task.io.sort.mb   100         //shuffle的环形缓冲区大小，默认100m

(7)MR.map.sort.spill.percent   0.8    //环形缓冲区溢出的阈值，默认80%

//应该在yarn启动之前就配置在服务器的配置文件中才能生效

以下配置都在yarn-site.xml配置文件当中配置

(8) yarn.scheduler.minimum-allocation-mb        1024   给应用程序container分配的最小内存

(9) yarn.scheduler.maximum-allocation-mb       8192  给应用程序container分配的最大内存

(10) yarn.scheduler.minimum-allocation-vcores      1     container最小的虚拟内核的个数

(11)yarn.scheduler.maximum-allocation-vcores      32 container最大的虚拟内核的个数

(12)yarn.nodemanager.resource.memory-mb   8192  每个nodemanager给多少内存


## MR 的分区以及reduceTask的个数

分区：将相同类型的数据发送到同一个reduce里面去。

物以类聚，人以群分，相同的数据发送到同一个reducetask里面去

reduceTask的个数：自己定义的，job.setNumReduceTasks(8)

mr当中的combiner  规约组件：调优用的，在map端对相同key2进行一次聚合，减少发送到reduce端的key2的数据量


## [MR](https://cwiki.apache.org/confluence/display/HADOOP2/MR) algorithm 

- [HadoopMR](https://cwiki.apache.org/confluence/display/HADOOP2/HadoopMR)
- [HadoopMapRedClasses](https://cwiki.apache.org/confluence/display/HADOOP2/HadoopMapRedClasses)
- [HowManyMapsAndReduces](https://cwiki.apache.org/confluence/display/HADOOP2/HowManyMapsAndReduces)
- [TaskExecutionEnvironment](https://cwiki.apache.org/confluence/display/HADOOP2/TaskExecutionEnvironment)
- [HowToDebugMRPrograms](https://cwiki.apache.org/confluence/display/HADOOP2/HowToDebugMRPrograms)
- Examples
    - [WordCount](https://cwiki.apache.org/confluence/display/HADOOP2/WordCount)
    - [Python Word Count](https://cwiki.apache.org/confluence/display/HADOOP2/PythonWordCount)
    - [C/C++ Word Count](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=120729874)
    - [Grep](https://cwiki.apache.org/confluence/display/HADOOP2/Grep)
    - [Sort](https://cwiki.apache.org/confluence/display/HADOOP2/Sort)
    - [RandomWriter](https://cwiki.apache.org/confluence/display/HADOOP2/RandomWriter)
    - [How to read from and write to HDFS](https://cwiki.apache.org/confluence/display/HADOOP2/HadoopDfsReadWriteExample)
- Benchmarks
    - [Hardware benchmarks](https://cwiki.apache.org/confluence/display/HADOOP2/HardwareBenchmarks)
    - [Data processing benchmarks](https://cwiki.apache.org/confluence/display/HADOOP2/DataProcessingBenchmarks)