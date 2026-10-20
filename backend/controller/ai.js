const https = require('https')

const DEEPSEEK_HOST = 'api.deepseek.com'
const DEEPSEEK_PATH = '/chat/completions'
const DEFAULT_MODEL = 'deepseek-v4-pro'

// Python AI 服务(FastAPI):提供 RAG 检索增强问答;不可用时降级为直连 DeepSeek
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002'

// 调用 AI 服务;失败(未启动/超时/报错)返回 null,由调用方走降级逻辑
const callAiService = async (path, body, timeoutMs = 3000, signal) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: signal || AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    return response
  } catch {
    return null
  }
}

const normalizeMessage = (message) => {
  return typeof message === 'string' ? message.trim() : String(message || '').trim()
}

const normalizeContext = (context) => {
  if (!Array.isArray(context)) return []

  return context
    .filter((item) => item && typeof item.content === 'string')
    .slice(-8)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.content.slice(0, 2000),
    }))
}

const extractAIResponse = (result) => {
  const content = result?.choices?.[0]?.message?.content
  return typeof content === 'string' ? content.trim() : ''
}

const requestDeepSeek = (payload) => {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return Promise.reject(new Error('Missing DEEPSEEK_API_KEY'))
  }

  const postData = JSON.stringify(payload)

  const options = {
    hostname: DEEPSEEK_HOST,
    port: 443,
    path: DEEPSEEK_PATH,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = ''

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        try {
          const result = JSON.parse(data)

          if (response.statusCode >= 400 || result.error) {
            const message = result.error?.message || `DeepSeek request failed: ${response.statusCode}`
            reject(new Error(message))
            return
          }

          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    request.on('error', reject)
    request.write(postData)
    request.end()
  })
}
const requestDeepSeekStream = (payload, onDelta) => {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return Promise.reject(new Error('Missing DEEPSEEK_API_KEY'))
  }

  const postData = JSON.stringify({ ...payload, stream: true })
  const options = {
    hostname: DEEPSEEK_HOST,
    port: 443,
    path: DEEPSEEK_PATH,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let buffer = ''

      response.on('data', (chunk) => {
        buffer += chunk.toString('utf8')
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const text = line.trim()
          if (!text.startsWith('data:')) continue

          const data = text.replace(/^data:\s*/, '')
          if (data === '[DONE]') {
            resolve()
            return
          }

          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error.message || 'DeepSeek stream failed'))
              return
            }
            const content = json.choices?.[0]?.delta?.content || ''
            if (content) onDelta(content)
          } catch (error) {
            reject(error)
            return
          }
        }
      })

      response.on('end', resolve)
    })

    request.on('error', reject)
    request.write(postData)
    request.end()
  })
}

exports.chatWithAI = async (req, res) => {
  try {
    const cleanMessage = normalizeMessage(req.body.message)

    if (!cleanMessage) {
      res.json({
        code: 400,
        response: '请输入要发送给 AI 的内容。',
      })
      return
    }

    // 优先走 AI 服务的 RAG 问答(检索博客文章作为上下文,回答附来源)
    const upstream = await callAiService(
      '/rag/chat',
      { question: cleanMessage, history: normalizeContext(req.body.context) },
      60000,
    )
    if (upstream) {
      const result = await upstream.json()
      res.json({
        code: 200,
        model: result.model || 'deepseek',
        response: result.answer || '抱歉，AI 暂时没有生成有效内容，请稍后再试。',
        sources: result.sources || [],
      })
      return
    }

    // 降级:直连 DeepSeek(无 RAG)
    const messages = [
      {
        role: 'system',
        content:
          '你是一个中文技术博客创作助手。回答要适合前端开发者，结构清晰，避免空泛套话。涉及代码时优先给可执行建议。',
      },
      ...normalizeContext(req.body.context),
      {
        role: 'user',
        content: cleanMessage,
      },
    ]

    const payload = {
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      messages,
      stream: false,
      temperature: 0.7,
    }

    const result = await requestDeepSeek(payload)
    const aiResponse = extractAIResponse(result) || '抱歉，AI 暂时没有生成有效内容，请稍后再试。'

    res.json({
      code: 200,
      model: payload.model,
      response: aiResponse,
    })
  } catch (error) {
    console.error('AI service failed:', error.message)
    res.json({
      code: 500,
      response:
        error.message === 'Missing DEEPSEEK_API_KEY'
          ? '后端还没有配置 DEEPSEEK_API_KEY，请先设置环境变量。'
          : 'AI 服务暂时不可用，请稍后再试。',
    })
  }
}
exports.chatWithAIStream = async (req, res) => {
  try {
    const cleanMessage = normalizeMessage(req.body.message)

    if (!cleanMessage) {
      res.writeHead(400, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      res.write(`data: ${JSON.stringify({ error: '请输入要发送给 AI 的内容。' })}\n\n`)
      res.end()
      return
    }

    // 优先走 AI 服务的 RAG 流式问答,事件格式与下方降级路径保持一致
    // 连接超时和流式读取要分开控制:5 秒连不上就走降级,连上后允许长回答
    const controller = new AbortController()
    const connectTimer = setTimeout(() => controller.abort(), 5000)
    // 客户端提前断开才中止上游;Express 5 里 req 的 close 在请求体读完就触发,不能用它判断断连
    res.on('close', () => {
      if (!res.writableEnded) controller.abort()
    })
    const upstream = await callAiService(
      '/rag/chat/stream',
      { question: cleanMessage, history: normalizeContext(req.body.context) },
      undefined,
      controller.signal,
    ).finally(() => clearTimeout(connectTimer))
    if (upstream && upstream.body) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      })
      for await (const chunk of upstream.body) {
        if (controller.signal.aborted) break
        res.write(chunk)
      }
      res.end()
      return
    }

    // 降级:直连 DeepSeek(无 RAG)
    const messages = [
      {
        role: 'system',
        content:
          '你是一个中文技术博客创作助手。回答要适合前端开发者，结构清晰，避免空泛套话。涉及代码时优先给可执行建议。',
      },
      ...normalizeContext(req.body.context),
      {
        role: 'user',
        content: cleanMessage,
      },
    ]

    const payload = {
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      messages,
      temperature: 0.7,
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    await requestDeepSeekStream(payload, (content) => {
      res.write(`data: ${JSON.stringify({ content })}\n\n`)
    })

    res.write(`data: ${JSON.stringify({ done: true, model: payload.model })}\n\n`)
    res.end()
  } catch (error) {
    console.error('AI stream failed:', error.message)
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
    }
    res.write(
      `data: ${JSON.stringify({
        error:
          error.message === 'Missing DEEPSEEK_API_KEY'
            ? '后端还没有配置 DEEPSEEK_API_KEY，请先设置环境变量。'
            : 'AI 服务暂时不可用，请稍后再试。',
      })}\n\n`,
    )
    res.end()
  }
}
