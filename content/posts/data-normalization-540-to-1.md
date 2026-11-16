---
title: "数据归一化工程：从 540 张表到 1 张表"
date: 2026-11-15
summary: "measurement_attr 导致每实体一张表（540 张）。override_measurement 统一单表，entity_id 作 tag，跨源分析一条 SQL。"
categories: ["智能家居", "架构"]
tags: ["数据归一化", "GreptimeDB", "表设计", "跨源分析"]
---

## 我打开数据库，被 540 张表吓到了

那天我想写一条查询：看看"泵启动的时候，入户水压和总电耗是怎么变的"。

结果我发现，光是我家的 Home Assistant 数据，就在 GreptimeDB 里摊开了 **540 张表**。每张表对应一个实体：

```
sensor.ydai_water_pressure  → 一张表
sensor.sofar_pump_voltage   → 一张表
sensor.lumi_temperature     → 一张表
sensor.kitchen_fridge_power → 一张表
……
```

540 个实体，就是 540 张表。每一台新设备接入，就悄悄多出一张表。

问题立刻暴露了：我想做的"跨源分析"——把泵、水、电三个系统的数据放一起看——**在这 540 张表面前根本无从下手**。我总不能把 540 个表名拼进一条 UNION ALL 吧？就算拼出来，加一台设备我就得改一次查询。

这不是"数据多"，这是**设计缺陷**。表爆炸的本质，是**没有一个统一的数据模型**。

## 为什么会这样：一个默认配置惹的祸

追根溯源，是 Home Assistant 官方 InfluxDB 集成的一个默认行为。它默认把 `measurement_attr` 设成 `entity_id`——意思是"用实体名作为表名（measurement）"。

于是每个实体都被塞进一张以自己名字命名的表里。官方这么设计，大概是方便"一个实体一张表、互不干扰"。但在我这个"要把几十上百个实体放一起分析"的场景下，它变成了灾难。

我盯着这 540 张表想：能不能让它们**都进同一张表**？

## 一个配置项，540 变 1

改一个配置项，结构就变了：

{{< mermaid >}}
flowchart LR
    subgraph B["改造前：一实体一表"]
        b1["sensor.pump_pressure"]
        b2["sensor.water_pressure"]
        b3["… 共 540 张"]
    end
    subgraph A["改造后：单表 + tag"]
        a1[("ha_observations<br/>entity_id 作为 tag")]
    end
    B -->|"override_measurement"| A
{{< /mermaid >}}

查了文档，答案是一个配置：

```yaml
influxdb:
  override_measurement: ha_observations
```

`override_measurement` 的意思是：**别再拿实体名当表名了，所有数据都写进 `ha_observations` 这一张表**。至于"这条数据是哪个实体"，用 tag 来区分：

```
ha_observations
  ts | domain | entity_id      | device_class | value | unit
  ---+--------+----------------+--------------+-------+-----
  ...| sensor | ydai_water     | pressure     | 0.29  | MPa
  ...| sensor | pump_voltage   | voltage      | 229   | V
  ...| sensor | kitchen_fridge | power        | 87.3  | W
```

表还是那 540 个实体的数据，但**表只剩一张，实体从"表名"变成了"tag 值"**。

改完配置、重启 HA、等数据灌进来，我再去库里数表——那张梦寐以求的 `ha_observations` 躺在那儿，540 张的噩梦结束了。

## 真正的好处：一条 SQL 横跨三个系统

表统一之后，我开头那个"跨源分析"的念头，突然变成了一条能跑通的 SQL：

```sql
SELECT date_bin('10 seconds', observed_at) AS t,
  max(CASE WHEN entity_id = 'pump_pressure'   THEN value END) AS pump_bar,
  max(CASE WHEN entity_id = 'ydai_pressure'   THEN value END) AS house_mpa,
  max(CASE WHEN entity_id = 'ch1_power'       THEN value END) AS total_power_w
FROM ha_observations
WHERE observed_at > now() - interval '1 hour'
GROUP BY t
ORDER BY t;
```

这一条查询，同时拉出了**泵的压力、入户水压、总电耗**三个物理系统，按 10 秒对齐。这在分表时代要查三次再自己合并，现在一条 SQL 搞定。

这就是统一表的真正价值：不是"表少了好看"，而是**跨源分析从"几乎不可能"变成了"一条 SQL"**。

## 但统一不是无脑合并

这里我得刹一脚，讲清楚边界。统一表很容易被误解成"把所有数据都塞进一张表"，那就错了。

我在实操里最终分了这么几类，而不是真的只留一张：

| 数据形态 | 放哪 | 为什么 |
|---|---|---|
| 数值观测（功率/压力/温度） | `obs_numeric` 长表 | 跨源分析一条 SQL |
| 状态跳变（开→关） | `obs_event` 独立表 | 语义完全不同，点查为主 |
| 原始消息（完整 JSON） | `obs_message` 独立表 | 要保留原文，供重放 |
| 目录名册 | `dir_current` | 放 PG，不是时序库 |

**统一的是"同类数据"，不是"所有数据"。** 数值归数值、事件归事件、原文归原文。它们语义不同、查询模式不同，硬塞一张表反而更乱。

## 再往深一层：宽表和长表的取舍

还有一个绕不开的选择：一条设备消息里往往带几十个字段（我家那台泵一次报 32 个字段）。是**宽表**（一行放几十个字段列）还是**长表**（一行一个指标）？

- **宽表**：`ts, device, power, voltage, temp, wifi, ...` —— 一次遥测快照，读起来直观，但字段一多列就失控。
- **长表**：`ts, device, metric, value` —— 一行一个指标，字段再多也只是多几行，最适合"多源统一观测"。

我的结论是：**单设备、字段固定的遥测用宽表；多源统一分析用长表**。归一化要落地，绕不开这两个形态的权衡。

## 这件事教给我什么

1. **表爆炸是设计缺陷，不是数据量大。** 540 张表的罪魁不是数据，是一个默认配置背后"没有统一模型"的侥幸。

2. **统一表的真正价值是"跨源分析一条 SQL"**，不是"表少了好维护"这个表面理由。

3. **归一化的边界是"同类数据放一起"**，不是"所有数据放一起"。数值、事件、原文、目录，各有各的去处。

4. **宽表长表没有绝对对错**，取决于你是"看一台设备的快照"还是"跨设备做关联分析"。

**教训一句话：表少不是目的，能跨源问出问题才是。**
