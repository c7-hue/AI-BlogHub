import { ref,getCurrentInstance } from 'vue'
import type { LabelData } from '../utils/interface'
// import labelManage from './label-manage.vue'
// import type {labelData} from '../../utils/interface'
import {useUserStore} from '../store/user'
import {useCode} from '../hooks/code'
import {addLabelApi,labelApi,deleteLabelApi} from '../api'

export function useLabel(){
  const {tackleCode}=useCode()
  const userStore = useUserStore()

  // 新建标签内容 
  const inputValue = ref<string>()

  // 当前选择
  const selected = ref<string>('-1all')

  // 选择切换
  const changeOption = (id:number|string,type:string, emit: (event: 'nowlabel', value: { id: number | string; type: string }) => void)=>{
    if(id+type!=selected.value){
      selected.value=id+type
      emit('nowlabel',{id,type})
    }
  }

//获取标签
const label = ref<LabelData[]>([])
const rawlabel=()=>{
   let request = {
    token :userStore.token,
  }
  labelApi(request).then((res:any)=>{
    if(tackleCode(res.code)){
      // console.log(res);
      label.value = [...res.data]
    }
  })  
}

const proxy: any =getCurrentInstance()?.proxy

// 取消
function cancel(){
  inputValue.value=''
}

// 新建标签
function confirm(){
  if(inputValue.value){
    let request = {
      token :userStore.token,
      value:{
        moment:new Date(),
        label_name:inputValue.value,
      }
    }
    addLabelApi(request).then((res:any)=>{
      if(tackleCode(res.code)){
        // console.log(res);
        let lab ={
          id:res.data,
          label_name:inputValue.value!,
        }
        label.value.unshift(lab)
        inputValue.value=''
        proxy.$message({type:'primary',message:'插入成功'})
      }
    })
  }else {
    proxy.$message({type:'warning',message:'请输入分组名称'})
  }
}

// 删除标签
const deleteLabel = (e: number | string) => {
  let request = {
    labelId: e, 
    token: userStore.token
  }
  deleteLabelApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      // 前端数组静态删除
      label.value = label.value.filter(
        (obj: { id: number | string }) => {
          return obj.id !== e 
        }
      )
      proxy.$message({ type: 'primary', message: '删除成功' })
    }
  })
}


// 管理标签 
const visible = ref<Boolean>(false)
const showModel = ()=>{
  visible.value=!visible.value
}
return {
  showModel,
  label,
  rawlabel,
  cancel,
  confirm,
  inputValue,
  visible,
  selected,
  changeOption,
  deleteLabel,
 }
}