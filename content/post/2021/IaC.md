---
title: "基础设施既代码-读书笔记"
date: 2021-09-04T12:10:00+08:00
---

# 基础设施即代码-读书笔记

# 读书人自己的前言

其实k8s也是一种基础设施既代码的实现，其中很多理念IaC是相同的。只不过IaC中并没有调度。

## 第一部分　基础

### 第1章　挑战与原则

#### 1.1　为什么采用基础设施即代码

在云和自动化的时代还维持着传统IT的管理模式，比如创建机器，删除机器，扩容机器。云的一些特性并没有发挥出来，而且不关注一致性和可靠性，导致越管越乱。系统与硬件解耦后，可以更方便的定义基础设施环境。

#### 1.2　什么是基础设施即代码

基于软件开发实践的基础设施自动化的方法。具有一致性和可重复性。有自己的代码仓库、自动化测试、测试驱动开发、持续集成、持续交付。

目标：

- IT基础设施允许变更，而不是成为阻碍
- 消除对基础设施变更的恐惧
- IT人员不应该把时间精力花费重复的创建机器上
- 用户可以自定义自己的环境，不需要IT人员的参与
- 团队应该可以快速的恢复环境，而不是害怕环境变更影响业务
- 持续小批量的修改，而不是上线前的集中创建
- 不要在会议上讨论变更，而是应该去不断的测试生成的环境。

#### 1.3　动态基础设施的挑战

##### 1.3.1　服务器蔓延

创建机器太容易了，迅速的扩张。超过所能控制和管理的规模。

##### 1.3.2　配置漂移

同样的业务，跑着不同样的应用配置。随着时间增加 差异也不断的增加。

##### 1.3.3　雪花服务器

雪花服务器和其它机器配置不一样，且不能够被重新复制一套。

##### 1.3.4　脆弱的基础设施

谁都不敢碰那台雪花服务器。

##### 1.3.5　自动化恐惧症

使用配置管理工具，但不是自动化的使用。对自动化缺乏信心。

##### 1.3.6　侵蚀

操作系统升级和硬件损坏等异常条件，会打破并且侵蚀系统的一致性。

#### 1.4　基础设施即代码的原则

##### 1.4.1　系统能够轻松复制

##### 1.4.2　系统是用完可扔的

运行在不可靠的硬件资源上，应该按照牲口的管理方式去管理，而不是宠物的管理方式。

##### 1.4.3　系统是一致的

目录结构、各个组件的版本都应该是一致的。

##### 1.4.4　过程是可重复的

每个系统管理员应该使用相同的脚本去初始化机器，保持每次创建的机器的过程都是一致的。

##### 1.4.5　设计经常变更

#### 1.5　实践

##### 1.5.1　使用定义文件

使用DSL定义基础设施

> 目前这种方式有改变的趋势，变为使用代码定义。DSL的方式不太灵活。

##### 1.5.2　自文档化的系统和流程

DSL语言就是文档

##### 1.5.3　一切版本化

- 可追述
- 回滚
- 相关性
- 可见性
- 可执行

##### 1.5.4　持续测试系统和流程

更好的借助DevOps的能力

##### 1.5.5　小的变更，而不是批量变更

同DevOps

##### 1.5.6　让服务持续可用

变更的时候确保高可用

##### 1.6　反脆弱性：超越“稳健性”

