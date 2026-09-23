<template>
  <div class="data-card comment">
    <div class="data-card__title">
      <p class="data-card__title-name">评论 {{ count }}</p>
    </div>
    <yk-scrollbar ref="scrollbar" :height="height" class="comment__scrollbar">
      <yk-space dir="vertical">
        <reply v-for="item in comments" :key="item.id" :content="item" @delete="deleteComment" isComment @isread="changeIsread" />  

      </yk-space>
    </yk-scrollbar>
    <div class="comment__pagintion">
      <yk-pagination :total="count" size="m" @change="changePage" :page-size="props.pageSize" :current-page="request.nowPage"></yk-pagination>  
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref ,getCurrentInstance } from 'vue'
import Reply from './reply.vue'
// import { comment } from '../../mock/data'
import type { CommentProps } from './reply'
import { commentApi,commentIsreadApi,deleteCommentApi } from '../../api/index'
import { useUserStore } from '../../store/user'
import { useCode } from '../../hooks/code'

const userStore = useUserStore()
const {tackleCode} = useCode()


const proxy:any=getCurrentInstance()?.proxy;//获取当前实例的代理对象

const props = withDefaults(defineProps<CommentProps>(),{
  pageSize:4,//单页条数
  height:"650px",
})
//总数
const count = ref<number>(123)
// 数据内容
interface CommentItem {
  id: number;
  isread: number;
  [key: string]: any;
}
const comments=ref<CommentItem[]>([]);

// 请求
type Request={
  token?:string;
  pageSize:number;//单页条数
  nowPage:number;//当前页
  count?:boolean;
}

const request:Request={
  pageSize:props.pageSize,
  nowPage:1,//当前页
  token:userStore.token,
}

// 获取数据
const drawCommentData = (e:boolean) => {
  request.count=e;
  commentApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      if(res.data.count != -1){
        // 使用后端返回的实际评论总数
        count.value=res.data.count;
      }
      comments.value=res.data.result || [];
    }
  }).catch((error:any)=>{
    console.error('获取评论数据失败:', error);
    comments.value=[];
    // API请求失败时，设置count为0
    count.value=0;
  })
}

// 翻页
const changePage=(e:number)=>{
  request.nowPage=e;
  drawCommentData(false);
}

// 已读
const changeIsread = (e:number)=>{
  let   request = {
    token :userStore.token,
    id:e,
  }
  commentIsreadApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      // 处理前端的已读
      for(let i = 0;i<comments.value.length;i++){
        const item = comments.value[i];
        if(item && item.id == e){
          item.isread = 1;
        }
      }

    }
  }).catch((error:any)=>{
    console.error('标记已读失败:', error);
  })
}

// 删除评论
const deleteComment = (e: number) => {
  let request = {
    token :userStore.token,
    id:e,
  }
  deleteCommentApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      comments.value = comments.value.filter((obj:any)=>{
        return obj.id!==e
      })
      // 删除成功后，减少评论总数
      if(count.value > 0) {
        count.value--;
      }
      proxy.$message({type:'primary','message':'删除成功'});
    }
  })
}

onMounted(()=>{
  drawCommentData(true);
})

</script>

<style lang="less" scoped>
.comment{
  position: relative;
  padding:@space-xl 0 64px;

  .data-card__title-name{
    padding:0 @space-xl;
  }

  &__scrollbar {
    :deep(.yk-scrollbar__content) {
      box-sizing: border-box;
      padding: 12px 24px 0;
    }
  }

  &__pagintion{
    padding:@space-l @space-xl;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid @line-color-s;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }
}
</style>
