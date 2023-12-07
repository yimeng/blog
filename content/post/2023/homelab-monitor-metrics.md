---
title: "利用免费的SaaS监控homelab-指标优化"
date: 2023-12-05T13:19:00+08:00
---
## 背景

上一篇文章写到如何使用SaaS来监控homelab，但是除了温度和功耗，主机的一些基础信息也需要一起更新起来。但，我们用的是SaaS。每一个metric都是跟钱息息相关的。所以对于指标的精简就显得尤其重要。其中的原则就是：放到SaaS上的一定是自己知道并且看懂的指标，看不懂以及无用的指标可以收集，但建议放到本地，不建议集中存储。

## 部署图

<img src="http://pic.chenym.net/blog/image-20231205132619401.png" alt="image-20231205132619401" style="zoom:60%;" />

在homelab中加入了本地的prometheus，在remote write给grafana cloud的时候，将自己理解并且需要的指标写到grafana cloud中。本地根据磁盘大小进行存放，云端尽量让每个指标都发挥人民币的价值。

## 问题

这个架构并不复杂，但是如何治理相关的指标就成了下一个问题。例如：

- node-exporter这个插件究竟收集了哪些指标，哪些指标是常用的。
- remote write如何进行指标的选择性发送。

饭要一口一口的吃，问题要一个一个的解决。我们先解决remote write如何方便的过滤相关指标这个问题。感谢万能的chatGPT，这个问题chatGPT给出了很好的解答（水一下）

在 Prometheus 的上下文中，"remote write" 是一个功能，它允许 Prometheus 将收集到的监控数据发送到远程存储系统。这通常用于长期数据存储、数据聚合或在多个 Prometheus 实例之间共享数据。关于 "label 治理"（label management），这通常涉及到管理和优化 Prometheus 中的标签（labels），以确保数据的有效组织和查询性能。

### 问题一

prometheus 中的remote write如何进行label治理：

在使用 Prometheus 的 remote write 功能进行 label 治理时，可以考虑以下几个方面：

1. **标签重命名和删除**：在将数据发送到远程存储之前，可以重命名或删除某些标签。这有助于减少存储需求和简化查询。这通常通过 Prometheus 的配置文件中的 `metric_relabel_configs` 部分来实现。

2. **保持标签一致性**：确保在整个监控系统中使用一致的标签名称和值，这有助于查询时的效率和准确性。

3. **避免高基数标签**：高基数标签（即具有大量唯一值的标签，如用户 ID）可能会导致存储和查询性能问题。在将数据发送到远程存储之前，考虑删除或聚合这些标签。

4. **使用标签过滤**：在配置 remote write 时，可以指定只发送包含特定标签的时间序列。这有助于减少发送到远程存储的数据量。

5. **优化标签集**：限制每个时间序列中标签的数量，避免不必要的标签，以减少存储需求和提高查询效率。

6. **使用远程存储的特性**：某些远程存储解决方案可能提供额外的标签管理功能，如自动标签聚合或特殊的索引机制。

要实现这些策略，你需要编辑 Prometheus 的配置文件，特别是 `remote_write` 部分，并可能需要调整你的远程存储解决方案的配置。建议在进行任何重大更改之前，先在测试环境中验证这些更改的影响。



### 问题二

详细介绍下在remote write的时候使用标签过滤和优化标签集

在 Prometheus 中使用 remote write 功能时，进行标签过滤和优化标签集是一种有效的数据管理策略。这些技术有助于减少发送到远程存储的数据量，提高存储效率，同时保持重要数据的完整性。下面详细介绍这两个方面：

### 标签过滤 (Label Filtering)

在 Prometheus 的 remote write 配置中，你可以指定只发送包含特定标签的时间序列。这意味着只有满足特定条件的时间序列会被发送到远程存储系统。

#### 如何配置标签过滤

1. **`write_relabel_configs`**：这是在 Prometheus 配置文件中用于标签过滤的关键部分。通过这个配置，你可以定义一系列的重标记（relabeling）规则，这些规则将应用于每个时间序列，以确定它是否应该被发送。

