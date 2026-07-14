<template>
  <aside class="article-ai-writer">
    <header class="writer-header">
      <div>
        <h3>AI 创作助手</h3>
        <p>标题、大纲、正文、润色、摘要和标签推荐</p>
      </div>
      <div class="header-actions">
        <button v-if="lastAction && !loading" class="icon-btn" title="重新生成" @click="retryAction">重试</button>
        <button v-if="loading" class="icon-btn stop-btn" title="停止生成" @click="stopGeneration">停止</button>
        <button v-else class="icon-btn" title="清空结果" @click="clearResult">清空</button>
      </div>
    </header>

    <section class="writer-section">
      <label>创作主题</label>
      <textarea
        v-model="topic"
        rows="3"
        placeholder="例如：周末爬山记录、Vue3 项目复盘、猫猫日常..."
      />
    </section>

    <section class="writer-section">
      <div class="section-title">
        <span>快捷能力</span>
        <button class="text-btn" @click="refreshSelection">读取选中</button>
      </div>
      <div class="action-grid">
        <button
          v-for="action in actions"
          :key="action.type"
          :class="{ active: activeType === action.type }"
          :disabled="loading"
          @click="runAction(action.type)"
        >
          {{ action.label }}
        </button>
      </div>
    </section>

    <section class="writer-section selected-box" v-if="selectedText">
      <label>当前选中文本</label>
      <p>{{ selectedText }}</p>
    </section>

    <section class="writer-section result-box">
      <div class="section-title">
        <span>生成结果</span>
        <span v-if="loading" class="loading">生成中...</span>
      </div>
      <textarea
        v-model="result"
        rows="10"
        placeholder="AI 生成结果会显示在这里"
      />
    </section>

    <section class="writer-section meta-box" v-if="metaSuggestion">
      <label>识别到的文章信息</label>
      <div class="meta-row" v-if="metaSuggestion.title">
        <span>标题</span>
        <p>{{ metaSuggestion.title }}</p>
      </div>
      <div class="meta-row" v-if="metaSuggestion.introduce">
        <span>摘要</span>
        <p>{{ metaSuggestion.introduce }}</p>
      </div>
      <div class="meta-row" v-if="metaSuggestion.categoryName">
        <span>分类</span>
        <p>{{ metaSuggestion.categoryName }}</p>
      </div>
      <div class="tag-row" v-if="metaSuggestion.tags?.length">
        <span v-for="tag in metaSuggestion.tags" :key="tag">{{ tag }}</span>
      </div>
    </section>

    <footer class="writer-actions">
      <button :disabled="!result" @click="copyResult">复制</button>
      <button :disabled="!result" @click="insertResult">插入正文</button>
      <button :disabled="!result || !sourceText" @click="reviewOpen = true">对比采纳</button>
      <button :disabled="!canApplyMeta" class="primary" @click="applyMeta">回填表单</button>
    </footer>
  </aside>

  <Teleport to="body">
    <div v-if="reviewOpen" class="review-overlay" @click.self="reviewOpen = false">
      <section class="review-dialog" role="dialog" aria-modal="true" aria-label="AI 改写对比">
        <header class="review-header">
          <div>
            <h3>审阅 AI 改写</h3>
            <p>绿色为新增，红色为删除；可按段选择需要采纳的结果。</p>
          </div>
          <button class="icon-btn" title="关闭" @click="reviewOpen = false">关闭</button>
        </header>

        <div class="diff-grid">
          <div class="diff-pane">
            <strong>原文</strong>
            <p>
              <template v-for="(segment, index) in diffSegments" :key="`old-${index}`">
                <mark v-if="segment.type === 'remove'" class="removed">{{ segment.text }}</mark>
                <span v-else-if="segment.type === 'equal'">{{ segment.text }}</span>
              </template>
            </p>
          </div>
          <div class="diff-pane">
            <strong>AI 结果</strong>
            <p>
              <template v-for="(segment, index) in diffSegments" :key="`new-${index}`">
                <mark v-if="segment.type === 'add'" class="added">{{ segment.text }}</mark>
                <span v-else-if="segment.type === 'equal'">{{ segment.text }}</span>
              </template>
            </p>
          </div>
        </div>

        <div class="review-select-title">
          <strong>分段采纳</strong>
          <button class="text-btn" @click="toggleAllParagraphs">
            {{ allParagraphsSelected ? '取消全选' : '全选结果' }}
          </button>
        </div>
        <div class="paragraph-list">
          <label v-for="(paragraph, index) in resultParagraphs" :key="index">
            <input v-model="selectedParagraphs" type="checkbox" :value="index">
            <span>{{ paragraph }}</span>
          </label>
        </div>

        <footer class="review-actions">
          <button @click="reviewOpen = false">取消</button>
          <button class="primary" :disabled="!selectedResult" @click="confirmReplace">采纳所选内容</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { chatWithAI, streamChatWithAI } from '@/api/ai'
import {
  buildTextDiff,
  parseMetaSuggestion,
  splitParagraphs,
  stripHtml,
  textToHtml,
  type MetaSuggestion,
} from '@/utils/aiText'

