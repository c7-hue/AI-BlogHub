# AI-BlogHub 部署手册(小白版:从零到公网可访问)

全程照着复制粘贴就行,不需要任何 Linux 基础。全程约 2~3 小时(其中大半时间在等下载)。

> **怎么区分在哪台机器敲命令:**
> - 标着 **【本地】** 的:在你 Windows 的 PowerShell 里敲(开始菜单搜 "PowerShell")
> - 标着 **【服务器】** 的:在 SSH 连上服务器后的黑窗口里敲(提示符长这样:`root@xxx:~#`)
> - 两个窗口别搞混,拿不准就看你能不能看到 `root@`

---

## 部署后的样子

```
访客浏览器打开 http://你的服务器IP
        │
        ▼
┌── frontend 容器(Nginx)──────────────────┐
│  打开页面      → 返回 Vue 打包的静态文件      │
│  请求 /api/*   → 转发给后端(去掉 /api 前缀)  │
└──────────────────────────────────────┘
        │
        ▼
   backend 容器(Node/Express :3001)
   登录鉴权 JWT、AI 对话、文章增删改查、图片上传
        │
        ▼
   db 容器(MySQL 8,数据存在硬盘卷里,删容器不丢)
```

## 已准备好的文件(都在仓库里了,不用动)

| 文件 | 作用 |
|---|---|
| `frontend/Dockerfile` | 两阶段打包:先把 Vue 项目 build 成静态文件,再塞进 Nginx |
| `frontend/nginx.conf` | Nginx 规则:托管前端页面 + 把 `/api` 转发给后端 |
| `backend/Dockerfile` | 后端镜像:Node 22 + 生产依赖 |
| `docker-compose.yml` | 总开关:一条命令把前端/后端/MySQL 三个容器全拉起来 |
| `.env.example` | 密码模板,复制成 `.env` 填上真实密码 |
| `backend/config/default.js` | 已改为:优先读环境变量,本地开发默认值不变 |
| `frontend/src/utils/env.ts` | 已改为:生产环境走 `/api` 同源代理,不再写死 IP |

---

## 第 1 步:买服务器(网页操作,约 20 分钟)

1. 搜索 **腾讯云校园计划**(或阿里云高校学生计划),用学信网做学生认证。
2. 买**轻量应用服务器**,配置 2核2G 就够(约 10~15 元/月),地域选离你近的(上海/广州都行)。
   - ⚠️ 镜像类型选 **"系统镜像" → Ubuntu 22.04**(千万别选带 WordPress 的"应用镜像")
3. 付款后进控制台,找到这台服务器,记下 **公网 IP**(形如 `101.43.xx.xx`)。
4. 点 **"重置密码"**,给 root 用户设一个密码(记牢,一会 SSH 要用)。
5. 点 **"防火墙"** 标签页,确认放行了这三个端口:**22、80、443**(22 一般默认有,80/443 需要自己添加规则)。

**✅ 检查点:你能说出服务器的公网 IP 和 root 密码,防火墙放行了 22/80/443。**

## 第 2 步:把代码推上 GitHub(【本地】,5 分钟)

```powershell
cd 'D:\OneDrive\Desktop\前端文档\博客文档'
git add .
git commit -m "feat: Docker 容器化部署配置"
git push
```

**✅ 检查点:打开 github.com/c7-hue/AI-BlogHub 能看到 docker-compose.yml 这个新文件。**

## 第 3 步:连上服务器(【本地】开个 PowerShell,10 分钟)

```powershell
ssh root@你的服务器IP
```

- 第一次连接会问 `Are you sure you want to continue connecting?` → 输入 `yes` 回车
- 然后让你输密码。**⚠️ 最大的坑:输密码时屏幕上什么都不显示,不是卡了!** 盲打完直接回车
- 看到提示符变成 `root@xxx:~#` 就连上了

**✅ 检查点:窗口里是 `root@` 开头的提示符。**

## 第 4 步:服务器装 Docker(【服务器】,10~15 分钟)

逐行粘贴执行(右键即可粘贴):

```bash
apt update && apt install -y git
curl -fsSL https://get.docker.com | sh
```

装完验证(两条都要有版本号输出):

```bash
docker --version
docker compose version
```

**如果你买的是腾讯云服务器**,顺手配上镜像加速(拉 MySQL 等镜像快很多):

```bash
mkdir -p /etc/docker
echo '{"registry-mirrors":["https://mirror.ccs.tencentyun.com"]}' > /etc/docker/daemon.json
systemctl restart docker
```

**✅ 检查点:`docker compose version` 能打印出版本号。**

## 第 5 步:把代码弄上服务器 + 填密码(【服务器】,10 分钟)

```bash
mkdir -p /www && cd /www
git clone https://github.com/c7-hue/AI-BlogHub.git
cd AI-BlogHub
```

