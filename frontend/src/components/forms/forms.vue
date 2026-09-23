<template>
  <div class="form">
    <yk-space dir="vertical" size="xl" padding-top="16px">
      <input type="text" class="form__title" placeholder="请输入标题" v-model="formatData.title">

      <yk-space dir="horizontal" style="margin-bottom: 20px;">
        <yk-space align="center">
          <div class="subset">
            <input type="text" placeholder="选择分类" disabled v-model="subsetName" style="width: 110px;height:28px;"/>
            <IconDownOutline/>
            <yk-dropdown @selected="subsetSelect">
              <yk-dropdown-item v-for="item in subsetList" :value="item.id">{{ item.name }}</yk-dropdown-item>
            </yk-dropdown>
          </div>
        </yk-space>

        <yk-space align="center" size="s">
          <yk-tag v-for="(tag,index) in formatData.label" :key="index" closeable shape="round" @close="deleteLabel(tag)">
            {{ tag }}
          </yk-tag>
          <yk-text type="third" @click="showlabel" style="cursor: pointer;white-space: nowrap;" v-show="formatData.label!.length<3">
            插入标签
          </yk-text>
        </yk-space>
      </yk-space>

    </yk-space>
    <div :class="{introduce:props.classify==0}">
      <yk-text-area v-model="formatData.introduce" :max-length="800" placeholder="请输入简介" :auto-size="raw">
      </yk-text-area>
    </div>
    <div class="form__cover" v-if="$props.classify==0">
    <yk-upload :upload-url="uploadUrl" :file-list="fileUrl" accept="image/*" :limit="1" desc="封面800x600" @handle-success="handleSuccess"></yk-upload>
  </div>
   <yk-modal v-model="visible" title="标签" size="s" :show-footer="false">
    <yk-space dir="vertical" size="l">
      <yk-input v-model="inputValue" placeholder="请输入标签回车确定" style="width: 280px;" @submit="addLabel"></yk-input>
       <yk-space size="s">
         <yk-tag v-for="(tag,index) in formatData.label" :key="index" closeable shape="round"  @close="deleteLabel(tag)">
            {{ tag }}
          </yk-tag>
       </yk-space>
       <yk-space wrap size="s" style="padding-top: 8px;">
        <yk-tag v-for="(tag,index) in labelArr" :key="index" shape="round" style="cursor: pointer;" @click="selectLabel(tag)">
            {{ tag }}
          </yk-tag>
       </yk-space>
    </yk-space>
   </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref,computed ,watch} from 'vue'
import {useSubset} from '../../hooks/subset'
import {useLabel} from '../../hooks/label'
import {useSubsetStore} from '../../store/subset'
import {baseUrl,baseImgUrl} from '../../utils/env'
import {useCode} from '../../hooks/code'
import type { FormData } from '../../utils/interface';

const {tackleCode} = useCode()

// store
const subsetStore = useSubsetStore();

const {rawSubset} = useSubset()
const {rawlabel,label,inputValue,confirm} = useLabel();

type formProps={
  classify:number;
  form?:FormData;
}

const props=withDefaults(defineProps<formProps>(),{ 
  classify:0,
})

// const props=defineProps({
//   classify:{
//     default:0,
//     type:Number
//   }
// })

const emits=defineEmits(['formData'])

type AISuggestion = {
  title?: string;
  introduce?: string;
  tags?: string[];
  categoryName?: string;
}

const formatData = ref<FormData>({
  title:"",
  subset_id:undefined,
  label:[],//标签
  introduce:'',//简介
  cover:"",
  classify:props.classify,
})

// 简介行数
const raw=computed(()=>{
  if(props.classify==1){
    return {
      minRows:24,
      maxRows:30
    }
  }else{
    return {
      minRows:4,
      maxRows:10
    }
  }
})




// 分类名称
const subsetName = ref();

//选择分类
const subsetSelect = (e:number) =>{
  formatData.value.subset_id = e;
  for (let i=0;i<subsetList.value.length;i++){
    if (subsetList.value[i].id === e){
      subsetName.value = subsetList.value[i].name;
    }
  }
}
// 当前分类
const nowSubset =(e:number)=>{
  for (let i=0;i<subsetList.value.length;i++){
    if (subsetList.value[i].id === e){
      subsetName.value = subsetList.value[i].name;
    }
  }
}
// 获取分类
const subsetList = ref()
// subsetList.value=subsetStore.data
// const getSubset = () =>{
//   subsetList.value=subset.data.list
//   console.log(subsetList.value);
  
// }

// 标签
// 所有标签
const labelArr = ref<any[]>([])
//标签弹窗
const visible = ref<boolean>(false)
const showlabel = () =>{
  visible.value = true
}

// 增加标签
const addLabel = () =>{
  if (inputValue.value && formatData.value.label!.length  <3){
    confirm()
    formatData.value.label!.push(inputValue.value)//增加标签
  }
}

// 选择标签
const selectLabel = (e:string)=>{
  if(formatData.value.label!.length<3){
    formatData.value.label!.push(e)
    labelArr.value=labelArr.value.filter((obj:number|string)=>{
      return obj!=e
    })
  }
}

