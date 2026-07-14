<template>
  <yk-space dir="vertical" size="l" style="width: 100%;"> <!--//dir="vertical" 垂直方向排列  -->
    <TopTitle name="随笔随记" :isSearch="true" @search="search"> </TopTitle>
      <yk-space style="width: 100%;">
         <DiaryVue :newDiary="newDiary" :searchTerm="searchTerm" :pageSize="3"></DiaryVue>
         <DiaryEditor style="flex:none;width: 600px;" @diaryData="diaryData"></DiaryEditor>
     </yk-space>
    </yk-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopTitle from '@/components/bar/TopTitle.vue'
import DiaryEditor from '@/components/diary/diary-editor.vue'
import DiaryVue from '@/components/diary/diary.vue'
import type {DiaryDate} from '../utils/interface'

// 接收新建的日记
const newDiary=ref()
const diaryData = (e: DiaryDate) => {
  console.log(e)  
  newDiary.value=e
}

// 搜索
const searchTerm=ref()
const search=(e:string)=>{
  searchTerm.value=e
}
</script>

<style lang="less" scoped>

</style>