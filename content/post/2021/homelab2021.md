---
title: "homelab再出发"
date: 2021-08-19T22:46:00+08:00
---

## 背景

自从家里的homelab换了一次内存之后就再也没有打开的欲望了，原因是太大了。折腾起来经常要爬上高出去接键盘和显示器。调试起来及其麻烦。尤其是夏天一身汗，调试硬件需要把一个大机箱搬上搬下及其不方便。加上里面的硬盘数据日益多了起来。而且有一些重要资料。再混在一起怕哪天都崩了。鸡蛋不能放到一个篮子里。



笔记本：5800U 有将近2w的跑分 是NUC11+1135G7 和联想m720q+ 8700T的两倍。但！扩展性稍差 只有一个网口 ，不能扩展PCIE和硬盘。平时不跑编译，应该用不到那么好的CPU，裸机价格5K。



NUC：NUC8可以装黑苹果，单网口做计算节点没啥毛病。就是电源太大（可以用替代） 。NUC11的双网卡版本基本买不到，CPU性能1w左右 跟垃圾佬的 8700T差不多 。NUC6可以改双网卡但CPU太弱。裸机 2K-3K



垃圾佬：

M720q：可以装四网卡 CPU也不弱 价格 裸机1K。如果想再好好玩玩 可以看看m910x，双M2扩展，。 930x,量比较少，适配挡板比较难。 裸机+CPU 2K



综上好像也就垃圾佬方案了。最总应该是 M920x 准系统 1200+CPU 980+2000 64G内存 +1K 1T SSD 总价下来 5.2K



二手笔记本：

联想T540P

i7 4870hq（6365） 4c8t 16G 256G 500G 1999￥





## 需求

- 体积要小（容易折腾,房子小折腾大家伙可以扔天津地下室）
- 性能要差不多（平时需求量不大，但希望能多开点虚拟机做实验）
- 内存要大（方便开虚拟机）

- 网口最好要多一些（方便做SDN实验）
- 要便宜（可以多买几个做分布式实验）
- 存储和计算分离（鱼和熊掌不可兼得）

## 选型

### 笔记本方案（7K左右）

