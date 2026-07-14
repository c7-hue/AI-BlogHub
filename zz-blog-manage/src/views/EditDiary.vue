<template>
  <div class="edit-diary">
    <div class="edit-diary__topbar">
      <div>
        <p class="edit-diary__eyebrow">Diary</p>
        <p class="edit-diary__topbar__title">新建日记</p>
      </div>
      <yk-space>
        <yk-button type="secondary" @click="cancel">取消</yk-button>
        <yk-button type="primary" @click="publishDiary">发布</yk-button>
      </yk-space>
    </div>

    <div class="edit-diary__content">
      <main class="edit-diary__main">
        <section class="diary-paper">
          <div class="paper-date">
            <span>{{ today.month }}</span>
            <strong>{{ today.day }}</strong>
          </div>

          <input
            class="diary-title"
            placeholder="给今天起一个标题"
            v-model="diaryForm.title"
          />

          <textarea
            class="diary-content"
            placeholder="写下今天发生的小事、情绪、灵感，或者一段想保存下来的生活片段..."
            v-model="diaryForm.content"
          />

          <div class="image-zone">
            <div>
              <p>添加今日照片</p>
              <span>记录风景、美食、猫猫或者任何值得留下的瞬间</span>
            </div>
            <yk-upload
              :upload-url="uploadUrl"
              :file-list="fileList"
              accept="image/*"
              @handle-success="handleSuccess"
              @handle-delete="deletePhoto"
            >
              <yk-button type="secondary">上传图片</yk-button>
            </yk-upload>
          </div>
        </section>
      </main>

      <aside class="edit-diary__sidebar">
        <section class="setting-card">
          <div class="card-title">
            <p>发布设置</p>
            <span>补充这篇日记的状态</span>
          </div>

          <label class="field-block">
            <span>日期</span>
            <input type="date" v-model="diaryForm.date" />
          </label>

          <div class="field-block">
            <span>天气</span>
            <div class="weather-grid">
              <button
                v-for="item in weather"
                :key="item.id"
                class="weather-item"
                :class="{ active: diaryForm.weather_id === item.id }"
                @click="diaryForm.weather_id = item.id"
              >
                <img :src="item.icon" :alt="item.name">
                <small>{{ item.name }}</small>
              </button>
            </div>
          </div>

          <div class="field-block">
            <span>心情</span>
            <div class="mood-list">
              <button
                v-for="item in moods"
                :key="item.id"
                :class="{ active: diaryForm.mood === item.id }"
                @click="diaryForm.mood = item.id"
              >
                <strong>{{ item.icon }}</strong>
                <span>{{ item.name }}</span>
              </button>
            </div>
          </div>
        </section>

        <section class="preview-card">
          <p>写作状态</p>
          <div class="stat-row">
            <span>标题</span>
            <strong>{{ diaryForm.title.length || 0 }} 字</strong>
          </div>
          <div class="stat-row">
            <span>正文</span>
            <strong>{{ diaryForm.content.length || 0 }} 字</strong>
          </div>
          <div class="stat-row">
            <span>天气</span>
            <strong>{{ currentWeatherName }}</strong>
          </div>
          <div class="stat-row">
            <span>图片</span>
            <strong>{{ fileList.length }} 张</strong>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { weather } from '../utils/weather'
import { baseUrl } from '../utils/env'
import { createDiaryApi, deleteFileApi } from '../api'
import { useCode } from '../hooks/code'
import { useUserStore } from '../store/user'

const date = new Date()
const pad = (value: number) => String(value).padStart(2, '0')

const diaryForm = reactive({
  title: '',
  content: '',
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  weather_id: 0,
  mood: 0,
})

const router = useRouter()
const userStore = useUserStore()
const proxy: any = getCurrentInstance()?.proxy
const { tackleCode } = useCode()

const uploadUrl = `${baseUrl}/upload`
const fileList = ref<{ id: number; url: string; name: string; status: string; uid: number }[]>([])

const today = computed(() => {
  const selectedDate = diaryForm.date ? new Date(diaryForm.date) : new Date()
  const validDate = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate

  return {
    month: `${validDate.getFullYear()}.${pad(validDate.getMonth() + 1)}`,
    day: pad(validDate.getDate()),
  }
})

const moods = [
  { id: 0, name: '平静', icon: 'Calm' },
  { id: 1, name: '开心', icon: 'Nice' },
  { id: 2, name: '疲惫', icon: 'Tired' },
  { id: 3, name: '期待', icon: 'Hope' },
]

const currentWeatherName = computed(() => {
  return weather.find((item) => item.id === diaryForm.weather_id)?.name || '未选择'
})

const handleSuccess = (res: any) => {
  if (!tackleCode(res.code)) return

  const file = {
    id: res.data.id,
    url: res.data.url,
    name: res.data.file_name || res.data.url,
    status: 'success',
    uid: Date.now(),
  }
  fileList.value.push(file)
}

const deletePhoto = (value: any) => {
  const index = Array.isArray(value) ? value[0] : value
  const file = fileList.value[index]
  if (!file) return

  deleteFileApi({
    token: userStore.token,
    filesId: file.id,
  })
  fileList.value.splice(index, 1)
}

const resetDiary = () => {
  diaryForm.title = ''
  diaryForm.content = ''
  diaryForm.date = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  diaryForm.weather_id = 0
  diaryForm.mood = 0
  fileList.value = []
}

