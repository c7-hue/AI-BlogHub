<template>
  <aside class="article-version-panel">
    <header class="version-header">
      <div>
        <h3>版本历史</h3>
        <p>{{ statusText }}</p>
      </div>
      <button class="primary" @click="saveManual">保存快照</button>
    </header>

    <section class="version-list" v-if="versions.length">
      <article v-for="item in versions" :key="item.id" class="version-item">
        <div class="version-info">
          <strong>{{ item.title || '未命名文章' }}</strong>
          <span>{{ formatTime(item.createdAt) }} · {{ item.source === 'auto' ? '自动保存' : '手动快照' }}</span>
        </div>
        <div class="version-actions">
          <button @click="restoreVersion(item)">恢复</button>
          <button @click="deleteVersion(item.id)">删除</button>
        </div>
      </article>
    </section>

    <div v-else class="empty-state">还没有保存版本</div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  addArticleVersion,
  parseVersionHistory,
  type ArticleVersion,
  type ArticleVersionSnapshot,
} from '@/utils/versionHistory'

export type { ArticleVersionSnapshot } from '@/utils/versionHistory'

const props = defineProps<{
  storageKey: string
  getSnapshot: () => ArticleVersionSnapshot
}>()

const emits = defineEmits<{
  (event: 'restore', snapshot: ArticleVersionSnapshot): void
}>()

const versions = ref<ArticleVersion[]>([])
const lastSavedAt = ref<number | null>(null)
let timer: number | undefined

const statusText = computed(() => {
  if (!lastSavedAt.value) return '每 30 秒自动保存一次'
  return `上次保存 ${formatTime(lastSavedAt.value)}`
})

const readVersions = () => {
  try {
    const raw = localStorage.getItem(props.storageKey)
    versions.value = parseVersionHistory(raw)
  } catch (error) {
    versions.value = []
  }
}

const persistVersions = () => {
  localStorage.setItem(props.storageKey, JSON.stringify(versions.value.slice(0, 20)))
}

const saveVersion = (source: 'auto' | 'manual') => {
  const snapshot = props.getSnapshot()
  const nextVersions = addArticleVersion(versions.value, snapshot, source)
  if (nextVersions === versions.value) return

  versions.value = nextVersions
  lastSavedAt.value = nextVersions[0]?.createdAt || null
  persistVersions()
}

const saveManual = () => {
  saveVersion('manual')
}

const saveDraft = () => {
  saveVersion('auto')
}

const saveWhenHidden = () => {
  if (document.visibilityState === 'hidden') saveDraft()
}

const restoreVersion = (version: ArticleVersion) => {
  emits('restore', {
    title: version.title,
    introduce: version.introduce,
    label: version.label,
    subset_id: version.subset_id,
    cover: version.cover,
    content: version.content,
  })
}

const deleteVersion = (id: string) => {
  versions.value = versions.value.filter((item) => item.id !== id)
  persistVersions()
}

const formatTime = (time: number) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  readVersions()
  timer = window.setInterval(() => saveVersion('auto'), 30000)
  window.addEventListener('beforeunload', saveDraft)
  document.addEventListener('visibilitychange', saveWhenHidden)
})

onBeforeUnmount(() => {
  saveDraft()
  if (timer) window.clearInterval(timer)
  window.removeEventListener('beforeunload', saveDraft)
  document.removeEventListener('visibilitychange', saveWhenHidden)
})

defineExpose({
  saveManual,
  saveDraft,
})
</script>

<style scoped>
.article-version-panel {
  width: 320px;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.version-header h3 {
  margin: 0;
  font-size: 17px;
  color: #111827;
}

.version-header p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
}

button {
  height: 30px;
  border: none;
  border-radius: 7px;
  padding: 0 10px;
  background: #f1f5f9;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
}

button:hover {
  background: #e2e8f0;
}

button.primary {
  background: #2b5aed;
  color: #fff;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.version-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
}

.version-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #111827;
  font-size: 13px;
}

.version-info span {
  color: #64748b;
  font-size: 12px;
}

.version-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 96px;
  border-radius: 8px;
  color: #94a3b8;
  background: #f8fafc;
  font-size: 13px;
}
</style>