> **如果 clone 一直超时失败**(国内服务器访问 GitHub 偶尔抽风),用备用方案——回【本地】项目目录执行:
> ```powershell
> tar -czf bloghub.tar.gz --exclude=node_modules --exclude=dist --exclude=.git .
> scp bloghub.tar.gz root@你的服务器IP:/www/
> ```
> 再回【服务器】:`mkdir -p /www/AI-BlogHub && tar -xzf /www/bloghub.tar.gz -C /www/AI-BlogHub && cd /www/AI-BlogHub`

接着创建密码文件:

```bash
cp .env.example .env
nano .env
```

nano 是个简易编辑器:方向键移动光标,直接打字修改。把三个值都改掉:
- `MYSQL_ROOT_PASSWORD=` 后面换成你设的数据库密码(字母+数字)
- `JWT_SECRET=` 后面随手敲一长串乱字符
- `DEEPSEEK_API_KEY=` 把你原来 `backend/.env` 里的 key 粘过来

改完按 **Ctrl+O → 回车**保存,按 **Ctrl+X** 退出。

**✅ 检查点:`cat .env` 能看到你改过的三行。**

## 第 6 步:启动!(【服务器】,5 分钟 + 等待)

```bash
docker compose up -d --build
```

第一次要下载基础镜像+装依赖,约 5~15 分钟。完成后看状态:

```bash
docker compose ps
```

三个容器都是 `Up` 就成功了。**前几分钟 backend 可能显示 `Restarting`,别慌**——它在等 MySQL 初始化完(第一次约 30~60 秒),会自动重试拉起,属正常现象。

看后端日志(确认它连上数据库了):

```bash
docker compose logs -f backend
```

看到 `已经启动端口 3001` 且不再报错,按 **Ctrl+C** 退出日志(不会停掉服务)。

**✅ 检查点:`docker compose ps` 三个容器全 `Up`。**

## 第 7 步:验证清单(浏览器)

打开 `http://你的服务器IP`,逐项检查:

- [ ] 首页正常显示
- [ ] 注册 → 登录,能进后台
- [ ] 发一篇文章、上传一张图片,图片能显示
- [ ] AI 聊天能流式回复
- [ ] 随便进一篇文章,按 **F5 刷新**,页面不 404(验证 Nginx SPA 配置)

全勾上 = 部署成功 🎉 简历可以写:**"独立完成前后端容器化部署,Docker + Nginx 反向代理,公网可访问"**。

想把你本地写好的示例数据也搬上去(可选,失败了跳过即可):

```bash
docker compose exec backend node seed_demo_content.js
docker compose exec backend node seed_life_content.js
docker compose exec backend node seed_system_comments.js
```

---

## 日常操作速查(【服务器】,都在 /www/AI-BlogHub 目录下执行)

| 我想… | 命令 |
|---|---|
| 改了代码,更新网站 | `git pull && docker compose up -d --build` |
| 看后端报错日志 | `docker compose logs -f backend`(前端/数据库同理换名字) |
| 重启所有服务 | `docker compose restart` |
| 停掉所有服务 | `docker compose stop` |
| 进数据库看数据 | `docker compose exec db mysql -uroot -p你的数据库密码 xxblog`,进去后如 `show tables;` `select id,title from article limit 5;` |
| 备份数据库 | `docker compose exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" xxblog' > backup_$(date +%m%d).sql` |
| 看服务器内存/磁盘 | `free -h` / `df -h` |

## 出问题了怎么办(对照表)

| 症状 | 原因 | 解决 |
|---|---|---|
| 浏览器一直转圈打不开 | 防火墙没放行 80,或容器没起来 | 回控制台防火墙页检查;`docker compose ps` 看状态 |
| 页面能开,但登录/数据全失败(502) | backend 容器没起来 | `docker compose logs backend` 看报错,多半是 `.env` 里密码和 compose 对不上 |
| 上传图片报 413 | 不该发生(nginx.conf 已配 20m) | 确认 frontend/nginx.conf 有 `client_max_body_size 20m;` |
| 刷新子页面 404 | 不该发生(已配 try_files) | 同上,确认 nginx.conf 是仓库里这份 |
| `docker compose up` 报 env file 错误 | 没创建 `.env` | 回第 5 步 `cp .env.example .env` 并填写 |
| AI 聊天报错 | DEEPSEEK_API_KEY 没填或填错 | `docker compose exec backend env \| grep DEEPSEEK` 检查 |
| git clone 超时 | 国内访问 GitHub 抽风 | 用第 5 步的 tar + scp 备用方案 |
| 拉镜像巨慢/失败 | 没配镜像加速 | 回第 4 步配 daemon.json |

## 下一步(部署成功后再做,不着急)

1. **买域名**(阿里云/腾讯云,`.top`/`.cn` 首年十几块)→ 做**备案**(免费,7~20 天,个人身份就能办)
2. 备案下来后:域名解析 A 记录指到服务器 IP → 用 certbot 申请免费 HTTPS 证书
3. 再往后:热门文章加 **Redis 缓存**、文章表加**索引**并用 EXPLAIN 对比耗时——每一条都是新的简历 bullet
