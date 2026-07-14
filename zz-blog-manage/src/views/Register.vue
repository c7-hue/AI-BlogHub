<template>
  <div class="login" :style="{height: pageHeight + 'px'}">
    <yk-space dir="vertical" :size="48" class="login__main" align="center">
      <yk-space dir="vertical" align="center">
        <img class="logo" src="@/assets/logo.png" alt="">
        <span class="name">欢迎注册张张博客后台</span>
      </yk-space>
      <yk-space dir="vertical">
        <yk-input v-model="user.name" placeholder="请输入用户名" style="width: 320px;" size="xl"></yk-input>
        <yk-input v-model="user.psw" placeholder="密码不能少于4位数" style="width: 320px;" size="xl"></yk-input> 
      </yk-space>
      <yk-button long size="xl" @click="submit">注册</yk-button>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { registerApi } from '../api'
import { useRouter } from 'vue-router'
import { YkMessage } from '@yike-design/ui'

const router = useRouter()

const pageHeight = ref(window.innerHeight)

// 用户
const user = ref({
  name: '',
  psw: '',
})
// 提交
const submit = () => {
  if(user.value.name && user.value.psw && user.value.psw.length>3){
    let data={
      name: user.value.name,
      password: user.value.psw,
    }
    registerApi(data).then((res:any)=>{
      if(res && res.code === 200){
        // 注册成功
        YkMessage({ message: '注册成功',  type: 'success'})
        router.push('/login')
      }else if(res && res.code === 400){
        // 用户已存在
        YkMessage({ message: '用户已存在',  type: 'error'})
      }else{
        YkMessage({ message: '注册失败，请稍后重试',  type: 'error'})
      }
    }).catch(()=>{
      YkMessage({ message: '网络错误，请检查网络连接',  type: 'error'})
    })
  }else{
    YkMessage({ message: '请输入用户名和密码',type: 'warning'})
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
