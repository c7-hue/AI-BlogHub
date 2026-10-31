# zz-homepage — 个人主页 / 作品集门面

部署在 `zzlabai.top` 根域名的静态个人主页,指向两个子域名项目:

| 子域名 | 项目 | 状态 |
|---|---|---|
| `blog.zzlabai.top` | [AI-BlogHub 个人博客](https://github.com/c7-hue/AI-BlogHub)(源码公开) | ✅ 已上线 |
| `edu.zzlabai.top` | 智途好学 · 在线教育平台(源码私有仓 zhitu-edu) | ✅ 已上线(2026-10) |

纯静态:一个 `index.html` + 一个 `style.css`,无框架、无构建,双击 `index.html` 即可本地预览。

## 目录结构

```
zz-homepage/
├── index.html        # 页面结构:自我介绍 + 实习经历 + 项目卡片
├── style.css         # 样式(配色集中在 :root 变量里,改一处换全站)
├── assets/
│   ├── avatar.jpg        # 头像(仍是「ZZ」占位图,待换真实头像)
│   ├── blog-cover.png    # 博客项目卡片封面(后台截图 2400x1350)
│   ├── edu-cover.png     # 教育平台卡片封面(H5首页截图 2400x1350)
│   └── beian.png         # 公安备案警徽图标(页脚用,同步时别漏)
└── README.md
```

## 上线状态(2026-10-31 核对)

- [x] 备案:页脚挂 苏ICP备2026078874号 + 公安备案 苏公网安备32050602014783号(含警徽图标)
- [x] 两个项目卡片「访问网站」可点,blog / edu 子域名均已上线
- [x] AI-BlogHub 源码仓公开,「查看源码」按钮有效;zhitu-edu 私有,edu 卡不放源码按钮
- [ ] `assets/avatar.jpg` 仍是「ZZ」占位图,待换真实头像
- [ ] 简历 PDF 未挂主页(要挂的话:秋招目录里 `张文婕-南京晓庄学院-前端开发-2027届-18261446829.pdf` 改名 `张文婕-前端开发.pdf` 放 assets/,index.html 加下载按钮)
- [ ] `blog-cover.png` 里文章卡带灰色破图占位图标,有空可重截一张干净的

## 部署方式(重要:别被 Actions 骗了)

**线上生效通道只有一条:快车道 kit。** 流程:

1. 本目录改动后,整个目录(含 assets 全部文件)cp 同步到 `博客文档/frontend/homepage/`(双副本,改一边必须同步另一边);
2. 再同步进快车道工具包 `%TEMP%\blog-deploy-kit\frontend-static\homepage\`;
3. 打包 scp 到服务器,`docker compose -f docker-compose.server.yml up -d --build frontend`(主页是 COPY 进 bloghub-frontend 镜像的,必须 rebuild frontend 才生效)。

zz-homepage 仓库里的 GitHub Actions(deploy.yml)会把页面推到服务器 `/www/homepage`,
但 nginx 容器的 root 指向镜像内 `/usr/share/nginx/homepage`,**根本不读 /www/homepage——
推了也不生效**,仅当一份异机备份看待。详见 Hermes 技能 portfolio-site。
