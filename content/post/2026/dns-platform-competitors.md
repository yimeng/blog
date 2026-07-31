---
title: "内网 DNS 平台（9）：竞品分析——市面上的产品都怎么做"
date: 2026-08-08T00:00:00+08:00
draft: false
tags: ["DNS", "平台工程"]
---

## 背景

设计过程中我有一个坚持：不闭门造车。平台的每个模块，市面上都有做得最好的产品，先看清它们怎么做、为什么这么做，再决定自己采用什么、参考什么、不碰什么。

这一篇按模块过一遍竞品。分析的方法论不是"选哪个产品"，而是回答三个问题：**这个模块谁做得最好？学什么？为什么不直接用？**

## 总表

| 模块 | 竞品/参照 | 学什么 | 为什么不直接用 |
|---|---|---|---|
| 权威 DNS | PowerDNS / BIND / CoreDNS | PowerDNS 的 API 与后端灵活性 | —（直接采用） |
| 管理 UI | PowerDNS-Admin | 开箱即用 + LDAP | 配额/空间隔离要二开 |
| toC 域名商 | DNSPod / Cloudflare / name.com | view 智能解析的概念 | 功能止于解析，无治理面 |
| 商业 DDI | Infoblox / BlueCat | DDI 一体，IPAM 是护城河 | 重型商业套件，自助体验差 |
| 智能解析/GSLB | F5 GTM / NS1 | 功能天花板：pool/健康监控/就近调度 | 商业硬件；但边界设计值得学 |
| 云 DNS | Route53 / Azure Private DNS | 私有 zone + 转发的产品形态 | 云绑定，自建内网不适用 |
| GitOps 工具 | dnscontrol / OctoDNS | 记录即代码 + plan/apply | 评估后决定集成深度 |
| IPAM | NetBox / phpIPAM | 数据模型与 API | IP 级太重，我们只要段级 |
| 私有 CA | step-ca / Vault PKI | step-ca 的轻量 ACME | —（选型推荐） |
| 门户层 | Backstage | "门户做广度，平台做深度" | 未来方向，不在本平台边界 |

下面挑几个最有启发的展开。

## PowerDNS：直接采用的底座

权威 DNS 这个模块没有悬念。BIND 是教科书但 API 是老式的（rndc + zone 文件）；CoreDNS 长在 Kubernetes 生态里，插件化强但管理权威 zone 不是它的主场；PowerDNS Authoritative 恰好卡在我的需求上：数据库后端、完整的 REST API、成熟的 zone transfer，还有 Lua 记录这种可编程能力做上限。

**采用，不造。** 造一个权威 DNS 服务器没有任何道理——这个领域三十年的坑（协议细节、性能、安全补丁）不是一个小团队该趟的。

## PowerDNS-Admin：半路顶上来的 UI

管理 UI 原计划自研。做到一半发现 PowerDNS-Admin 开源版已经覆盖了基础场景：zone 管理、记录编辑、LDAP 认证开箱即用。

于是路线改成"先用它顶"。它的短板也清楚：配额管理和空间隔离不符合我的模型（个人 zone 自动分配、按用户名隔离这些逻辑它没有），所以长期还是会回到自研控制台，PDA 作为过渡和管理员视图存在。这个插曲本身是个教训：**自研之前把开源选项翻到底，哪怕已经开工了。**

## Infoblox：商业 DDI 的启示

DDI（DNS + DHCP + IPAM 一体）市场里 Infoblox 是事实标准。研究它的产品结构后我有一个判断：

> **Infoblox 的护城河其实是 IPAM，不是 DNS。**

权威和递归功能各家都能做，Infoblox 真正值钱的是那本 IP 账：段、分配、回收、审计、和 DNS/DHCP 的联动对账。这也印证了我 IPAM 篇的架构选择——账是本体，但我不买它整个重型套件，只做段级轻台账。它家的自助体验（厚重的审批流、企业级的 UI）恰好是平台工程要避开的反面教材。

## F5 GTM：功能天花板与边界范本

智能解析/GSLB 方向，F5 的 GTM（现在叫 BIG-IP DNS）是功能天花板：pool 管理、健康监控、拓扑库、就近调度。我把它当作"DNS 平台功能的上限参照"——我的平台最多做到 GTM 的能力集，不超出它。

更值得学的是 F5 的**产品线分离**：GTM 只回 DNS 答案、不碰流量；碰流量的是另一条产品线 LTM（负载均衡）。一家做了二十年网络设备的公司，始终坚持"智能应答"和"流量代理"是两个产品——这个边界感和我的平台边界（做七层的知情者和指挥者，不做执行者）完全同构。边界篇会展开。

## dnscontrol 与 OctoDNS：GitOps 不用从零造

记录即代码这个方向有两个成熟实现：StackExchange 的 dnscontrol 和 GitHub 的 OctoDNS。dnscontrol 的 `preview`（改前看 diff）和 `push` 流程、OctoDNS 的多 provider 抽象，都是直接可用的设计参考。

我的 GitOps 同步器第一版是 CI 脚本起步的（够用就行），但评估过它们之后明确了演进方向：当 provider 变多（比如未来要同步云 DNS）、记录类型变复杂时，迁移到 dnscontrol 而不是继续自研。**先评估再决定自研深度**——这条顺序不能反。

## toC 厂商：一道清晰的鸿沟

最后说说为什么 toC 产品（DNSPod、Cloudflare 的域名解析）几乎整类出局。不是它们不好，是客户模型不同：toC 的客户不拥有网络，厂商能提供的功能到"解析 + 安全 + view（分线路智能解析）"就封顶了——再往下（归属、生命周期、审批、对账）全是"拥有网络"之后才有意义的功能。

这道鸿沟是篇 1 那个判断的具体化：**企业 DNS 平台的核心是治理体系，而治理恰好是所有 toC 产品都不会做的部分。**

## 选型地图

过完全部模块，最终的姿态分三档：

- **直接采用**：PowerDNS（权威）、step-ca（私有 CA）、PowerDNS-Admin（过渡 UI）；
- **学设计不采用**：Infoblox（IPAM 价值）、F5 GTM（天花板与边界）、Route53（私有 zone 形态）、Backstage（门户形态）；
- **评估后集成**：dnscontrol/OctoDNS（GitOps 工具链）、NetBox（若未来要 IP 级台账）。

> **竞品分析的价值不是找到答案，而是校准位置：知道自己在哪一层、天花板在哪、哪些仗不值得打。**

下一篇是收官：六层框架全景，以及一个 DNS 平台的边界到底该画在哪。