const cancel = () => {
  resetDiary()
  router.back()
}

const publishDiary = () => {
  if (!diaryForm.title.trim()) {
    proxy?.$message?.({ type: 'warning', message: '请输入日记标题' })
    return
  }

  if (!diaryForm.content.trim()) {
    proxy?.$message?.({ type: 'warning', message: '请输入日记内容' })
    return
  }

  const picture = fileList.value
    .map((file) => JSON.stringify({
      id: file.id,
      url: file.url,
      name: file.name,
      status: file.status,
      uid: file.uid,
    }))
    .join(' ')

  const selectedDate = new Date(`${diaryForm.date} 12:00:00`)
  const request = {
    token: userStore.token,
    value: {
      title: diaryForm.title,
      content: diaryForm.content,
      picture,
      weather_id: diaryForm.weather_id,
      mood: diaryForm.mood,
      moment: Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate,
    },
  }

  createDiaryApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      proxy?.$message?.({ type: 'primary', message: '发布成功' })
      resetDiary()
      router.push('/diary')
    }
  })
}
</script>

<style lang="less" scoped>
.edit-diary {
  min-height: calc(100vh - 72px);
  padding: @space-xl 80px 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(247, 249, 252, 0.94)),
    radial-gradient(circle at 12% 8%, rgba(43, 90, 237, 0.08), transparent 32%);

  &__topbar {
    width: min(1540px, calc(100vw - 160px));
    box-sizing: border-box;
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: @space-l @space-xl;
    margin-bottom: @space-l;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);

    &__title {
      .font-xl();
      font-weight: 700;
      margin: 2px 0 0;
    }
  }

  &__eyebrow {
    margin: 0;
    color: @pcolor;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__content {
    width: min(1540px, calc(100vw - 160px));
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: @space-l;
    align-items: stretch;
  }
}

.edit-diary__main {
  min-height: 0;
}

.diary-paper,
.setting-card,
.preview-card {
  border-radius: @radius-m;
  background: @bg-color-l;
  box-shadow: 0 16px 46px rgba(15, 23, 42, 0.07);
}

.diary-paper {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  min-height: 640px;
  padding: 44px 52px 36px 132px;
  display: flex;
  flex-direction: column;
}

.paper-date {
  position: absolute;
  top: 44px;
  left: 40px;
  width: 64px;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  border: 1px solid @line-color-s;

  span {
    display: block;
    padding: 7px 0;
    background: @pcolor;
    color: @white;
    font-size: 12px;
  }

  strong {
    display: block;
    padding: 12px 0;
    font-size: 28px;
    color: @font-color-l;
    background: #fff;
  }
}

.diary-title,
.diary-content,
.field-block input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
}

.diary-title {
  padding: 6px 0 20px;
  border-bottom: 1px solid @line-color-s;
  color: @font-color-l;
  font-size: 30px;
  font-weight: 700;

  &::placeholder {
    color: @gray-4;
  }
}

.diary-content {
  flex: 1;
  min-height: 390px;
  resize: vertical;
  margin-top: 24px;
  color: @font-color-l;
  font-size: 16px;
  line-height: 1.9;

  &::placeholder {
    color: @gray-4;
  }
}

.image-zone {
  flex: none;
  margin-top: 24px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;

  p {
    margin: 0 0 4px;
    font-weight: 700;
    color: @font-color-l;
  }

  span {
    color: @font-color-s;
    font-size: 13px;
  }
}

.edit-diary__sidebar {
  display: flex;
  flex-direction: column;
  gap: @space-l;
}

.setting-card,
.preview-card {
  padding: @space-xl;
}

.card-title {
  margin-bottom: @space-l;

  p {
    margin: 0;
    .font-l();
    font-weight: 700;
  }

  span {
    display: block;
    margin-top: 4px;
    color: @font-color-s;
    font-size: 13px;
  }
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: @space-l;

  > span {
    color: @font-color-l;
    font-weight: 700;
  }

  input {
    height: 42px;
    padding: 0 12px;
    border-radius: 8px;
    background: #f3f6fb;
    color: @font-color-l;
  }
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.weather-item,
.mood-list button {
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f3f6fb;
  color: @font-color-l;
  cursor: pointer;
  transition: all @animatb;
}

.weather-item {
  height: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;

  img {
    width: 22px;
    height: 22px;
  }

  small {
    font-size: 12px;
  }

  &.active {
    border-color: @pcolor;
    background: rgba(43, 90, 237, 0.08);
  }
}

.mood-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  button {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    strong {
      font-size: 12px;
      color: @pcolor;
    }

    &.active {
      border-color: @pcolor;
      background: rgba(43, 90, 237, 0.08);
      font-weight: 700;
    }
  }
}

.preview-card {
  p {
    margin: 0 0 @space-m;
    font-weight: 700;
    color: @font-color-l;
  }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid @line-color-s;
  color: @font-color-s;

  strong {
    color: @font-color-l;
  }
}

@media (max-width: 1200px) {
  .edit-diary {
    padding-left: @space-xl;
    padding-right: @space-xl;

    &__topbar,
    &__content {
      width: 100%;
    }

    &__content {
      grid-template-columns: 1fr;
    }
  }

  .diary-paper {
    padding-left: 112px;
  }
}
</style>
