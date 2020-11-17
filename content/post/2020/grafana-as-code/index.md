---
title: "Grafana最佳实践"
date: 2020-10-31T09:25:49+08:00
---



# grafana最佳实践

## 前言

上次说到，后面会针对Grafana，使用对于监控指标的可视化方面做个大致的介绍。大致内容有

- Grafana最佳实践
- Grafana as Code

为什么要讲的是这两点？

前一阵子在做基础监控的项目，既然做监控就离不开展示，做展示大屏又离不开Grafana。做Grafana就想了解下知道最佳实践，最佳实践里有一条Grafana as Code。结合这个路子，正好在这里说几个做监控时的两个小感悟。

1. 开源产品的展示页基本都比较丑：由奢入俭难，大部分的开源软件的自带dashboard基本上只是可用的级别。
2. 开发都比较懒，运维也比较懒：如果你是做监控工具的，可以的话就帮开发运维把一些通用的dashboard都做好吧，一穷二白的指望他们自己做不太现实，大家都很忙。不管是出人搞定制化，还是用技术的手段。做工具的服务意识要有。

基于以上的两点，在SRE时代，关于大屏有三个点可能要了解和掌握：

1. 了解监控指标分类体系，知道在Grafana上如何展示更直观和合理。
2. 使用代码的方式批量去实现1。
3. 做好培训和布道，帮助开发和运维去更好的使用，回到1。



