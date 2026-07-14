import { defineStore } from 'pinia'

export type AIMessageRole = 'user' | 'assistant'
export type AIMessageStatus = 'done' | 'loading' | 'error' | 'stopped'

export interface AIMessage {
  id: string
  role: AIMessageRole
  content: string
  status: AIMessageStatus
  createdAt: number
}

const welcomeMessage = (): AIMessage => ({
  id: `ai-welcome-${Date.now()}`,
  role: 'assistant',
  content: '你好，我是你的博客 AI 助手。可以帮你写文章、润色内容、推荐标签，也可以解释代码。',
  status: 'done',
  createdAt: Date.now(),
})

export const useAIStore = defineStore('ai', {
  state: () => ({
    messages: [welcomeMessage()] as AIMessage[],
    isGenerating: false,
    lastUserMessage: '',
    errorMessage: '',
  }),
  getters: {
    chatContext: (state) =>
      state.messages
        .filter((message) => message.status === 'done')
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
  },
  actions: {
    addMessage(role: AIMessageRole, content = '', status: AIMessageStatus = 'done') {
      const message: AIMessage = {
        id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        content,
        status,
        createdAt: Date.now(),
      }
      this.messages.push(message)
      if (role === 'user') {
        this.lastUserMessage = content
      }
      return message.id
    },
    updateMessage(id: string, patch: Partial<Omit<AIMessage, 'id'>>) {
      const message = this.messages.find((item) => item.id === id)
      if (message) {
        Object.assign(message, patch)
      }
    },
    removeMessage(id: string) {
      this.messages = this.messages.filter((message) => message.id !== id)
    },
    clearMessages() {
      this.messages = [welcomeMessage()]
      this.lastUserMessage = ''
      this.errorMessage = ''
      this.isGenerating = false
    },
  },
  persist: true,
})