- 设备型号：[ThinkPad L14](https://psref.lenovo.com/Detail/ThinkPad/ThinkPad_L14_Gen_1_AMD?M=20U50000AT)
- 处理器：AMD Ryzen 7 PRO 4750U (8C / 16T, 1.7 / 4.1GHz, 4MB L2 / 8MB L3) / 15W TDP
- 内存配置：64G / 2667 （32G 1k *2 ）
- 磁盘位：1个磁盘位，NGFF
- 价格 5099-6500 6800  7K+
- 链接：https://item.taobao.com/item.htm?spm=a230r.1.14.55.7ecc6405ZGoTUV&id=569044191317&ns=1&abbucket=9#detail



- 设备型号： [ThinkBook 15 G3 ACL](https://psref.lenovo.com/Detail/ThinkBook/ThinkBook_15_G3_ACL?M=21A4004UHH) 

- 处理器：AMD Ryzen 7 5800U (8C / 16T, 1.9 / 4.4GHz, 4MB L2 / 16MB L3) (**19669**)
- 内存配置：Up to 40GB (8GB soldered + 32GB SO-DIMM) DDR4-3200
- 磁盘：1T
- 价格：6899
- 链接：https://item.jd.com/10022943779704.html#crumb-wrap

### 差异

- 同样是 8C/16T的CPU，基础和最高频率分别提升了 0.2 / 0.3 GHz，L3 提升了一倍达到了 16MB。
- 因为板载了一条 8GB 的内存，所以内存上限从 64GB 下调至了 40GB。
- 这台笔记本允许使用两条 M2 SSD 磁盘，在不使用 USB 和雷电外接存储的情况下，默认的容量会比之前大一些。
- 因为网卡从 Intel 换成了螃蟹网卡的某个版本，自带“蓝牙”版本从 5.2 下调到了 5.1。
- 默认电源从 45w 提升到了 65w。

### 小主机方案

## NUC方案

NUC6 i5-syh（J3455 ）

- CPU J3455 (**2259**)

NUC7 

NUC8 i5-beh（1800-2399）

- 处理器 ：[Intel® Core™ i5-8259U Processor (4C / 8T, 2.3 / 3.8GHz, 6MB L2)](https://ark.intel.com/content/www/cn/zh/ark/products/135935/intel-core-i5-8259u-processor-6m-cache-up-to-3-80-ghz.html) (**8131**)
- 内存：32 GB 1K  

- 磁盘：1T  1K
- 电源很大
- 可以装黑苹果

NUC11（3299 +2K=5.5k）

- 处理器 ： i5-1135G7 @ 2.40GHz (4C / 8T, 2.4 / 4.2GHz, 8MB L2) (**10072**)
- 网卡：2.5G 



https://post.smzdm.com/p/apx5mv6x/

## 垃圾佬方案

内存 32G 1K 64G 2K

CPU 1K

HP800G2 

联想M93P

- 处理器 g3220t i3-4130t i5-4590t
- 扩展性：双网卡
- 主板 Q87
- 价格：820

联想m720q

- 处理器 g4900t g4930 i3-8100 i5-8500t 9500t(**8203**) 9700t 8-9代 35w 8700T（1210）（**10781**） 8600t(980)(**8424**) 9900T(1690)
- 扩展性：四网卡 可以上魔改CPU  C口 usb3.1 dp+hdmi
- 主板：B360
- 价格：1K 

联想m920q

- 规格：同 m720q 
- 扩展性：可以雷电扩展

联想m920x

- CPU：8600t(980)(**8424**)
- 扩展性：多散热孔 两个M2 720一个
- 价格：1.2K

联想730q

- 十代CPU
- 没有pcie
- 放弃

联想930x

- 十代CPU
- 有pcie

联想m910x

m715q 

- AMD A12 9800E R7 4C
- R3 2200ge 或R5 2400ge(4C8T 3.2 3.8 2M 4M 35W)
- https://item.taobao.com/item.htm?spm=a230r.1.14.18.691177714V0w4h&id=645971945417&ns=1&abbucket=9#detail

联想920

联想710q

- 6-7-8代CPU
- 铜底散热

华擎 A300



华擎 X300



minisforum HM80

- CPU: AMD锐龙ryzen7 R7 4800U (**Cores:** 8 **Threads:** 16 1.8 GHz **TDP Up**: 25 W)
- 硬盘：m2 * 1 2 * SATA
- 网卡：双网口 1G+2.5G
- 

| CPU型号               | 价格 | 跑分  | 核数  | 主频          | 功耗 | 搭配机器            |               |
| --------------------- | ---- | ----- | ----- | ------------- | ---- | ------------------- | ------------- |
| AMD Ryzen 7 PRO 4750U |      | 15535 | 8C16T | 1.7  / 4.1G   | 15W  | ThinkPad  L14       | 7K            |
| AMD Ryzen 7 5800U     |      | 19669 | 8C16T | 1.9  / 4.4GHz | 15W  | ThinkBook 15 G3 ACL | 7K            |
| J3455                 |      | 2259  |       |               |      | NUC6 i5-syh         |               |
| i5-8259U              |      | 8131  | 4C8T  | 2.3 / 3.8GHz  |      | NUC8 i5-beh         |               |
| i5-1135G7             |      | 10072 | 4C8T  | 2.4 / 4.2GHz  |      | NUC11               |               |
| g3220t                |      | 1539  |       |               |      | M93P                |               |
| i3-4130t              |      | 2879  |       |               |      | M93P                |               |
| i5-4590t              |      | 4022  |       |               |      | M93P                |               |
| g4900t                |      | 2331  |       |               |      | m720q               |               |
| g4930                 |      | 2575  |       |               |      | m720q               |               |
| i3-8100               |      | 6135  |       |               |      | m720q               |               |
| i5-8500t              |      | 7678  |       |               |      | m720q               |               |
| 9500t                 |      | 8203  |       |               |      | m720q               |               |
| 9700t                 |      | 10642 |       |               |      | m720q               |               |
| 8700T                 | 1210 | 10781 |       |               |      | m720q               |               |
| 8600t                 | 980  | 8424  |       |               |      | m720q               |               |
| 9900T                 | 1690 | 13993 |       |               |      | m720q               |               |
| AMD 9800E             |      | 3191  |       |               |      |                     |               |
| AMD Ryzen7 R7 4800U   |      | 17249 |       |               |      | HM80                | 3.5K+2K+1K=6K |

https://www.chiphell.com/forum.php?mod=viewthread&tid=2309337&extra=&page=2&mobile=1

https://www.chiphell.com/thread-2173141-1-1.html M910x

![image-20210825141915443](/Users/yimeng/Library/Application Support/typora-user-images/image-20210825141915443.png)