<template>
  <yk-modal v-model="visible" title="裁剪头像" size="m">
    <div class="avatar-cropper">
      <!-- 裁剪画布：拖动移动、滚轮缩放 -->
      <div
        class="avatar-cropper__stage"
        @mousedown.prevent="onMouseDown"
        @mousemove.prevent="onMouseMove"
        @mouseup.prevent="onMouseUp"
        @mouseleave.prevent="onMouseUp"
        @wheel.prevent="onWheel"
      >
        <canvas ref="canvasRef" width="320" height="320"></canvas>
      </div>

      <!-- 操作条：缩放 + 旋转 -->
      <yk-space class="avatar-cropper__ops" justify="between" style="width: 100%">
        <yk-space align="center" size="s">
          <IconMinusOutline class="avatar-cropper__op-icon" @click="zoomBy(-5)" />
          <!-- yk-slider 非区间模式下不正确支持非零 min（手柄位置会溢出），故滑杆用 0~50 区间，内部映射回 50~100 -->
          <yk-slider v-model="sliderValue" class="avatar-cropper__slider" :min="0" :max="50"></yk-slider>
          <IconPlusOutline class="avatar-cropper__op-icon" @click="zoomBy(5)" />
        </yk-space>
        <yk-space align="center" size="s">
          <IconRotateLeftOutline class="avatar-cropper__op-icon" @click="rotateBy(-90)" />
          <IconRotateRightOutline class="avatar-cropper__op-icon" @click="rotateBy(90)" />
        </yk-space>
      </yk-space>
      <yk-text type="third" class="avatar-cropper__tip">拖动图片调整位置，滚轮或滑杆调整大小，确定后裁剪为圆形头像</yk-text>
    </div>

    <template #footer>
      <yk-space>
        <yk-button @click="visible = false">取消</yk-button>
        <yk-button type="primary" :loading="uploading" @click="confirm">确定</yk-button>
      </yk-space>
    </template>
  </yk-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { YkMessage } from '@yike-design/ui'
import {
  IconMinusOutline,
  IconPlusOutline,
  IconRotateLeftOutline,
  IconRotateRightOutline,
} from '@yike-design/ui/es/components/svg-icon'
import { uploadFileApi } from '@/api/index'
import { useCode } from '@/hooks/code'

const emit = defineEmits(['cropped'])
const { tackleCode } = useCode()

const visible = ref(false)
const uploading = ref(false)
const canvasRef = ref<HTMLCanvasElement>()

// 图片状态：位置 / 缩放 / 旋转
const offsetX = ref(0) // 图片中心相对画布中心的偏移
const offsetY = ref(0)
const scalePercent = ref(50)
// 滑杆值与实际缩放双向映射：滑杆 0~50 ↔ 缩放 50~100
const sliderValue = computed({
  get: () => scalePercent.value - 50,
  set: (v) => {
    scalePercent.value = v + 50
  },
})
const rotation = ref(0) // 角度
let scaleFactor = 1 // 基础缩放（图片适配画布）
let img: HTMLImageElement | null = null

const CROP = 240 // 裁剪框边长（正方形，比 320 画布小一圈）
const CANVAS = 320

// 拖动状态
const dragging = {
  on: false,
  startX: 0,
  startY: 0,
  fromX: 0,
  fromY: 0,
}

// 打开弹窗并载入图片
const open = (file: File) => {
  const url = URL.createObjectURL(file)
  const image = new Image()
  img = image // 同步模块级引用，供 redraw / confirm 使用
  image.onload = () => {
    // 基础缩放：滑杆 50% 时图片短边刚好盖住裁剪框（可缩到 0.2 倍，放到 2 倍）
    scaleFactor = 2 * Math.max(CROP / image.width, CROP / image.height)
    offsetX.value = 0
    offsetY.value = 0
    rotation.value = 0
    scalePercent.value = 50
    visible.value = true
    nextTick(() => {
      redraw()
      // yk-slider 在挂载时测量轨道宽度，弹窗隐藏时测到 0，点击轨道会算出 NaN。
      // 弹窗打开后派发 resize 让 slider 重新测量
      window.dispatchEvent(new Event('resize'))
    })
    URL.revokeObjectURL(url)
  }
  image.onerror = () => {
    YkMessage({ type: 'error', message: '图片加载失败' })
    URL.revokeObjectURL(url)
  }
  image.src = url
}

// 缩放值变化时自动重绘（滑杆点击/拖动、按钮、滚轮都覆盖）
watch(scalePercent, () => {
  if (!Number.isFinite(scalePercent.value)) scalePercent.value = 50 // NaN 兜底
  clampOffset()
  redraw()
})

