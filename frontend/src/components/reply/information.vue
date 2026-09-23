<template>
    <yk-drawer placement="right" :show="active" @close="closes" :title="'私信'+count">
    <yk-space dir="vertical">
        <reply v-for="item in messages" :key="item.id" :content="item" @delete="deleteMessage" :isComment="false"/> 
      </yk-space>
    <template #footer>
      <yk-pagination :total="count" simple @change="changePage" :page-size="props.pageSize" :current-page="request.nowPage"></yk-pagination>
    </template>
  </yk-drawer>
</template>

<script setup lang="ts">
import {ref,toRefs} from 'vue'
import type {InformationProps} from './reply'
import { onMounted,getCurrentInstance } from 'vue';
import { messageApi, deleteMessageApi } from '../../api/index'
import { useUserStore } from '../../store/user'
import { useCode } from '../../hooks/code'

const userStore = useUserStore()

const {tackleCode} = useCode()

const proxy: any =getCurrentInstance()?.proxy

const props = withDefaults(defineProps<InformationProps>(),{
  active:false,
  pageSize:8,
})

const emitd= defineEmits(['close'])

const {active} = toRefs(props)
const closes=()=>{
  emitd('close',false)
}

//总数
const count = ref<number>(123)
// 数据内容
const messages = ref();

// 请求
type Request={
  token?:string;
  pageSize:number;//单页条数
  nowPage:number;//当前页
  count?:boolean;
}

const request:Request={
  pageSize:props.pageSize,
  nowPage:1,
  count:false,
  token:userStore.token,
}

// 获取数据
const drawMessageData = (e:boolean) => {
  request.count=e;
  messageApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      if(e && res.data.count != undefined){
        count.value=res.data.count;
      }
      messages.value=res.data.result;
    }
  })
}

// 翻页
const changePage=(e:number)=>{
  request.nowPage=e;
  drawMessageData(false);
}

// 删除私信 删除后刷新数据  
const deleteMessage = (e: number) => {
  let deleteRequest = {
    token: userStore.token,
    id: e
  };
  deleteMessageApi(deleteRequest).then((res:any)=>{
    if(tackleCode(res.code)){
      messages.value=messages.value.filter((obj:any)=>{
        return obj.id!==e
      });
      if(count.value > 0) {
        count.value--;
      }
      proxy.$message({type:'primary','message':'删除成功'});
    }
  }).catch((error:any)=>{
    console.error('删除私信失败:', error);
    proxy.$message({type:'error','message':'删除失败'});
  })
}

onMounted(()=>{
  drawMessageData(true);
})

</script>

<style lang="less" scoped>

</style>