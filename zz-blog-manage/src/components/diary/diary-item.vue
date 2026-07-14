<template>
  <div class="diary-item">
    <yk-space dir="vertical" >
      <div class="diary-item_toptitle">
        <yk-space dir="vertical" :size="4">
           <p class="diary-item_title">
            <span v-html="title"></span>  
              <!-- 调用方法获取图标 -->
             <img v-if="props.data?.weather_id !== undefined" 
                  :src="getWeatherIcon(props.data?.weather_id)"   
                  style="width: 16px; height: 16px; margin-left: 8px;">
           </p>
           <yk-text type="third">{{ props.data?.moment ? momentl(props.data.moment) : '' }}</yk-text>
        </yk-space>
         <yk-popconfirm trigger="click" placement="top" title="确定删除" content="删除将不可恢复" 
                @confirm="deletediary(props.data!.id)">
                  <IconDeleteOutline class="diary-item__delete"/>
         </yk-popconfirm>
      </div>
      <yk-text v-html="content"></yk-text>  
      <div  class="images">
      <yk-image-preview-group :src-list="images" width="80px" height="80px" fit="cover">
      </yk-image-preview-group>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import type { DiaryDate } from '../../utils/interface';
import { computed, ref, watch } from 'vue'  
import { momentl } from '../../utils/moment';
import { weather } from '../../utils/weather';
import {baseImgUrl} from '../../utils/env'
import {highlightKeywords} from '../../utils/highlight'
type diaryItemProps={
  data?:DiaryDate;
  searchTerm?:string;
}

const props=withDefaults(defineProps<diaryItemProps>(),{
})

// 图片处理
const images = computed(() => {
  if (props.data?.picture) {
    // 深拷贝
    let arr = props.data?.picture.split(" ").map((obj: string) => JSON.parse(obj))

    let pic = []
    for (let i = 0; i < arr.length; i++) {
      pic.push(baseImgUrl + '/' + arr[i].url)
    }
    return pic
  }
})

const emits=defineEmits(['delete'])

// 删除
const deletediary=(id:number)=>{
  emits('delete',id)
}

// --- 核心修改：增加类型转换 ---
const getWeatherIcon = (id: number | string | undefined) => {
  if (id === undefined) return undefined
  
  // 使用 Number(id) 强制转换，解决 "0" !== 0 的问题
  const item = weather.find(w => w.id === Number(id))
  
  return item ? item.icon : undefined
}

// 高亮标题和内容
const content = ref(props.data?.content)
const title = ref(props.data?.title)

const heightLight = (key?: string) => {
  if (props.data?.content) {
    content.value = highlightKeywords(props.data?.content, key)
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
/* 样式保持不变 */
.diary-item{
  border-radius: @radius-m;
  background: @bg-color-l;
  padding: @space-xl;
  width: 100%;
  &_toptitle{
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  &_title{
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    img{
      margin-right: @space-s;
    }
  }
  &__delete{
    width: 20px;
    height: 20px;
    padding: 2px;
    color: @font-color-s;
    transition: color @animatb;
    display: none;
    &:hover{
      color: @font-color-l;
    }
  }
  &:hover{
    .diary-item__delete{
      display: block;
    }
  }
}
</style>

<style lang="less" scoped>
.images{
  .yk-space{
    gap:@space-s;
  }
  .yk-image{
    border-radius: 8px;
  }
}
.diary-item{
  .highlight{
    font-weight: 600; 
  }
}
</style>