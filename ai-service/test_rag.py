"""RAG 纯函数单元测试,不依赖数据库和网络: pytest test_rag.py"""

import rag


def test_strip_html_removes_tags():
    assert rag.strip_html("<p>hello<b>world</b></p>") == "hello world"


def test_chunk_short_text_returns_single_chunk():
    text = "这是一段不到四百字的测试文本。" * 3
    chunks = rag.chunk_text(text)
    assert chunks == [text.strip()]


def test_chunk_long_text_sliding_window():
    text = "字" * 1000
    chunks = rag.chunk_text(text, size=400, overlap=50)
    # 步长 = 400 - 50 = 350,1000 字应切成 3 块
    assert len(chunks) == 3
    assert all(len(chunk) <= 400 for chunk in chunks)
    # 相邻块有 50 字重叠
    assert chunks[0][-50:] == chunks[1][:50]


def test_chunk_tiny_fragments_dropped():
    assert rag.chunk_text("短") == []


def test_cosine_identical_vectors_is_one():
    assert abs(rag.cosine_similarity([1, 2, 3], [1, 2, 3]) - 1.0) < 1e-9


def test_cosine_orthogonal_vectors_is_zero():
    assert rag.cosine_similarity([1, 0], [0, 1]) == 0.0


def test_build_messages_includes_sources_and_citation_rule():
    sources = [{"article_id": 1, "title": "Vue3 教程", "content": "ref 是响应式引用", "score": 0.8}]
    messages = rag.build_messages("什么是 ref?", [], sources)
    system = messages[0]["content"]
    assert "[资料1]" in system
    assert "Vue3 教程" in system
    assert "ref 是响应式引用" in system
    assert messages[-1] == {"role": "user", "content": "什么是 ref?"}


def test_build_messages_without_sources_requires_refusal():
    messages = rag.build_messages("什么是 ref?", [], [])
    assert "没有找到与问题相关的博客文章" in messages[0]["content"]


def test_build_messages_keeps_recent_history():
    history = [{"role": "user", "content": f"历史问题{i}"} for i in range(10)]
    messages = rag.build_messages("新问题", history, [])
    # system + 最近 8 条历史 + 当前问题 = 10 条
    assert len(messages) == 10
    assert messages[1]["content"] == "历史问题2"
