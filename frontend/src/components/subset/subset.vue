<template>
  <div class="subset">
    <yk-space wrap><!--wrap可以换行 -->
      <div class="subset__menu" :class="{'subset__menu--selected':selected==='-1all'}" @click="changeOption(-1,'all')">
        全部{{ subsetStore.count }}
      </div>
      <div class="subset__menu" v-for="item in state" :key="item.id" v-if="props.classify == 0" 
      :class="{'subset__menu--selected':selected===item.id+'state'}" @click="changeOption(item.id,'state')">
        {{ item.name }} {{ item.value }}
      </div>
      <div class="subset__menu" :class="{'subset__menu--selected': selected===subsetStore.exclude.id+'exclude'}" @click="changeOption(subsetStore.exclude.id,'exclude')">
        {{ subsetStore.exclude.name }} {{ subsetStore.exclude.valid }}
      </div>
      <div class="subset__menu" v-for="item in subsetStore.data" 
      :key="item.id" :class="{'subset__menu--selected':selected===item.id+'subset'}" @click="changeOption(item.id,'subset')">
        {{ item.name }} {{ item.value }}
      </div>
    </yk-space>

    <yk-space style="flex:none">
      <yk-popconfirm 
      title="新建分组"   @cancel="cancel"  trigger="click" @confirm="confirm(props.classify)" placement="bottom">
        <yk-text type="primary">
          <IconCirclePlusOutline style="margin-right: 4px;"/>新建分组
        </yk-text>
        <template #content>
          <div style="margin: 8px 4px 16px;"> <!--上  左右  下  -->
          <yk-input show-counter :limit="6" placeholder="请输入..." style="width: 208px" v-model="inputValue"/>
          </div>
        </template>
      </yk-popconfirm>
      <yk-text type="primary" @click="showModel">
          <IconSettingsOutline style="margin-right: 4px;"/>管理分组
        </yk-text>
    </yk-space>
    <yk-modal v-model="visible" title="管理分组">
      <subset-manage></subset-manage>
      <template #footer>
        <yk-button @click="showModel">确定</yk-button>
      </template>
    </yk-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted} from 'vue'; 
import subsetManage from './subset-manage.vue'
import {useSubset} from '../../hooks/subset'

const emit = defineEmits(['nowSubset'])

const {inputValue,selected,subsetStore,cancel,changeOption,rawSubset,confirm,visible,showModel,getState,state}=useSubset(emit)

const props=defineProps({
  classify:{
    type:Number,
    default:-1
  }
})


onMounted(()=>{//当组件第一次显示到页面上时，自动执行 rawSubset()。  页面一打开，就加载假数据   onMounted 是 Vue 的生命周期钩子，表示“组件挂载完成”。
  rawSubset(props.classify)
  if(props.classify == 0){
    getState()
  }
})

</script>

<style lang="less" scoped>
.subset{
  padding:@space-l @space-xl;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 100%;
  display: flex;
  justify-content: space-between;//第一个子元素靠最左边  最后一个子元素靠最右边
  align-items: center;//垂直居中

  .yk-text{
    cursor: pointer;
  }

  &__menu{
    line-height: 32px;//行高
    padding:0 @space-l;
    background: @bg-color-m;
    border-radius: @radius-r;
    user-select: none;//禁止选中
    cursor: pointer;//手形
    &--selected{
      background:@pcolor-1;
      color:@pcolor;
      font-weight: 500;
    }
  }
}
</style>