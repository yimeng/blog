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

## 问题

这个方案在runner那调用powershell或者cmd的时候会有一些问题，例如执行时间太长（调用vagrant的时候下载box），runner中看不到回显，排错问题等等。因此执行一些简单的任务还可以，用于ci操作系统镜像还是有点问题。可以建议将runner放到VirtualBox的linux的虚拟机中进行执行。避开windows没有管理员权限和调试的窘境。

## 扩展

如果可以还可以用cloudflare把相关端口暴露出去，这样就可以通过外网访问办公室的实验环境了，但需要做好相应的安全措施。但目前没有管理员权限，只能作罢。