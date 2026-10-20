"""RAG 核心:分块、向量化、余弦检索、prompt 组装、DeepSeek 调用."""

import re
import time

import requests

from config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL,
    DEEPSEEK_URL,
    EMBEDDING_API_KEY,
    EMBEDDING_MODEL,
    EMBEDDING_URL,
    MIN_SCORE,
)

HTML_TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")

EMBED_BATCH_SIZE = 16


class EmbeddingNotConfigured(Exception):
    pass


def is_embedding_configured():
    return bool(EMBEDDING_API_KEY)


def strip_html(text):
    text = HTML_TAG_RE.sub(" ", str(text or ""))
    return WHITESPACE_RE.sub(" ", text).strip()


def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """滑动窗口分块:每块约 size 字,相邻块重叠 overlap 字,避免句子被切在边界上丢失语义."""
    clean = strip_html(text)
    if len(clean) <= size:
        return [clean] if len(clean) > 20 else []

    chunks = []
    start = 0
    while start < len(clean):
        chunks.append(clean[start : start + size])
        start += size - overlap
    return [chunk for chunk in chunks if len(chunk) > 20]


def embed_texts(texts):
    if not EMBEDDING_API_KEY:
        raise EmbeddingNotConfigured("缺少 EMBEDDING_API_KEY,无法向量化")
    vectors = []
    # 接口一次有输入条数上限,分批请求
    for start in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[start : start + EMBED_BATCH_SIZE]
        resp = requests.post(
            EMBEDDING_URL,
            headers={"Authorization": f"Bearer {EMBEDDING_API_KEY}"},
            json={"model": EMBEDDING_MODEL, "input": batch},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("error"):
            raise RuntimeError(f"embedding 接口报错: {data['error']}")
        batch_vectors = [item["embedding"] for item in data["data"]]
        vectors.extend(batch_vectors)
    return vectors


def cosine_similarity(a, b):
    dot = norm_a = norm_b = 0.0
    for x, y in zip(a, b):
        dot += x * y
        norm_a += x * x
        norm_b += y * y
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / ((norm_a**0.5) * (norm_b**0.5))


def search_relevant_chunks(question, all_rows, top_k=5, min_score=MIN_SCORE):
    """问题向量化后和库里全部向量算余弦相似度,取最相近的 top_k 条.

    个人博客几百篇文章的量级,全量内存计算是毫秒级,不需要向量数据库.
    """
    if not all_rows:
        return []
    question_vector = embed_texts([question])[0]
    scored = [
        {
            "article_id": row["article_id"],
            "content": row["content"],
            "score": cosine_similarity(question_vector, row["embedding"]),
        }
        for row in all_rows
    ]
    scored.sort(key=lambda item: item["score"], reverse=True)
    return [item for item in scored[:top_k] if item["score"] >= min_score]


def build_messages(question, history, sources):
    """检索结果拼进 system prompt;没有检索到资料时明确要求 AI 说明,禁止编造."""
    if sources:
        # 检索阶段的原始块没有 title,标题由调用方按需补齐,这里做容错
        context_text = "\n\n".join(
            f"[资料{i + 1}](《{item.get('title', '博客文章')}》相关片段){item['content']}"
            for i, item in enumerate(sources)
        )
        system = (
            "你是本博客的AI助手。请优先依据下面的博客文章资料回答用户问题,"
            "引用了哪条资料就在句末标注 [资料n];"
            "资料没有覆盖的问题,先说明\"博客文章中没有相关内容\",再用你自己的知识简要补充。\n\n"
            f"{context_text}"
        )
    else:
        system = (
            "你是本博客的AI助手。检索后没有找到与问题相关的博客文章,"
            "回答时请先说明\"博客文章中没有找到相关内容\",再用你自己的知识回答。"
        )

    messages = [{"role": "system", "content": system}]
    for item in history[-8:]:
        if not isinstance(item, dict) or not isinstance(item.get("content"), str):
            continue
        role = "assistant" if item.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": item["content"][:2000]})
    messages.append({"role": "user", "content": question})
    return messages


def build_article_text(article):
    """标题拼进分块文本,标题的检索价值很高."""
    parts = [article.get("title") or ""]
    content = strip_html(article.get("content") or "")
    if content:
        parts.append(content)
    else:
        parts.append(strip_html(article.get("introduce") or ""))
    return "。".join(part for part in parts if part)


def chat_deepseek_stream(messages):
    """流式调用 DeepSeek,逐段 yield 增量文本."""
    if not DEEPSEEK_API_KEY:
        raise RuntimeError("缺少 DEEPSEEK_API_KEY")
    resp = requests.post(
        DEEPSEEK_URL,
        headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
        json={"model": DEEPSEEK_MODEL, "messages": messages, "stream": True, "temperature": 0.7},
        stream=True,
        timeout=(10, 120),
    )
    resp.raise_for_status()
    for line in resp.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data:"):
            continue
        payload = line.replace("data:", "", 1).strip()
        if payload == "[DONE]":
            return
        delta = _parse_delta(payload)
        if delta:
            yield delta


def _parse_delta(payload):
    import json

    try:
        data = json.loads(payload)
    except ValueError:
        return ""
    if data.get("error"):
        raise RuntimeError(data["error"].get("message", "DeepSeek 调用失败"))
    return data.get("choices", [{}])[0].get("delta", {}).get("content", "")


def now_string():
    return time.strftime("%Y-%m-%d %H:%M:%S")
