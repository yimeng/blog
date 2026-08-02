# 家庭实验室监控最终形态

更新时间：2026-08-03

## 监控职责

Better Stack 状态页：<https://status.yimeng.ch/zh>

状态页负责展示服务状态、历史可用性和故障记录。博客首页只保留一组轻量的服务状态摘要，并提供“远程状态”入口跳转到状态页；首页不保存 API Key，也不直接读取 Better Stack 鉴权接口。

## 心跳归属

PVE 上的 `home-lab-heartbeat.timer` 每 4 分钟运行一次，负责以下四项：

- 家庭实验室 / PVE：检查 Home Assistant 虚拟机是否运行；
- 家庭网络 / 路由器：检查两个家庭网关是否可达；
- AdGuard Home：执行一次外部 DNS 查询；
- Home Assistant：检查本地 HTTP 服务是否响应。

以下项目不由 PVE 心跳脚本重复负责，后续应由各自实际所在的主机或任务发送心跳：

- NAS 存储；
- 可观测性 / Grafana；
- 照片与备份 / Immich。

博客与状态页由 Better Stack 云端 HTTP Monitor 检查，不需要内网机器发送心跳。

## 当前边界

- 已确认没有发现 NAS、Grafana、Immich 在 PVE 或现有 LXC 中重复配置心跳；
- 不在仓库、前端代码或公开文档中记录 Heartbeat URL、API Key 等敏感信息；
- 新增心跳前，先确认服务实际部署位置和现有定时任务，避免同一服务由多个主机重复上报；
- PVE 心跳脚本的四项现有检查保持不变，不再重复创建。
