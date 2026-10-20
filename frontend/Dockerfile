# ---- 阶段 1:打包 Vue 前端 ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- 阶段 2:用 Nginx 托管打包产物 + 反向代理后端 ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# 个人主页(纯静态)→ 根域名 zzlabai.top 从这里服务
COPY homepage /usr/share/nginx/homepage
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
