---
title: "pulumi-quickstart"
date: 2021-09-04T09:19:00+08:00
---



## 背景

基础设施即代码的当红小生，大有把大哥terraform比下去的趋势。有评价说terraform是配置文件即代码，而pulumi才是真正的基础设施既代码。说白了就是terraform被人诟病的HCL语言过于“刻板”，甚至有点当年[puppet那有一定入门门槛的语言一样](https://puppet.com/docs/puppet/7/puppet_language.html)。所以喜欢自由的devops们都对于pulumi的门下，甚至[thoughtworks技术雷达里在2021年10月将等级从评估提到了实验级别](https://www.thoughtworks.com/zh-cn/radar/platforms/pulumi)。 所以借着研究基础设施既代码的机会，研究下这位当红小生吧。

## 结论

把结论放到这里各位可以各取所需，不太适合的就可以不看下面的详细过程了

- 小众Provider需要时间和经历尝试，如果只是像proxmox这样自己玩玩homelab的，平时创建个机器啥的。ansible和terraform都可以满足你的需要。不一定非要用pulumi。
- 尽量用python，调试资料啥的都好找一些。尝试了下golang，有点小放弃。主要是用的人不太多。而且编译成一个文件执行的机会可能也不大。大多数时候还是shell+bin。当然这个依据你的技术栈而定。
- 可以用用它的k8s模块，目前还没有尝试。不过k8s的yml确实跟terraform puppet这些前辈们有一拼。不知道这个效果如何。
- 最后总结下：如果terraform能满足你的需要，用着吧。如果有一些实在不能满足需要的，再来看看pulumi。或许有惊喜。



## 过程

### 阿里云

#### 环境准备

```shell
export ALICLOUD_ACCESS_KEY=xxxxx
export ALICLOUD_SECRET_KEY=xxxxxx
mkdir quickstart && cd quickstart
pulumi new python --force
source venv/bin/activate
```

#### main.py

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



### proxmox

#### 环境准备

```shell
 git clone https://github.com/ryan4yin/pulumi-proxmox.git
 cd pulumi-proxmox
 brew tap pulumi/tap
 brew install pulumictl
 make build_sdks
 make install_python_sdk
 pulumi plugin install resource proxmox v0.0.6
```

#### main.py

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

