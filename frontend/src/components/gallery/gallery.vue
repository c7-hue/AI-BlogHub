<template>
  <div class="gallery">
    <div class="gallery__content">
      <div class="gallery__content__files">
         <galleryItemView v-for="item in articleList" :key="item.id" :data="item" @delete="deleteArticle"
          @state="updateState" :searchTerm="props.searchTerm"/>
      </div>
    </div>
    <div class="pagination">
      <yk-pagination :total="count" size="m" @change="changePage" :default-page-size="request.pageSize" :current="request.nowPage" v-show="count/request.pageSize>1"></yk-pagination> 
    </div>
    <div class="empty" v-show="count==0">
      <yk-empty description="暂无数据" type="secondary"></yk-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import galleryItemView from './gallery-item.vue'
import {onMounted,watch,getCurrentInstance} from 'vue'
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
  searchTerm:{
    default:'',
    type:String,
  }
})

const request={
  token:userStore.token,
  pageSize:props.pageSize,
  nowPage:1,
  state:-1,
  subsetId:props.subsetId,
  searchTerm:props.searchTerm,
  count:true,
  classify:1,
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
    // 查询数据
    request.nowPage=1;
    request.pageSize=props.pageSize;
    request.subsetId=props.subsetId;
    request.searchTerm=props.searchTerm;
    request.count=true;
    request.classify=1;
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
 .gallery{
  width: 100%;
  background: @bg-color-l;
  padding:32px 24px 24px;
  border-radius: @radius-m;

  &__content{
    display: block;
    width: 100%;
    &__files{
      display: grid;
      grid-template-columns: repeat(auto-fill, 238px);// 自动填充列数，每个列宽度为240px
      row-gap: 32px;// 行间距为32px
      column-gap: 24px;// 列间距为24px
      justify-items: center;// 水平居中
    }

  }
  
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