---
title: "时序数据库选型实战：观测留 GT，目录放 PG"
date: 2026-11-15
summary: "目录数据放时序库不支持 UPDATE，只能 DELETE+INSERT。观测留时序库，目录放关系库，跨库方向必须是 PG → GT。"
categories: ["智能家居", "架构"]
tags: ["时序数据库", "PostgreSQL", "GreptimeDB", "数据架构"]
---

## 一个周五晚上，我想给一台设备改个房间归属

HomePulse 里有一批"目录数据"——设备名册、房间归属、型号、是否启用。这类数据有个特点：**它一直在变**。今天把温湿度传感器从客厅挪到北卧，明天给一台闲置的插座改个名字，后天发现某台设备的型号当初填错了要纠正。

这些东西我一直放在 GreptimeDB 里。理由特别朴素：观测数据都在那儿，目录数据也是数据，放一起省得再起一个库。

直到那个周五晚上，我准备把一台插座从"厨房"改到"玄关"，习惯性地敲了一句：

```sql
UPDATE dir_current SET area_name = '玄关' WHERE record_id = 'device:plug_entrance';
```

结果返回了一行冷冰冰的报错：

```
SQL statement is not supported, keyword: UPDATE
```

我第一反应是"我语法写错了？" 换了几种写法，报错一模一样。然后我去翻 GreptimeDB 的文档，看到一句话：**时序数据库是 append-only 的，不支持 UPDATE 和 DELETE 单行**。

那一刻我才反应过来：这不是配置问题，是**数据模型的根本差异**。时序库为"不可变的观测值"而生——传感器每秒钟报一次温度，你只管往上追加，从不需要回头修改"3 分钟前那个温度值"。但目录数据不是观测值，它是**需要反复修改的状态**。

## 只能 DELETE 全表再 INSERT，还留了个空窗期

时序库不支持 UPDATE，那目录每次同步怎么办？答案很蠢，但确实是唯一的路：

1. `DELETE FROM dir_current` —— 删掉全表 1146 行
2. 重新 INSERT 1146 行

每次同步，整张表被清空重建。这里有两个坑：

**第一个坑是空窗期。** DELETE 和 INSERT 之间大约有 0.4 秒，这期间谁要是查这张表，看到的是空表。放在自己家里问题不大，但这是**语义错误**——目录同步本应是"增量更新几条变化"，我却做成了"全量重写"。

**第二个坑更隐蔽。** 时序库里的表一旦 DELETE 了旧时间戳的数据，再 INSERT 新数据，如果你没处理好时间列，历史就没了。目录这种本不该有"历史"的东西，硬塞进一个"以时间为主键"的引擎里，处处别扭。

我意识到：我把**关系型数据放进了时序库**，这是个根本性的错误选择。

## 那让 GT 跨库查 PG 不就行了？

两类数据的天性不同，落点也必须不同：

{{< mermaid >}}
flowchart LR
    o["观测数据<br/>只追加、不可变"] -->|写入| gt[("GreptimeDB<br/>时序")]
    d["目录数据<br/>频繁修改"] -->|upsert| pg[("PostgreSQL<br/>关系型")]
    pg -.->|"查询时按需关联"| gt
{{< /mermaid >}}

既然目录不该放时序库，那放回 PostgreSQL，让 GreptimeDB 跨库去 JOIN 不就行了？

这个想法听起来很合理，于是我兴冲冲地去试 GT 的 external table（外部表）。我把各种可能的语法都试了一遍：

| 尝试 | 结果 |
|---|---|
| `provider = 'postgres'` | ❌ Unrecognized table option key |
| `provider = 'postgresql'` | ❌ 同上 |
| `connector = 'postgres'` | ❌ Unrecognized table option key: port |
| `type = 'postgres'` | ❌ Unrecognized table option key: type |
| DataFusion `STORED AS` | ❌ SQL statement not supported |

全失败了。翻文档才发现：GT 的 external table 是**为文件和对象存储设计的**——S3、CSV、Parquet，你给它一个路径，它去读文件。它压根没有"连接另一个数据库"的能力。

我有点沮丧。跨库查询这条路，从 GT 这头是走不通的。

## 转机：PG 那头的 FDW 早就建好了

就在我以为"跨库查询没戏"的时候，我突然想起一件早就存在、却被我忽略的事实：

**PostgreSQL 里早就建好了 `postgres_fdw`，而且已经映射了 6 张 GreptimeDB 的外部表**（power_metrics、ha_entities 等等）。

这是之前为了让 Grafana 能查 GT 数据时搭的。也就是说，**跨库查询的路其实早就通了，只是方向和我以为的相反**：

```
我以为的：GT → PG（GT 去查 PG）
实际通着的：PG → GT（PG 通过 FDW 去查 GT）
```

GreptimeDB 对外暴露了一个兼容 PostgreSQL 协议的端口（4003）。所以反过来，PostgreSQL 可以用自己成熟的 `postgres_fdw`，把 GT 当成一个"远端的 PostgreSQL 服务器"来查。

我一直盯着"GT 能不能查 PG"，却忘了问"PG 能不能查 GT"——答案早就是"能"，而且已经用了很久。

## 解法：谁有联邦能力，方向就朝谁

想清楚之后，架构一下子顺了：

```
观测数据（数值、事件）→ GreptimeDB   ← 时序库，append 天然
目录数据（名册、归属）→ PostgreSQL   ← 关系库，UPDATE 天然
                              ↓
              PG 通过 postgres_fdw 查 GT
                              ↓
              在 PG 里 JOIN「目录 + 观测」
                              ↓
                      Grafana 查 PG
```

每个库做自己天生擅长的事：GT 扛高频时序写入和列式压缩，PG 扛需要事务和 UPDATE 的目录数据，跨库方向顺着"谁有联邦能力"来——**PG 有 FDW，GT 没有 PG 连接器，所以方向只能是 PG → GT**。

## 这件事教给我什么

回头想，这个弯路的价值不在最终结论，而在**撞墙的过程**：

1. **不同数据形态，就该放不同的库。** "统一存储"听着清爽，但把需要 UPDATE 的目录塞进 append-only 的时序库，是拿形式统一去牺牲语义正确。

2. **跨库方向由"谁有联邦能力"决定，不由你拍脑袋。** 我在 GT 那头反复试语法，是因为我先入为主地认定了方向；正确答案在 PG 那头，一直就在那儿。

3. **统一语义，比统一存储更重要。** 我不是要把所有数据塞进一个引擎，而是要让目录和观测在语义上对齐，在查询时能 JOIN 起来。

如果有一天 GreptimeDB 真的支持了 PostgreSQL 外部表（社区里有相关的 issue 在做），那时方向可以再议。但在那之前，"观测留 GT、目录放 PG、PG 联合 GT"就是最踏实的答案。

**教训一句话：别跟数据模型较劲，顺着它的脾气来。**
