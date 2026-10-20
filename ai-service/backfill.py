"""一次性脚本:把数据库里所有已发布文章回填到向量索引.

用法:
    python backfill.py
"""

import db
import rag


def main():
    if not rag.is_embedding_configured():
        print("缺少 EMBEDDING_API_KEY,请先在 ai-service/.env 里配置")
        return

    articles = db.fetch_published_articles()
    print(f"共 {len(articles)} 篇已发布文章待索引")
    for index, article in enumerate(articles, start=1):
        chunks = rag.chunk_text(rag.build_article_text(article))
        if not chunks:
            print(f"[{index}/{len(articles)}] #{article['id']} 《{article['title']}》 内容过短,跳过")
            continue
        vectors = rag.embed_texts(chunks)
        count = db.replace_article_embeddings(article["id"], chunks, vectors, rag.now_string())
        print(f"[{index}/{len(articles)}] #{article['id']} 《{article['title']}》 索引 {count} 块")
    print("回填完成")


if __name__ == "__main__":
    main()
