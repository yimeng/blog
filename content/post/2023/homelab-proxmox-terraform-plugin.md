---
title: "由terraform-proxmox-provider想到的"
date: 2023-12-07T18:22:00+08:00
---

## 背景

前几天看到一个直播，发现了一个[国内的创业公司](https://www.seal.io/zh)发布了一个[IaC的平台系统](https://seal-io.github.io/docs/zh/)。原理就是利用Terraform和K8S的能力，为开发者提供了一个基础设施创建以及编排的平台。试用了下，虽然还不太完善，但总体的功能和思路还是非常不错的。轻量级，可以利用Terraform的插件生态（pulumi也是这么搞，不然适配各种云的成本真的很高）。

因为这个系统依赖Terraform的模块，以前正好写过一个[基于proxmox的Terraform模块](https://github.com/yimeng/terraform-proxmox-module) 。然而，由于我的proxmox升级到了8.0.4了之后，使用了[telmete的proxmox provider的插件](https://github.com/Telmate/terraform-provider-proxmox)，就出现了crashed的现象，详见[Error: The terraform-provider-proxmox_v2.9.14 plugin crashed! (Proxmox 8.0.4 latest update)](https://github.com/Telmate/terraform-provider-proxmox/issues/863) 的讨论。

然后就开始有人谈论关于telmete的provider是否已经不更新了：

[Is the Proxmox provider dead?](https://github.com/Telmate/proxmox-api-go/issues/281)

还有人已经转向了[另一个proxmox的provider](https://github.com/bpg/terraform-provider-proxmox)

然后经过一番努力，还是有人进行了一个修复[Fix: memory type conversion panic](https://github.com/Tinyblargon/proxmox-go-sdk/pull/7) 不过可能需要重新的编译或者等待。



## 开源

当软件产品更新越来越快，开源软件之间的适配也越来越繁琐。君不见k8s的API和周边生态，真的是日新月异。各种微服务的复杂度在实施的时候也是各种百花齐放。经历过centos的大版本缓慢的变化的时期，步入了容器微服务的时代。不知道这事是好是坏。宠物和牛的变化的观念可能占据了主流。但是商业产品在这一点上可能会变成一个“卖点”，解决各种版本的兼容和适配问题。毕竟客户面临这还有维护成本和历史债务问题，这部分虽然不好啃，但可能依旧是刚需。

话说回来，我这个重启Terraform的proxmox的模块，打算明天看看是否能够升级下插件版本。另一方面，也需要转向另一个插件进行下模块重构了。虽然有成本，但也不得不做。毕竟开源就是有这种问题，随大流不一定技术正确，但可能是市场正确的唯一选择。只是这么做就可惜了好多好的技术和产品了。（例如SUN）

## 后记

留个坑，待更新。

















