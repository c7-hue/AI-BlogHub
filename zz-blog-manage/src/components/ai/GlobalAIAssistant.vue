<template>
  <div class="global-ai-assistant">
    <button
      class="ai-float-btn"
      :class="{ active: isChatOpen }"
      title="AI 助手"
      @click="toggleChat"
    >
      AI
    </button>

    <section
      v-if="isChatOpen"
      ref="chatWindow"
      class="ai-chat-window"
      :style="{ left: chatPosition.x + 'px', top: chatPosition.y + 'px' }"
    >
      <header class="chat-header" @mousedown="startDrag">
        <div>
          <h3>AI 助手</h3>
          <p>支持上下文、停止生成、重试和复制</p>
        </div>
        <div class="header-actions">
          <button title="清空会话" @click.stop="clearChat">清空</button>
          <button title="关闭" @click.stop="closeChat">×</button>
        </div>
      </header>

      <main ref="chatContent" class="chat-content">
        <article
          v-for="message in aiStore.messages"
          :key="message.id"
          class="message"
          :class="[message.role, message.status]"
        >
          <div class="message-content">{{ message.content }}</div>
          <div v-if="message.role === 'assistant'" class="message-actions">
            <span v-if="message.status === 'loading'">生成中...</span>
            <span v-else-if="message.status === 'stopped'">已停止</span>
            <span v-else-if="message.status === 'error'">生成失败</span>
            <button v-if="message.content" @click="copyText(message.content)">复制</button>
          </div>
        </article>
      </main>

      <footer class="chat-input">
        <textarea
          v-model="inputMessage"
          placeholder="输入问题，Enter 发送，Shift + Enter 换行"
          rows="2"
          @keydown.enter.exact.prevent="sendMessage()"
        />
        <div class="input-actions">
          <button v-if="aiStore.isGenerating" class="secondary" @click="stopGenerate">停止</button>
          <button
            v-else
            class="secondary"
            :disabled="!aiStore.lastUserMessage"
            @click="retryLast"
          >
            重试
          </button>
          <button :disabled="!inputMessage.trim() || aiStore.isGenerating" @click="sendMessage()">
            发送
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { chatWithAI } from '@/api/ai'
import { useAIStore } from '@/store/ai'

const aiStore = useAIStore()

const isChatOpen = ref(false)
const inputMessage = ref('')
const chatContent = ref<HTMLElement | null>(null)
const chatWindow = ref<HTMLElement | null>(null)
const chatPosition = ref({ x: 800, y: 100 })

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
let streamTimer: number | undefined
let activeAssistantId = ''

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    scrollToBottom()
  }
}

const closeChat = () => {
  isChatOpen.value = false
}

const clearChat = () => {
  stopGenerate()
  aiStore.clearMessages()
  scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
}

const runStream = (id: string, text: string) => {
  const chars = Array.from(text || '抱歉，我暂时没有生成有效内容。')
  let index = 0
  window.clearInterval(streamTimer)
  streamTimer = window.setInterval(() => {
    if (!aiStore.isGenerating || id !== activeAssistantId) {
      window.clearInterval(streamTimer)
      return
    }
    index += 2
    aiStore.updateMessage(id, {
      content: chars.slice(0, index).join(''),
      status: index >= chars.length ? 'done' : 'loading',
    })
    scrollToBottom()
    if (index >= chars.length) {
      aiStore.isGenerating = false
      activeAssistantId = ''
      window.clearInterval(streamTimer)
    }
  }, 28)
}

const requestAI = async (message: string, shouldRecordUser = true) => {
  const cleanMessage = message.trim()
  if (!cleanMessage || aiStore.isGenerating) return

  if (shouldRecordUser) {
    aiStore.addMessage('user', cleanMessage)
  }
  const assistantId = aiStore.addMessage('assistant', '', 'loading')
  activeAssistantId = assistantId
  aiStore.isGenerating = true
  aiStore.errorMessage = ''
  scrollToBottom()

  try {
    const data = await chatWithAI(cleanMessage, aiStore.chatContext)
    runStream(assistantId, data.response)
  } catch (error) {
    aiStore.isGenerating = false
    aiStore.errorMessage = 'AI 服务暂时不可用，请稍后再试。'
    aiStore.updateMessage(assistantId, {
      content: aiStore.errorMessage,
      status: 'error',
    })
    scrollToBottom()
  }
}

const sendMessage = () => {
  const message = inputMessage.value
  inputMessage.value = ''
  requestAI(message)
}

const retryLast = () => {
  if (!aiStore.lastUserMessage || aiStore.isGenerating) return
  requestAI(aiStore.lastUserMessage, false)
}

const stopGenerate = () => {
  if (!aiStore.isGenerating) return
  aiStore.isGenerating = false
  window.clearInterval(streamTimer)
  if (activeAssistantId) {
    aiStore.updateMessage(activeAssistantId, { status: 'stopped' })
    activeAssistantId = ''
  }
}

const copyText = async (text: string) => {
  await navigator.clipboard?.writeText(text)
}

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  const rect = chatWindow.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  chatPosition.value = {
    x: Math.max(16, Math.min(window.innerWidth - 420, event.clientX - dragOffset.value.x)),
    y: Math.max(16, Math.min(window.innerHeight - 560, event.clientY - dragOffset.value.y)),
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  chatPosition.value = {
    x: Math.max(16, window.innerWidth - 420),
    y: 90,
  }
})

onUnmounted(() => {
  stopGenerate()
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.global-ai-assistant {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.ai-float-btn,
.chat-header button,
.input-actions button,
.message-actions button {
  border: none;
  cursor: pointer;
}

.ai-float-btn {
  position: fixed;
  right: 22px;
  bottom: 28px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.28);
  pointer-events: auto;
}

.ai-float-btn.active {
  background: #111827;
}

.ai-chat-window {
  position: fixed;
  width: 400px;
  height: 540px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  pointer-events: auto;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f7;
  cursor: move;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #111827;
}

.chat-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions button,
.message-actions button,
.input-actions button {
  border-radius: 6px;
  background: #eef2f7;
  color: #374151;
  font-size: 12px;
}

.header-actions button {
  height: 28px;
  padding: 0 9px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
  background: #f8fafc;
}

.message {
  max-width: 86%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.user .message-content {
  background: #2563eb;
  color: #fff;
}

.assistant .message-content {
  background: #fff;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.message-actions button {
  padding: 4px 8px;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.chat-input textarea {
  width: 100%;
  resize: none;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 9px 10px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.input-actions button {
  min-width: 64px;
  height: 32px;
  padding: 0 12px;
}

.input-actions button:last-child {
  background: #2563eb;
  color: #fff;
}

.input-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
