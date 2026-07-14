<template>
      <yk-title :level="4">网站logo及首屏设置</yk-title>
     <yk-space class="website-logo-and-homepage"  size="l" style="width: 100%;">  <!--//dir="vertical" 垂直方向排列  -->
      <!-- logo +  表单 -->
      <yk-space dir="vertical"> 
        <yk-space dir="vertical" class="website-logo-and-homepage__form"> 

          <div class="logo-upload">
            <yk-upload :upload-url="uploadUrl" :file-list="fileUrl" accept="image/*" desc="logo" :limit="1" @handle-success="handleSuccess1"></yk-upload> 
          </div>
          <yk-text>名称</yk-text>
          <yk-input show-counter v-model="nameValue" clearable placeholder="请输入..." :limit="8" />
          <yk-text>slogan</yk-text>
          <yk-input show-counter v-model="sloganValue" clearable placeholder="请输入..." :limit="24"/>
          <yk-text>首屏背景</yk-text>
          <div class="homepage-bg-upload">
            <yk-upload :upload-url="uploadUrl" :file-list="fileUrl2" accept="image/*" desc="封面1920x1080" :limit="1" @handle-success="handleSuccess2"></yk-upload>
          </div>
          <yk-button @click="handleSubmit">确定</yk-button> 
        </yk-space>
      </yk-space>  

      <!-- 首屏背景预览 -->
      <yk-space>
        <div v-if="fileUrl2.length > 0" class="image-preview-container" style="padding: 20px;"> 
          <div class="image-wrapper">
            <img :src="fileUrl2[0].url" class="preview-image"></img>
            <div class="image-overlay" dir="vertical" style="width: 100%;">
              <yk-space v-if="fileUrl.length > 0" class="logo-image" :size="0">
                <img :src="fileUrl[0].url" class="preview-image" style="width: 30px; height: 30px;border-radius: 100%;"></img>  
                <yk-text style="font-size: 17px;font-weight: bold;" size="0">{{ nameValue }}</yk-text>      
              </yk-space> 
              <yk-space dir="vertical" :size="0" class="slogan">
                 <yk-title :level="1">{{ nameValue }}</yk-title>
                 <yk-text style="font-size: 17px;font-weight:normal ;" type="secondary">{{ sloganValue }}</yk-text> 
              </yk-space>
            </div>
          </div>
        </div>  
      </yk-space>
    </yk-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FileData } from '../../utils/interface'
import { useCode } from '../../hooks/code'
import { baseUrl, baseImgUrl } from '../../utils/env'

const { tackleCode } = useCode()

const nameValue = ref('')
const sloganValue = ref('')

const uploadUrl = `${baseUrl}/upload`

const fileUrl =ref<any[]>([])

const fileUrl2 = ref<any[]>([])

const handleSuccess1 = (e: {code: number, data: FileData}) => {
  console.log('上传返回数据:', e)
  
  if (tackleCode(e.code)) {
    const photo = {
      id: e.data.id,
      url: e.data.url.startsWith('http') ? e.data.url : `${baseImgUrl}/${e.data.url}`,
      name: e.data.file_name || 'image.jpg',
      status: 'success',
      uid: Date.now()
    }
    
    console.log('photo对象:', photo)
    fileUrl.value = [photo]
  }
}

const handleSuccess2 = (e: {code: number, data: FileData}) => {
  console.log('上传返回数据:', e)
  
  if (tackleCode(e.code)) {
    const photo = {
      id: e.data.id,
      url: e.data.url.startsWith('http') ? e.data.url : `${baseImgUrl}/${e.data.url}`,
      name: e.data.file_name || 'image.jpg',
      status: 'success',
      uid: Date.now()
    }
    
    console.log('photo对象:', photo)
    fileUrl2.value = [photo]
  }
}
const handleSubmit = () => {
  // 获取名称输入框内容
  console.log('名称:', nameValue.value)
  // 获取slogan输入框内容
  console.log('slogan:', sloganValue.value)
  
  // 可以在这里进行表单提交等操作
}
</script>

<style lang="less">
.website-logo-and-homepage{
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  &__form{
    padding: @space-xl;
    display: flex;
    justify-content:flex-start;
    align-items: flex-start;
  }
}

.website-logo-and-homepage__form .logo-upload {
  min-height: 100px;
}

.website-logo-and-homepage__form .homepage-bg-upload {
  min-height: 120px;
  .yk-upload__picture-button{
    width: 160px !important;
    height: 120px !important;
  }
  .yk-upload-picture{
    width: 160px !important;
    height: 120px !important; 
  }
}

.image-preview-container {
  width: 100%;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.preview-image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  display: block;// 保持图片居中显示
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image{
  position: absolute;
  top: 10px;
  left: 10px;  
}

.slogan{
  position: absolute;
  top: 50px;
  left: 50px;
}



</style>
