---
title: "基础设施即代码-cloud-init"
date: 2021-09-04T09:19:00+08:00
---

# 基础设施即代码-cloud-init

第一次接触这个东西应该是在2012年，在创建aws的ec2上的时候，需要注入主机名。当时aws给了一个输入框，可以往里写一些“变量”。在启动的时候就可以按照规定好的变量进行设置。而且还能通过一个URL访问这些变量。这可能就是一开始的cloud-init



从下面的图可以看出来 cloud-init除了images(iso)之外，还需要三个数据

- user-data
- vendor-data
- meta-data

作为支撑。其中最主要的应该就是user-data了。



![cloud-init](http://pic.chenym.net/blog/20220429084107.png)

## 用户数据

### user-data

这部分是cloud-init的最主要的数据源，这个阶段白皮书建议做下面的一些事情。但有些事情详见一开始的说明。技术上可以做但是用于第一次启动会不太适合。

- 设置主机名
- 增加公钥
- 增加用户
- 磁盘挂载分区
- 更新软件包
- 配置LXD或者docker
- 运行测试代码
- 执行配置管理（ansible puppet chef）
- 扩容根分区
- 设置时区
- 更新软件源地址

文件要满足相关的 [文件格式](https://cloudinit.readthedocs.io/en/latest/topics/format.html)  ，相关实例可以参考 [文件示例](https://cloudinit.readthedocs.io/en/latest/topics/examples.html) 。使用过程中可以使用一些[已经写好的模块](https://cloudinit.readthedocs.io/en/latest/topics/modules.html)进行配置。

同时，还支持一些事件的调用。比如第一次运行的时候，之后每次启动的时候，都可以根据启动的状态进行模块的调用。

但事件的调用目前用的应该不多，而且功能也还待完善。



### vendor-data

这部分的数据一般来自于云平台自身，跟user-data数据类似。如果使用了user-data数据 这部分可能就不太需要了。例如如果在aws启动实例的控制台上定义了user-data，估计这部分就不生效了。主要用来设置ntp和软件更新源。这部分数据官方文档放到了实例数据中。但是ubuntu的cloud-init白皮书放到了实例数据中，应该属于一个中间地带。并且官方文档也说，建议云厂商不要滥用这个文件。防止给用户带来不必要的困扰，虽然，user-data大于vendor-data，想必这么设计也是有这层意思吧。

## 实例数据

#### meta-data 

这部分就是云实例提供的了。一般来说就是我们可以使用curl来获取的那些信息。会在本机生成一个实例数据的一个文件，可以在这个文件中找到一些非常有用的信息，比如IP地址等。cloud-init在执行的时候就会把一些相关的信息写入这个文件。这个倒是可以结合CMDB或者配置管理的一些数据库进行联合。例如把维护人的username email写入这个文件中。详细的说明可以参考下 [官方元数据的说明](https://cloudinit.readthedocs.io/en/latest/topics/instancedata.html)



## 最佳实践

这个东西应该是在通过PXE/Packer打包好了镜像之后（也安装了cloud-init）使用的。但有个悖论就是：cloud-init里面有一些软件包的安装过程，这个跟PXE/Packer里面的软件包安装甚至cloud-init后续的ansible/puppet过程的软件包安装可能会有冲突。所以软件包安装这个行为需要谨慎的进行考虑其各个阶段的作用。那么cloud-init在其生命周期里，主要可以用来做什么呢？个人感觉如下几个功能可以供参考：

- 主机名的初始化
- 用户初始化
- 公钥的注入
- 一些通过镜像基线没有搞定的事情弥补下
- 分区挂载（如果有运维标准的话可以做）

这个阶段已经开始有IP地址了，准备让应用运维上来初始化他们自己的机器了，基础软件在PXE还有一些小问题的，需要通过这个阶段弥补下。

不适合做的事情：

- 应用软件的安装（交给应用运维用puppet或者ansible 安装会占用过多的时间 影响交付）
- 跟PE(应用运维)业务有关的事情（增加各个PE的账户，实际上是SA交给PE的最后一步。具体PE分配和使用交给PE去规划）

说白了 cloud-init是用于SA的最后一步的添补，弥补在打镜像或者terraform的时候的一些缺陷，但似乎跟terraform有一些小冲突。这里可以认为terraform是用于个性化的启动，是一个SA的主动改变的行为。而cloud-init是用于通用化的启动，基本上不太会更改里面的内容，即使修改，可能也在一些可变的URL里进行修改。

本篇并没有对cloud-init的技术做过多的介绍，多半还是功能和定位的一个介绍。并且根据自己的思考把一些适用场景进行了描述。因为技术很容易就更新。但产品的定位和功能基因大体不太会变。甚至有些产品到了最后被收购的情况下也不太会改变了。比如puppet。



[cloud-init白皮书](https://pages.ubuntu.com/rs/066-EOV-335/images/CloudInit_Whitepaper.pdf?utm_source=marketo&utm_medium=landingpage&utm_campaign=CY19_DC_Server_Whitepaper_CloudInit)

TH9REX-4QBDS3-5ADB8U-M5YE4V

pulumi

quickstart



```shell
export ALICLOUD_ACCESS_KEY=xxxxx
export ALICLOUD_SECRET_KEY=xxxxxx
mkdir quickstart && cd quickstart
pulumi new python --force
source venv/bin/activate
```

__main__.py

```python
"""A Python Pulumi program"""
import pulumi
import pulumi_alicloud as alicloud

vpc = alicloud.vpc.Network("my-vpc",cidr_block="172.16.0.0/12")
az = "cn-beijing-c"
sg = alicloud.ecs.SecurityGroup("pulumi_sg",description="pulumi security_groups",vpc_id=vpc.id)
vswitch = alicloud.vpc.Switch("pulumi_vswitch",zone_id=az,cidr_block="172.16.0.0/21",vpc_id=vpc.id)
sg_ids= [sg.id]
sg_rule= alicloud.ecs.SecurityGroupRule("sg_rule",security_group_id=sg.id,ip_protocol = "tcp", type= "ingress",nic_type    = "intranet",port_range="22/22",cidr_ip="0.0.0.0/0")

instance=alicloud.ecs.Instance("ecs-instance2",availability_zone=az,instance_type ="ecs.t5-lc2m1.nano" , security_groups =sg_ids,image_id="ubuntu_18_04_64_20G_alibase_20190624.vhd",instance_name ="ecsCreatedByPulumi2",vswitch_id=vswitch.id,internet_max_bandwidth_out = 10)
```



```shell
 git clone https://github.com/ryan4yin/pulumi-proxmox.git
 cd pulumi-proxmox
 brew tap pulumi/tap
 brew install pulumictl
 make build_sdks
 make install_python_sdk
 pulumi plugin install resource proxmox v0.0.6
```

```python
import os
from pathlib import Path

import pulumi
from pulumi_proxmox import Provider, ProviderVirtualEnvironmentArgs
from pulumi_proxmox.vm import *

# this provider cannot read configuration from Environment variables yet,
# You must manually pass parameters by instantiating a custom provider
proxmox_provider = Provider(
    "proxmox-provider",
    virtual_environment=ProviderVirtualEnvironmentArgs(
        endpoint=os.getenv("PROXMOX_VE_ENDPOINT"),
        insecure=os.getenv("PROXMOX_VE_INSECURE") == "true",
        username=os.getenv("PROXMOX_VE_USERNAME"),
        password=os.getenv("PROXMOX_VE_PASSWORD")
    )
)

# create a virtual machine
VirtualMachine(
    "ubuntu-vm-0",
    name="ubuntu-vm-0",
    description="a ubuntu vm for test",
    node_name="homelab",
    on_boot=True,  # start the vm during system bootup
    reboot=False,  # reboot the vm after it was created successfully
    started=True,  # start the vm after it was created successfully
    # clone from a vm template
    clone=VirtualMachineCloneArgs(
        vm_id=110,  # template's vmId
        full=False,  # full clone, not linked clone
        datastore_id="local-lvm",  # template's datastore
        node_name="homelab",  # template's node name
    ),

    # resource pool name
    #pool_id="local",
    cpu=VirtualMachineCpuArgs(
        cores=2,
        sockets=2,
        type="kvm64",  # set it to kvm64 for better vm migration
    ),
    memory=VirtualMachineMemoryArgs(
        dedicated="4096",  # unit: MB
        shared="4096"
    ),
    operating_system=VirtualMachineOperatingSystemArgs(
        type="l26"  # l26: linux2.6-linux5.x
    ),
    agent=VirtualMachineAgentArgs(
        # please confirm you have qemu-guest-agent in your vm before enable this!
        # otherwise this may cause the vm to fail to shutdown/reboot!
        enabled=False,
        timeout="60s",  # timeout
    ),
    disks=[
        VirtualMachineDiskArgs(
            interface="scsi0",
            datastore_id="local-lvm",
            size="30",  # unit: GB
        )
    ],
    network_devices=[
        VirtualMachineNetworkDeviceArgs(
            enabled=True,
            bridge="vmbr0",
            model="virtio",
            vlan_id=0,
        )
    ],
    # cloud init configuration
    initialization=VirtualMachineInitializationArgs(
        type="nocloud",  # 'nocloud' for linux,  'configdrive2' for windows
        #datastore_id="local-lvm",
        dns=VirtualMachineInitializationDnsArgs(
            # dns servers,
            server="114.114.114.114,8.8.8.8",
        ),
        ip_configs=[
            VirtualMachineInitializationIpConfigArgs(
                ipv4=VirtualMachineInitializationIpConfigIpv4Args(
                    address="192.168.1.111/24",
                    gateway="192.168.1.1"
                )
            )
        ],
        user_account=VirtualMachineInitializationUserAccountArgs(
            # set root's ssh key
            keys=[
                Path("ssh-common.pub").read_text()
            ],
            password="chage_me",  # needed when login from console
            username="root",
        )
    ),

    # use custom provider
    opts=pulumi.ResourceOptions(
        provider=proxmox_provider
    )
)
```

