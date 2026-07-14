<template>
  <div class="head-bar">
    <yk-space align="center" size="12" style="cursor: pointer;" @click="backHome">
      <img src="@/assets/logo.png" alt="logo" class="logo" >
      <span class="name">博客管理系统</span>
    </yk-space>
    <!-- email -->
    <yk-space align="center" size="xl">  
      <yk-badge is-dot :hidden="isread">
      <IconEmailFill style="font-size: 20px;" @click="changeActive(true)"/>
    </yk-badge>
    <!-- 头像 -->
    <yk-avatar img-url="https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png"></yk-avatar>
    <div><yk-theme/></div>
    <yk-button @click="logout">退出</yk-button>
    </yk-space>
    <information :active="active" :page-size="10" @close="changeActive(false)"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import { IconEmailFill } from '@yike-design/ui/es/components/svg-icon';
import {Information} from '../reply/index'
import {isRegisterApi} from '../../api/index'
import {useCode} from '../../hooks/code'
import {useUserStore} from '../../store/user'
import {noreadMessageApi} from '../../api/index'

const userStore = useUserStore()
const router = useRouter();

const active = ref<boolean>(false)

// code验证
const {tackleCode} = useCode()

//返回总览
const backHome=()=>{
  router.push('/')
}

// 展开/关闭私信
const changeActive=(e:boolean)=>{
  active.value=e;
}

const isRegister =()=>{
  let data={
    token:userStore.token,
  }
  isRegisterApi(data).then((res:any)=>{  
    if(tackleCode(res.code)){
      // 已注册
      console.log(res.data);
    }
  })
}

// 获取私信未读数
const isread = ref(false)
const noreadMg =()=>{
  let data={
    token:userStore.token,
  }
  noreadMessageApi(data).then((res:any)=>{  
    if(tackleCode(res.code)){
      if(res.data==0){
        isread.value=true
      }
    }
  })
}

// 退出系统
const logout =()=>{
  userStore.$patch=()=>(
    {
      id:-1,
      name:'',
      token:'',
    } 
  )
  router.push('/login')
}

onMounted(()=>{
  isRegister()
  noreadMg()
})

</script>

<style lang="less" scoped>
.head-bar{
  position: fixed;//元素脱离正常文档流，相对于浏览器窗口固定定位（滚动页面时它不会移动）。
  top: 0;
  left: 0;//固定在窗口的左上角
  width: 100%;
  height: 64px;
  background-color:@bg-color-l;
  z-index: 10;//设置层叠顺序为 10，确保它显示在其他普通内容之上（避免被遮挡）
  display: flex;
  justify-content: space-between;//第一个子元素靠最左边，最后一个子元素靠最右边
  align-items: center;
  padding: 0 @space-xl;
  
  .logo{
    height: 38px;
    width: 38px;
  }
  .name{
    font-size: 20px;
    font-weight: 600;
  }
}

</style>