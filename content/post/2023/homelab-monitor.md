---
title: "利用免费的SaaS监控homelab"
date: 2023-12-05T09:19:00+08:00
---
## 背景

因为家里的homelab和NAS服务器怕娃进行物理性破坏，放到了一个稍微有点密闭的空间里。因此温度监控就比较重要，防止过热产生的各种问题。

## 收集

homelab是个AMD的小主机，通过sensors命令可以很容易得到，NAS则需要使用SNMP获取到。

```bash
root@homelab:~# sensors
iwlwifi_1-virtual-0
Adapter: Virtual device
temp1:            N/A

nvme-pci-0100
Adapter: PCI adapter
Composite:    +38.9°C  (low  =  -0.1°C, high = +74.8°C)
                       (crit = +79.8°C)

amdgpu-pci-0600
Adapter: PCI adapter
vddgfx:        1.36 V
vddnb:       756.00 mV
edge:         +45.0°C
PPT:          11.00 W

k10temp-pci-00c3
Adapter: PCI adapter
Tctl:         +69.8°C
```

## 服务端选型

方法有了，那么下一步就是找一个免费白嫖的SaaS监控服务。国内有观测yun，国外有grafana，datadog等。国产的guance云用了下，用户体验过于“专业”，小人愚笨，感觉入门门槛比较高，放弃。datadog抄guance云，用户体验如出一辙，也放弃。剩下grafana了，虽然grafana照比以前也复杂臃肿了很多，但依旧在用户体验和技术投入产出比上有这一定优势，虽然存在国外站点传输上的问题，但稍微不稳定也还可以接受，谁让咱是白嫖呢。最后定格grafana cloud服务。

grafana cloud包含如下组件：

- Grafana Instance
- Prometheus Endpoint
- Graphite Endpoint
- Logs Backend
- Traces Backend
- Performance Testing
- Unlimited Dashboards
- Community Support

## 收集端选型

其中Graphite Endpoint还可以直接支持proxmox的[External Metric Server](https://pve.proxmox.com/wiki/External_Metric_Server) ，但需要安装一个Carbon-Relay-NG进行转发。懒得装了，反而找到一个[graphite_exporter](https://github.com/prometheus/graphite_exporter) 可以用来把接收到的graphite数据转成Prometheus的exporter。尝试了下，也还可以。但是有可能有一些限制，比如因为性能问题，一段时间的指标数据会丢弃啥的。

但因为温度的格式是非结构的，因此如何把相关格式通过shell转换成格式化数据就变成了一个技术问题。再次感叹下现在chatGPT的伟大，把这段格式扔进去，然后chatGPT就帮你写好了。相关脚本如下，可供参考：

```bash
#!/bin/bash

# 您的输入数据
data=$'Composite: +37.9°C (low = -0.1°C, high = +74.8°C) (crit = +79.8°C)\n\nvddgfx: 1.32 V\nvddnb: 749.00 m
V\nedge: +42.0°C\nPPT: 5.00 W\n\nTctl: +63.4°C'

# 函数来提取和格式化指标
parse_metric() {
    local metric=$1
    echo "$data" | awk -F ': ' -v metric="$metric" '
    $1 == metric {
        gsub(/[+°C,VWm]/, "", $2);
        print metric ",device=\"your_device_name\",adapter=\"PCI adapter\",source=\"grafana\" metric="$2
    }'
}

# 输出指定的指标
parse_metric "Composite"
parse_metric "vddgfx"
parse_metric "vddnb"
parse_metric "edge"
parse_metric "PPT"
parse_metric "Tctl"
```

非常的方便，因为上传到grafana cloud的话，有一个比较简便的方式是实用curl，因此最终的脚本如下，使用了senso

```bash
#!/bin/bash
# 获取传感器数据并解析
sensors amdgpu-pci-0600 k10temp-pci-00c3 nvme-pci-0100 -j | jq -r '
    to_entries[] |
    .key as $device |
    .value |
    to_entries[] |
    select(.key != "Adapter") |
    .key as $metric |
    .value |
    to_entries[] |
    "\(.key),device=\($device),source=grafana_cloud_docs metric=\(.value)"' |
while IFS= read -r line; do
    curl -X POST -H "Authorization: Bearer $API_KEY" -H "Content-Type: text/plain" "$URL" -d "$line"
    echo  $line
done
```

也顺便让chatGPT帮忙写了一个30s定时执行的systemd服务

```toml
# /etc/systemd/system/sensor_data.service
[Unit]
Description=Sensor Data Collection Service

[Service]
ExecStart=/usr/local/bin/sensor_data.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

至此，就可以在grafana cloud直接出图了，前后应该花费大概30分钟-1小时（主要是找方案和调试的时间）。如果没有chatGPT可能需要4-8小时的时间。效率提升还是比较明显的，主要是可以将精力主要放到找寻解决方案上，而不是具体的实现细节。

## 成果

![image-20231204110031249](http://pic.chenym.net/blog/image-20231204110031249.png)

## 遗留问题

CPU温度和功率是否有相关关系？

如何监控除了温度其它的性能指标？

SaaS上的指标如何优化？