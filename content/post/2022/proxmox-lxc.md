---
title: "家庭电量可观测性"
date: 2022-05-03T09:19:00+08:00
---

# proxmox-lxc

## 背景

## 方案

### clone

### 原生



### 自己制作	

Create lxc template with proxmox

```shell
Step 1) Download the LXC/openVZ template
Step 2) Create an LXC container with this template
Step 3) Boot the container
Step 4) Enter the container via console (pct enter <id>)
Step 5) Install / modifY anything you want
Step 6) Remove the network configuration from the network interface
Step 7) Shutdown the container
Step 8) Make a backup with vzdump and select tar.gz as extension
Step 9) Move and rename your xyz.tar.gz to /var/lib/vz/template/cache/template-version.tar.gz
Step 10) Use your new template on new containers
```

Step 8&9

```shell
# https://billing.instantdedicated.com/index.php?rp=/knowledgebase/169/Create-lxc-template-with-proxmox.html
#/var/lib/vz/dump
root@homelab:/var/lib/vz/dump# vzdump 100 -compress gzip

INFO: starting new backup job: vzdump 100 --compress gzip
INFO: Starting Backup of VM 100 (lxc)
INFO: Backup started at 2022-05-26 00:16:48
INFO: status = stopped
INFO: backup mode: stop
INFO: ionice priority: 7
INFO: CT Name: CT100
INFO: including mount point rootfs ('/') in backup
INFO: creating vzdump archive '/var/lib/vz/dump/vzdump-lxc-100-2022_05_26-00_16_48.tar.gz'
INFO: Total bytes written: 611809280 (584MiB, 27MiB/s)
INFO: archive file size: 189MB
INFO: Finished Backup of VM 100 (00:00:22)
INFO: Backup finished at 2022-05-26 00:17:10
INFO: Backup job finished successfully

cp /var/lib/vz/dump/vzdump-lxc-100-2022_05_26-00_41_06.tar.zst /var/lib/vz/template/cache/
```

## 问题

openssh 8.8 去除了ssh-rsa算法

https://github.com/hashicorp/terraform/issues/29082

https://github.com/hashicorp/terraform/issues/27768

https://github.com/golang/go/issues/49952

https://github.com/golang/go/issues/39885

https://cloud.tencent.com/developer/article/1493298



https://www.turnkeylinux.org/tkldev



https://xuanwo.io/reports/2021-47/



https://cloud.tencent.com/developer/article/1878381

https://bbs.php8.win/d/43-aws-ec2ubuntu2204xshell

https://cloud.tencent.com/developer/article/1493298

https://neil-wu.github.io/2020/04/04/2020-04-04-SSH-key/



https://vanmieghem.io/automating-proxmox-with-terraform-ansible/

https://github.com/vivami/proxmox-automation

## 结论 

```shell
-rw-r--r-- 1 root root 121M Nov 12  2021 ubuntu-21.10-standard_21.10-1_amd64.tar.zst
-rw-r--r-- 1 root root 124M Apr 24 18:24 ubuntu-22.04-standard_22.04-1_amd64.tar.zst
-rw-r--r-- 1 root root 190M May 26 00:26 vzdump-lxc-100-2022_05_26-00_16_48.tar.gz
-rw-r--r-- 1 root root 183M May 26 00:42 vzdump-lxc-100-2022_05_26-00_41_06.tar.zst
```

