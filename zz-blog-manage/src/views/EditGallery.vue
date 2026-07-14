<template>
  <div class="edit-gallery">
    <div class="edit-gallery__topbar">
      <p class="edit-gallery__topbar__title">新建摄影图库</p>
      <yk-space>
        <yk-button type="secondary" @click="cancel">取消</yk-button>
        <yk-button type="primary" @click="submit(1)">发布</yk-button>  
      </yk-space>
    </div>
    <div class="edit-gallery__content">
      <div class="edit-gallery__main">
        <EditPhoto @editors="editorData" @cover="coverData" :cover="defaultArticle?.[2]" :content="defaultArticle?.[0]"></EditPhoto>
      </div>
      <div class="edit-form">
         <Forms  style="width: 420px;" :classify="1" @formData="formData" :form="defaultArticle?.[1]"></Forms>  
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditPhoto from '../components/gallery/edit-photo.vue'
import Forms from '../components/forms/forms.vue'
import { useArticle } from '../hooks/article'
import {useRouter} from 'vue-router'


const {submit,formData,editorData,defaultArticle,id,getArticleDetail,coverData}=useArticle()

const router=useRouter()

if(router.currentRoute.value.query.id){
  id.value=Number(router.currentRoute.value.query.id)
  console.log(id.value);
  getArticleDetail()
}
// 取消
const cancel=()=>{
  router.go(-1)// 返回上一页
}

</script>

<style lang="less" scoped>
.edit-gallery{
  padding:@space-xl 80px;//上下80px 左右120px

  &__topbar{
    border-radius: @radius-m;
    background: @bg-color-l;
    padding:@space-l @space-xl;
    margin-bottom: @space-l;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__title{
      .font-xl();
      font-weight: 600;
    }
  }
  &__content{
    display: flex;// 主内容区域 左右布局
    gap: @space-l;// 主内容区域 左右间距
  }
  &__main{
    flex: 1;// 主内容区域 占满剩余空间
  }
  .edit-form{
    background: @bg-color-l;
    border-radius: @radius-m;
    flex: none;
    display: flex;// 弹性布局
    padding: 24px;// 内边距 24px
    justify-content: center;// 表单居中
  }
}
</style>