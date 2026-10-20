import json

import pymysql

from config import DB

EMBEDDING_TABLE_SQL = """
create table if not exists article_embedding(
  id int not null auto_increment,
  article_id int not null comment '所属文章',
  chunk_index int not null comment '第几块',
  content text not null comment '分块原文',
  embedding json not null comment '向量化结果',
  moment varchar(100) not null comment '时间',
  primary key(id),
  key idx_article (article_id)
) default charset utf8mb4;
"""


def get_conn(with_db=True):
    return pymysql.connect(
        host=DB["host"],
        user=DB["user"],
        password=DB["password"],
        database=DB["database"] if with_db else None,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )


def ensure_table():
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute(EMBEDDING_TABLE_SQL)


def fetch_article(article_id):
    # 只索引已发布的文章(classify=0 是文章,1 是图库图片)
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "select id, title, introduce, content, state, classify from article where id=%s",
                (article_id,),
            )
            return cursor.fetchone()


def fetch_published_articles():
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "select id, title, introduce, content from article where state=1 and classify=0 order by id"
            )
            return cursor.fetchall()


def replace_article_embeddings(article_id, chunks, vectors, moment):
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute("delete from article_embedding where article_id=%s", (article_id,))
            if not chunks:
                return 0
            rows = [
                (article_id, index, chunk, json.dumps(vector), moment)
                for index, (chunk, vector) in enumerate(zip(chunks, vectors))
            ]
            cursor.executemany(
                "insert into article_embedding (article_id, chunk_index, content, embedding, moment)"
                " values (%s, %s, %s, %s, %s)",
                rows,
            )
            return len(rows)


def delete_article_embeddings(article_id):
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute("delete from article_embedding where article_id=%s", (article_id,))


def fetch_all_embeddings():
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute("select article_id, content, embedding from article_embedding")
            rows = cursor.fetchall()
    for row in rows:
        row["embedding"] = json.loads(row["embedding"])
    return rows


def count_embeddings():
    with get_conn() as conn:
        with conn.cursor() as cursor:
            cursor.execute("select count(*) as count from article_embedding")
            return cursor.fetchone()["count"]
