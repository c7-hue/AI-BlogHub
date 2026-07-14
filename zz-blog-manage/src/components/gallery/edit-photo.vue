<template>
  <div class="edit-photo">
    <yk-upload :upload-url="uploadUrl" :file-list="fileList" :draggable="true" @handle-success="handleSuccess"></yk-upload>   
    <div class="waterfall">
      <div class="waterfall__item" v-for="item in fileList">  
        <img :src="baseImgUrl+'/'+ item.url" loading="lazy" decoding="async">   
        <IconStarFill class="waterfall__item--cover" v-show="item.id ===coverIndex"></IconStarFill>
        <yk-space size="ss">
          <p class="waterfall__item--tool" v-show="item.id !=coverIndex" @click="changeCover(item)" >设为封面</p>
          <IconDeleteOutline class="waterfall__item--delete" @click="deletePhoto(item)"></IconDeleteOutline>
        </yk-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,watch} from 'vue' 
import {baseUrl, baseImgUrl} from '../../utils/env'
import {useCode} from '../../hooks/code'
import type {FileData} from '../../utils/interface'
import {useFile} from '../../hooks/files' 

const {tackleCode}=useCode()

const props = defineProps(['cover','content'])

const emits = defineEmits(['cover','editors'])

const uploadUrl = `${baseUrl}/upload`
const fileList = ref<{url:string;id:number;name:string;status:string;uid:number}[]>([])  

// 封面
const coverIndex=ref<number>(-1)

  // 设为封面
const changeCover=(e:any)=>{
    coverIndex.value=e.id
    emits('cover',e.url)
  }

//删除
const {deleteFile}=useFile()

const deletePhoto = (e: { id: number; url: string }) => {
    fileList.value = fileList.value.filter((obj: any) => {
        return obj.id !== e.id
    })
    emits('editors',fileList.value.map((obj:any)=>JSON.stringify(obj)).join(' ')) 
    if (coverIndex.value == e.id && fileList.value.length > 0) {
        coverIndex.value = fileList.value[0]?.id ?? -1
        emits("cover", fileList.value[0]?.url ?? '')
    } else if (coverIndex.value == e.id && fileList.value.length <= 0) {
        coverIndex.value = -1
        emits("cover", '')
    }
    deleteFile(e)
}

// 图片提交
const handleSuccess=(e:{code:number,data:FileData})=>{
  if(tackleCode(e.code)){
    let photo={
      id:e.data.id,
      url:e.data.url,
      name:e.data.url.split('/').pop() || 'image.jpg',
      status:'success',
      uid:Date.now()
    }
    console.log(photo);

    fileList.value.push(photo)
    emits('editors',fileList.value.map((obj:any)=>JSON.stringify({id:obj.id,url:obj.url})).join(' '))
    if(coverIndex.value == -1){
      coverIndex.value=photo.id
      emits('cover',photo.url)
    }
  }
} 

watch(
  () => props.content,
  (e) => {
    if (!e) {
      fileList.value = []
      return
    }
    let cont = e.split(" ")
    fileList.value = cont.map((obj: string) => {
      const parsed = JSON.parse(obj)
      return {
        id: parsed.id,
        url: parsed.url,
        name: parsed.url.split('/').pop() || 'image.jpg',
        status: 'success',
        uid: parsed.id || Date.now()
      }
    })
    if (props.cover) {
      for (let i = 0; i < fileList.value.length; i++) {
        const file = fileList.value[i]
        if (file && props.cover === file.url) {
          coverIndex.value = file.id
        }
      }
    }
  },
  { immediate: true }
)

</script>

<style lang="less" scoped>
::v-deep .yk-upload-file {
  display: none !important;
}
.edit-photo {
  background: @bg-color-l;
  border-radius: @radius-m;
  padding:@space-xl;
  width: 100%;
  min-height: 660px;  
}
.waterfall{
  width: 100%;
  column-count: 3;
  column-gap: @space-xl;
  padding-top:32px;

  &__item{
    margin-bottom: @space-xl;
    border-radius: @radius-m;
    overflow: hidden;
    line-height: 0%;

    img{
      width: 100%;
    }

    .yk-space{
      position:absolute;
      top:@space-l;
      right: @space-l;
    }

    &--cover{
      position: absolute;
      top: @space-l;
      left: @space-l;
      width: 24px;
      height: 24px;
      color:@wcolor;
    }

    &--tool{
      line-height: 32px;
      padding:0 @space-m;
      border-radius: @radius-m;
      background: rgba(255,255,255,0.56);
      color: @pcolor;//黄色
      cursor: pointer;
      transition: all @animatb;
      opacity: 0;// 初始透明度为0 隐藏起来

      &:hover{
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(2px);// 模糊背景
      }
    }
      &--delete{
      width: 32px;
      height: 32px;
      border-radius: @radius-m;
      padding:9px;// 内边距
      background: rgba(255,255,255,0.56);
      color: @gray;
      cursor: pointer;
      transition: all @animatb;
      opacity: 0;// 初始透明度为0 隐藏起来

      &:hover{
      color: @ecolor;//红色
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(2px);// 模糊背景
      }
    }
    &:hover{
      .waterfall__item--tool{
        opacity: 1;// 鼠标悬停时显示
      }
      .waterfall__item--delete{
        opacity: 1;// 鼠标悬停时显示
      }
    }
  }
}
</style>
