<template>
  <yk-space class="gather">
    <div v-for="(item,index) in gathers":key="index" class="gather__list" :style="{'background': 'linear-gradient('+ item.bgColor+')'}">
      <yk-space dir="vertical" size="s">
      <yk-text type="secondary">{{item.name}}</yk-text>
      <yk-title :level="2" style="margin:0">{{item.total}}</yk-title>
      </yk-space>
      <yk-button v-if="index>0" size="xl" type="secondary" shape="square" @click="editPage(item.path)">
        <IconPlusOutline/>
      </yk-button>
    </div>
  </yk-space>
</template>

<script setup lang="ts">
import {ref,onMounted} from 'vue'
import { overLink } from '../../utils/menu';
import { useRouter } from 'vue-router';
import { overviewApi } from '../../api/index';
import { useUserStore } from '../../store/user';
import {useCode} from '../../hooks/code'

const userStore = useUserStore()

const {tackleCode} = useCode()

const router = useRouter();

const gathers = ref(overLink)

// 获取数据
const drawGatherData=()=>{
  // let data=overview.data;
    let request = {
      token:userStore.token,
    }
    overviewApi(request).then((res:any)=>{
      if(tackleCode(res.code)){
        // 返回的数据
        let data=res.data;
        // 确保数据存在，否则使用默认值
        gathers.value[0]!.total = data.file || '0M'
        gathers.value[1]!.total = data.article || 0
        gathers.value[2]!.total = data.gallery || 0
        gathers.value[3]!.total = data.diary || 0  
      }
    }).catch((error:any)=>{
      console.error('获取总览数据失败:', error)
      // 请求失败时使用默认值
      gathers.value[0]!.total = '0M'
      gathers.value[1]!.total = 0
      gathers.value[2]!.total = 0
      gathers.value[3]!.total = 0
    })
  }


// 跳转到编辑页面
const editPage = (path:string) => {
  router.push({path});
}

onMounted(()=>{
  drawGatherData();
})

</script>

<style lang="less" scoped>
.gather{
  width: 100%;
  &__list{
    width:25%;
    background: #eee;
    display:flex;
    justify-content: space-between;
    padding: @space-xl;
    border-radius: @radius-m;
    align-items: center;
    &:first-child{
      .yk-title,.yk-text{
        color: @white;
      }
    }
  }
}
</style>