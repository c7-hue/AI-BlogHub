FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY . .

EXPOSE 3002

# lifespan 里会自动建 article_embedding 表;MySQL 未就绪时靠 restart 重试
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3002"]
