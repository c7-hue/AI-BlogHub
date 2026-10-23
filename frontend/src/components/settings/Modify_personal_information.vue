<template>
  <yk-modal v-model="visible" title="修改个人资料" size="s">
    <yk-space dir="vertical" size="l" align="stretch" class="modify-info">
      <!-- 头像 -->
      <div class="modify-info__avatar">
        <label class="modify-info__avatar__box">
          <input
            ref="fileRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="chooseAvatar"
          />
          <yk-avatar v-if="avatarUrl" :img-url="avatarUrl" size="80"></yk-avatar>
          <div v-else class="modify-info__avatar__empty">
            <yk-text type="third">点击上传</yk-text>
          </div>
        </label>
        <yk-text type="third">点击头像选择图片，裁剪后上传，不超过 2M</yk-text>
      </div>

      <!-- 头像裁剪弹窗 -->
      <AvatarCropper ref="cropperRef" @cropped="onCropped"/>

      <!-- 昵称 -->
      <div class="modify-info__field">
        <yk-text>昵称</yk-text>
        <yk-input v-model="nickname" placeholder="请输入昵称" :limit="20" show-counter></yk-input>
      </div>

      <!-- 邮箱 -->
      <div class="modify-info__field">
        <yk-text>邮箱</yk-text>
        <yk-input v-model="email" placeholder="请输入邮箱"></yk-input>
      </div>
    </yk-space>

    <template #footer>
      <yk-space>
        <yk-button @click="visible = false">取消</yk-button>
        <yk-button type="primary" :loading="saving" @click="save">保存</yk-button>
      </yk-space>
    </template>
  </yk-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { YkMessage } from '@yike-design/ui'
import { baseUrl } from '@/utils/env'
import { getUserInfoApi, updateUserInfoApi } from '@/api/index'
import { useCode } from '@/hooks/code'
import { useUserStore } from '@/store/user'
import AvatarCropper from './AvatarCropper.vue'

const emit = defineEmits(['updated'])
const { tackleCode } = useCode()
const userStore = useUserStore()

const visible = ref(false)
const saving = ref(false)
const fileRef = ref<HTMLInputElement>()
const cropperRef = ref<InstanceType<typeof AvatarCropper>>()

// 表单数据
const nickname = ref('')
const email = ref('')
const avatar = ref('') // 存在数据库里的文件名
const avatarUrl = ref('') // 展示用的完整地址

// 打开弹窗：拉取当前资料
const open = async () => {
  visible.value = true
  await getUserInfoApi({ token: userStore.token }).then((res: any) => {
    if (tackleCode(res.code)) {
      nickname.value = res.data.nickname
      email.value = res.data.email
      avatar.value = res.data.avatar
      avatarUrl.value = res.data.avatar ? `${baseUrl}/files/${res.data.avatar}` : ''
    }
  })
}

// 选择头像：先打开裁剪弹窗
const chooseAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    YkMessage({ type: 'error', message: '头像不能超过 2M' })
    return
  }
  cropperRef.value?.open(file)
}

// 裁剪并上传成功后更新头像
const onCropped = (fileName: string) => {
  avatar.value = fileName
  avatarUrl.value = `${baseUrl}/files/${fileName}`
}

// 保存
const save = () => {
  if (email.value && !/^[\w.-]+@[\w-]+(\.[\w-]+)+$/.test(email.value)) {
    YkMessage({ type: 'error', message: '邮箱格式不正确' })
    return
  }
  saving.value = true
  updateUserInfoApi({
    token: userStore.token,
    nickname: nickname.value,
    email: email.value,
    avatar: avatar.value,
  }).then((res: any) => {
    saving.value = false
    if (tackleCode(res.code)) {
      YkMessage({ type: 'primary', message: '修改成功' })
      visible.value = false
      // 同步到本地存储（头像/昵称，登录账号不变）
      userStore.setUser({
        id: res.data.id,
        name: res.data.name,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
      })
      emit('updated', res.data)
    }
  }).catch(() => {
    saving.value = false
  })
}

defineExpose({ open })
</script>

<style lang="less" scoped>
.modify-info {
  width: 100%;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    &__box {
      cursor: pointer;

      .yk-avatar {
        display: block;
      }
    }

    &__empty {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px dashed @font-color-l;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        border-color: @pcolor;
      }
    }
  }
}
</style>
