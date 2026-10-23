# AI Service(Python FastAPI)

AI-BlogHub 的 AI 能力独立微服务:RAG 检索增强问答 + Embedding 向量化。Node 后端(blog.js)通过 HTTP 调用本服务;本服务不可用时 Node 自动降级为直连 DeepSeek,博客功能不受影响。

## 架构

```
浏览器 ──→ Node(Express :3001) ──→ MySQL(xxblog 业务数据)
                │
                └──HTTP(:3002)──→ 本服务(FastAPI)
                                     ├─ /index/article   文章分块+向量化+入库
                                     ├─ /rag/search      余弦相似度语义检索
                                     └─ /rag/chat(/stream) 检索增强问答(SSE 流式)
```

RAG 流程:

1. **索引(离线)**:文章保存时 Node 通知本服务 → 拉取文章 → 去 HTML 标签 → 400 字滑窗分块(50 字重叠) → 调硅基流动 `bge-m3` 算 embedding → 存 MySQL `article_embedding` 表
2. **问答(在线)**:用户提问 → 问题向量化 → 与全部文章向量算余弦相似度 → 取 Top-5(相似度 ≥ MIN_SCORE) → 拼进 system prompt → DeepSeek 流式生成,回答标注来源,检索不到时明确说明

## 本地启动

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

cp .env.example .env         # 填 DEEPSEEK_API_KEY 和 EMBEDDING_API_KEY
python backfill.py           # 首次:把已发布文章全部回填索引
uvicorn main:app --port 3002
```

注意: `DEEPSEEK_API_KEY` 与 backend/.env 里的是同一个;`EMBEDDING_API_KEY` 需要到 [siliconflow.cn](https://siliconflow.cn) 单独注册获取(有免费额度)。

## 与 Node 端的对接

- 文章新增/编辑/删除/改发布状态时,Node(`backend/lib/aiIndex.js`)异步通知本服务重建或清除索引,失败静默(博客主流程不受影响)
- Node 的 `/ai/chat`、`/ai/chat-stream` 优先代理到本服务,本服务离线时自动降级为直连 DeepSeek(无 RAG)
- SSE 事件格式与原有约定一致:`{content}` 增量 / `{error}` / `{done}`,前端零改动

## 测试

```bash
pytest test_rag.py -v        # 纯函数单元测试(9 个)
python eval_rag.py           # 30 条测试集检索质量评测(RAG 向量 vs 关键词基线,输出 hit@1/hit@3)
```

## Docker

仓库根目录 `docker compose up -d --build` 会一并构建本服务(容器名 bloghub-ai);`.env` 里需要补 `EMBEDDING_API_KEY`。
