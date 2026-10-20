import os

from dotenv import load_dotenv

# override=True:项目 .env 优先于系统环境变量,避免机器上遗留的旧 key 抢占
# (Docker 容器内没有 .env 文件,load_dotenv 是空操作,compose 注入的环境变量照常生效)
load_dotenv(override=True)

DB = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "123456"),
    "database": os.getenv("DB_NAME", "xxblog"),
}

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

# embedding 走硅基流动的 bge-m3,和 DeepSeek 的 key 相互独立
EMBEDDING_API_KEY = os.getenv("EMBEDDING_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
EMBEDDING_URL = os.getenv("EMBEDDING_URL", "https://api.siliconflow.cn/v1/embeddings")

PORT = int(os.getenv("AI_SERVICE_PORT", "3002"))

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "400"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
TOP_K = int(os.getenv("TOP_K", "5"))
# 余弦相似度低于该值视为"博客里没有相关内容",触发拒答
MIN_SCORE = float(os.getenv("MIN_SCORE", "0.35"))