type ActionType =
  | 'title'
  | 'outline'
  | 'draft'
  | 'polish'
  | 'expand'
  | 'continue'
  | 'summary'
  | 'tags'

const props = defineProps<{
  getContent: () => string
  getSelectedText: () => string
  currentTitle?: string
  currentSummary?: string
}>()

const emits = defineEmits<{
  (event: 'insert-html', html: string): void
  (event: 'replace-selection', html: string): void
  (event: 'apply-meta', suggestion: MetaSuggestion): void
  (event: 'before-apply'): void
}>()

const actions: { type: ActionType; label: string }[] = [
  { type: 'title', label: '生成标题' },
  { type: 'outline', label: '生成大纲' },
  { type: 'draft', label: '生成正文' },
  { type: 'polish', label: '润色选中' },
  { type: 'expand', label: '扩写选中' },
  { type: 'continue', label: '续写正文' },
  { type: 'summary', label: '生成摘要' },
  { type: 'tags', label: '推荐标签' },
]

const topic = ref('')
const result = ref('')
const selectedText = ref('')
const sourceText = ref('')
const selectedParagraphs = ref<number[]>([])
const reviewOpen = ref(false)
const activeType = ref<ActionType | ''>('')
const lastAction = ref<ActionType | null>(null)
const loading = ref(false)
const metaSuggestion = ref<MetaSuggestion | null>(null)
let activeController: AbortController | null = null

const canApplyMeta = computed(() => {
  return Boolean(
    metaSuggestion.value?.title ||
      metaSuggestion.value?.introduce ||
      metaSuggestion.value?.tags?.length ||
      metaSuggestion.value?.categoryName,
  )
})

const resultParagraphs = computed(() => splitParagraphs(result.value))
const selectedResult = computed(() => selectedParagraphs.value
  .map((index) => resultParagraphs.value[index])
  .filter((paragraph): paragraph is string => Boolean(paragraph))
  .join('\n\n'))
const diffSegments = computed(() => buildTextDiff(sourceText.value, result.value))
const allParagraphsSelected = computed(() =>
  resultParagraphs.value.length > 0 && selectedParagraphs.value.length === resultParagraphs.value.length,
)

const getContext = () => {
  const content = stripHtml(props.getContent?.() || '')
  return {
    title: props.currentTitle || '',
    summary: props.currentSummary || '',
    content: content.slice(0, 2600),
    selected: selectedText.value || '',
    topic: topic.value.trim(),
  }
}

const refreshSelection = () => {
  selectedText.value = props.getSelectedText?.() || ''
}

const buildPrompt = (type: ActionType) => {
  refreshSelection()
  sourceText.value = type === 'polish' || type === 'expand' ? selectedText.value : ''
  const context = getContext()
  const base = [
    '你是博客后台里的 AI 写作助手。',
    '请使用自然、有生活感但不浮夸的中文表达。',
    '输出可以直接放进博客编辑器，不要解释你的工作过程。',
    `当前标题：${context.title || '暂无'}`,
    `当前简介：${context.summary || '暂无'}`,
    `创作主题：${context.topic || '暂无'}`,
    `正文内容：${context.content || '暂无'}`,
    `选中文本：${context.selected || '暂无'}`,
  ].join('\n')

  const promptMap: Record<ActionType, string> = {
    title: `${base}\n请生成 5 个适合博客文章的标题，每行一个，标题要具体、有记忆点。`,
    outline: `${base}\n请生成一份文章大纲，使用二级标题和要点，适合直接扩写成博客正文。`,
    draft: `${base}\n请生成一篇完整博客正文，包含 3-5 个段落，内容自然具体，不要空泛。`,
    polish: `${base}\n请润色“选中文本”。如果没有选中文本，请根据正文中最核心的一段进行润色。只输出润色后的内容。`,
    expand: `${base}\n请扩写“选中文本”，补充细节、场景和感受。如果没有选中文本，请围绕主题扩写一段。`,
    continue: `${base}\n请根据当前正文自然续写 2-3 段，保持原有语气和主题。`,
    summary: `${base}\n请生成一段 80 字以内的文章摘要，只输出摘要文本。`,
    tags: `${base}\n请根据文章内容返回严格 JSON，不要 Markdown，不要解释：{"title":"推荐标题","introduce":"80字以内摘要","categoryName":"生活日常/旅行记录/美食随记/前端开发/AI创作 中最合适的一个","tags":["标签1","标签2","标签3"]}`,
  }

  return promptMap[type]
}

