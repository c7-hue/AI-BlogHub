<template>
    <yk-title :level="3">用户设置</yk-title>
    <yk-space size="l" style="width: 100%;">  <!--//dir="vertical" 垂直方向排列  -->
      <!-- 左边部分 -->
       <yk-space class="user-settings">
        <yk-space class="user-settings__info">
            <yk-avatar v-if="avatarUrl" :img-url="avatarUrl" size="100" style="margin:20px"></yk-avatar>
            <yk-image v-else src="https://www.huohuo90.com:3005/logo/yike.png" style="margin:20px" width="100"height="100":is-lazy="true"></yk-image>
           <yk-space dir="vertical" size="0">
             <yk-title :level="4" size="0">{{ nickname || userStore.name || '未设置昵称' }}</yk-title>
              <yk-text type="third">{{ email || '未设置邮箱' }}</yk-text>
              <yk-text style="padding-top: 10px;">特征码</yk-text>
              <yk-space size="0" class="user-settings__code">
                <yk-text :strong="true" type="primary" style="font-size: 22px;">{{ changeCode }}</yk-text>
                <yk-popconfirm
                    title="修改特征码" placement="bottom" :arrow="false" @cancel="cancel" @confirm="confirm"
                  >
                   <template #content>
                      <div style="margin: 8px 4px 16px;"> <!--上  左右  下  -->
                      <yk-input show-counter :limit="16" placeholder="请输入..." style="width: 208px"  v-model="changeCode"/>
                      </div>
                  </template>
                   <IconModifyOutline class="user-settings__code__icon" />
                </yk-popconfirm>
              </yk-space>
           </yk-space>
        </yk-space>
        <yk-space class="user-settings__btn">
            <yk-button type="secondary" @click="showModify">修改个人资料</yk-button>
            <yk-button>进入微博</yk-button>
        </yk-space>
       </yk-space>

       <!-- 右边部分 -->
       <yk-space class="user-settings__right" dir="vertical">
          <yk-space class="user-settings__right__progress" dir="vertical" >
            <yk-space dir="vertical">
              <yk-space dir="horizontal" align="center" justify="between" style="width: 100%;">
                <yk-text type="third">图片空间</yk-text>
                <yk-text :strong="true">已用/24M</yk-text>
              </yk-space>
              <yk-progress :showText="false"></yk-progress>
            </yk-space>

            <yk-space dir="vertical">
              <yk-space dir="horizontal" align="center" justify="between" style="width: 100%;">
                <yk-text type="third">发布文章空间</yk-text>
                <yk-text :strong="true">已用/24篇</yk-text>
              </yk-space>
              <yk-progress :showText="false"></yk-progress>
            </yk-space>

          </yk-space>
          <yk-button style="position: absolute;bottom: 5px; right: 10px;"size="s">空间扩容</yk-button>
       </yk-space>

    </yk-space>
    <!-- 修改个人资料弹窗 -->
    <ModifyPersonalInformation ref="modifyRef" @updated="onUpdated"/>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue'
import { baseUrl } from '@/utils/env'
import { getUserInfoApi } from '@/api/index'
import { useUserStore } from '@/store/user'
import { useCode } from '@/hooks/code'
import ModifyPersonalInformation from './Modify_personal_information.vue'

const userStore = useUserStore()
const { tackleCode } = useCode()

const changeCode = ref('111111111')  // 新增：存储特征码

const email = ref('')
const avatarUrl = ref('')
const nickname = ref('')
const modifyRef = ref<InstanceType<typeof ModifyPersonalInformation>>()

const proxy: any = getCurrentInstance()?.proxy

function cancel() {
}
function confirm() {
  proxy.$message({ type: 'primary', message: '修改成功' })
}

// 打开修改资料弹窗
const showModify = () => {
  modifyRef.value?.open()
}

// 弹窗保存成功后刷新展示
const onUpdated = (data: { nickname: string; avatar: string; email: string }) => {
  email.value = data.email
  nickname.value = data.nickname
  avatarUrl.value = data.avatar ? `${baseUrl}/files/${data.avatar}` : ''
}

// 初始化拉取资料
const loadInfo = () => {
  getUserInfoApi({ token: userStore.token }).then((res: any) => {
    if (tackleCode(res.code)) {
      email.value = res.data.email
      nickname.value = res.data.nickname
      avatarUrl.value = res.data.avatar ? `${baseUrl}/files/${res.data.avatar}` : ''
    }
  })
}

onMounted(loadInfo)
</script>

<style lang="less" scoped>
.user-settings{
  background-color: white;
  width: 50%;
  height: 150px;
  display: flex;
  justify-content: left;
  align-items: center;
  &__info{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
  } 
  &__code{
    display: flex;
    justify-content: center;
    align-items: center;
    &__icon{
      margin-left: 8px;
      cursor: pointer;
      &:hover{
        color: #2B5AED;
      }
    }
  }
  
  
  &__btn{
    position: absolute;
     top: 20px; 
     right: 20px;
  }
}
.user-settings__right{
 background-color: white;
  width: 50%;
  height: 150px;
  display: flex;
  justify-content: left;
  align-items: center;
  &__progress{
    // display: flex;
    // justify-content: flex-start;// 水平方向对齐
    // align-items: flex-start;  // 垂直方向对齐
    
    position: absolute;
     top: 20px; 
     left: 20px;
    width: 100%; 
  } 
}
</style>
