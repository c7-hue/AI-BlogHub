<template>
 <yk-space dir="vertical" size="l" style="width: 100%;">  <!--//dir="vertical" 垂直方向排列  -->
    <TopTitle name="摄影图库" :isSearch="true" @search="search"> </TopTitle>
    <subset :classify="1" @select="nowSelect" v-show="!query" ></subset>
    <galleryVue :subsetId="nowSubset" :searchTerm="searchTerm"></galleryVue>  
    </yk-space>
</template>

<script setup lang="ts">
import TopTitle from '@/components/bar/TopTitle.vue'
import Subset from '../components/subset/subset.vue'
import galleryVue from '../components/gallery/gallery.vue'
import { ref } from 'vue'

// 子分类
const nowSubset = ref<number|string>(-1)

const nowSelect = (e:{id:number|string,type:string})=>{
  // console.log(e);
  if(e.type=='all'){
    nowSubset.value=-1
  }else if(e.type=='subset' || e.type=='exclude'){
    nowSubset.value=e.id
  }
}
// 搜索
const searchTerm = ref<string>()
const query=ref<boolean>(false)  
const search = (e:string)=>{
  searchTerm.value=e
  if(e){
    query.value = true
  }
  else{
    query.value = false
  }
}
</script>

<style lang="less" scoped>
</style>