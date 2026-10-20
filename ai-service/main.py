import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import db
import rag
from config import DEEPSEEK_API_KEY, PORT, TOP_K


@asynccontextmanager
async def lifespan(_app):
    try:
        db.ensure_table()
    except Exception as error:
        # MySQL 没就绪时不阻断启动,健康检查会报 db_ok=false
        print(f"[ai-service] 建表失败(数据库未就绪?): {error}")
    yield


app = FastAPI(title="AI-BlogHub AI Service", version="1.0.0", lifespan=lifespan)


class ArticleIndexRequest(BaseModel):
    article_id: int


class ArticleDeleteRequest(BaseModel):
    article_id: int


class SearchRequest(BaseModel):
    query: str
    top_k: int = TOP_K


class ChatRequest(BaseModel):
    question: str
    history: list = []


@app.get("/health")
def health():
    try:
        chunks = db.count_embeddings()
        db_ok = True
    except Exception:
        chunks = None
        db_ok = False
    return {
        "status": "ok",
        "db_ok": db_ok,
        "indexed_chunks": chunks,
        "embedding_configured": rag.is_embedding_configured(),
        "deepseek_configured": bool(DEEPSEEK_API_KEY),
    }


@app.post("/index/article")
def index_article(req: ArticleIndexRequest):
    """文章新增/编辑后调用:重建该文章的向量索引;未发布或已不存在则清掉索引."""
    article = db.fetch_article(req.article_id)
    if not article or article["state"] != 1 or article["classify"] != 0:
        db.delete_article_embeddings(req.article_id)
        return {"code": 200, "indexed": 0, "reason": "文章不存在或未发布,已清除索引"}

    chunks = rag.chunk_text(rag.build_article_text(article))
    if not chunks:
        db.delete_article_embeddings(req.article_id)
        return {"code": 200, "indexed": 0, "reason": "文章内容过短,未建立索引"}

    vectors = rag.embed_texts(chunks)
    indexed = db.replace_article_embeddings(req.article_id, chunks, vectors, rag.now_string())
    return {"code": 200, "indexed": indexed, "article_id": req.article_id}


@app.post("/index/delete")
def index_delete(req: ArticleDeleteRequest):
    db.delete_article_embeddings(req.article_id)
    return {"code": 200, "deleted": req.article_id}


@app.post("/rag/search")
def rag_search(req: SearchRequest):
    rows = db.fetch_all_embeddings()
    sources = rag.search_relevant_chunks(req.query, rows, top_k=req.top_k)
    return {"code": 200, "sources": attach_titles(sources)}


@app.post("/rag/chat")
def rag_chat(req: ChatRequest):
    sources = retrieve_sources(req.question)
    messages = rag.build_messages(req.question, req.history, sources)
    answer = "".join(rag.chat_deepseek_stream(messages))
    return {
        "code": 200,
        "model": "deepseek",
        "answer": answer,
        "sources": attach_titles(sources),
    }


@app.post("/rag/chat/stream")
def rag_chat_stream(req: ChatRequest):
    # 先完成检索再开始流式输出;事件格式与 Node 端现有 SSE 约定一致(content/error/done)
    sources = retrieve_sources(req.question)
    messages = rag.build_messages(req.question, req.history, sources)
    titled_sources = attach_titles(sources)

    def event_stream():
        yield sse_event({"meta": {"sources": titled_sources}})
        try:
            for delta in rag.chat_deepseek_stream(messages):
                yield sse_event({"content": delta})
        except Exception as error:  # 流中断时前端只认 error 字段
            yield sse_event({"error": str(error)})
            return
        yield sse_event({"done": True, "model": "deepseek", "sources": titled_sources})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def retrieve_sources(question):
    if not rag.is_embedding_configured():
        return []
    try:
        rows = db.fetch_all_embeddings()
        return rag.search_relevant_chunks(question, rows)
    except Exception:
        # 检索失败不阻断对话,退化为无资料问答
        return []


def attach_titles(sources):
    """补上文章标题,便于前端展示回答来源."""
    if not sources:
        return []
    try:
        with db.get_conn() as conn:
            with conn.cursor() as cursor:
                ids = ",".join(str(item["article_id"]) for item in sources)
                cursor.execute(f"select id, title from article where id in ({ids})")
                titles = {row["id"]: row["title"] for row in cursor.fetchall()}
    except Exception:
        titles = {}
    return [
        {
            "article_id": item["article_id"],
            "title": titles.get(item["article_id"], f"文章{item['article_id']}"),
            "snippet": item["content"][:120],
            "score": round(item["score"], 4),
        }
        for item in sources
    ]


def sse_event(payload):
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
