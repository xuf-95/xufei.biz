---
title: Hadoop Yarn
tags:
  - hadoop
  - data-architecture
date: 2022-01-25
draft: false
description: Yet Another Resource Negotiator
---

## Yarn Overwrite 

> [!info]
> YARN 是 Yet Another Resource Negotiator（另一个资源管理器）的缩写，可充当 Hadoop 堆栈的集群协调组件。该组件负责协调并管理底层资源和调度作业的运行。通过充当集群资源的接口，YARN 使得用户能在 Hadoop 集群中使用比以往的迭代方式运行更多类型的工作负载



> Yarn是hadoop2.x当中新出来的架构模块
> hadop2.x当中，将我们[[MapReduce]]的模块取代了，变成了yarn的资源调度; mr模块还是保留，运行在yarn上面。由yarn集群来统一的管理分配资源

资源调度器是Yarn中最核心的组件之一，他是ResourceManager中的一个可插拔的服务组件，负责整个集群的管理和分配。目前Yarn中的作业类型:

  - 批处理作业,这种作业比较耗时，对时间的完成没有严格要求，如数据挖掘和机器学习等;
  - 交互式作业，这种作业一半希望能够及时的返回结果，例如：HiveSQL 查询;
  - 生产性作业:这种作业要求有一定量的资源保证，如统计值计算,垃圾数据分析等;

> 为了满足多用户多队列的资源分配问题以及Yarn自带的FIFO(先进先出资源调度器)单队列的问题，又引入了Yahoo的Capacity Scheduler和FaceBook的Fair Scheduler

## Yarn的资源调度器的基本架构

资源调度器作为Yarn中的可插拔的资源调度器,它定义了一套接口规范以便用户可按照规范实现自己的调度器，本文主要从资源调度器的可插拔性和时间处理器两方面来说

1.ResourceScheduler之插拔式组件

```java
  protected ResourceScheduler createScheduler() {
    String schedulerClassName = conf.get(YarnConfiguration.RM_SCHEDULER,
        YarnConfiguration.DEFAULT_RM_SCHEDULER);
    LOG.info("Using Scheduler: " + schedulerClassName);
    try {
      Class<?> schedulerClazz = Class.forName(schedulerClassName);
      if (ResourceScheduler.class.isAssignableFrom(schedulerClazz)) {
        return (ResourceScheduler) ReflectionUtils.newInstance(schedulerClazz,
            this.conf);
      } else {
        throw new YarnRuntimeException("Class: " + schedulerClassName
            + " not instance of " + ResourceScheduler.class.getCanonicalName());
      }
    } catch (ClassNotFoundException e) {
      throw new YarnRuntimeException("Could not instantiate Scheduler: "
          + schedulerClassName, e);
    }
  }
```

资源调度器的实现必须实现ResourceScheduler接口,代码如下:

```java
@LimitedPrivate("yarn")
@Evolving
public interface ResourceScheduler extends YarnScheduler, Recoverable {

  /**
   * Set RMContext for <code>ResourceScheduler</code>.
   * This method should be called immediately after instantiating
   * a scheduler once.
   * @param rmContext created by ResourceManager
   */
  void setRMContext(RMContext rmContext);

  /**
   * Re-initialize the <code>ResourceScheduler</code>.
   * @param conf configuration
   * @throws IOException
   */
  void reinitialize(Configuration conf, RMContext rmContext) throws IOException;
}
```

而ResourceScheduler实现了YarnScheduler接口，代码如下:

```java
public interface YarnScheduler extends EventHandler<SchedulerEvent> {

  /**
   * Get queue information
   * @param queueName queue name
   * @param includeChildQueues include child queues?
   * @param recursive get children queues?
   * @return queue information
   * @throws IOException
   */
  //todo 获取一个队列信息
  @Public
  @Stable
  public QueueInfo getQueueInfo(String queueName, boolean includeChildQueues,
      boolean recursive) throws IOException;

  /**
   * Get acls for queues for current user.
   * @return acls for queues for current user
   */
  //todo 返回当前用户的队列Acl权限
  @Public
  @Stable
  public List<QueueUserACLInfo> getQueueUserAclInfo();
  
  .......
```

### yarn的具体架构：

resourceManager：主节点，接收客户端任务请求，分配资源

nodeManager：从节点，主要负责执行任务

appMaster：每一个任务都要启动一个对应的appMaster进程。全权负责管理任务的执行，包括资源的申请，container划分，任务执行情况的汇报（给resourceManager汇报），资源的回收等等

container：资源划分的容器，所有的资源的分配都是以container为单位的。便于我们资源的管理

jobHistoryServer：查看所有完成任务的历史的日志

TimeLineServer：查看正在执行的任务的情况，hadoop2.4.0以后的新特性。没什么用。实际工作当中一个mr的任务可能跑好几个小时

## yarn当中的调度器

调度器主要研究的是任务的执行流程。先提交一个任务，还没执行完成，再提交一个任务怎么办。研究并行的任务如何执行的

yarn当中主要有三种调度器

1: FIFO  队列调度器   先来先执行，后来的任务都等着。队列式的串行的任务

​	第一个大任务，执行两个小时，	第二个小任务，执行两分钟

​	这种调度器没人用

2: capacity scheduler  容量调度器  apache版本的hadoop默认使用的调度器

​	将我们资源及进行划分成不同的梯队

10G内存  ==》  10%  1Gb   70% 7Gb  20%  2Gb

提交一个任务，都能找到最合适的梯队去执行

缺陷：将资源划散了，一个大任务来了，没法快速满足所需要的资源

3: fair  scheduler  公平调度器  CDH版本默认使用的调度器

不划散资源，第一个任务提交，将所有的资源都给第一个任务，保证第一个任务快速的执行完成

万一第一个任务没有执行完成吗，第二个任务来了，将第一个任务当中的资源，划出来一块给第二个任务




### References

- https://www.jianshu.com/p/861af1cc89f1