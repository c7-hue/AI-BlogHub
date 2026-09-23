<template>
  <div class="label">
  <div class="label__title">
    <yk-title :level="4" style="margin:0;">标签</yk-title>
    <yk-space style="flex:none">
      <yk-popconfirm 
      title="新建标签"   @cancel="cancel"  trigger="click" @confirm="confirm" placement="bottom">
        <yk-text type="primary">
          <IconCirclePlusOutline style="margin-right: 4px;"/>新建
        </yk-text>
        <template #content>
          <div style="margin: 8px 4px 16px;"> <!--上  左右  下  -->
          <yk-input show-counter :limit="6" placeholder="请输入..." style="width: 208px" v-model="inputValue"/>
          </div>
        </template>
      </yk-popconfirm>
      <yk-text type="primary" @click="showModel">
          <IconSettingsOutline style="margin-right: 4px;"/>管理标签
        </yk-text>
    </yk-space>
    </div>
       <yk-space wrap size="s"> <!--wrap可以换行 -->
      <yk-tag v-for="item in label" :key="item.id" 
      :class="{'label__menu--selected':selected===item.id+'label'}" @click="changeOption(item.id,'label', emits)">
        {{ item.label_name }}
      </yk-tag>
    </yk-space>
  </div>
      <yk-modal v-model="visible" title="管理标签">
      <label-manage :label="label" @deletelabel="handleDeleteLabel"></label-manage>
      <template #footer>
        <yk-button @click="showModel">确定</yk-button>
      </template>
    </yk-modal>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {useLabel} from '../../hooks/label'

const {showModel,label,rawlabel,cancel,confirm,inputValue,visible,selected,changeOption,deleteLabel}=useLabel()

const emits=defineEmits(['nowlabel'])

// 处理删除标签
const handleDeleteLabel = (id: number | string) => {
  deleteLabel(id)
}

onMounted(()=>{//当组件第一次显示到页面上时，自动执行 rawlabel()。  页面一打开，就加载假数据   onMounted 是 Vue 的生命周期钩子，表示“组件挂载完成”。
  rawlabel()
})

</script>

<style lang="less" scoped>
.label{
  padding:@space-l @space-xl;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 280px;
  float: none;
  
  &__title{
    display: flex;//flex布局
    justify-content: space-between;//第一个子元素靠最左边  最后一个子元素靠最右边
    align-items: center;//垂直居中
    margin-bottom: @space-l;//标签和操作按钮之间的间距是16
  }

}
</style>