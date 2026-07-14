<template>
  <div class="login" :style="{height: pageHeight + 'px'}">
    <yk-space dir="vertical" :size="48" class="login__main" align="center">
      <yk-space dir="vertical" align="center">
        <img class="logo" src="@/assets/logo.png" alt="">
        <span class="name">欢迎来到张张博客后台</span>
      </yk-space>
      <yk-space dir="vertical">
        <yk-input v-model="user.name" placeholder="请输入用户名" style="width: 320px;" size="xl"></yk-input>
        <yk-input v-model="user.psw" placeholder="请输入密码" style="width: 320px;" size="xl"></yk-input> 
      </yk-space>
      <yk-button long size="xl" @click="submit">登录</yk-button>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginApi } from '../api'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { YkMessage } from '@yike-design/ui'
import type { ApiResponse, LoginRequest, LoginUser } from '../api/types'

const userStore = useUserStore()

const router = useRouter()  

const pageHeight = ref(window.innerHeight)

// 用户
const user = ref({
  name: '',
  psw: '',
})
// 提交
const submit = () => {
  if(user.value.name && user.value.psw){
    const data: LoginRequest = {
      name:user.value.name,
      psw:user.value.psw,
    }
    console.log('登录请求数据：', data)
    loginApi(data).then((res: ApiResponse<LoginUser>)=>{
      console.log('登录响应：', res)
      if(res && res.code == 200 && res.data){
        console.log('登录成功，数据：', res.data)
        // 保存用户信息到store
        userStore.setUser(res.data)
        console.log('登录成功，数据：', userStore)
        console.log(userStore.name);
        
        // 保存到localStorage
        const redirect = typeof router.currentRoute.value.query.redirect === 'string'
          ? router.currentRoute.value.query.redirect
          : '/'
        router.push(redirect)
      }else if(res && res.code == 401){
        // 用户不存在，跳转到注册页面
        YkMessage({message: '用户不存在，请先注册',type: 'error',})
        router.push('/register')
      }else if(res && res.code == 400){
        // 密码错误
        YkMessage({message: '密码错误',type: 'error',})
      }else{
        console.log('登录响应格式错误：', res)
        YkMessage({message: '登录失败，请稍后重试',type: 'error',})
      }
    }).catch((error: unknown)=>{
      console.log('登录错误：', error)
      YkMessage({message: '网络错误，请检查网络连接',type: 'error',})
    })
  }else{
    YkMessage({message: '输入不完整',type: 'warning',})
  }
}
</script>

<style lang="less" scoped>
.login{
  z-index:10;
  position: fixed;
  top:0;
  left:0;
  background: @bg-color-m;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &__main{
    padding: 48px;
    background: @bg-color-l;
    border-radius: @radius-l;
    .name{
      font-size:20px;
      font-weight: 600;
    }
    .logo{
      width: 84px;
    }
  }
}
</style>
