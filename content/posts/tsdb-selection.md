---
title: "时序数据库选型实战；观测留 GT，目录放 PG"
date: 2026-11-15
summary: "目录数据放时序库不支持 UPDATE，只能 DELETE+INSERT。观测留时序库，目录放关系库，跨库方向必须是 PG → GT。"
categories: ["智能家居", "架构"]
tags: ["时序数据库", "PostgreSQL", "GreptimeDB", "数据架构"]
---

## 起因：目录数据放时序库，每次同步都要全表重写

做 HomePulse 时，最自然的想法是"所有数据都放时序库"。但实测发现，这个直觉在目录数据上完全失效。

**目录数据（设备名册、房间、型号）的本质是关系型数据**：需要 UPDATE（改名、换房间、标记禁用）、需要事务（批量更新一致性）、需要关联查询（目录 JOIN 观测）。

而时序库（GreptimeDB）是为**不可变观测**设计的：append-only、按时间索引、列式压缩。**它根本不支持 UPDATE**。

## 打算：试试时序库能不能处理目录

我最初的想法很简单："时序库也能存目录吧，反正都是数据"。于是把 `dir_current`（设备/实体目录）也放进了 GreptimeDB。

**结果遇到了硬约束**：

```sql
UPDATE dir_current SET area_name='厨房' WHERE record_id='device:abc';
-- ❌ SQL statement is not supported, keyword: UPDATE
```

**这不是配置问题，是数据模型问题**。时序库是为**不可变观测**设计的，它根本不支持 UPDATE。

**后果**：每次同步目录，只能：
1. DELETE 全表（1146 行）
2. INSERT 全部（1146 行）

**空窗期**：DELETE 与 INSERT 之间有约 0.4 秒，Grafana 查询可能看到空表。而且每次同步都是全量重写，语义完全错误。

## 发现：跨库查询也走不通

那能不能让 GT 直接联合 PG 查询呢？这样目录放 PG，观测留 GT，跨库 JOIN 就行了吧？

**实测发现 GT 没有 PG 连接器**：

| 尝试的语法 | 结果 |
|---|---|
| `provider = 'postgres'` | ❌ Unrecognized table option key |
| `provider = 'postgresql'` | ❌ 同上 |
| `connector = 'postgres'` | ❌ Unrecognized table option key: port |
| `type = 'postgres'` | ❌ Unrecognized table option key: type |
| DataFusion `STORED AS` | ❌ SQL statement not supported |

**GT 的 external table 是为文件/对象存储设计的**（S3/CSV/Parquet），不是数据库联邦。它根本不支持 PostgreSQL 外部表。

## 转机：PG 的 FDW 已经存在

正当我以为"跨库查询没戏了"的时候，发现 **PG 的 `postgres_fdw` 已经存在**：

```
PG homepulse_remote  ←── FDW ──→  GT（时序库）
   ↑
   └── 已验证：PG 里有 6 张 GT 外部表（power_metrics、ha_entities 等）
```

**关键认知**：跨库查询的方向**本来就已经通了**——是 PG → GT，不是 GT → PG。

## 解决：观测留 GT，目录放 PG

既然 GT 不能联合 PG，那就反过来：**PG 联合 GT**。

```
观测（数值/事件）→ GreptimeDB（时序库，append 天然）
目录（名册）     → PostgreSQL（关系库，UPDATE 天然）
                  ↓
            PG 通过 postgres_fdw 查 GT
                  ↓
         在 PG 里 JOIN 目录 + 观测
                  ↓
              Grafana 查 PG
```

**每个库做自己擅长的事**：
- GT：高频时序（列式引擎、压缩、时间索引）
- PG：目录/分析结果（UPDATE、事务、关系）

**关键点**：
- 目录在 PG：UPDATE/upsert 天然支持，无空窗
- 观测在 GT：大数据量时序，append 天然
- PG 通过 FDW 查 GT：数据不搬，重计算在 GT 列式引擎
- Grafana 查 PG：返回小结果集

## 为什么这个方向对

**PG 的 FDW 是成熟的数据库联邦机制**，支持 PostgreSQL、MySQL、甚至时序库（通过 HTTP/SQL 协议）。数据不用搬，PG 只做 JOIN 和过滤，重计算在 GT 列式引擎。返回给 Grafana 的是小结果集，性能好。

**实测验证**：
- 目录在 PG 后，UPDATE 正常（改名、换房间、标记禁用都能正确更新）
- 观测在 GT 后，时序查询正常（列式引擎、压缩、时间索引）
- PG 通过 FDW 查 GT 后，跨库 JOIN 正常（目录 JOIN 观测）

## 通用原则：不同数据形态该放不同库

**不要强求统一存储，统一语义比统一存储更重要**：

- 时序观测（append-only、高频、按时间查）→ 时序库
- 目录/关系（UPDATE、事务、关联查）→ 关系库
- 原始消息（完整 JSON、重放）→ 时序库或文档库
- 分析结果（复杂查询、JOIN、事务）→ 关系库

**跨库查询的方向由"谁有联邦能力"决定**：PG 有 FDW，GT 没有 PG 连接器，所以必须是 PG → GT。

## 边界与误区

### 误区 1：以为"一个库搞定所有"更简单

实际上，不同数据形态需要不同存储。强求统一存储会导致：
- 目录放时序库 → UPDATE 不支持，语义错误
- 观测放关系库 → 时序性能差

### 误区 2：以为跨库查询是"GT 联合 PG"

实际上 GT 没有 PG 连接器，**跨库方向必须是 PG → GT**（PG 通过 FDW 查 GT）。

### 边界：什么时候该换库

- 如果 GT 未来支持 PostgreSQL external table（issue #9767 已有人做），可以考虑 GT 联合 PG
- 但当前 GT v1.3.0 早于该特性，且 nightly 不完整，**暂不升级**

## 原则提炼

1. **不同数据形态该放不同库**：观测留时序库，目录放关系库
2. **跨库方向由联邦能力决定**：PG 有 FDW，GT 没有 PG 连接器，所以是 PG → GT
3. **统一语义比统一存储更重要**：不要强求统一存储，要统一数据语义
4. **不要为形式统一而牺牲语义**：目录放时序库是语义错误，不是技术选择问题
