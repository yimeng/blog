---
title: "出租窝装修记"
date: 2019-08-18T15:34:49+08:00
---

# 出租窝装修记
## 背景

刚来北京的时候把自己的博客定义成出租窝，想想和那时候的情景还是很贴合的。现实中有了自己的固定的窝了，但网上的这个窝确荒废了很久了。特别是技术的这个屋子，好久没有收拾了。

平时搜索技术文章的时候，还是能看到一些有毅力的人把自己平时的点点滴滴整理成文章，而自己每年都想重拾的出租窝。一直也没有时间和精力搞，这次的突发事件才发现，如果再不整理的话，就可能什么也没留下。

还记得10多年前一个feed聚合网站搞的一个比赛，每个星期都要写一篇命题博客，真的好痛苦。但是坚持下来又可以收获很多。这么多的益处还是多写写吧。

既然重拾，先定几个大原则：

1. 更新频率：每周更新一篇；
2. 遇到一天没搞定纠结的选择就先选一个；
3. 初期内容为主、表现为辅；
4. 逐步迭代；

总体还是出租窝的title，分为生活屋和技术屋，本次折腾的为技术屋。

## 技术选型

生活屋依旧用WordPress，技术屋转移到github上，为了保险有空的话会在国内也做个镜像。

github上有三个大的阵营：

- jekyll 
- hexo 
- hugo

网上有很多比较 一开始用jekyll 后来用hexo 如今用hugo，理由如下：

1. 一开始生成静态的初期好像只有jekyll，当时hexo还没有太成熟，就选择了jekyll。
2. 后来大家说hexo还可以了，模板还多，比jekyll先进，加上自己并没有几个文章，迁移成本低，就到了hexo。
3. 本以为可以能多写一篇文章了，没想到写了5+文章后就再也没有了下文。
4. 等又反应过来之后，大家开始高举在微服务、k8s上golang的hugo了，而且hexo的生成速度被大家诟病。好吧开始折腾hugo

真是人算不如天算，技术的更新从ruby nodejs 再到golang 还是那句话，工具其实不重要，重要的是内容。虽然工具可能有这样或那样的不适合。但现实情况是有时候还没到不改工具就无法进行下去的节奏。但是，既然大势所趋，迁移成本还是不那么高，那就转成hugo吧。



搜索了下相关文章，这两年在这方面还是有很多变化的：

1. 生成上：写blog也开始用上CI/CD了。
2. 评论上：多说没了 disqus依旧 而github的issues也可以变成评论。
3. 图片上：有一些在线压缩的工具可以继承到CI中，七牛云 微博图床这些不知道是否还好。
4. CDN上：七牛云好像也变了很多、其它云的对象存储+CDN好像大家也开始有所涉及。
5. 主题上：好像大家对于主题没有了以前的热情，唠的涝死旱的旱死，两极分化。
6. 其它：唯一不变的还是用git管理markdown写的文章。

## Git

基础操作这里就略过不讲了三部曲 

1. git add
2. git commit 
3. git push

重点讲一下下面两项

### Git LFS

无论是github还是gitlab目前比较新的版本都支持了LFS，当然也需要git的客户端的版本在1.8.5+ 

这样在上传一些图片或者二进制包的时候不至于记录到git的历史记录里，防止git仓库过大。

git lfs也是三部曲:

1. git lfs install
2. git lfs track "*.png"
3. git add .gitattributes

### Git remote

说实话，这个还没有用上。原打算在本地生成之后一个push，然后推送到github和coding上的。

不过用了CI，只能在CI的过程中生成好静态页，再推送到两个Git仓库中。还可能牵涉到配置文件域名的修改。尚未实践。

## CI

在DevOps当道的今天，个人博客也不例外。其实本意应该是减少以前hexo的缓慢编译，以及减少击键次数。目前网上的教程大多是用travis做的，目前github自家的CI也出来了，可以尝试。

下面是我的yaml，总结了几点改进建议和优化的地方，供参考：

