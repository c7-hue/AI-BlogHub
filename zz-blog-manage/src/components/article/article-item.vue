<template>
  <div class="article-item">
    <yk-space size="xl">  <!--间距-xl  -->
      <div class="article-item__cover">
        <yk-image :src="cover" width="160" height="120" :is-lazy="true" :preview="false" fit="cover"/>
        <p class="article-item__unpublish" v-if="props.data?.state == 0">未发布</p>
      </div>
      <div style="width: 100%;">
        <p class="article-item__title" v-html="title"></p>
        <p class="article-item__introduce" v-html="introduce"></p>  
        <div class="article-item__data">
          <yk-space size="l">
            <yk-text type="secondary"><!-- 二级字体颜色 -->
              {{subsetStore.subsetName(props.data?.subsetId)}}
              <yk-text type="secondary" v-if="props.data!.label!.length > 0">
              /
              <span v-for="item in props.data?.label" style="padding-right: 4px;">{{item}}</span>
              </yk-text>
            </yk-text>
            <yk-text type="third">{{ moment(props.data?.moment!) }}</yk-text>
            <yk-space>
              <yk-text type="third">
                <IconEyeOutline/>
                {{props.data?.views}}
              </yk-text>
              <yk-text type="third">
                <IconLikeOutline/>
                {{props.data?.praise}}
              </yk-text>
              <yk-text type="third">
                <IconCommentOutline/>
                {{props.data?.comment}}
              </yk-text>
            </yk-space>
          </yk-space>
          <yk-space class="article-item__control" size="xl">
            <yk-tooltip placement="top" title="发布" v-if="props.data?.state===0">
              <IconSendOutline @click="updateState(1)"/>
            </yk-tooltip>
            <yk-tooltip placement="top" title="撤回" v-if="props.data?.state===1">
              <IconRevokeOutline @click="updateState(0)"/>
            </yk-tooltip>
            <yk-tooltip placement="top" title="编辑" >
              <IconFillOutline @click="updateArticle"/>
            </yk-tooltip>
            <yk-popconfirm trigger="click" placement="top" title="确定删除" content="删除将不可恢复" 
            @confirm="deleteArticle(props.data!.id)">
                <IconDeleteOutline/>
            </yk-popconfirm>
          </yk-space>
        </div>
      </div>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import type { ArticleData } from '../../utils/interface';
import {computed,ref,watch} from 'vue'
import { useSubsetStore } from '../../store/subset';
import { moment } from '../../utils/moment';
import {useRouter} from 'vue-router'
import { highlightKeywords } from '../../utils/highlight'

const router=useRouter()

// store
const subsetStore=useSubsetStore()

type ArticleItemProps={
  data?:ArticleData;
  searchTerm?:string; 
}

const props=withDefaults(defineProps<ArticleItemProps>(),{
})

const emits=defineEmits(['delete','state'])

// 封面地址
const cover=computed(()=>{
  return props.data?.cover || ''
})

// 删除文章
const deleteArticle=(id:number)=>{
  emits('delete',id)
}

// 修改状态
const updateState=(e:number)=>{
  emits('state',{id:props.data!.id,state:e})
}

// 修改编辑文章
const updateArticle=()=>{
  router.push({
    path:'editarticle',
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
.article-item{
  border-radius: @radius-m;
  background: @bg-color-l;
  padding: @space-xl;
  width: 100%;
  &__cover{
    position: relative;
    border-radius: @radius-m;
    overflow: hidden;// 隐藏超出部分
    width: 160px;
    height: 120px;
    flex: none;
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
    font-size: 20px;
    font-weight: 600;
    padding-bottom: @space-s;
  }
  &__introduce{
    .font-m();// 引入字体大小m
    height: 48px;
    overflow: hidden;
    display:-webkit-box;// 限制显示行数
    -webkit-line-clamp:2;// 显示两行
    line-clamp:2;// 标准属性，兼容性
    -webkit-box-orient:vertical;// 垂直方向
    text-overflow:ellipsis;// 超出部分显示省略号
    color:@font-color-l;
    margin-bottom: @space-m;// 下外边距
    max-width: 720px;// 最大宽度
  }
  &__data{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__control{
    .yk-icon{
      width: 20px;
      height: 20px;
      color: @font-color-s;
      cursor: pointer;
      &:hover{
        color: @pcolor;
      }
    }
  }
}
</style>