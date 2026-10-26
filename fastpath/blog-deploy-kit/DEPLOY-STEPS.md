# 快车道部署步骤(全部在服务器上执行,一键复制)

cd /www/AI-BlogHub
mkdir -p fastpath
tar xzf /root/blog-deploy-kit.tar.gz -C fastpath
cd fastpath/blog-deploy-kit

## 1) .env 数据库密码(之前建过就只会显示,不会覆盖)
test -f .env || echo "MYSQL_ROOT_PASSWORD=*** rand -hex 12)" > .env
cat .env    # <- 把这串密码记到你的备忘录,以后连数据库要用

## 2) swap 防内存爆(之前加过会自动跳过)
if [ -z "$(swapon --show)" ]; then fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab && free -h; fi

## 3) 清掉之前可能残留的旧容器(没有就是无操作)
docker rm -f bloghub-frontend bloghub-backend bloghub-db 2>/dev/null

## 4) mysql 镜像不存在才走加速拉取(存在就秒过)
docker image inspect mysql:8.0 >/dev/null 2>&1 || {
  docker pull docker.m.daocloud.io/library/mysql:8.0
  docker tag docker.m.daocloud.io/library/mysql:8.0 mysql:8.0
}

## 5) 起服务(frontend 组装只要几十秒)
docker compose -f docker-compose.server.yml up -d --build

## 6) 验收
docker compose -f docker-compose.server.yml ps        # 三个容器 Up
docker logs bloghub-backend --tail 20                 # 看数据库连接成功

# 浏览器三项:
#   https://zzlabai.top       -> 个人主页(ZZ头像+两张项目卡片) 带锁标
#   https://blog.zzlabai.top  -> 博客 带锁标
#   http://zzlabai.top        -> 自动301跳转 https

## 后备:如果提示 backend 镜像不存在(理论上服务器上已构建好)
docker build -t ai-bloghub-backend:latest /www/AI-BlogHub/backend
# 然后重跑第 5 步
