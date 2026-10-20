// AI 服务索引通知:文章变化时异步告知 Python 服务重建/清除向量索引
// AI 服务没启动时静默忽略,不影响博客主流程(问答会自动降级为无 RAG 模式)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002'

const notifyAiService = (path, body) => {
  fetch(`${AI_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(2000),
  }).catch(() => {})
}

exports.indexArticle = (articleId) => notifyAiService('/index/article', { article_id: articleId })
exports.removeArticleIndex = (articleId) => notifyAiService('/index/delete', { article_id: articleId })