2. **重标记规则**：你可以使用 Prometheus 的标准重标记配置来保留或删除特定的时间序列。例如，你可以基于标签值保留或丢弃时间序列，或者根据正则表达式过滤时间序列。

#### 示例配置

```yaml
remote_write:
  - url: "http://remote-storage.example.com/write"
    write_relabel_configs:
      - source_labels: [__name__]
        regex: 'important_metric.*'
        action: keep
      - source_labels: [job]
        regex: 'unwanted_job'
        action: drop
```

在这个例子中，只有名称符合 `important_metric.*` 正则表达式的时间序列会被保留，而带有 `job` 标签值为 `unwanted_job` 的时间序列会被丢弃。

### 优化标签集 (Optimizing Label Sets)

优化标签集涉及到减少每个时间序列中标签的数量和/或调整标签的内容，以提高存储和查询效率。

#### 如何优化标签集

1. **减少不必要的标签**：通过配置文件中的重标记规则，移除那些对于时间序列的意义不大或者不被查询的标签。

2. **合并或重命名标签**：如果某些标签可以合并或者通过重命名来简化，这可以通过重标记规则实现。

3. **避免高基数标签**：高基数标签（如具有大量唯一值的标签）会显著增加存储需求和降低查询性能。考虑是否真的需要这些标签，或者是否可以通过聚合来减少其基数。

#### 示例配置

```yaml
remote_write:
  - url: "http://remote-storage.example.com/write"
    write_relabel_configs:
      - source_labels: [instance]
        target_label: instance
        regex: '(.+):.+'
        replacement: '$1'
      - action: labeldrop
        regex: 'unnecessary_label'
```

在这个例子中，`instance` 标签被重写为只包含主机名，而不是主机名和端口的组合。同时，任何名为 `unnecessary_label` 的标签都会从时间序列中删除。

通过这些方法，你可以有效地管理 Prometheus 在使用 remote write 功能时发送的数据量和质量，从而优化整体的监控和存储性能。

## 实战

方法论现在有了，那么开始我们的实战。以node-exporter为例：

```
root@ubuntu:~# curl -s http://localhost:9100/metrics|grep -v ^#|wc -l
519
```

在一个ubuntu 22.04虚拟机上node-exporter默认手机了519个指标。

```
   root@ubuntu:~# curl -s http://localhost:9100/metrics|grep -v ^#|awk -F'_' '{print NF}'|sort |uniq -c|sort -rn
    243 4
    185 5
     45 3
     31 6
      6 7
      6 2
      1 8
      1 19
      1 11
```

通过使用_分割，统计metrics的命名规则，大致在3-6范围内。

按照2进行metrics进行分类

```
root@ubuntu:~# curl -s http://localhost:9100/metrics|grep -v ^#|awk -F'_' '{print $1,$2}'|sort|uniq -c|sort -n
     14 node softnet
     17 node timex
     20 node cpu
     20 node sockstat
     23 go memstats
     40 node netstat
     42 node filesystem
     50 node memory
     57 node disk
     70 node network
     90 node scrape

```

发现大部分都是node的 ，其中cpu disk network占比较大。继续往下发现了一个问题：Prometheus这个node-exporter收集的数据过于详细，放到指标中得到易于观看的指标还需要使用Prometheus进一步的计算。恩，这个很符合研发的思维，但对于运维并不友好。因此优化到这里对于node-exporter这个方案可以暂时暂停，看看有没有其它更好的方案。因为这种指标，即便优化了之后，还是存在后续的问题。

## 再选型

那么在homelab这种场景下，对于主机监控数据，应该使用哪种方案呢？

原则：

最好单文件+配置文件 

体积和系统占用要小



先把目前已知的主机监控agent进行下罗列：

