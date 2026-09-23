<template>
  <yk-space dir="vertical" style="width: 100%;" size="xl">
    <articleItemView v-for="item in articleList" :key="item.id" :data="item" @delete="deleteArticle"
     @state="updateState" :searchTerm="props.searchTerm"/>
    <div class="pagination">
      <yk-pagination :total="count" size="m" @change="changePage" :default-page-size="props.pageSize" :current="request.nowPage" v-show="count/props.pageSize>1"></yk-pagination>  
    </div>
    <div class="empty" v-show="count==0">
      <yk-empty description="暂无数据" type="secondary"></yk-empty>
    </div>
  </yk-space>
</template>

<script setup lang="ts">
import {onMounted,watch,getCurrentInstance} from 'vue'
import articleItemView from './article-item.vue'
import { useArticle } from '../../hooks/article';
import {useUserStore} from '../../store/user'

const userStore=useUserStore()

const {getData,articleList,count,deleteArticle}=useArticle()

const proxy:any=getCurrentInstance()?.proxy

const props=defineProps({
  pageSize:{
    type:Number,
    default:3,//每页显示数量
  },
  subsetId:{
    default:-1,
    type:[Number,String],
  },
  state:{
    default:-1,
    type:[Number,String],
  },
  searchTerm:{
    default:'',
    type:String,
  }
})

const request={
  token:userStore.token,
  pageSize:props.pageSize,
  nowPage:1,
  state:props.state,
  subsetId:props.subsetId,
  searchTerm:props.searchTerm,
  count:true,
  classify:0,
}


// 修改状态
const updateState=(e:{id:number,state:number})=>{
  articleList.value=articleList.value.map(item=>{
    if(item.id===e.id){
      item.state=e.state
      if(e.state===1){
        proxy.$message({ message:'发布成功', type:'success'})
      }else{
        proxy.$message({ message:'撤回成功', type:'success'})
      }
    }
    return item
  })
}

// 翻页
const changePage=(e:number)=>{
  request.nowPage=e; // 📄 更新当前页码（比如从1变成2）
  request.count=true; // 确保 API 返回总数
  getData(request);// 🔄 重新加载数据
}

watch(
  props,()=>{
    console.log(props.state,props.subsetId);
    console.log(props);
    
    // 查询数据
    request.nowPage=1;
    request.pageSize=props.pageSize;
    request.state=props.state;
    request.subsetId=props.subsetId;
    request.searchTerm=props.searchTerm;
    request.count=true;
    request.classify=0;
    // 重置count为0，确保分页器正确显示
    count.value = 0;
    getData(request)
    
  }
)

onMounted(()=>{//组件挂载时获取文章  就是默认获取数据
  getData(request)
})
</script>

<style lang="less" scoped>
 .pagination{
    padding:@space-s 0 @space-xl;
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
</style>