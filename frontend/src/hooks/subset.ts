import {  ref,getCurrentInstance} from 'vue'; 
import {useSubsetStore} from '../store/subset'
import { useUserStore } from '../store/user'
import {addSubsetApi,subsetApi,deleteSubsetApi,updateSubsetApi,articleStateApi} from '../api'
import {useCode} from '../hooks/code'

export function useSubset(emits?:any){
  const {tackleCode}=useCode()
  
  //store
  const subsetStore = useSubsetStore();
  const userStore = useUserStore();
  
  // 新建分组内容
  const inputValue = ref<number|string>()
  
  // 当前选择
  const selected = ref<string>('-1all')
  
  // 选择切换
  const changeOption = (id:number|string,type:string)=>{
    if(id+type!=selected.value){
      selected.value=id+type
      emits('nowSubset',{id,type})
    }
  }
  
  //获取分组
  const rawSubset = (e:number)=>{
    let request = {
      token :userStore.token,
      classify:e,
    }
    subsetApi(request).then((res:any)=>{
      if(tackleCode(res.code)){
        // console.log(res);
        subsetStore.data = res.data.list
        subsetStore.count=res.data.count  
      }
    })  
  }
  
  const proxy: any =getCurrentInstance()?.proxy
  
  // 取消
  function cancel(){
    inputValue.value=''
  }
  
  // 新建分组
  function confirm(e:number){
    if(inputValue.value){
      let request = {
        token :userStore.token,
        value:{
          classify:e,
          subset_name:inputValue.value,
        }
      }
      addSubsetApi(request).then((res:any)=>{
        if(tackleCode(res.code)){
          // console.log(res);
          let sub ={
            id:res.data,
            name:inputValue.value!,
            value:0,
          }
          subsetStore.data.push(sub)
          inputValue.value=''
          proxy.$message({type:'primary',message:'插入成功'})
        }
      })
    }else {
      proxy.$message({type:'warning',message:'请输入分组名称'})
    }
  }
  
  // 管理分组
  const visible = ref<Boolean>(false)
  const showModel = ()=>{
    visible.value=!visible.value
  }
  // 删除分组
const deleteSubset = (e: number | string) => {
  let request = {
    subsetId: e,
    token: userStore.token
  }
  deleteSubsetApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      // 前端数组静态删除
      subsetStore.data = subsetStore.data.filter(
        (obj: { value: any; id: number | string }) => {
          if (obj.id === e) {
            subsetStore.exclude.value += obj.value
          }
          return obj.id !== e
        }
      )
      proxy.$message({ type: 'primary', message: '删除成功' })
    }
  })
}
// 修改分组信息
const updateSubset = (e: number | string) => {
  // 提交后端处理
      let request = {
        subsetId:e,
        subsetName:inputValue.value!,   
        token:userStore.token,
      }
      console.log(request);
      updateSubsetApi(request).then((res:any)=>{
        if(tackleCode(res.code)){
          proxy.$message({ type:'primary', message:'修改成功'})
        }
      })      
}

// 获取文章不同状态下的数量
const state  = ref<{id:number,name:string,value:number}[]>()
const getState=()=>{
  let request = {
    token :userStore.token,
  }
  articleStateApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      console.log(res);
      state.value = res.data.list 
    }
  })
}

  return {
    inputValue,
    selected,
    subsetStore,
    cancel,
    changeOption,
    rawSubset,
    confirm,
    visible,
    showModel,
    deleteSubset,
    updateSubset,
    getState,
    state,
  }
}

