---
title: "数据归一化工程；从 540 张表到 1 张表"
date: 2026-11-15
summary: "measurement_attr 导致每实体一张表（540 张）。override_measurement 统一单表，entity_id 作 tag，跨源分析一条 SQL。"
categories: ["智能家居", "架构"]
tags: ["数据归一化", "GreptimeDB", "表设计", "跨源分析"]
---



## 问题：表爆炸是怎么发生的

HA 的 InfluxDB 集成默认配置 `measurement_attr: entity_id`，导致**每个实体自动建一张表**：

```
sensor.ydai_water_pressure  → 表 1
sensor.sofar_pump_voltage   → 表 2
sensor.lumi_temperature     → 表 3
...
（共 540 张表）
```

**问题**：
- 查询要按实体名拼表名，无法统一分析
- 跨源 JOIN 几乎不可能（540 个 union 性能差）
- 每加一台设备就多一张表，维护成本指数增长

## 解法：override_measurement 统一单表

```yaml
influxdb:
  override_measurement: ha_observations
```

**效果**：所有 HA 数据进**一张表**，`entity_id` 作为 tag 区分。

```sql
ha_observations
  ts | domain | entity_id | device_class | value | unit
  ---+--------+-----------+--------------+-------+-----
  ...| sensor | ydai_water| pressure     | 0.29  | MPa
  ...| sensor | pump_volt | voltage      | 229   | V
```

## 统一表的价值：跨源分析一条 SQL

```sql
-- 看"泵启动时，入户水压和流量怎么变，同时耗电多少"
SELECT date_bin('10 seconds', observed_at) t,
  max(CASE WHEN entity_id='pump_pressure' THEN value END) AS pump_bar,
  max(CASE WHEN entity_id='ydai_pressure' THEN value END) AS house_mpa,
  max(CASE WHEN entity_id='ch_1_power' THEN value END) AS total_power_w
FROM ha_observations
WHERE observed_at > now() - interval '1 hour'
GROUP BY t ORDER BY t;
```

**这一条查询横跨了三个物理系统**：泵、入户水、总电。如果分表要查三次再合并。

## 宽表 vs 长表的选择

| 形态 | 结构 | 适用 |
|---|---|---|
| **宽表**（一行多字段） | `ts, device, power, voltage, temp, wifi` | 一次遥测快照（多字段消息） |
| **长表**（一行一指标） | `ts, device, metric, value` | 多源统一观测 |

**决策**：
- 设备一次发多字段（泵 43 字段）→ 宽表自然，但列数失控时要收敛
- 多源统一观测 → **长表**（obs_numeric 模式）

## 通用原则

**表爆炸是设计缺陷，统一表才能跨源分析**。

但统一表需要统一字段契约（entity_id/metric_name/unit），否则查询会乱。归一化的目标不是"表越少越好"，而是"**跨源分析能用一条 SQL 完成**"。
