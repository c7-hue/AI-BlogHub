<template>
  <div class="diary-editor">
    <div class="diary-editor__form">
      <div class="diary-editor__top">
         <input type="text" class="diary-editor__title" placeholder="请输入标题" v-model="diaryForm.title"/>
         
         <yk-popover placement="bottomRight" title="选择天气">
          <template #content>
            <yk-space wrap :size="[32,20]" style="padding:16px 0 16px 14px">
              <!-- 这里的 :src 直接使用 item.icon，因为在 ts 文件里已经是处理过的路径了 -->
              <div class="diary-editor__weather" v-for="item in weather" 
              :class="{'selected': diaryForm.weather_id === item.id}" @click="selectWeather(item.id)">
                <img :src="item.icon" />
              </div>
            </yk-space>
          </template>
          
          <!-- 这里显示当前选中的天气图标 -->
          <img :src="weather[diaryForm.weather_id]?.icon" />
         </yk-popover>
      </div>

      <yk-text-area v-model="diaryForm.content" :max-length="1600" placeholder="请输入..." 
      :auto-size="{minRows:24,maxRows:24}" />
      
      <div class="diary-editor__picture">
        <yk-upload :uploadUrl="uploadUrl" :file-list="fileList" accept="image/*" 
        @handleSuccess="handleSuccess" @handleDelete="deletePhoto" />
      </div>
    </div>

    <div class="diary-editor__foot">
      <yk-space size="s">
        <yk-button type="secondary" @click="cancel">取消</yk-button>
        <yk-button @click="newDiary">新建笔记</yk-button>
      </yk-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,getCurrentInstance } from 'vue'
import { weather } from '../../utils/weather';
import type { DiaryDate } from '../../utils/interface';
import {baseUrl} from '../../utils/env'
import {useFile} from '../../hooks/files' 
import type {FileData} from '../../utils/interface'
import {useCode} from '../../hooks/code'
import {useUserStore} from '../../store/user'
import {createDiaryApi} from '../../api/index'

const userStore = useUserStore()

const emits = defineEmits(['diaryData'])

const proxy: any = getCurrentInstance()?.proxy

const {tackleCode}=useCode()

// 初始化时明确赋值 weatherId: 0
const diaryForm = ref<DiaryDate>({
  id: 0,
  title: '',
  weather_id: 0,
  moment: new Date(),
  content: '',
  picture: '',
})

// 上传地址
const uploadUrl = `${baseUrl}/upload`
type UploadFile = { url: string; id: number; name: string; status: string; uid: number }

const createEmptyDiary = (): DiaryDate => ({
  id: 0,
  title: '',
  weather_id: 0,
  moment: new Date(),
  content: '',
  picture: '',
})

const fileList = ref<UploadFile[]>([])  

// 选择天气
const selectWeather = (id: number) => {
  diaryForm.value.weather_id = id
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
  }
} 

//图片删除
const {deleteFile}=useFile()

const deletePhoto = (e:any) => {
    deleteFile(e[0])
    let dFile=fileList.value[e[0]]
    // 后端删除文件
    deleteFile(dFile)
    // 前端删除文件
    fileList.value.splice(e[0],1)
}

// 新建
const newDiary = () => {
  if (fileList.value.length > 0) {
    diaryForm.value.picture = fileList.value.map((obj: any) => JSON.stringify(obj)).join(" ")
  }
  diaryForm.value.moment = new Date()
  let data = {
    token: userStore.token,
    value: diaryForm.value
  }
  createDiaryApi(data).then((res: any) => {
    if (tackleCode(res.code)) {
      // 新建的日记传给父亲
      let data = diaryForm.value
      data.id = res.id
      emits("diaryData", data)
      // 清空内容
      diaryForm.value = createEmptyDiary()
      fileList.value = []
      proxy.$message({ type: 'primary', message: '发布成功' })
    }
  })
}

// 取消
const cancel = () => {
  diaryForm.value={
    id: 0,
    title: '',
    weather_id: 0,
    moment: new Date(),
    content: '',
    picture: '',
  }
  fileList.value = [];
}

</script>

<style lang="less" scoped>
.diary-editor{
  background: @bg-color-l;
  border-radius: @radius-m;
  width: 100%;

  &__form{
    padding: @space-xl;
  }

  &__top{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title{
    font-size:@size-xl;
    font-weight: bold;
    color:@font-color-l;
    padding-bottom: @space-m;
  }
  &__picture{
    padding-top: @space-xl;
  }

  /* 确保相对定位，这样 ::before 的绝对定位才有效 */
  &__weather {
    position: relative; 
    cursor: pointer;
    img {
      width: 24px;
      height: 24px;
    }
  }
  
  /* 设置天气图标显示 */
  img {
    width: 24px;
    height: 24px;
  }

  .selected{
    &::before{
      position: absolute;
      bottom:-6px;
      left: 50%;
      transform: translateX(-50%); /* 让圆点居中 */
      content:"";
      display:block;
      width: 6px;
      height: 6px;
      border-radius: 50%; /* 建议改成 50% 变圆点 */
      background: @pcolor;
    }
  }

  input{
    border: none;
    background: transparent;
    outline: none;

    &::placeholder{
      color:@gray-4;
    }
  }

  &__foot{
    display: flex;
    justify-content: end;
    padding: @space-m;
    border-top: 1px solid @line-color-s;
  }
}
</style>

<style lang="less">
.diary-editor{
  .yk-text-area{
    background-color: transparent;
    border:none;
    border-radius: 0;
    padding:0px;
  }
  .yk-text-area__inner{
    font-size: @size-m;
    line-height: 1.5;
    &::placeholder{
      color:@gray-5;
    }
  }
}
</style>