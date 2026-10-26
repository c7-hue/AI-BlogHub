# zz-homepage — 个人主页 / 作品集门面

部署在 `zzlabai.top` 根域名的静态个人主页,指向两个子域名项目:

| 子域名 | 项目 | 状态 |
|---|---|---|
| `blog.zzlabai.top` | [AI-BlogHub 个人博客](https://github.com/c7-hue/AI-BlogHub) | ✅ 已上线(域名 + HTTPS) |
| `edu.zzlabai.top` | 智途好学 · 在线教育平台 | ⏳ 待部署 |

纯静态:一个 `index.html` + 一个 `style.css`,无框架、无构建,双击 `index.html` 即可本地预览。

## 目录结构

```
zz-homepage/
├── index.html        # 页面结构:自我介绍 + 项目卡片 + 简历下载
├── style.css         # 样式(配色集中在 :root 变量里,改一处换全站)
├── assets/
│   ├── avatar.jpg        # 头像(当前是程序生成的占位图,替换成真照片)
│   ├── blog-cover.png    # 博客项目卡片封面(换成博客首页截图)
│   ├── edu-cover.png     # 教育平台卡片封面(换成平台截图)
│   └── 张文婕-前端开发.pdf  # 简历(自己放进来,文件名保持一致)
└── README.md
```

## 上线前 TODO

- [ ] `assets/avatar.jpg` 换成真实头像
- [x] `assets/blog-cover.png` 博客截图
- [x] `assets/edu-cover.png` 教育平台截图(H5首页,2400x1350)
- [ ] 放入简历 PDF,命名 `张文婕-前端开发.pdf`
- [x] 备案完成(2026-10):页脚已挂 `苏ICP备2026078874号` + 公安备案 `苏公网安备32050602014783号`(含警徽图标)
- [ ] 两个项目子域名上线后,确认卡片链接可点

## 部署方式(已自动化)

不用独立容器。总入口 Nginx 容器启动时,把这个文件夹挂载为默认站点:

```yaml
# 总入口 nginx 的 docker-compose 片段
volumes:
  - /www/homepage:/usr/share/nginx/html
```

服务器上放一份在 `/www/homepage/`,更新流程:本地改完 → `git push` → GitHub Actions 自动 scp 到服务器 `/www/homepage/`(纯静态,秒级生效,连 rebuild 都不用)。
