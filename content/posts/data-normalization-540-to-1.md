---
title: "数据归一化工程；从 540 张表到 1 张表"
date: 2026-11-15
summary: "measurement_attr 导致每实体一张表（540 张）。override_measurement 统一单表，entity_id 作 tag，跨源分析一条 SQL。"
categories: ["智能家居", "架构"]
tags: ["数据归一化", "GreptimeDB", "表设计", "跨源分析"]
---

# 数据归一化工程：从 540 张表到 1 张表

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

**这不是"数据多"，这是"设计缺陷"**。表爆炸的本质是**没有统一的数据模型**。

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

**关键变化**：
- 540 张表 → **1 张表**
- 实体从"表名"变成"tag 值"
- 跨源分析可以用一条 SQL 完成

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

**统一表的核心价值**：
- 跨源分析一条 SQL（不用记 540 个表名）
- 统一语义（entity_id/metric_name/unit 统一）
- 查询性能可接受（时序库按 tag 过滤快）

## 宽表 vs 长表的选择

| 形态 | 结构 | 适用 |
|---|---|---|
| **宽表**（一行多字段） | `ts, device, power, voltage, temp, wifi` | 一次遥测快照（多字段消息） |
| **长表**（一行一指标） | `ts, device, metric, value` | 多源统一观测 |

**决策依据**：
- 设备一次发多字段（泵 43 字段）→ 宽表自然，但列数失控时要收敛
- 多源统一观测 → **长表**（obs_numeric 模式）

**注意**：统一表需要统一字段契约（entity_id/metric_name/unit），否则查询会乱。

## 归一化的边界：不是"表越少越好"

**归一化的目标不是"表越少越好"，而是"跨源分析能用一条 SQL 完成"**。

| 情况 | 该分表还是统一表 |
|---|---|
| 要做跨源关联分析（"泵启动时电表怎么变"） | **统一表**（obs_numeric 同表） |
| 各源独立分析为主（只看单个设备） | 分表可接受（各源独立） |
| 设备语义完全不同（数值 vs 状态 vs 原始消息） | **分表**（obs_numeric/obs_event/obs_message 分开） |

**关键判断**：统一表的价值是"跨源分析便利"，如果不需要跨源分析，分表也没问题。但表爆炸（540 张）一定是设计缺陷。

## 通用原则

**表爆炸是设计缺陷，统一表才能跨源分析**：

- 统一表需要统一字段契约（entity_id/metric_name/unit）
- 归一化的目标不是"表越少越好"，而是"跨源分析能用一条 SQL 完成"
- **宽表 vs 长表**：多字段消息用宽表，多源统一用长表

**归一化的边界**：
- 统一表适合"跨源分析"场景
- 分表适合"语义完全不同"的场景（数值 vs 状态 vs 原始消息）
- **归一化不等于"所有数据放一张表"**，而是"同类数据放一张表"

## 误区与边界

### 误区 1：以为"表越多越好维护"

实际上表爆炸（540 张）导致：
- 查询要按实体名拼表名，无法统一分析
- 跨源 JOIN 几乎不可能
- 维护成本指数增长

### 误区 2：以为"统一表就是所有数据放一张表"

实际上统一表需要**同类数据**：
- 数值类数据（功率/压力/温度）→ obs_numeric 统一表
- 状态跳变 → obs_event 独立表
- 原始消息 → obs_message 独立表
- 目录名册 → dir_current 独立表

**统一表不等于"所有数据放一张表"，而是"同类数据放一张表"**。

### 边界：什么时候该分表

- 数据语义完全不同（数值 vs 状态 vs 原始消息）→ 必须分表
- 查询模式完全不同（连续扫描 vs 点查跳变）→ 建议分表
- 数据量差异巨大（高频数值 vs 低频事件）→ 可以分表

## 原则提炼

1. **表爆炸是设计缺陷**：每实体一张表（540 张）导致无法统一分析
2. **统一表才能跨源分析**：一条 SQL 横跨泵/电/水三个系统
3. **归一化的边界是"同类数据"**：数值统一表，状态独立表，原始消息独立表
4. **宽表 vs 长表**：多字段消息用宽表，多源统一用长表
