<template>
  <div class="diary">
    <yk-space dir="vertical" size="xl" style="width: 100%;padding-bottom:24px ;">
       <diaryItemView v-for="item in diaryList" :key="item.id" :data="item" @delete="deleteDiary" :searchTerm="props.searchTerm"></diaryItemView>
    </yk-space>
    <div class="pagination" v-show="count/props.pageSize > 1"> 
      <yk-pagination :total="count" size="m" @change="changePage" :default-page-size="props.pageSize"></yk-pagination>  
    </div>
      <div class="empty" v-show="count==0">
      <yk-empty description="暂无数据" type="secondary"></yk-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {DiaryDate } from '../../utils/interface';
import {ref,onMounted,getCurrentInstance,watch} from 'vue'
import diaryItemView from './diary-item.vue'
import {useCode} from '../../hooks/code'
import {useUserStore} from '../../store/user'
import {diaryApi,deleteDiaryApi} from '../../api/index'  

const userStore = useUserStore()


const {tackleCode}=useCode()

const proxy:any=getCurrentInstance()?.proxy

type DiaryProps={
  pageSize:number,
  searchTerm?:string,
  newDiary?:DiaryDate,
}

const props=withDefaults(defineProps<DiaryProps>(),{
  pageSize:3,
})

const request={
  token:userStore.token,
  pageSize:props.pageSize, 
  nowPage:1,
  searchTerm:props.searchTerm,
  count:true,
}


//获取日记
// 日记
const diaryList = ref<DiaryDate[]>([]);
// 日记总数
const count = ref<number>(0);

const getData = (e: boolean) => {
  request.count = e

  diaryApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      // console.log(res)
      if (e) {
        count.value = res.data.count
      }
      diaryList.value = res.data.list;
    }
  })
}

// 删除
const deleteDiary = (e: number) => {

  let request = {
    token: userStore.token,
    diaryId: e,
  }
  deleteDiaryApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      diaryList.value = diaryList.value.filter((obj: any) => {
        return obj.id !== e
      })
      proxy.$message({ type: 'primary', message: '删除完成' })
    }
  })
}


// 翻页
const changePage=(e:number)=>{
  request.nowPage=e; // 📄 更新当前页码（比如从1变成2）
  getData(false);// 🔄 重新加载数据，但不更新总数
}

watch(
  // 监听新建的日记
  ()=>props.newDiary!,
  (e?:DiaryDate)=>{
    if (e) diaryList.value.unshift(e)
  }
)

watch(
  // 监听搜索关键词变化
  ()=>props.searchTerm,
  (e?:string)=>{
    request.nowPage=1;
    request.searchTerm=e;
    count.value=0;
    getData(true);
  }
)

onMounted(()=>{//组件挂载时获取日记  就是默认获取数据
  getData(true)
})
</script>

<style lang="less" scoped>
 .diary{
  width: 100%;

  
 .pagination{
    padding:@space-s 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
  }
   .empty{
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
 }
</style>