1. 吐槽下每次都要重新编译hugo，下载一堆的依赖，可以用docker去抹平这个过程提高速度。
2. 用pushover将部署之后的git message通知到终端，了解目前的编译部署情况。
3. 不足之处无法在pages上看到历史记录，不过将blog和pages分开。blog的仓库中还是有相关修改记录的。

```yaml
sudo: false

language: go

git:
  depth: 1

install: go get -v github.com/spf13/hugo

script:

- hugo

deploy:
  provider: pages
  skip_cleanup: true

# token is set in travis-ci.org dashboard

  github_token: $GITHUB_API_KEY
  on:
    branch: master
  local_dir: public
  repo: yimeng/yimeng.github.com
  target_branch: master
  email: deploy@travis-ci.org
  name: deployment-bot
after_deploy:

- curl -s  --form-string "token=$APP_TOKEN"  --form-string "user=$USER_KEY"  --form-string "message=$(git --no-pager  log -n 1 --oneline)"  https://api.pushover.net/1/messages.json
```



## 图片

#### 管理方案

先说下管理方案，网上大多是让你放到主题的static目录下。出于职业习惯，感觉这么搞似乎有些不妥。换个主题之后就凉凉了，虽说可以人肉移动，但也不利于后期的维护。而且最大的问题是无法在markdown编辑器中预览，相关的文件路径需要修改。

参考了下往上的方案，发现hugo是可以将文章打包成文件夹的，在文件夹里放md文章和图片是一个比较不错的方案。至于是按照年份还是文章分类，这个因人而定吧。

举个例子：

```bash
.
├── about.md
└── post
    ├── 2019
    │   ├── ammeter
    │   │   ├── ammeter.png
    │   │   └── index.md
    │   ├── hugo
    │   │   └── index.md
    │   └── marslander.md
    ├── hello.md
    └── vagrant-alpine.md
```

about.md 是关于页面

post目录下按照年份分类

其它随时修改的或者记不起年份的可以单分出来，或者放到other目录里。



#### 压缩工具

ImgBot 定期扫描git仓库把可以处理的图片进行处理之后，合并到相应分支。

tinning 免费的好像只能处理5M以下的图片，有相应的api可以调用。

相应的图片压缩工具应该还有很多，但一般还是希望能够有原图，展现的时候使用压缩过的图。好比元数据存在一个地方，其它都是衍生的各种视图。

所以，可能原始图片用LFS上传，然后经过处理用CI把处理好的放到相应的目录中这种模式比较好？但是LFS是否支持这种用git当自己的图片库的操作呢？或许上个CDN才是更好的做法？放到阿里云上的对象存储上好像可以自动处理大小以及压缩率。终于知道为什么程序员喜欢PaaS服务了。把你需要考虑的都考虑到了。

#### 优化

除了上面介绍的图片优化，还有一些开启http2 压缩js css字体等等，但我个人感觉，http2倒是有一定的意义，比起图片其它的可能都是小虾米（除非上M的js文件）。所以下一步优化还是在图片方面，先昧着良心用LFS吧。

## 主题

以前会花费一周的时间找一个好看的主题，现在感觉不是那么的重要了。好看的皮囊太多了，hugo没几个。本着实用主义的原则，先把内容写起来再说。

## 参考

[Hugo 的文件管理方案]: https://isyin.cn/post/2018-05-03-hugo-%E7%9A%84%E6%96%87%E4%BB%B6%E7%AE%A1%E7%90%86%E6%96%B9%E6%A1%88/
[新手搭建Hogo静态博客教程（四）:使用优化]: http://zhaogaz.com/post/2018/newbie-start-hugo-blog-4/
[使用 ImgBot 无损压缩博客中的图片]: https://mogeko.me/2019/066/
[利用Hugo和Webpack搭建PWA个人网页]: https://www.valleyease.me/zh/2018/12/23/利用hugo和webpack搭建pwa个人网页/
[Hugo 从入门到会用]: https://blog.olowolo.com/post/hugo-quick-start/