// 限制偏移量，保证圆形裁剪框始终在图片边界内
const clampOffset = () => {
  if (!img) return
  const scale = scaleFactor * (scalePercent.value / 100)
  const w = img.width * scale
  const h = img.height * scale
  // 旋转为 90° 步进：奇数倍时宽高互换
  const deg = Math.abs(rotation.value % 180)
  const halfW = (deg === 90 ? h : w) / 2
  const halfH = (deg === 90 ? w : h) / 2
  const maxX = Math.max(0, halfW - CROP / 2)
  const maxY = Math.max(0, halfH - CROP / 2)
  offsetX.value = Math.min(maxX, Math.max(-maxX, offsetX.value))
  offsetY.value = Math.min(maxY, Math.max(-maxY, offsetY.value))
}

// 重绘画布：图片 + 遮罩 + 裁剪框
const redraw = () => {
  const canvas = canvasRef.value
  if (!canvas || !img) return
  const ctx = canvas.getContext('2d')!
  const scale = scaleFactor * (scalePercent.value / 100)
  const cx = CANVAS / 2 + offsetX.value
  const cy = CANVAS / 2 + offsetY.value
  const w = img.width * scale
  const h = img.height * scale

  ctx.clearRect(0, 0, CANVAS, CANVAS)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()

  // 半透明遮罩（圆形镂空）+ 圆形裁剪框
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.rect(0, 0, CANVAS, CANVAS)
  ctx.arc(CANVAS / 2, CANVAS / 2, CROP / 2, 0, Math.PI * 2, true) // 反向圆，形成镂空
  ctx.fill('evenodd')
  ctx.restore()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(CANVAS / 2, CANVAS / 2, CROP / 2, 0, Math.PI * 2)
  ctx.stroke()
}

// 拖动
const onMouseDown = (e: MouseEvent) => {
  dragging.on = true
  dragging.startX = e.clientX
  dragging.startY = e.clientY
  dragging.fromX = offsetX.value
  dragging.fromY = offsetY.value
}
const onMouseMove = (e: MouseEvent) => {
  if (!dragging.on) return
  offsetX.value = dragging.fromX + (e.clientX - dragging.startX)
  offsetY.value = dragging.fromY + (e.clientY - dragging.startY)
  clampOffset()
  redraw()
}
const onMouseUp = () => {
  dragging.on = false
}

// 滚轮缩放（步进 3%）
const onWheel = (e: WheelEvent) => {
  zoomBy(e.deltaY < 0 ? 3 : -3)
}

const zoomBy = (delta: number) => {
  // 最小 50%：刚好盖住裁剪框，保证裁剪框始终在图片内
  const next = Math.min(100, Math.max(50, scalePercent.value + delta))
  if (Number.isFinite(next)) scalePercent.value = next
}

const rotateBy = (delta: number) => {
  // 90° 步进旋转，累计到 ±360 后归零，避免多次旋转后数值越积越大
  rotation.value += delta
  if (rotation.value >= 360 || rotation.value <= -360) rotation.value = 0
  clampOffset()
  redraw()
}

// 确认：从原图按当前变换裁出圆形头像，直接上传
const confirm = () => {
  if (!img) return
  // 输出图取 480×480（2 倍裁剪框，清晰一些）
  const OUT = 480
  const out = document.createElement('canvas')
  out.width = OUT
  out.height = OUT
  const ctx = out.getContext('2d')!
  // 只保留圆形区域（其余透明）
  ctx.save()
  ctx.beginPath()
  ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
  ctx.clip()
  const scale = scaleFactor * (scalePercent.value / 100) * (OUT / CROP)
  ctx.translate(OUT / 2 + offsetX.value * (OUT / CROP), OUT / 2 + offsetY.value * (OUT / CROP))
  ctx.rotate((rotation.value * Math.PI) / 180)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()

  out.toBlob(
    (blob) => {
      if (!blob) return
      const fileName = `avatar_${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', file)
      uploading.value = true
      uploadFileApi(formData).then((res: any) => {
        uploading.value = false
        if (tackleCode(res.code)) {
          visible.value = false
          emit('cropped', res.data.url)
        }
      }).catch(() => {
        uploading.value = false
      })
    },
    'image/png'
  )
}

defineExpose({ open })
</script>

<style lang="less" scoped>
.avatar-cropper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &__stage {
    cursor: move;
    border-radius: @radius-m;
    overflow: hidden;
    user-select: none;
  }

  &__ops {
    width: 100%;
  }

  &__slider {
    width: 160px;
  }

  &__op-icon {
    font-size: 18px;
    cursor: pointer;
    color: @font-color-m;

    &:hover {
      color: @pcolor;
    }
  }

  &__tip {
    text-align: center;
  }
}
</style>
