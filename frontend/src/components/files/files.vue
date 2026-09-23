<template>
  <div class="files">
    <div class="files_tool" v-show="selectedFilesId.length>0"><!-- //v-show 用于根据表达式值的真假来切换元素的可见性。 -->
      <yk-space >
        <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
          全选 
        </yk-checkbox>
        <yk-text>已选择{{selectedFilesId.length}}项内容</yk-text>
        <yk-text type="primary" style="cursor: pointer" @click="removeAll">取消选择</yk-text>
      </yk-space>
      <yk-space>
        <IconDeleteOutline class="files_tool-delete" @click="deleteFiles"/>
        <yk-popconfirm
      title="选择分组" placement="bottomRight" trigger="click" @cancel="cancel" @confirm="confirm">
      <IconSwitchOutline class="files_tool-switch"/>
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
    </div>
    <div class="files_main">
      <FilesItem v-for="item in files"  :data="item" :key="item.id" @delete="deleteFile" @selected="selectFile" @changeSubsetId="changeSubset"/>    
    </div>
    <div class="pagination" v-show="count/props.pageSize > 1"> 
      <yk-pagination :total="count" size="m" @change="changePage" :default-page-size="props.pageSize"></yk-pagination>  
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance,watch} from 'vue'
import FilesItem from './files-item.vue'
import {useSubsetStore} from '../../store/subset';
import './files.less'
import {useCode} from '../../hooks/code'
import {useUserStore} from '../../store/user'
import {deleteFileApi,removeFileApi,getFileApi} from '../../api/index'

const userStore = useUserStore()

const {tackleCode}=useCode()

//store
const subsetStore = useSubsetStore();

type FileProps ={
  pageSize:number;
  subsetId:number|string
}

const props=withDefaults(defineProps<FileProps>(),{ // ① 声明 props 类型
  pageSize:16,                                       // ② 设置默认值
  subsetId:-1,
})
//总数
const count = ref<number>(123)// 总共123个文件

// 数据内容
const files=ref<any[]>([]);

// 请求
type Request={
  token:string;
  pageSize:number;//单页条数
  nowPage:number;//当前页
  count:boolean;
  subsetId?:number|string;
}

const request:Request={// 当前第1页
  token:userStore.token,
  pageSize:props.pageSize,
  nowPage:1,
  subsetId:props.subsetId,
  count:false,
}

// 获取数据
const drawData = (e: boolean) => {
  request.count = e;

  getFileApi(request).then((res: any) => {  
    if (tackleCode(res.code)) {
      console.log(res.data)
      if (e) {
        count.value = res.data.count
      }
      let arr = res.data.list
      // 加入选择项
      for (let i = 0; i < arr.length; i++) {
        arr[i].selected = false;
      }
      files.value = arr
    }
  })

  // console.log(files.value)
}

// 头部操作
const checkedAll = ref(false)// 全选框是否勾选
const indeterminate = ref(false)// 半选状态（部分选中时显示横线）

const handleChangeAll = (value: boolean) => {// 点击全选时切换状态
  checkedAll.value = value
  indeterminate.value = false
  
  // 更新所有文件的选中状态
  selectedFilesId.value = [];
  files.value = files.value.map((file: any) => {
    const updatedFile = {
      ...file,
      selected: value
    };
    if(value) {
      selectedFilesId.value.push(file.id);
    }
    return updatedFile;
  });
}

//取消选择
const removeAll=()=>{
  selectedFilesId.value=[]
  for(let i=0;i<files.value.length;i++){
    files.value[i].selected=false
  }
}

//被选中图片ID的数组
const selectedFilesId = ref<number[]>([]);

//选择操作
const selectFile=(e:any)=>{
  for(let i=0;i<files.value.length;i++){
    if(files.value[i].id==e.id){
      // 使用响应式方式更新选中状态
      const newSelectedState = !files.value[i].selected;
      files.value[i] = {
        ...files.value[i],
        selected: newSelectedState
      };
      
      if(newSelectedState){
        selectedFilesId.value.push(e.id);
      }else{
        //从数组中删除对应项
        selectedFilesId.value.splice(selectedFilesId.value.indexOf(e.id),1); 
      }
      //半选与全选
      if(selectedFilesId.value.length==0){
        indeterminate.value=false
        checkedAll.value=false;
      }else if(selectedFilesId.value.length==files.value.length){
        indeterminate.value=false;
        checkedAll.value=true;
      }else{
        indeterminate.value=true;
        checkedAll.value=false;
      }
    }
  }
}

// 删除
// 删除单张图片
const deleteFile = (id: number, url: string) => {
  let request = {
    token: userStore.token,
    filesId: id,
    filesUrl: url,
  }
  deleteFileApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      proxy.$message({ type: 'success', message: '删除成功' })
      files.value = files.value.filter((item: any) => {
        return item.id !== id
      })
    }
  })
}

