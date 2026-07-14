import{defineStore} from 'pinia'
import type {SubsetData} from '../utils/interface'
import { reactive } from 'vue'

export const useSubsetStore=defineStore('subset',{
  state:()=>{
    return {
      //所有这些属性都将自动推断出它们的类型
      count:0,
      data:[] as SubsetData[]
    }
  },
  getters:{
    exclude:(state)=>{
      // 拿到所有id,计算未分组数
      const idArray = state.data.map(item => item.id);
      const totalValue = state.data.reduce((sum, item) => sum + item.value, 0);
      const ungroupedCount = state.count - totalValue;
      
      return {
        id: idArray.join(','),
        name: "未分类",
        valid: ungroupedCount
        ,value:ungroupedCount
      }
    }
  },
  actions:{
    subsetName(e?:number){
      for(let i=0;i<this.$state.data.length;i++){
        const item = this.$state.data[i]
        if(item && item.id===e){
          return item.subset_name || item.name
        }
      }
      return '未分类'
    }
  }
})

// 导出subset和state供组件使用
export const subset = reactive({
  data: {
    list: [] as SubsetData[],
    count: 0
  }
});

export const state = reactive({
  data: [] as SubsetData[]
});