[以人为本的自动化](https://www.infoq.com/news/2014/10/devops-days-automation-humans/)

##### 1.7　结语

- 基础设施每一个元素都可以进行重建
- 所有的操作系统都打上了最新的补丁
- 用户可以自主的在几分钟之内恢复自己的基础设施
- 工作时间也可以变更基础设施
- 关注改善MTTR
- 团队成员有成就感

##### 1.8　下一步

- 动态基础设施平台
- 基础设施定义工具
- 服务器配置工具
- 基础设施服务

### 第2章　动态基础设施平台

#### 2.1　什么是动态基础设施平台

可编程的计算 网络 存储平台

- 公有云：阿里 腾讯
- 社区云：国资云
- 私有云：OpenStack
- 裸机云：大数据 

#### 2.2　对动态基础设施平台的要求

##### 2.2.1　可编程

- Restful API 
- SDK
- Provider

##### 2.2.2　按需获取

即时创建销毁，按需计费。

##### 2.2.3　自服务

不仅能创建资源还可以快速的调整资源，而不用经过基础设施人员的批准。

#### 2.3　平台提供的基础设施资源

##### 2.3.1　计算资源

- CPU
- GPU

##### 2.3.2　存储资源

- 块存储
- 对象存储
- 网络存储 （集中式 分布式）

##### 2.3.3　网络资源

- VPC
- 路由
- 防火墙
- 公网带宽
- EIP
- DNS

#### 2.4　动态基础设施平台的类型

[The NIST Definition of Cloud Computing](https://csrc.nist.gov/publications/detail/sp/800-145/final)

根据NIST的定义

按照服务类型分为 IaaS PaaS SaaS 

按照部署方式分为 公有 社区 私有 混合四类。

##### 2.4.1　公有IaaS云

##### 2.4.2　社区IaaS云

##### 2.4.3　私有IaaS云

##### 2.4.5　混合云服务

##### 2.4.5　反模式：手摇云

##### 2.4.6　裸机云

- PXE
- Cobbler
- Foreman
- TFTP（网络）

#### 2.5　如何选择动态基础设施平台

##### 2.5.1　公有还是私有

- 安全和数据保护
- 托管位置的法律约束
- 可变容量的需求
- 自己构建IDC的总体成本
- 商业托管和自主可控

##### 2.5.2　云的可移植性

应用系统：云原生

#### 2.6　与云和虚拟化的“机械通感”

了解云下面的硬件和性能特性。案例：Netflix创建EC2测试。

#### 2.7　结语

开始选择工具

### 第3章　基础设施定义工具

#### 3.1　选择基础设施即代码的工具

##### 3.1.1　需求：脚本接口

- API
- CLI

##### 3.1.2　需求：无人值守的命令行工具

CLI 应该可以放到shell或者Powershell命令里。

##### 3.1.3　需求：支持无人值守的执行

执行的时候有能力实现无人值守。

- 幂等
- 事前检查
- 事后检查
- 可观测性
- 参数化

##### 3.1.4　需求：外部化配置

可以支持外部化配置定义

#### 3.2　配置定义文件

##### 3.3　使用基础设施定义工具

- HashiCorp Terraform
- AWS CloudForamtion
- Openstack Heat
- Aliyun 

##### 3.3.1　用过程化脚本置备基础设施

##### 3.3.2　声明式定义基础设施

##### 3.3.3　使用基础设施定义工具

##### 3.3.4　配置服务器

#### 3.4　配置注册表

##### 3.4.1　轻量级配置注册表

##### 3.4.2　配置注册表是CMDB吗

##### 3.4.3　CMDB的审计与修复反模式

##### 3.4.4　CMDB的基础设施即代码方式

#### 3.5　结语

### 第4章　服务器配置工具

4.1　自动化服务器管理的目标　　45
4.2　具有不同的服务器管理功能的工具　　46
4.2.1　创建服务器的工具　　46
4.2.2　配置服务器的工具　　47
4.2.3　打包服务器模板的工具　　48
4.2.4　在服务器上运行命令的工具　　49
4.2.5　从中央注册中心获取配置　　50
4.3　服务器变更管理模型　　51
4.3.1　临时变更管理　　51
4.3.2　配置同步　　51
4.3.3　不可变的基础设施　　51
4.3.4　容器化服务　　52
4.4　容器　　52
4.4.1　以容器方式和非容器方式管理Ruby应用程序　　53
4.4.2　容器是虚拟机吗　　54
4.4.3　使用容器而不是虚拟机　　55
4.4.4　运行容器　　56
4.4.5　安全和容器　　56
4.5　结语　　58

### 第5章 　基础服务概述

5.1　基础设施服务和工具的考虑　　59
5.1.1　支持外部配置的工具优先　　60
5.1.2　假定基础设施是动态的工具优先　　61
5.1.3　具有云兼容许可的产品优先　　61
5.1.4　支持松耦合的产品优先　　62
5.2　团队之间共享服务　　62
5.3　监控：告警、指标和日志　　63
5.3.1　告警：出现问题时告诉我　　64
5.3.2　指标：收集和分析数据　　65
5.3.3　日志聚合和分析　　65
5.4　发现服务　　66
5.4.1　服务器端的服务发现模式　　67
5.4.2　客户端的服务发现模式　　67
5.5　分布式进程管理　　67
5.5.1　使用服务器角色编排进程　　67
5.5.2　使用容器编排进程　　67
5.5.3　调度短期任务　　68
5.5.4　容器编排工具　　68
5.6　软件部署　　68
5.6.1　部署流水线软件　　68
5.6.2　打包软件　　69
5.7　结语　　70

## 第二部分　模式

### 第6章　置备服务器的模式

6.1　服务器置备　　74
6.1.1　服务器的生命周期　　74
6.1.2　服务器都承载了什么　　77
6.1.3　服务器上东西的类型　　77
6.1.4　服务器角色　　79
6.2　创建服务器的模式　　80
6.2.1　反模式：手动制作服务器　　80
6.2.2　实践：将服务器创建参数放在脚本中　　81
6.2.3　反模式：热克隆服务器　　82
6.2.4　模式：服务器模板　　82
6.2.5　反模式：雪花工厂　　82
6.3　引导新服务器的模式　　83
6.3.1　推送引导　　83
6.3.2　拉取引导　　84
6.3.3　实践：对每个新服务器实例进行冒烟测试　　84
6.4　结语　　85

### 第7章　管理服务器模板的模式

7.1　供应模板：不能让别人来做吗　　86
7.2　使用模板置备服务器　　87
7.2.1　创建时置备服务器　　87
7.2.2　在模板中置备　　88
7.2.3　平衡模板和创建之间的置备工作　　88
7.3　构建服务器模板的流程　　89
7.4　原始镜像　　90
7.4.1　反模式：热复制服务器模板　　90
7.4.2　基于操作系统安装镜像烘焙模板　　91
7.4.3　基于供应镜像烘焙模板　　91
7.4.4　基于Unikernel构建模板　　92
7.4.5　在不启动服务器的情况下自定义服务器模板　　92
7.5　更新服务器模板　　92
7.5.1　重新烘烤模板　　93
7.5.2　烘焙新模板　　93
7.5.3　版本控制服务器模板　　93
7.6　构建基于角色的模板　　95
7.6.1　模式：分层模板　　95
7.6.2　共享模板的基础脚本　　96
7.7　自动化服务器模板管理　　96
7.7.1　在烘焙前自定义服务器　　96
7.7.2　实践：自动测试服务器模板　　97
7.8　结语　　97

### 第8章　服务器更新与变更模式

8.1　服务器变更管理模型　　99
8.1.1　临时性变更管理　　99
8.1.2　持续配置同步　　99
8.1.3　不可变服务器　　99
8.1.4　容器化服务器　　100
8.2　通用模式和实践　　100
8.2.1　实践：最小化服务器模板　　101
8.2.2　实践：当服务器模板变更时更换服务器　　101
8.2.3　模式：凤凰服务器　　101
8.3　持续部署的模式与实践　　102
8.3.1　模式：无主服务器的配置管理　　102
8.3.2　实践：应用Cron　　103
8.3.3　持续同步流　　104
8.3.4　未配置领域　　104
8.4　不可变服务器的模式与实践　　106
8.4.1　服务器镜像作为制品　　106
8.4.2　使用不可变服务器简化确认管理工具　　106
8.4.3　不可变服务器流程　　107
8.4.4　使用不可变服务器引导配置　　108
8.4.5　事务性服务器更新　　109
8.5　管理配置定义的实践　　109
8.5.1　实践：保持配置定义最小化　　109
8.5.2　组织定义　　110
8.5.3　实践：使用测试驱动开发来驱动良好的设计　　110
8.6　结语　　110

### 第9章　定义基础设施的模式　　111

9.1　环境　　112
9.1.1　反模式：手动制作的基础设施　　112
9.1.2　定义基础设施栈即代码　　112
9.1.3　反模式：每个环境单独的定义文件　　114
9.1.4　模式：可重用的定义文件　　114
9.1.5　实践：测试并推进栈定义　　115
9.1.6　自服务的环境　　116
9.2　组织基础设施　　116
9.2.1　反模式：单体栈　　116
9.2.2　迁移基础设施时避免“直接迁移”　　118
9.2.3　将应用程序环境分到不同的栈中　　118
9.2.4　管理栈之间的配置参数　　119
9.2.5　共享基础设施元素　　120
9.2.6　实践：应用程序代码和基础设施代码一起管理　　122
9.2.7　共享定义的方法　　123
9.2.8　实践：基础设施设计要与变更范围匹配　　124
9.2.9　示例：微服务的基础设施设计　　125
9.3　运行定义工具　　128
9.4　结语　　128

## 第三部分　实践

### 第10章　基础设施的软件工程实践

10.1　系统质量　　132
10.1.1　低质量的系统很难变更　　132
10.1.2　高质量的系统能更容易、更安全地变更　　132
10.1.3　基于代码的基础设施质量　　133
10.1.4　快速反馈　　133
10.2　基础设施管理的版本控制系统　　133
10.3　持续集成　　134
10.3.1　持续测试分支不是持续集成　　134
10.3.2　谁破坏了构建　　136
10.3.3　忽略失败的测试　　137
10.3.4　针对基础设施的持续集成　　137
10.4　持续交付　　137
10.4.1　集成阶段的问题　　137
10.4.2　部署流水线和变更流水线　　138
10.4.3　持续交付不是持续部署　　139
10.5　代码质量　　140
10.5.1　整洁代码　　140
10.5.2　实践：管理技术债务　　140
10.6　管理重大的基础设施变更　　141
10.7　结语　　142

### 第11章　测试基础设施变更

11.1　敏捷测试方法　　144
11.1.1　自动化测试提供快速反馈　　144
11.1.2　有机地构建一个测试套件　　145
11.2　构建测试套件：测试金字塔　　145
11.2.1　避免失衡的测试套件　　146
11.2.2　实践：尽可能在最低层级进行测试　　147
11.2.3　实践：仅实现需要的层级　　148
11.2.4　实践：经常删减测试套件　　148
11.2.5　实践：持续评审测试的有效性　　148
11.3　实现均衡的测试套件　　149
11.3.1　低层级测试　　150
11.3.2　中间层级测试　　151
11.3.3　高层级测试　　154
11.3.4　测试运维质量　　155
11.4　管理测试代码　　156
11.4.1　实践：将测试代码与所测代码放在一起　　156
11.4.2　反模式：反射测试　　156
11.4.3　隔离组件进行测试的技巧　　157
11.4.4　重构组件以便隔离　　158
11.4.5　管理外部依赖　　158
11.4.6　测试设置　　159
11.5　测试的角色和工作流　　161
11.5.1　原则：人们应该为所构建的东西编写测试　　161
11.5.2　编写测试的习惯　　162
11.5.3　原则：每个人都应该能够使用测试工具　　162
11.5.4　质量分析师的价值　　162
11.5.5　测试驱动开发　　163
11.6　结语　　164

### 第12章　基础设施的变更管理流水线

12.1　变更管理流水线的好处　　166
12.2　设计流水线的准则　　166
12.2.1　确保每个阶段的一致性　　167
12.2.2　对于每个变更都立即得到反馈　　167
12.2.3　在手动阶段之前运行自动阶段　　168
12.2.4　尽早获得类生产环境　　168
12.3　基本流水线设计　　169
12.3.1　本地开发阶段　　169
12.3.2　构建阶段　　169
12.3.3　发布配置制品　　170
12.3.4　自动化测试阶段　　171
12.3.5　手动验证阶段　　172
12.3.6　上线　　173
12.3.7　流水线的节奏　　173
12.4　使用流水线的实践　　174
12.4.1　实践：证明每个变更都对生产准备就绪　　174
12.4.2　实践：每个变更都始于流水线起点　　175
12.4.3　实践：出现错误时停止流水线　　175
12.5　扩展流水线到更复杂的系统　　175
12.5.1　模式：扇入型流水线　　176
12.5.2　实践：保持较短的流水线　　179
12.5.3　实践：解耦流水线　　179
12.5.4　集成模型　　180
12.6　处理组件之间依赖的技巧　　181
12.6.1　模式：库依赖　　181
12.6.2　模式：自置备的服务实例　　183
12.6.3　提供预发布的库构建　　183
12.6.4　为消费者提供服务的测试实例　　184
12.6.5　将服务的测试实例用作消费者185
12.7　管理组件间接口的实践　　186
12.7.1　实践：保证接口的向后兼容性　　186
12.7.2　实践：从发布解耦部署　　186
12.7.3　实践：使用版本相容　　187
12.7.4　实践：提供测试替身　　187
12.7.5　实践：用契约测试来测试提供者　　188
12.7.6　实践：用参考消费者来测试　　188
12.7.7　实践：提供者接口的冒烟测试　　188
12.7.8　实践：运行消费者驱动契约测试　　188
12.8　结语　　189

### 第13章　基础设施团队的工作流

13.1　任何可以自动化的都要自动化　　190
13.1.1　手动变更　　191
13.1.2　临时的自动化　　191
13.1.3　自主的自动化　　192
13.1.4　自主的自动化工作流　　193
13.2　使用本地沙箱　　194
13.2.1　使用本地虚拟化做沙箱　　194
13.2.2　具有本地测试的工作流示例　　196
13.2.3　使用虚拟化平台做沙箱　　197
13.3　代码库组织模式　　197
13.3.1　反模式：基于分支的代码库　　198
13.3.2　模式：每个组件一个主干　　199
13.3.3　模式：单一主干　　199
13.4　工作流的效率　　199
13.4.1　加快变更　　199
13.4.2　代码评审　　200
13.4.3　将治理融入工作流　　200
13.5　结语　　202

### 第14章　动态基础设施的连续性

14.1　服务连续性　　204
14.1.1　真实可用性　　204
14.1.2　用动态服务器池做恢复　　205
14.1.3　为动态基础设施设计软件　　206
14.1.4　为连续性划分系统　　208
14.2　零停机变更　　208
14.2.1　模式：蓝绿替换　　209
14.2.2　模式：凤凰替换　　209
14.2.3　实践：缩小替换的范围　　210
14.2.4　模式：金丝雀替换　　211
14.2.5　为零停机替换路由流量　　212
14.2.6　有数据的零停机变更　　213
14.3　数据连续性　　214
14.3.1　冗余地复制数据　　214
14.3.2　重新生成数据　　215
14.3.3　委托数据持久化　　215
14.3.4　备份到持久存储　　215
14.4　灾难恢复　　216
14.4.1　持续的灾难恢复　　217
14.4.2　灾备计划：为灾难做计划　　218
14.4.3　实践：优先重建而不是冷备份　　218
14.4.4　通过流水线持续监控　　219
14.5　安全　　220
14.5.1　自动掩盖危害　　220
14.5.2　以可靠的更新作为防护　　221
14.5.3　包的来源　　221
14.5.4　自动加固　　222
14.5.5　流水线中安全验证的自动化　　223
14.5.6　变更流水线的漏洞　　223
14.5.7　管理云账号的安全风险　　224
14.6　结语　　225

### 第15章　基础设施即代码的组织要求

15.1　演进式架构　　226
15.1.1　在实战中学习　　228
15.1.2　从先驱者流水线开始　　228
15.2　度量有效性　　229
15.2.1　首先对期望的结果达成一致　　229
15.2.2　选择有助于团队的度量指标　　230
15.2.3　跟踪和改善周期时间　　230
15.2.4　使用看板可视化工作　　232
15.2.5　回顾会议及事后分析　　233
15.3　组织授权用户　　233
15.3.1　划分功能模型的陷阱　　233
15.3.2　采取自服务模型　　235
15.3.3　承担全部责任：谁构建，谁运行　　235
15.3.4　组织跨职能团队　　236
15.4　持续变更管理的治理　　237
15.4.1　提供稳固的构建单元　　237
15.4.2　在流水线中证明运维就绪　　238
15.4.3　共享运维质量的所有权　　238
15.4.4　审查和审计自动化流程　　238
15.4.5　优化发现和修复问题的时间　　239
15.5　结语：永无止境　　239