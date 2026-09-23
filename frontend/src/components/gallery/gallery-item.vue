<template>
  <div class="gallery-item">
    <yk-space size="s" dir="vertical">  <!--间距-xl  -->
      <div class="gallery-item__image">
        <div class="gallery-item__cover">
          <yk-image :src="cover" width="238" height="160" :is-lazy="true" :preview="false" fit="cover" />
        </div>
        <yk-space :size="2">
          <div class="gallery-item__image--left image-div">
        <yk-image :src="baseImgUrl+'/'+content![0].url" width="78" height="78" :is-lazy="true" 
           :preview="false" fit="cover" v-if="content![0]"/>   
           </div> 
          <div class="gallery-item__image--center image-div">
        <yk-image :src="baseImgUrl+'/'+content![1].url" width="78" height="78" :is-lazy="true" 
           :preview="false" fit="cover" v-if="content![1]"/>    
          </div>
          <div class="gallery-item__image--right image-div">
            <yk-image :src="baseImgUrl+'/'+content![2].url" width="78" height="78" :is-lazy="true"  
           :preview="false" fit="cover" v-if="content![2]"/>   
          </div>
        </yk-space>
            <yk-space class="gallery-item__control" :size="4">
              <IconFillOutline @click="updateGallery"/>
               <yk-popconfirm trigger="click" placement="top" title="确定删除" content="删除将不可恢复" 
                @confirm="deletegallery(props.data!.id)">
                  <IconDeleteOutline/>
               </yk-popconfirm>
            </yk-space>
      </div>
      <div style="width: 100%;">
        <p class="gallery-item__title" v-html="title"></p>
        <div class="gallery-item__data">
          <yk-space size="l">
             <yk-space>
              <yk-text type="third">
                查看
                {{props.data?.views}}
              </yk-text>
              <yk-text type="third">
                喜欢
                {{props.data?.praise}}
              </yk-text>
            </yk-space>
          </yk-space>
            <yk-text type="third">{{ moment(props.data?.moment!) }}</yk-text>

        </div>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import type { ArticleData } from '../../utils/interface';
import {ref,watch,computed} from 'vue'   
import { moment } from '../../utils/moment';
import {baseImgUrl} from '../../utils/env'
import router from '../../router' 
import {highlightKeywords} from '../../utils/highlight'

type galleryItemProps={
  data?:ArticleData;
  searchTerm?:string;
}
const props=defineProps<galleryItemProps>() 

const emits=defineEmits(['delete','state'])

// 封面地址
const cover=computed(()=>{
  return baseImgUrl+'/'+props.data?.cover || '' 
})

// 内容
const content=computed(()=>{
  if(props.data?.content){
    let contentList=props.data?.content.split(' ')
    return contentList.map((obj:string)=>JSON.parse(obj))
  }else{
    return ""
  } 
})

// 删除图库 
const deletegallery=(id:number)=>{
  emits('delete',id)
}
// 修改编辑图库
const updateGallery=()=>{
  router.push({
    path:'/editgallery',
    query:{
      id:props.data!.id,
    }
  })
}

// 高亮标题和简介
const introduce = ref(props.data?.introduce)
const title = ref(props.data?.title)  
const heightLight = (key?: string) => {
  if (props.data?.introduce) {
    introduce.value = highlightKeywords(props.data?.introduce, key)
  }
  title.value = highlightKeywords(props.data?.title!, key)
}

watch(
  () => props.searchTerm,
  (e) => {
    heightLight(e)
  }
)
</script>

<style lang="less" scoped>
.gallery-item{
  border-radius: @radius-m;
  background: @bg-color-l;
  width: 238px;
  &__cover{
    position: relative;
    border-radius: @radius-m @radius-m 0 0;// 上圆角
    overflow: hidden;// 隐藏超出部分
    flex: none;
    padding-bottom: 2px;
  }
  &__image--left{
    border-radius:  0 0 0 @radius-m;
    overflow: hidden;
  }
  &__image--right{
    border-radius: 0 0 @radius-m 0;// 右下圆角
    overflow: hidden;
  }
  .image-div{
    width: 78px;
    height: 78px;
    background: @gray-2;
  }
  &__unpublish{
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    background: rgba(43, 90, 237, 0.8);
    line-height: 36px;
    color: @white;// 白色字体
    font-weight: 600;
  }
  &__title{
    .font-l();// 引入字体大小l  18像素
    padding-top: @space-m;// 上外边距
    font-weight: 600;
    overflow: hidden;
    display: -webkit-box;// 限制显示行数
    -webkit-line-clamp: 1;
    line-clamp: 1; // 显示一行
    -webkit-box-orient:vertical;// 垂直方向
    text-overflow:ellipsis;// 超出部分显示省略号
  }
  &__data{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__control{
    position:absolute;// 绝对定位
    top: @space-l;// 顶部外边距
    right: @space-l;// 右外边距
    background: rgba(255, 255, 255, 0.56);
    border-radius: @radius-m;
    padding: @space-s;
    opacity: 0;// 初始透明度为0
 &:hover{
        background: rgba(255, 255, 255, 0.64);
        backdrop-filter: blur(2px);
        color: @pcolor;
      }
    .yk-icon{
      width: 24px;
      height: 24px;
      padding: 5px;
      color: @gray;
      cursor: pointer;
      &:hover{
        color: @pcolor;
      }
    }
   
  }
   &:hover{
      .gallery-item__control{
        opacity: 1;// 悬停时透明度为1
      }
    }
}
</style>

<style lang="less" scoped>
.gallery-item{
  .yk-image__img{
    border-radius: 0;
  }
}
</style>