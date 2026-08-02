---
title: "Vagrant Alpine"
date: 2018-02-09T13:40:05+08:00
---
# vagrant-alpine自定义实战

## 背景

在docker CI CD devops各种新鲜事务的潮流下，[Pets=>Cattle](http://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/) 也告诉运维要的一个思维的转变。
这个就需要很多的牛来做实验.

13年在做puppet的CI/CD的时候，单位有一个OpenStack环境，利用api还是很爽的。后来嫌弃创建实例太慢，又开始用了docker。但docker还是有一定的局限性，比如dns和一些系统参数无法修改验证。vagrant也不错，但当时没有一个精简合适的Linux发行版，启动和资源占用还是很耗费电脑的。

在玩docker的时候，发现了alpine这个系统。几十兆到一百兆，经过优化之后启动大概10s就ok。虽然官方有做好了的vagrant镜像。但是感觉还是不够本地化。就有了自己搞的念头。

## 安装alpine

[alpine下载](https://alpinelinux.org/downloads/) 
如果是virtualbox，选择VIRTUAL版本即可。

下载回来是一个iso文件，用virtualbox加载引导。用户名root 密码为空。登陆之后运行setup-alpine开始安装。具体内容这里就不说了。可以看[这里](http://blog.csdn.net/csdn_duomaomao/article/details/76053229)

## vagrant配置

1. 添加vagrant账户，密码好像无所谓，最好也是vagrant
2. [vagrant的公钥](https://github.com/hashicorp/vagrant/tree/master/keys)放到~/.ssh/下面，注意好.ssh和公钥的权限问题
3. sudo里加上vagrant
4. root密码为vagrant
5. 网络访问方式需要是NAT，这个在打包的时候vagrant甚至还会检测是否把端口映射关闭掉。
6. ssh加速需要把sshd里的UseDNS禁止掉，否则可能ssh进去的时候会稍微慢一点

以上是官方的建议，下面来点我自己的干货

### sshd相关配置

sshd里把最大尝试次数设置的多一点,因为在启动的时候vagrant会进行几次尝试，这时候如果出现一些意外的小状况的话，会被sshd直接拒绝，实验环境，密码私钥都是公开的了，也无所谓尝试几次了。

### 启动倒计时

启动的时候有3秒的倒计时，如果介意2秒的启动速度的话可以编辑 /etc/update-extlinux.conf文件，设置timeout=1，然后执行update-extlinux，重启即可看到效果

### chrony启动优化

启动的时候chrony会有一些慢，可能是在算本地时钟是否准确。如果介意的话可以编辑/etc/chrony/chrony.conf文件，把initstepslew那行注释掉即可提高启动速度，并且把各种ntp的源找个国内的填上比如  cn.pool.ntp.org

### repo源优化

改成国内的源，并且用@ pin住，如果加了testing等源的话，会提示apk-tools版本太老，可以用

```shell
apk add --upgrade apk-tools@edge
```

进行升级

/etc/apk/repositories

```shell
https://mirrors.ustc.edu.cn/alpine/latest-stable/main
https://mirrors.ustc.edu.cn/alpine/latest-stable/community
@edge https://mirrors.ustc.edu.cn/alpine/edge/main
@edgecommunity https://mirrors.ustc.edu.cn/alpine/edge/community
@testing https://mirrors.ustc.edu.cn/alpine/edge/testing
```

## 最后

找个目录执行

```shell
vagrant package --base vagrant-alpine --output vagrant-alpine.box
```

--base后面是virtualbox的名称，生成为vagrant-alpine.box。
但别着急编辑vagrantfile，还需要用

```bash
vagrant box list
```

看一下，否则up执行的可能是已经add过的老box，而不是这个新的。这点尤其要注意，我就被坑了2个多小时。

调试完毕之后，就可以去https://app.vagrantup.com 注册个账户，把做好的box传上去。hashicorp对于公开的box，是没有限制的。如果要私有化自己的box，5$/m 私有项目数目不限制。

个人测试上传还好，但是从官网下载的话，还是找个国内速度快的地方搞吧。

## 总结

制作本身并没有太难的地方，更多的还是遇到问题解决问题的过程并且总结更有意思一些。以后也多了一个在个人profiles页上的新资源：

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "yimeng/alpine"
end
```

## 参考资料

* https://www.vagrantup.com/docs/boxes/base.html
* https://wiki.alpinelinux.org/wiki/Installation
* https://wiki.alpinelinux.org/wiki/Alpine_Linux_package_management
* https://github.com/hashicorp/vagrant/tree/master/keys
