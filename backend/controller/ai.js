const https = require('https')

const DEEPSEEK_HOST = 'api.deepseek.com'
const DEEPSEEK_PATH = '/chat/completions'
const DEFAULT_MODEL = 'deepseek-v4-pro'

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