[Telegraf](https://www.influxdata.com/time-series-platform/telegraf/)

[grafana agent](https://github.com/grafana/agent)

[categraf](https://flashcat.cloud/product/categraf/)

恩，grafana_agent听说比较大，放弃。telegraf还没来得及尝试。基于对以前夜莺那帮老伙计的了解，估计categraf错不了。过去看了下。还真是，一个二进制文件+一堆配置文件。然后20M左右的体积大小，支持Prometheus的remote write完美。

配置好了之后，一台机器大概增加了100左右的指标。Prometheus需要使用--web.enable-remote-write-receiver参数开启。

categraf把url改成如下内容，默认是给夜莺发的地址。

```
[[writers]]
url = "http://127.0.0.1:9090/api/v1/write"
```

## 分析

categraf的指标统计分类收集如下，共计387个

```
    132 diskio
    113 categraf
     34 mem
     12 netstat
     11 processes
     11 linux
     10 sockstat
     10 net
      8 system
      8 disk
      6 kernel
      4 filecount
      2 conntrack
```

看起来好像还可以，其中diskio是因为docker的原因导致label较多，categraf自身的指标其实也不太需要。精简后估计也就100-200来个，还是完全可以接受的。下一步就是进一步把我们认识的指标挑选出来进行发送。其中的指标可以通过categraf --test 命令来获取。

在进一步的分析：

```
conntrack_ip
disk_device
disk_free
disk_inodes
diskio_io
diskio_iops
diskio_merged
diskio_read
diskio_reads
diskio_weighted
diskio_write
diskio_writes
disk_total
disk_used
filecount_count
filecount_newest
filecount_oldest
filecount_size
kernel_boot
kernel_context
kernel_entropy
kernel_interrupts
kernel_processes
kernel_vmstat
linux_sysctl
mem_active
mem_available
mem_buffered
mem_cached
mem_commit
mem_committed
mem_dirty
mem_free
mem_high
mem_huge
mem_inactive
mem_low
mem_mapped
mem_page
mem_shared
mem_slab
mem_sreclaimable
mem_sunreclaim
mem_swap
mem_total
mem_used
mem_vmalloc
mem_write
net_bits
net_bytes
net_drop
net_err
net_packets
netstat_frag
netstat_raw
netstat_sockets
netstat_tcp
netstat_udp
netstat_udplite
processes_blocked
processes_dead
processes_idle
processes_paging
processes_running
processes_sleeping
processes_stopped
processes_total
processes_unknown
processes_zombies
sockstat_tcp
sockstat_tcp6
sockstat_udp
sockstat_udp6
sockstat_used
system_load
system_load1
system_load15
system_load5
system_n
system_uptime
```

好像真的是不能再精简的地步了，其中有意思的地方是system_load开始增加了一个指标system_load_norm_x 这个是用于给负载一个平均值，解决无法对于多核CPU设置统一负载阈值的问题，虽然动态阈值可以解决这个问题，但是依旧实现成本较高。目前主流的[datadog](https://docs.datadoghq.com/integrations/system/)和[Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/exported-fields-system.html)都开始支持采集这个指标。不知道那个一直推广[load5s](https://zhuanlan.zhihu.com/p/474563755)指标的布道者是否也注意到了这个问题。（这是另一个有趣的故事，埋坑以后看看有没有机会再更新下）

## 总结

说实话，这篇文章写到分析的时候就被打断了，后来就忘记继续往下写了。想起来的时候，可能需要更新另一篇的文章了。暂且放到这里，等啥时候有空再来更新。这篇文章用chatGPT水了一段，昨天在twitter上[看到一个文章](https://x.com/oasisfeng/status/1732262601260683735?s=46&t=SXwLQn_TT906dBqsLOywew)，说现在使用chatGPT写文章的思路和以前有所不同。以前是先列大纲，然后再打磨内容。有了chatGPT之后，不能让chatGPT帮你不断地调整内容。而是让chatGPT不断地生产内容，然后通过人来进行整合，之后再进行创作。这样才能把人的价值发挥到最大化。chatGPT最终还是为人服务的。发挥人的创造力才是最关键的。