// 全部删除
const deleteFiles = () => {
  if (selectedFilesId.value.length > 0) {
    // 收集提交后端内容
    let url = []
    for (let i = 0; i < selectedFilesId.value.length; i++) {
      for (let j = 0; j < files.value.length; j++) {
        if (files.value[j].id == selectedFilesId.value[i]) {
          url.push(files.value[j].url) // 注意：此处可能有逻辑错误，见下方分析
        }
      }
    }

    let request = {
      token: userStore.token,
      filesId: selectedFilesId.value.join(','),
      filesUrl: url,
    }

    deleteFileApi(request).then((res: any) => {
      if (tackleCode(res.code)) {
        proxy.$message({ type: 'primary', message: '删除成功~' })
        // 从数据中移除已删除的文件 静态删除被删除的文件  
        for (let i = 0; i < selectedFilesId.value.length; i++) {
          files.value = files.value.filter((item: any) => {
            return item.id !== selectedFilesId.value[i]
          })
        }
        // 清除选择的ID
        selectedFilesId.value = [];
      }
    })
  }
}

// 翻页
const changePage=(e:number)=>{
  // 保存当前选中的文件ID
  const currentSelectedIds = [...selectedFilesId.value];
  
  request.nowPage=e; // 📄 更新当前页码（比如从1变成2）
  drawData(false);// 🔄 重新加载数据，但不更新总数
  
  // 恢复选中状态（如果这些ID在新页面中存在）
  selectedFilesId.value = [];
  files.value = files.value.map((file: any) => {
    const isSelected = currentSelectedIds.includes(file.id);
    if(isSelected) {
      selectedFilesId.value.push(file.id);
    }
    return {
      ...file,
      selected: isSelected
    };
  });
  
  // 更新全选和半选状态
  if(selectedFilesId.value.length == 0){
    indeterminate.value = false;
    checkedAll.value = false;
  } else if(selectedFilesId.value.length == files.value.length){
    indeterminate.value = false;
    checkedAll.value = true;
  } else {
    indeterminate.value = true;
    checkedAll.value = false;
  }
}

// 切换单张图片分组
const changeSubset = (e: any) => {
  console.log(e)

  let request = {
    token: userStore.token,
    id: e.id,
    subsetId: e.subsetId,
  }
  removeFileApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      // 静态删除列表项
      files.value = files.value.filter((item: any) => {
        return item.id !== e.id
      })
      // 将分组数字修改
      for(let i=0;i<subsetStore.data.length;i++){
        const item = subsetStore.data[i]
        if(!item) continue
        // 增加移动后分组
        if(item.id==e.subsetId){
          item.value++
        }
        // 减少移动前分组
        if(item.id==props.subsetId &&props.subsetId!=-1){
          item.value--
        }  
      } 
      proxy.$message({ type: 'primary', message: '移动完成' })
    }
  })
}

//分类选择
const subsetSelectedId=ref<number | string>();
//切换 分组
const changeOption=(e:number | string)=>{
  subsetSelectedId.value=e;
}

const proxy: any = getCurrentInstance()?.proxy
function cancel() {
  proxy.$message({ type: 'warning', message: '你点击了取消按钮' })
}

// 切换多张图片分组
function confirm() {
  let request = {
    token: userStore.token,
    fileId: selectedFilesId.value.join(','),
    subsetId: subsetSelectedId.value,
  }
  removeFileApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      // 静态删除列表项
      for (let i = 0; i < selectedFilesId.value.length; i++) {
        files.value = files.value.filter((item: any) => {
          return item.id !== selectedFilesId.value[i]
        })
      }
      // 将分组数字修改
      for (let i = 0; i < subsetStore.data.length; i++) {
        const item = subsetStore.data[i]
        if(!item) continue
        // 增加移动后分组
        if (item.id === subsetSelectedId.value) {
          item.value += selectedFilesId.value.length
        }
        // 减少移动前分组
        if (item.id === props.subsetId && props.subsetId !== -1) {
          item.value -= selectedFilesId.value.length
        }
      }
      // 清除选择的ID
      selectedFilesId.value = [];
      proxy.$message({ type: 'primary', message: '移动完成' })
    }
  })
}

watch(
  props,()=>{
  // 查询数据
  request.subsetId=props.subsetId;
  request.nowPage=1;
  drawData(true);
})

onMounted(()=>{
  drawData(true);// 🚀 页面刚打开时，首次加载数据+总数
})

</script>

<style lang="less" scoped>
.files{
  padding:@space-xl;
  border-radius: @radius-m;
  background: @bg-color-l;
  width: 100%;

  &_tool{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @space-l;
    border-radius: @radius-m;
    background: @bg-color-m;
    
    &-delete,&-switch{
      color: @font-color-s;
      width: 20px;
      height: 20px;
      cursor: pointer;
      &:hover{
        color: @font-color-l;
      }
    }
    
  }
  &_main{
    padding:24px 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill,200px);
    row-gap:32px;
    column-gap:24px;
    justify-content: center;
  }
  .pagination{
    padding:@space-l 0 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
  }
}
</style>