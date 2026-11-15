---
title: "时序数据库选型实战；观测留 GT，目录放 PG"
date: 2026-11-15
summary: "时序库不支持 UPDATE，目录只能 DELETE+INSERT。观测留时序库，目录放关系库，跨库方向必须是 PG → GT。"
categories: ["智能家居", "架构"]
tags: ["时序数据库", "PostgreSQL", "GreptimeDB", "数据架构"]
---



## 问题：目录数据该放哪？

做家庭数据平台时，最自然的选择是"所有数据都放时序库"。但实测发现，这个直觉是错的。

## 实测：时序库不支持 UPDATE

```sql
UPDATE dir_current SET area_name='厨房' WHERE record_id='device:abc';
-- ❌ SQL statement is not supported, keyword: UPDATE
```

后果：
- 每次同步必须 **DELETE 全表 + INSERT 全部**（1146 行）
- DELETE 与 INSERT 之间有**空窗期**（约 0.4 秒，Grafana 查询可能看到空表）
- 目录是关系型数据（需要 UPDATE/upsert），强行用 append 模拟语义别扭

## 跨库查询能力实测

| 方向 | 能力 | 结论 |
|---|---|---|
| **GT → PG** | ❌ 无 PostgreSQL external table provider | 实测 `provider='postgres'` 等语法全部失败 |
| **PG → GT** | ✅ `postgres_fdw` 已存在 | `homepulse_remote` 已暴露 6 张 GT 表 |

GT 的 external table 是为**文件/对象存储**设计的（S3/CSV/Parquet），不是数据库联邦。

## 正确架构：观测留 GT，目录放 PG

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

## 关键认知：跨库方向必须是 PG → GT

不是"GT 联合 PG 查"，而是"**PG 联合 GT 查**"。因为：
- GT 没有 PG 连接器（实测不支持）
- PG 的 FDW 是成熟的数据库联邦机制
- 数据不用搬，重计算在 GT 列式引擎，返回小结果集

## 上游进展

GreptimeDB issue #9767「Add read-only MySQL/PostgreSQL external tables」已在实施中（PR #9953 已合并），但当前生产 GT v1.3.0 早于该特性，且 nightly 不完整，**暂不升级**。

## 通用原则

**不同数据形态该放不同库**：
- 时序观测（append-only、高频、按时间查）→ 时序库
- 目录/关系（UPDATE、事务、关联查）→ 关系库

不要强求统一存储，**统一语义比统一存储更重要**。
