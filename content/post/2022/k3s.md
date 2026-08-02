---
title: "k3s"
date: 2022-05-03T09:19:00+08:00
---

# K3S学习笔记







https://comphilip.wordpress.com/2021/05/30/k3s-thing-better-ipvs-solution/

https://comphilip.wordpress.com/2021/05/22/k3s-thing-ipvs-failure/

https://weinan.io/2020/05/23/k3s.html

https://www.modb.pro/db/383288

https://metallb.universe.tf/configuration/k3s/

https://int32bit.sh/2019/11/28/IPVS从入门到精通kube-proxy实现原理/

```bash
K3S Master startup command: k3s server --node-external-ip 172.30.80.2 --advertise-address 172.30.81.2 --node-ip 172.30.81.2 --kube-proxy-arg proxy-mode=ipvs

K3S Worker startup command: k3s agent --node-external-ip 172.30.80.3 --node-ip 172.30.81.3 --kube-proxy-arg proxy-mode=ipvs
```

```bash
################### master
export INSTALL_K3S_CHANNEL=latest
export INSTALL_K3S_MIRROR=cn 
export LIP="100.127.255.135"
export EIP="100.127.255.133"
export INSTALL_K3S_EXEC="server --tls-san $LIP --node-ip $LIP --advertise-address $LIP  --node-external-ip $EIP  --pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2 --kube-proxy-arg proxy-mode=ipvs masquerade-all=true --kube-proxy-arg metrics-bind-address=0.0.0.0"
#export INSTALL_K3S_EXEC="server --pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2 --kube-proxy-arg metrics-bind-address=0.0.0.0"
# export INSTALL_K3S_EXEC="server --tls-san $IP --node-ip $IP --node-external-ip $IP --pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2  --disable servicelb --kube-proxy-arg proxy-mode=ipvs masquerade-all=true --kube-proxy-arg metrics-bind-address=0.0.0.0"

curl -sfL http://rancher-mirror.cnrancher.com/k3s/k3s-install.sh | sh -s -

cat /var/lib/rancher/k3s/server/node-token

################ agent 
export LIP="100.127.255.136"
export EIP="100.127.255.132"
export K3S_TOKEN=K10a8cec93b8572b2986d8fa0eba6aa3076d91ce19b374714a3e68ec4440a4c280a::server:9d9c38adc6578f7bb72ca372823989fc
export INSTALL_K3S_CHANNEL=latest
export INSTALL_K3S_MIRROR=cn 
export K3S_URL=https://100.127.255.135:6443
#export INSTALL_K3S_EXEC="--node-external-ip $IP --pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2  --kube-proxy-arg proxy-mode=ipvs masquerade-all=true --kube-proxy-arg metrics-bind-address=0.0.0.0"
export INSTALL_K3S_EXEC="--node-ip $LIP --node-external-ip $EIP --pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2  --kube-proxy-arg proxy-mode=ipvs masquerade-all=true --kube-proxy-arg metrics-bind-address=0.0.0.0"
#export INSTALL_K3S_EXEC="--pause-image registry.cn-beijing.aliyuncs.com/k7scn/pause:3.2 --kube-proxy-arg metrics-bind-address=0.0.0.0"
curl -sfL http://rancher-mirror.cnrancher.com/k3s/k3s-install.sh | sh -s -
```