[The RED Method: How To Instrument Your Services [B] - Tom Wilkie, Kausal](https://www.youtube.com/watch?v=TJLpYXbnfQ4&feature=emb_rel_end) 

https://grafana.com/files/grafanacon_eu_2018/Tom_Wilkie_GrafanaCon_EU_2018.pdf

[将Prometheus，Grafana，RED和USE指标放在一起以改善监控](https://medium.com/thron-tech/how-we-implemented-red-and-use-metrics-for-monitoring-9a7db29382af)

[一个用于生成Grafana仪表板的[Jsonnet](http://jsonnet.org/)库](https://github.com/grafana/grafonnet-lib)

[Tanka](https://grafana.com/go/grafanaconline/tanka-declarative-dashboards-for-declarative-clusters/)

[网站性能优化](https://jimmysong.io/hugo-handbook/steps/website-performence-optimization.html)

[A beginner’s guide to good Grafana dashboard design](https://grafana.com/go/webinar/guide-to-dashboard-design/?pg=blog&plcmt=body-txt)



## 监控指标分类体系

监控指标体系目前有三种主要的分类方式：

- ​	[USE Method](http://www.brendangregg.com/usemethod.html) (from Brendan Gregg): **Utilization, Saturation, and Errors**

- ​	[RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/) (from Tom Wilkie): **Rate, Errors, and Duration**

- ​	[Google SRE book](https://smile.amazon.com/Site-Reliability-Engineering-Production-Systems/dp/149192912X/ref=sr_1_1): **Latency, Traffic, Errors, and Saturation**

  

### USE方法

- 利用率（Utilization）：资源繁忙的时间百分比，例如节点CPU使用率。
- 饱和度（Saturation）：资源必须完成的工作量，通常是队列长度或节点负载。
- 错误（Errors）：错误事件计数。

主要适用场景：

基础结构中的硬件资源，例如CPU，内存和网络设备。



### RED方法

- 速率：每秒请求，每天访问人数等。
- 错误：失败的请求数，
- 持续时间：这些请求花费的时间，延迟测量的分布

主要适用场景：

这种方法比较适用于服务级别，尤其是微服务。对于研发提供的服务，建议每个组件的服务都暴露一些这样的指标。因为RED 的方法比较适合做成看板和统计SLO。在grafana最佳实践中：建议一个服务做成一行，横向放置某一接口的速率和错误和持续时间。

![](https://www.weave.works/docs/cloud/latest/images/monitoring/red-method-dashboard.png)



### SRE黄金指标

此方法与RED方法相似，但包含饱和度。

- 延迟（Latency）：处理请求所需的时间 
- 流量（Traffic）：系统上有多少请求
- 错误（Errors）：失败请求率
- 饱和度（Saturation）：系统有多“满”，例如负载和队列积压。

主要适用场景：

属于较为通用的场景（合集），基本上是个筐，什么都可以往里装。

这里可以说一下Latency里面有一个重要的概念就是Apdex（Application Performance Index）这是一个从APM角度评价性能的标准，主要用于评价用户体验的。比如打开一个服务用的总延迟是多少，根据这个延迟进行一个评分，最后落到0-1之间。



## 指标分类对比

方法没有好坏之分，比如比较以下从USE和SRE的两个角度来对于基础设施监控的维度，其实都是可以的，只要适合自己的系统情况即可。

USE方法是我自己从经验角度来进行的归类。

SRE方法是来自https://www.jianshu.com/p/b01bc69fcc3b 的内容。

但更推荐看https://medium.com/@steve.mushero/linuxs-sre-golden-signals-af5aaa26ebae 里关于系统监控项的内容。

### USE方法

#### CPU

- 利用率（Utilization）：CPU使用率。
- 饱和度（Saturation）：CPU负载。
- 错误（Errors）：CPU错误

#### 内存

- 利用率（Utilization）：内存使用率。
- 饱和度（Saturation）：内存换入换出。
- 错误（Errors）：内存错误 OOM

#### 磁盘

- 利用率（Utilization）：磁盘使用率 inode使用率。
- 饱和度（Saturation）：IO读写流量。
- 错误（Errors）：IO

#### 网络

- 利用率（Utilization）：流量 收发包数 。
- 饱和度（Saturation）：网卡带宽使用率。
- 错误（Errors）：网络设备错误，丢包

#### TCP

- 利用率（Utilization）：单个TCP收发包大小？。
- 饱和度（Saturation）：TCP状态连接数。
- 错误（Errors）：中断？



### SRE黄金指标

- 要测量CPU，以下测量可能是合适的：

  - 延迟：CPU调度程序的平均或最大延迟
  - 流量：CPU利用率
  - 错误：处理器特定的错误事件，出现故障的CPU
  - 饱和度：运行队列长度

  对于内存，信号可能有如下所示：

  - 延迟 :(没有 - 很难找到一个好的测量方法而且不可操作）
  - 流量：正在使用的内存量
  - 错误：内存不足错误
  - 饱和度：OOM杀手事件，交换使用

  对于存储设备：

  - 延迟：读取和写入的平均等待时间（await）
  - 流量：读写I / O级别
  - 错误：文件系统错误，磁盘错误 /sys/devices
  - 饱和度：I / O队列深度

  该网络信号可以是这样的：

  - 延迟：网络驱动程序队列
  - 流量：每秒传入和传出的字节或数据包
  - 错误：网络设备错误，丢包
  - 饱和度：溢出，丢弃数据包，重新传输的段

  对于为客户提供服务的应用程序，四个黄金信号通常可以很容易地选择：

  - 延迟：完成请求的时间
  - 流量：每秒服务请求数
  - 错误：处理客户端请求或访问资源时发生的应用程序错误
  - 饱和度：当前使用的资源的百分比或数量

## 后续

后面会针对grafana，使用对于监控指标的可视化方面做个大致的介绍。大致内容有

- Grafana as Code
- Gitlab grafana最佳实践

## 参考文档

> https://www.youtube.com/watch?v=pOo0oKNM9I8
>
> https://medium.com/faun/how-to-monitor-the-sre-golden-signals-1391cadc7524
>
> https://mint.splunk.com/static/images/landing/splunk/network.png
>
> https://grafana.github.io/grafonnet-lib/
>
> https://xie.infoq.cn/article/be5d880666c29c66b7eff65dc
>
> https://github.com/weaveworks/grafanalib
>
> https://github.com/K-Phoen/grabana
>
> https://sdgmf.github.io/goproject/