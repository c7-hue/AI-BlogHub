"""RAG 检索质量评测:30 条测试集,对比 RAG 向量检索与关键词基线的命中率.

用法(先在 .env 配好 EMBEDDING_API_KEY 并跑过 backfill.py):
    python eval_rag.py

指标:
    hit@1 = Top-1 命中目标文章的比例
    hit@3 = Top-3 内命中目标文章的比例
基线为不走向量的朴素关键词重合度,用来证明向量检索的真实收益.
"""

import db
import rag

# (问题, 目标文章 id)。问题按真实提问习惯写,包含口语化转述,不照抄文章标题
TESTSET = [
    ("博客里说图片优化该用什么图片格式", 22),
    ("前端性能优化有哪些实用技巧", 22),
    ("React Hooks 是 React 哪个版本引入的新特性", 23),
    ("函数组件里怎么使用状态", 23),
    ("Composition API 是哪个框架引入的", 24),
    ("Vue3 组合式 API 解决了什么问题", 24),
    ("回调地狱怎么解决", 25),
    ("async await 和 Promise 是什么关系", 25),
    ("CSS 里二维网格布局系统是什么", 26),
    ("Grid 布局的 fr 单位是什么意思", 26),
    ("TypeScript 和 JavaScript 是什么关系", 27),
    ("什么是静态类型检查,谁帮我做了这件事", 27),
    ("RESTful API 是什么风格", 28),
    ("用 Node.js 写接口的实践文章是哪篇", 28),
    ("Git 里分支是什么概念", 29),
    ("代码提交之前远程仓库怎么配置", 29),
    ("XSS 攻击是什么,怎么防御", 30),
    ("前端项目怎么防止恶意脚本注入", 30),
    ("前端工程化里提到了哪些构建工具", 31),
    ("怎么提高前端的开发效率和代码质量", 31),
    ("后台管理系统里状态为什么要拆分管理", 32),
    ("用户登录态这种跨页面共享的状态放哪合适", 32),
    ("AI 怎么接入博客创作流程", 33),
    ("除了单纯调 API,博客的 AI 助手还能做什么", 33),
    ("Axios 统一封装有什么好处", 34),
    ("登录过期了前端要怎么处理", 34),
    ("魔鬼城指的是什么地方", 11),
    ("爬到南天门是什么感受", 36),
    ("鸡公煲为什么让人踏实", 37),
    ("小黑干了什么理直气壮的事", 38),
]

BASELINE_TOP_K = 5
EVAL_TOP_K = 3


def keyword_score(query, chunk):
    """朴素基线:查询里的字符在分块中出现的比例(去重后),不依赖任何模型."""
    chars = {c for c in query if not c.isspace()}
    if not chars:
        return 0.0
    hit = sum(1 for c in chars if c in chunk)
    return hit / len(chars)


def search_baseline(query, all_rows, top_k):
    scored = sorted(
        (
            {"article_id": row["article_id"], "score": keyword_score(query, row["content"])}
            for row in all_rows
        ),
        key=lambda item: item["score"],
        reverse=True,
    )
    return scored[:top_k]


def hit_at_k(results, gold_id, k):
    return any(item["article_id"] == gold_id for item in results[:k])


def main():
    rows = db.fetch_all_embeddings()
    print(f"索引中共 {len(rows)} 个分块,测试集 {len(TESTSET)} 条\n")

    stats = {"rag_hit1": 0, "rag_hit3": 0, "base_hit1": 0, "base_hit3": 0}
    misses = []
    for question, gold in TESTSET:
        rag_hits = rag.search_relevant_chunks(question, rows, top_k=BASELINE_TOP_K, min_score=0.0)
        base_hits = search_baseline(question, rows, BASELINE_TOP_K)

        r1, r3 = hit_at_k(rag_hits, gold, 1), hit_at_k(rag_hits, gold, EVAL_TOP_K)
        b1, b3 = hit_at_k(base_hits, gold, 1), hit_at_k(base_hits, gold, EVAL_TOP_K)
        stats["rag_hit1"] += r1
        stats["rag_hit3"] += r3
        stats["base_hit1"] += b1
        stats["base_hit3"] += b3

        mark = "OK " if r3 else "MISS"
        top1 = rag_hits[0] if rag_hits else {"article_id": -1, "score": 0.0}
        print(f"[{mark}] {question[:24]:<26} 目标#{gold:<3} top1#{top1['article_id']}({top1['score']:.3f})  RAG@1={int(r1)} @3={int(r3)} | 基线@1={int(b1)} @3={int(b3)}")
        if not r3:
            misses.append(question)

    total = len(TESTSET)
    print("\n========== 汇总 ==========")
    print(f"RAG   向量检索: hit@1 {stats['rag_hit1']}/{total} = {stats['rag_hit1']/total:.0%}   hit@3 {stats['rag_hit3']}/{total} = {stats['rag_hit3']/total:.0%}")
    print(f"基线  关键词  : hit@1 {stats['base_hit1']}/{total} = {stats['base_hit1']/total:.0%}   hit@3 {stats['base_hit3']}/{total} = {stats['base_hit3']/total:.0%}")
    if misses:
        print("\nRAG 未命中(前3)的问题:")
        for question in misses:
            print(f"  - {question}")


if __name__ == "__main__":
    main()
