---
title: "基础设施即代码-PXE"
date: 2021-08-30T23:22:00+08:00
---

# 基础设施即代码-PXE

自从上次搞定了homelab机器之后，就开始基础设施即代码的第一步了 PXE启动。

也许你要问了，现在云这么方便PXE这玩意还用得上吗？话说还真是这样，目前大多数时候我们已经用不上这个古老的技术了。在很久以前无盘工作站或者虚拟化的时候，这玩意还是很吃香的。不过这并不影响我们作为一个技术去了解它。而且，现在的一些云厂商或者需要做烧制镜像之前，用PXE还是可以能省不少事的。况且还可以在没有U盘的时候安装系统，何乐不为？（别问我怎么知道的，机器到了之后我就经历了到处借U盘装系统的窘境）

前面介绍完了，下面开始介绍这个古老的技术吧：

## PXE

先来一段维基百科上的介绍

> **预启动执行环境**（**Preboot eXecution Environment**，**PXE**，也被称为**预执行环境**）提供了一种使用网络接口（Network Interface）启动计算机的机制。这种机制让计算机的启动可以不依赖本地数据存储设备（如硬盘）或本地已安装的操作系统。
>
> PXE当初是作为[Intel](https://zh.wikipedia.org/wiki/Intel)的[有线管理](https://zh.wikipedia.org/w/index.php?title=有线管理&action=edit&redlink=1)体系的一部分，[Intel](https://zh.wikipedia.org/wiki/Intel) 和 [Systemsoft](https://zh.wikipedia.org/w/index.php?title=Systemsoft&action=edit&redlink=1)于1999年9月20日公布其规格(版本2.1)[[1\]](https://zh.wikipedia.org/wiki/预启动执行环境#cite_note-pxespec-1)。通过使用像[网际协议](https://zh.wikipedia.org/wiki/网际协议)（IP）、[用户数据报协议](https://zh.wikipedia.org/wiki/用户数据报协议)（UDP）、[动态主机设定协定](https://zh.wikipedia.org/wiki/动态主机设定协定)（DHCP）、[BOOTP](https://zh.wikipedia.org/wiki/BOOTP)、[小型文件传输协议](https://zh.wikipedia.org/wiki/小型文件传输协议)（TFTP）等几种[网络协议](https://zh.wikipedia.org/wiki/网络协议)和[全局唯一标识符](https://zh.wikipedia.org/wiki/全局唯一标识符)（GUID）、[通用网络驱动接口](https://zh.wikipedia.org/wiki/通用网络驱动接口)（UNDI）、[通用唯一识别码](https://zh.wikipedia.org/wiki/通用唯一识别码)（UUID）的概念并通过对客户机（通过PXE自检的电脑）[固件](https://zh.wikipedia.org/wiki/固件)扩展预设的[API](https://zh.wikipedia.org/wiki/API)来实现目的。

这里可以看出来，这玩意涉及的技术主要有如下两个：

- DHCP（IP）
- TFTP（UDP 69）

相关的流程借用下往上的图片

![PXE流程](https://yimeng.cn-bj.ufileos.com/blog/20210830233150.png)

1. 主机对DHCP服务器说，给我一个IP地址，并且给我一个TFTP地址（[RFC5859](https://datatracker.ietf.org/doc/html/rfc5859) Option Codes 128-223）。
2. 主机用TFTP协议去主机上下载启动所需的引导文件[pxelinux.0](https://en.wikipedia.org/wiki/SYSLINUX#PXELINUX)和配置文件pxelinux.cfg/default（[rfc5071](https://datatracker.ietf.org/doc/html/rfc5071) Option Codes 209-211）。这个文件的引导顺序[参见这里](https://wiki.syslinux.org/wiki/index.php?title=PXELINUX)
3. 从pxelinux.cfg/default文件中把kennel文件vmlinuz，initrd.img下载回来进行引导。
4. 再向DHCP为linux内核请求一个IP地址。
5. 使用第二次请求的IP地址，将ks.cfg下载下来进行自动化安装。
6. 可选：将需要安装的操作系统通过http的方式将ks文件和iso文件放到某目录下，这个就是default文件之后的事情了。~~这玩意其实就是个[GRUB](https://zh.wikipedia.org/wiki/GNU_GRUB)~~ 。这里牵涉到了另外几个知识点。一会详细介绍，先把pxelinux.cfg/default的配置放出来。

```ini
#cat pxelinux.cfg/default
default vesamenu.c32
prompt 0
timeout 3
ONTIMEOUT CentOS 7

LABEL CentOS 7
        MENU LABEL CentOS 123
        KERNEL vmlinuz
        #APPEND ks initrd=initrd.img ramdisk_size=100000 ksdevice=eth1 ip=dhcp url --url http://192.168.33.11/
  	append initrd=initrd.img ks=tftp://xxx.xxx.xxx.xxx/anaconda-ks.cfg
```

好了 下面开始说一下关于引导的知识点了

## 有关引导

关于引导维基百科里有一个专业的[对比](https://en.wikipedia.org/wiki/Comparison_of_boot_loaders)

不过在这之前先说一下BIOS和UEFI的区别和对比吧

当然也少不了MBR和GPT的对比

作为好久不碰硬件的人来说，我的知识水平还停留在BIOS+MBR的时代。

### BIOS vs UEFI

一句话总结就是BIOS是很久以前用于跟硬件打交道的，一般跟磁盘上的MBR配合使用，但后来由于时代发展。BIOS有那么一点点跟不上时代了。就产生了UEFI，就是这么简单。但其实BIOS这个词应该是包含UEFI的，说白了就是跟各种硬件打交道的“操作系统”。只要你一开机执行的就是他们，他们再负责从各种地方，比如说磁盘的MBR或者GPT区域把操作系统引导起来。

具体详情可以参考知乎：[UEFI 引导与 BIOS 引导在原理上有什么区别？](https://www.zhihu.com/question/21672895)

### MBR vs GPT

这两位兄弟其实是针对BIOS/UEFI 之后的磁盘引导来说的，网络启动其实跟他俩没啥太大的关系。

如果启动设备是磁盘，就要读取MBR/GPT上的信息载入，再从这些信息中识别操作系统。

MBR：一段磁盘里的玄学区域，DOS时代只能用fdisk /mbr来备份或者覆盖。有这祖传四个主分区的习惯。

GPT：无限分区，支持大于2.2T磁盘，不区分主分区逻辑分区啥的概念了。反正就是较为先进的一种磁盘引导格式。

具体详情可以参考知乎[UEFI+GPT与BIOS+MBR各自有什么优缺点？](https://www.zhihu.com/question/28471913)

说完一开机的BIOS/UEFI+MBR/GPT之后，就来到我们的主角[引导程序](https://zh.wikipedia.org/wiki/啟動程式)了。

另外说一句 PXE的DHCP的过程其实跟这个磁盘上的MBR/GPT过程差不太多，因为刚刚介绍过了，这里就不赘述了。

### 引导程序

常见的如下

- [GNU GRUB](https://en.wikipedia.org/wiki/GNU_GRUB)：基本上搞Linux的应该没有不知道这个的，还经常被用到了各种装机光盘中。但这个引导程序有个小问题，虽然支持网络启动，但是可能资料比较难找。所以在PXE这个事情上，大家都转投了SYSLINUX
- [SYSLINUX](https://en.wikipedia.org/wiki/SYSLINUX)：经常用来当成各种Linux的Live光盘上的引导程序，并且包含的PXELinux基本上一统PXE启动的江山了。
- [Windows Boot Manager](https://en.wikipedia.org/wiki/Windows_Boot_Manager)：根据资料显示会有三个组件出现bootmgr winload.exe winresume.exe具体实在是没有经历去研究了，看起来跟以前DOS时代的CONFIG.SYS、COMMAND.COM、AUTOEXEC.BAT还有IO.SYS、MSDOS.SYS差不多。

那么我们的PXE所使用的[syslinux](https://wiki.syslinux.org/wiki/index.php?title=PXELINUX)里的default配置文件格式看起来跟GRUB里的配置文件很像，但确实不是。相关的语法应该所有区别。syslinux的配置文件[详见这里](https://wiki.syslinux.org/wiki/index.php?title=Config)，GRUB的配置文件[详见这里](https://wiki.archlinux.org/title/GRUB#Custom_grub.cfg)

引导程序还有很多很多，并且功能也不尽相同，详见可以看下wiki中的矩阵图。

## 有关协议

既然是PXE，技术里逃不出DHCP和TFTP，HTTP虽然也可以算，但毕竟不是主角，且内容较多，这里先略过了。

### DHCP

这个协议主要就是用于给终端动态分配IP地址，来达到IP地址复用，有效利用IP地址池。并且也加入了一些管理的功能。这些管理的功能就包含了PXE所需的几个重要Option Codes :

- [RFC 4578](https://tools.ietf.org/html/rfc4578) - November 2006 - DHCP Options for PXE
- [RFC 5071](https://tools.ietf.org/html/rfc5071) - December 2007 - DHCP Options used by PXELINUX

### TFTP

这个协议其实在没啥好介绍的，比FTP简单很多很多，没有了什么主动被动模式。20 21端口啥的区分。就监听一个UDP69的端口即可。但有时候过于简单，甚至不能列出目录的文件。所以临时用来传个小文件倒没什么问题。这里就不做过多赘述了。

## 需要做啥

- 在DHCP上设置好**Next Server**和**Boot File Name**参数
- 找台在DHCP可达范围内的服务器，开个TFTP服务。
- TFTP里面放上
  - pxelinux.0  引导文件
  - pxelinux.cfg/default 配置文件
  - vmlinuz，initrd.img 两个文件
  - anaconda-ks.cfg 自动安装脚本
- 找个机器可以启动了

## 注意事项

- 别在生产环境中晚DHCP。
- 别设置PXE作为第一启动，最好是磁盘找不到了再用PXE启动。（危险系数小一些，但不可避免还是有风险）
- 那个选择菜单可用可不用，找不到而已，默认还会正常加载的。

## 后记

这个PXE中间停顿了3-5天，导致有点虎头蛇尾，后来都不知道自己要写啥了。看起来以后先把大纲打好，一鼓作气再而衰三而竭。下一次应该写写自动化安装完毕的cloud-init，再接下来应该是puppet、ansible、salt了。