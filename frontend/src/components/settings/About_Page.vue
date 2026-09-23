<template>
      <yk-title :level="4">关于页设置</yk-title>  
    <yk-space class="about-page">
      <!-- 左边 -->
      <yk-space dir="vertical" size="s" class="about-page-left"> 
        <yk-text>一句话介绍自己</yk-text>
        <yk-input placeholder="一句话介绍自己" v-model="introduction" style="padding-bottom:10px;width: 300px;"></yk-input>
        <yk-text>标签（用空格隔开）</yk-text>
        <yk-input v-model="tags" style="padding-bottom:10px;width: 300px;"></yk-input>
        <!-- 模块 -->
        <yk-space dir="vertical" size="s">
            <yk-text>模块1</yk-text>
            <yk-input placeholder="请输入模块名称..." v-model="module1Title"></yk-input>
            <yk-text-area placeholder="请输入模块1内容..." v-model="module1Content" style="width: 300px;height: 100px;"></yk-text-area>  
        </yk-space>
        <yk-space dir="vertical" size="s">
            <yk-text>模块2</yk-text>
            <yk-input placeholder="请输入模块名称..." v-model="module2Title"></yk-input>
            <yk-text-area placeholder="请输入模块2内容..." v-model="module2Content" style="width: 300px;height: 100px;"></yk-text-area>     
        </yk-space>
            <yk-text style="padding-bottom:10px;">关于页背景</yk-text>
          <div class="homepage-bg-upload">
            <yk-upload :upload-url="uploadUrl" :file-list="fileUrl2" accept="image/*" :limit="1" @handle-success="handleSuccess"></yk-upload> 
          </div>
             <yk-button>示例</yk-button>  
      </yk-space>

      <!-- 右边 -->
      <yk-space dir="vertical" size="0" class="about-right"> 
          <img :src="fileUrl2[0].url" class="preview-image" v-if="fileUrl2.length > 0"></img>   
          <yk-space class="image-overlay" size="0" dir="vertical" v-if="fileUrl2.length > 0">  
            <yk-modal  v-model="visible" title="关于页面示例" :show-footer="false">
              <img src="../../assets/example.png" alt="" style="width: 100%;height: 100%;box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);"> 
            </yk-modal> 
            <yk-button class="confirm-btn" @click="showModal">示例</yk-button>
            <img :src="touxiang.url" style="width: 100px;height: 100px;border-radius: 100%;" v-if="fileUrl2.length > 0"></img>      
            <yk-title :level="3">张张</yk-title>
            <yk-text :level="3" type="secondary">{{ introduction || '暂无介绍' }}</yk-text>
            <!-- 修改模板部分，给父容器添加 flex 样式 -->
            <div style="display: flex; gap: 1px; flex-wrap: nowrap;">
              <yk-tag v-for="tag in tags.split(' ')" :key="tag" class="tag" :type="tag" > 
                {{ tag }}
              </yk-tag>
            </div>
            <yk-title :level="3">{{ module1Title || '模块1' }}</yk-title>
            <yk-text style="width: 70%; text-align: center;"  type="secondary" >{{ module1Content || '暂无模块1内容' }}</yk-text>
            <yk-title :level="3">{{ module2Title || '模块2' }}</yk-title>
            <yk-text style="width: 70%; text-align: center;"  type="secondary" >{{ module2Content || '暂无模块2内容' }}</yk-text> 
          </yk-space> 
      </yk-space>


    </yk-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCode } from '../../hooks/code'
import { baseImgUrl } from '../../utils/env'
import type { FileData } from '../../utils/interface'
import { baseUrl } from '../../utils/env'

const introduction = ref('') // 一句话介绍自己
const tags = ref('') // 标签
const module1Title = ref('') // 模块1标题
const module1Content = ref('') // 模块1内容
const module2Title = ref('') // 模块2标题
const module2Content = ref('') // 模块2内容

const visible = ref<boolean>(false)
const showModal = () => {
  visible.value = true
}

const uploadUrl = `${baseUrl}/upload`

const { tackleCode } = useCode()

const fileUrl2 = ref<any[]>([])
const touxiang = ref<any>({'url':'src/assets/logo.png'})    
const handleSuccess = (e: {code: number, data: FileData}) => {
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
</script>

<style lang="less" scoped>
.about-page{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;  

  &-left{
   padding: @space-xl;
    display: flex;
    justify-content:flex-start;
    align-items: flex-start;

}
}

.preview-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  border-radius: 8px;
  display: block;// 保持图片居中显示
}
.about-right{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content:flex-start;
  align-items: flex-start;
  padding: @space-xl;
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
.confirm-btn{
 position: absolute;
  top: 40px;
  left: 40px;  
}
.tag {
  margin-right: 10px;
  margin-bottom: 10px;
  max-width: 100px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 35%;
}
</style>