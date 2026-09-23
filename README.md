# 个人博客管理系统

一个前后端分离的个人博客管理系统，支持文章/图库管理、日记、文件管理、评论私信、数据总览，并内置 DeepSeek AI 写作助手。

## 项目结构

```
博客文档/
├── frontend/    # 前端管理端（Vue 3 + TypeScript + Vite）
├── backend/     # 后端服务（Node.js + Express + MySQL）
└── .github/     # CI 工作流
```

## 技术栈

**前端（frontend/）**

- Vue 3（`<script setup>` SFC）+ TypeScript + Vite
- Pinia（含持久化插件）+ Vue Router
- Yike Design UI（按需自动导入）
- wangEditor 富文本编辑器
- ECharts 图表
- Less 样式预处理

**后端（backend/）**

- Node.js + Express 5
- MySQL（mysql2 连接池）
- JWT 身份认证
- Multer 文件上传
- DeepSeek AI 接口（普通聊天 + 流式输出）

## 快速开始

### 环境要求

- Node.js >= 22
- MySQL

### 1. 启动后端

```bash
cd backend
npm install
cp .env.example .env   # 填入你的 DEEPSEEK_API_KEY、JWT_SECRET
node blog.js
```

- 首次启动会自动创建数据库 `xxblog` 及全部数据表（用户、文章、日记、评论、私信、标签、分类、文件、天气、点赞、访问记录）
- 默认监听 `3001` 端口，数据库连接配置见 [backend/config/default.js](backend/config/default.js)

**环境变量说明（backend/.env）**

| 变量 | 说明 |
| --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥，AI 功能必需 |
| `DEEPSEEK_MODEL` | 模型名称，默认 `deepseek-v4-pro` |
| `JWT_SECRET` | JWT 签名密钥，请使用足够长的随机字符串 |

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

- 开发环境通过 Vite 代理将 `/api` 请求转发到 `http://localhost:3001`（见 [frontend/vite.config.ts](frontend/vite.config.ts)）
- 首次使用通过页面完成管理员注册（同一时间仅支持一位管理员）

## 常用命令

```bash
# 前端
cd frontend
npm run dev             # 开发服务器
npm run build           # 类型检查 + 生产构建
npm test                # 运行测试

# 后端
cd backend
node blog.js            # 启动服务
node seed_demo_content.js       # 写入演示内容
node seed_life_content.js       # 写入生活板块内容
node seed_system_comments.js    # 写入系统演示评论
```

## 功能模块

- **数据总览**：访问量、文章状态统计等图表展示
- **文章管理**：富文本编辑、分组/标签、封面、发布状态
- **图库管理**：图片分类管理与展示
- **日记**：支持天气、心情记录
- **文件管理**：上传（Multer）、分类、移动、删除
- **评论 / 私信**：已读管理、删除
- **AI 助手**：文章 AI 写作、版本管理、全局流式对话（DeepSeek）

## 接口鉴权

除注册/登录等公开接口外，所有接口需在请求头携带 `Authorization: Bearer <token>`（或在 body 中传 `token`），token 由登录接口签发，过期或无效返回 401。

## CI

推送到 `main`/`master` 或提交 PR 时，GitHub Actions 会自动：

- 前端：`npm ci` → `npm test` → `npm run build`
- 后端：`npm ci` → 对 `blog.js`、`routers/index.js`、`controller/ai.js` 做语法检查

见 [.github/workflows/ci.yml](.github/workflows/ci.yml)。