const runAction = async (type: ActionType) => {
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  activeType.value = type
  lastAction.value = type
  loading.value = true
  result.value = ''
  selectedParagraphs.value = []
  metaSuggestion.value = null

  try {
    const prompt = buildPrompt(type)
    await streamChatWithAI(prompt, [], (content) => {
      result.value += content
    }, controller.signal)

    if (!result.value) {
      const data = await chatWithAI(prompt)
      result.value = data.response || ''
      selectedParagraphs.value = resultParagraphs.value.map((_, index) => index)
    }

    if (type === 'summary') {
      metaSuggestion.value = {
        introduce: result.value.replace(/\n/g, ' ').trim(),
      }
    } else if (type === 'title') {
      const title = result.value
        .split(/\n/)
        .map((line) => line.replace(/^\d+[.、]\s*/, '').trim())
        .find(Boolean)
      metaSuggestion.value = title ? { title } : null
    } else if (type === 'tags') {
      metaSuggestion.value = parseMetaSuggestion(result.value)
    }
    selectedParagraphs.value = resultParagraphs.value.map((_, index) => index)
  } catch (error) {
    if (controller.signal.aborted) return
    try {
      const data = await chatWithAI(buildPrompt(type))
      if (controller.signal.aborted) return
      result.value = data.response || ''
      selectedParagraphs.value = resultParagraphs.value.map((_, index) => index)
    } catch (fallbackError) {
      result.value = 'AI 服务暂时不可用，请检查后端模型配置或稍后重试。'
    }
  } finally {
    if (activeController === controller) {
      activeController = null
      loading.value = false
    }
  }
}

const stopGeneration = () => {
  activeController?.abort()
  activeController = null
  loading.value = false
}

const retryAction = () => {
  if (lastAction.value) runAction(lastAction.value)
}

const clearResult = () => {
  activeController?.abort()
  activeController = null
  loading.value = false
  result.value = ''
  sourceText.value = ''
  selectedParagraphs.value = []
  activeType.value = ''
  lastAction.value = null
  metaSuggestion.value = null
}

const insertResult = () => {
  emits('before-apply')
  emits('insert-html', textToHtml(result.value))
}

const replaceResult = () => {
  const content = selectedResult.value || result.value
  emits('before-apply')
  emits('replace-selection', textToHtml(content))
}

const confirmReplace = () => {
  replaceResult()
  reviewOpen.value = false
}

const toggleAllParagraphs = () => {
  selectedParagraphs.value = allParagraphsSelected.value
    ? []
    : resultParagraphs.value.map((_, index) => index)
}

const applyMeta = () => {
  if (metaSuggestion.value) {
    emits('before-apply')
    emits('apply-meta', metaSuggestion.value)
  }
}

const copyResult = async () => {
  await navigator.clipboard?.writeText(result.value)
}

onBeforeUnmount(() => {
  activeController?.abort()
})
</script>

<style scoped>
.article-ai-writer {
  width: 320px;
  flex: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow-y: visible;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
}

.writer-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.writer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.writer-header p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.writer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.writer-section label,
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 11px;
  outline: none;
  line-height: 1.6;
  color: #111827;
  background: #fff;
}

textarea:focus {
  border-color: #2b5aed;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

button {
  height: 34px;
  border: none;
  border-radius: 7px;
  background: #f1f5f9;
  color: #334155;
  cursor: pointer;
}

button:hover {
  background: #e2e8f0;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

button.active,
button.primary {
  background: #2b5aed;
  color: #fff;
}

.icon-btn,
.text-btn {
  width: auto;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
}

.text-btn {
  background: transparent;
  color: #2b5aed;
}

.stop-btn {
  background: #fee2e2;
  color: #dc2626;
}

.selected-box,
.meta-box {
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.review-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.48);
}

.review-dialog {
  width: min(880px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
}

.review-header,
.review-actions,
.review-select-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-header h3,
.review-header p {
  margin: 0;
}

.review-header h3 {
  color: #111827;
  font-size: 18px;
}

.review-header p {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.review-actions {
  justify-content: flex-end;
}

.review-actions button {
  min-width: 108px;
}

.review-select-title strong {
  color: #374151;
  font-size: 13px;
}

.diff-pane {
  min-width: 0;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
}

.diff-pane strong {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
}

.diff-pane p {
  height: 180px;
  margin: 0;
  overflow-y: auto;
  color: #334155;
  font-size: 12px;
  line-height: 1.7;
  word-break: break-word;
}

.diff-pane mark {
  padding: 0 1px;
  color: inherit;
}

.diff-pane .removed {
  background: #fee2e2;
  text-decoration: line-through;
}

.diff-pane .added {
  background: #dcfce7;
}

.paragraph-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

@media (max-width: 720px) {
  .review-overlay {
    padding: 12px;
  }

  .review-dialog {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }

  .diff-grid {
    grid-template-columns: 1fr;
  }

  .diff-pane p {
    height: 110px;
  }
}

.paragraph-list label {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 7px;
  align-items: start;
  padding: 7px;
  border-radius: 6px;
  background: #fff;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
  cursor: pointer;
}

.paragraph-list input {
  margin: 2px 0 0;
}

.selected-box p,
.meta-row p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 13px;
}

.selected-box p {
  max-height: 80px;
  overflow-y: auto;
}

.loading {
  color: #2b5aed;
  font-size: 12px;
  font-weight: 400;
}

.meta-row {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 8px;
  align-items: start;
  font-size: 13px;
}

.meta-row span {
  color: #64748b;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-row span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #e0ecff;
  color: #1d4ed8;
  font-size: 12px;
}

.writer-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
</style>