// 删除标签
const deleteLabel = (e:number|string)=>{
  labelArr.value.push(e)
  formatData.value.label=(formatData.value.label as string[]).filter((obj:string)=>{
    return obj!=e
  })
}

// 上传封面
const uploadUrl = `${baseUrl}/upload`
const fileUrl = ref<{name:string,url:string}[]>([])

// 图片提交成功
const handleSuccess = (res:any) =>{
  if(tackleCode(res.code)){ 
    let photoUrl = {name:res.data.file_name,url:baseImgUrl+'/'+res.data.url}
    fileUrl.value.push(photoUrl)
    formatData.value.cover=photoUrl.url 
  }
}

const emitFormData = () => {
  emits('formData', formatData.value)
}

const normalizeTags = (tags: string[]) => {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 3)
}

const syncCoverPreview = () => {
  if (formatData.value.cover) {
    const url = formatData.value.cover.startsWith('http')
      ? formatData.value.cover
      : baseImgUrl + '/' + formatData.value.cover
    fileUrl.value = [{ name: 'cover', url }]
  } else {
    fileUrl.value = []
  }
}

const setFormData = (data: Partial<FormData>) => {
  formatData.value = {
    ...formatData.value,
    ...data,
    label: Array.isArray(data.label) ? normalizeTags(data.label) : formatData.value.label || [],
  }

  if (formatData.value.subset_id && subsetList.value) {
    nowSubset(formatData.value.subset_id)
  }
  syncCoverPreview()
  emitFormData()
}

const applyAISuggestion = (suggestion: AISuggestion) => {
  const nextData: Partial<FormData> = {}
  if (suggestion.title) {
    nextData.title = suggestion.title
  }
  if (suggestion.introduce) {
    nextData.introduce = suggestion.introduce
  }
  if (suggestion.tags?.length) {
    nextData.label = suggestion.tags
  }
  if (suggestion.categoryName && subsetList.value?.length) {
    const category = subsetList.value.find((item: any) => {
      return item.name === suggestion.categoryName || item.subset_name === suggestion.categoryName
    })
    if (category) {
      nextData.subset_id = category.id
      subsetName.value = category.name || category.subset_name
    }
  }
  setFormData(nextData)
}

defineExpose({
  applyAISuggestion,
  setFormData,
})

watch(formatData.value,(e)=>{
  emits('formData',e)
},{deep:true})

watch(
  ()=>label.value,
  (e:any)=>{
  for (let i = 0;i<e.length;i++){
    labelArr.value.push(e[i].label_name);
  }
})

watch(
  ()=>subsetStore.data,
  (e)=>{
    subsetList.value=e
    if(formatData.value.subset_id){
      nowSubset(formatData.value.subset_id)
    }
  } ,
  {  immediate:true }
)

watch(
  ()=>props.form,
  (e)=>{
    formatData.value=e!
    if(formatData.value.cover){
      let photoUrl = {name:'',url:baseImgUrl+'/'+formatData.value.cover}
      fileUrl.value=[photoUrl]  
    } 
    if(formatData.value.subset_id && subsetList.value){
      nowSubset(formatData.value.subset_id)
    }
  }
)

// 初始化 form 数据
const initFormData = (formData: any) => {
  if (formData) {
    formatData.value = {
      ...formatData.value,
      ...formData
    }
    // 设置分类名称
    if (formData.subset_id) {
      for (let i = 0; i < subsetList.value.length; i++) {
        if (subsetList.value[i].id === formData.subset_id) {
          subsetName.value = subsetList.value[i].name;
          break;
        }
      }
    }
    // 设置封面图片
    if (formData.cover) {
      fileUrl.value = [{ name: 'cover', url: formData.cover }]
    }
  }
}

onMounted(()=>{
  rawSubset(props.classify) 
  rawlabel();
  // 初始化 form 数据
  if (props.form) {
    initFormData(props.form)
  }
})

// 监听 form 属性变化
watch(
  () => props.form,
  (e) => {
    formatData.value = e!
    if (formatData.value.cover) {
      let photoUrl = { name: '', url: baseImgUrl + '/' + formatData.value.cover }
      fileUrl.value=[photoUrl]  
    }
})
</script>

<style lang="less" scoped>
.form {
  position: relative;//相对定位
  
  input{
    border: none;
    background: transparent;
    outline: none;

    &::placeholder{
      color: @gray-4;
    }
  }

  &__title{
    font-size: @size-xl;
    font-weight: 600;
  }

  .yk-dropdown{
    position: absolute;
    top: 0;
  }

  .yk-text-area{
    border: 0px solid transparent;
    border-radius: 0;
    background-color: transparent;//透明背景
    padding: 0px;
  }

  .introduce{
    width: 100%;
    border-bottom: 1px solid @gray-2;//下边框颜色
  }

  &__cover{
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>

<style lang="less">
.form{
  .yk-dropdown__title{
    width: 120px;
     height: 24px;
  }

  .yk-upload__picture-button{
    width: 160px;
    height: 120px;
  }

  .yk-upload-picture{
    width: 160px;
    height: 120px;
  }
}
</style>
