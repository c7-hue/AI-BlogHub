<template>
  <div class="file-item">
    <div class="file-item__img" :class="{'file-item--selected':props.data?.selected}">
      <yk-image :src="url" width="200" height="200" :is-lazy="true" fit="contain" :preview="false"></yk-image>
      <yk-space class="file-item__img--tool" size="s">
        <IconDeleteOutline class="files__tool-delete" @click="deleteFile"/>
               <yk-popconfirm
      title="选择分组" placement="bottomRight" @cancel="cancel" @confirm="confirm">
        <IconSwitchOutline class="files__tool-switch"/>
      <template #content>
        <yk-scrollbar ref="scrollbar" height="148px" class="subset">
          <div v-for="item in subsetStore.data" class="subset__item" 
          :class="{'subset-selected':subsetSelectedId==item.id}"
          @click="changeOption(item.id)"
          >
            {{ item.name }} {{ item.value }}
          </div>
        </yk-scrollbar>
      </template>
    </yk-popconfirm>
      </yk-space>
      <div class="file-item__img--check" @click="checkFile">
        <IconTickMinOutline style="color:#fff;font-size:24px"/>
      </div>
    </div>
    <div class="file-item__name">
    <p class="file-item__name-file">{{ $props.data?.url }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type { FileData } from '../../utils/interface';
import {computed} from 'vue'
import {useSubsetStore} from '../../store/subset';
import './files.less'
import {baseImgUrl} from '../../utils/env'

//store
const subsetStore = useSubsetStore();

type FileItemProps={
  data:FileData
}

const props=withDefaults(defineProps<FileItemProps>(),{
})

const emits=defineEmits(['changeSubsetId','delete','selected'])
// 图片路径
const url=computed(()=>{
  return baseImgUrl+"/"+props.data?.url
})

//分类选择
const subsetSelectedId=ref<number | string>(props.data?.subset_id);
//切换 分组
const changeOption=(e:number | string)=>{
  subsetSelectedId.value=e;
}

function cancel() {
  // proxy.$message({ type: 'warning', message: '你点击了取消按钮' })
}
function confirm() {
  //如果当前选择与之前不同时
  if(subsetSelectedId.value!=props.data?.subset_id){
    let data={
      id:props.data?.id,
      subsetId:subsetSelectedId.value,
    }
    // 触发事件
    emits('changeSubsetId',data);
  }
}
//删除
const deleteFile=()=>{
  emits('delete',props.data?.id,props.data?.url);
}
//选择
const checkFile=(event: Event)=>{
  event.stopPropagation(); // 阻止事件冒泡

  emits('selected',props.data);
}

</script>

<style scoped lang="less">
.file-item{
  &__img{
    position:relative;
    border-radius:@radius-s;
    border:2px solid @bg-color-l;
    &--tool{
      position:absolute;
      right:@space-s;
      bottom:@space-s;
      opacity: 0;// 初始时隐藏
      .yk-icon{
        width: 32px;
        height: 32px;
        padding:8px;
        background: rgba(255,255,255,0.56);
        border-radius:@radius-m;
        transition: all @animatb;// 过渡动画
        cursor: pointer;// 指针形状

        &:hover{
          color:@pcolor;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(2px);// 模糊背景
        }
      }
    }

    &--check{
      width: 26px;
      height: 26px;
      border-radius: @radius-s;
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      left: @space-s;
      top:@space-s;
      cursor: pointer;// 指针形状
      border:1px solid rgba(255,255,255,0.8);// 白色边框
      opacity: 0.7; // 初始时更明显
      z-index: 10; // 确保勾选框在最上层
      pointer-events: auto; // 确保可以点击
      transition: all @animatb;
      .yk-icon{
        opacity: 0; // 初始时隐藏图标
        transition: opacity @animatb;
      }
      
      &:hover {
        opacity: 1;
        background: @pcolor;
        transform: scale(1.1);
        border-color: @pcolor;
      }
    }
  }
  
  &:hover{
    background: @pcolor-1;
    .file-item__img--tool{
      opacity: 1;// 悬停时显示
    }
    .file-item__img--check{
      opacity: 1;// 悬停时显示
      .yk-icon{
        opacity: 1;// 悬停时显示图标
      }
    }
  }

  &--selected{
    background: @pcolor-1;
    border:2px solid @pcolor-3;

    .file-item__img--check{
      opacity: 1;
      .yk-icon{
        opacity: 1;
      }
    }
    .file-item__img--tool{
      opacity: 0;
    }
     &:hover{
      .file-item__img--tool{
      opacity: 0;// 悬停时显示
     }
   }
  }

  &__name{
    padding-top:@space-l;
    display:flex;
    justify-content: center;
    &-file{
        overflow: hidden;
        display:-webkit-box;
        -webkit-line-clamp:1;
        line-clamp:1;
        -webkit-box-orient:vertical;
        text-overflow:ellipsis;
    }
  }
}
</style>