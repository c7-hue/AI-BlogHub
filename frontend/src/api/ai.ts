import axios from '@/utils/axios'
import { baseUrl } from '@/utils/env'
import { getAccessToken } from '@/utils/auth'

export type AIChatRole = 'user' | 'assistant'

export interface AIChatContext {
  role: AIChatRole
  content: string
}

export interface AIChatResponse {
  code: number
  response: string
}

interface AIStreamEvent {
  content?: string
  error?: string
}

export const chatWithAI = (message: string, context: AIChatContext[] = []) => {
  return axios.post<AIChatResponse, AIChatResponse>('/ai/chat', {
    message,
    context,
  })
}
export const streamChatWithAI = async (
  message: string,
  context: AIChatContext[] = [],
  onDelta: (content: string) => void,
  signal?: AbortSignal,
) => {
  const token = getAccessToken()
  const response = await fetch(`${baseUrl}/ai/chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, context }),
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error('AI stream request failed')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() || ''

    for (const event of events) {
      const line = event
        .split('\n')
        .find((item) => item.startsWith('data:'))

      if (!line) continue

      const payload = line.replace(/^data:\s*/, '')
      const data = JSON.parse(payload) as AIStreamEvent

      if (data.error) {
        throw new Error(data.error)
      }
      if (data.content) {
        onDelta(data.content)
      }
    }
  }
}
