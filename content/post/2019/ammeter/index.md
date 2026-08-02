---
title: "家用功率监控"
date: 2019-08-11T17:36:49+08:00
---

# 智能家居-家用功率监控
智能家居-总功率监控



## 背景

研究homelab机器的时候，忘记在哪个论坛里看到一个人的回复：家里整体功耗才是王道

然后就开始了如下的折腾之路，后来就找不到相关的帖子了，自己摸索之后。帖子又奇迹的出现了，正好也找一些资料供大家参考。我这个最终版可能少了一些自己DIY的过程，多半部分在于应用层。硬件和modbus协议部分自己搞了一周也没搞定，后来感谢有个IoT的同事帮忙，一晚上就搞定了。


## 架构

### 软件架构

#### 监控展现：

因为是运维背景，很容易就想到了平时做的监控系统: 
nagios历史比较长了，而且数据不是时序数据库，需要集成的东西较多，就没选。
看了一圈综合起来采集数据监控层还是prometheus比较适合，自带时序数据库，部署方便。展现层grafana易集成。
时序数据库就用prometheus自带的吧。懒的折腾influxdb了。

#### 数据采集：
prometheus需要自己根据modbus协议自己写个exporter，正好研究prometheus的golang的SDK，就顺手了个。

### 硬件架构

#### 电表
支持modbus的电表不用说了，但因为家里的电箱空间比较小，因此1P的比较适合。

#### 协议
modbus2tcp: 家里的串口设备也没有那么多，开始有同事建议用TTL转485的，但是TTl的只有树莓派，一直以来感觉树莓派不太稳定。再加上对TCP协议更熟悉一些，所以决定找一个modbus转tcp的转换器，同理也是越小越好。所以就某宝入了一个HF7121，也是冲着体积小去的。一开始买了另一个，体积大不说，调试还没调明白。

#### 传输
家里没有装修 因此走明线也是可以接受的，所以放弃了各种wifi或者无线的方式。既然可以走线就直接上网线了8根线中的两根，剩下的线还可以用作以后的扩展。

### 数据流：

1. Prometheus查询exporter
1. exporter 通过TCP<=>modbus(RS465)<=>电表 进行数据获取
1. Prometheus把数据存入时序数据库
1. grafana => 时序数据库进行查询


这个能干吗：
1. 可以看到自己家的用电量情况
2. 可以看到各种用电器的用电特性（微波炉 变频空调）
3. 加上点人工智能做智能家居
4. 学以致用，初中那些物理知识重新回顾下

### 最终效果图：

![ammeter](./ammeter.png)

### 参考资料

- https://bbs.hassbian.com/thread-5634-1-1.html
- https://bbs.hassbian.com/forum.php?mod=viewthread&tid=7736
- https://bbs.hassbian.com/forum.php?mod=viewthread&tid=1662
- https://bbs.hassbian.com/forum.php?mod=viewthread&tid=1472
- https://bbs.hassbian.com/forum.php?mod=viewthread&tid=6081





