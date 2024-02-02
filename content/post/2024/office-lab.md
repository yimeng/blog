---
title: "办公室实验环境"
date: 2024-02-02T10:45:00+08:00
---

## 背景

日结工的公司发了一个加入域的windows11笔记本，没有管理员权限。只能放到那里当成一个大的打卡机，有点浪费。如何有效的利用起来？

## 方案

正好对于gitops比较感兴趣，因此规划了如下几个场景功能：

- 虚拟机
- git仓库
- 利用vagrant和ci做一些镜像的测试工作

## 部署图

![image-20240202104716512](http://pic.chenym.net/blog/image-20240202104716512.png)

部署图如上，选取了gitea的一个二进制进行部署。然后使用cloudflare进行了泛域名解析，用traefik来进行域名的路由。gitea的runner负责在windows机器上执行各种命令。控制vagrant和VirtualBox来进行镜像打包。有时候这个机器的wifi可能不太好用，使用runner定时重启一下。别问我为啥不用windows自己的服务。没有管理员权限只能用这些骚操作了。

## 代码

相关配置文件可以移步如下git仓库进行获取

```
https://github.com/yimeng/office-lab.git
```

