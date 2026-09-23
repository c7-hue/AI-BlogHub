<template>
  <div class="top-title">
    <yk-space justify="start" align="center" class="title-container">
      <yk-title>{{ name }}</yk-title>
    </yk-space>
    <yk-space class="right-container" align="center">
      <slot name="custom"></slot>
      <yk-space class="search-container" size="s" v-if="showSearch" justify="end">
        <yk-button type="secondary" v-show="SearchData" @click="cancelSearch">取消搜索</yk-button>
        <yk-input-search style="width: 320px;" placeholder="请输入..." v-model="SearchData" @search="search">
          <template #suffix>
            <yk-button type="secondary">
              <IconSearchOutline/>
            </yk-button>
          </template>
        </yk-input-search>
      </yk-space>
    </yk-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface TopTitleProps {
  name?: string;
  isSearch?: boolean;
}

const SearchData = ref<string>('');

const props = withDefaults(defineProps<TopTitleProps>(), {
  name: '总览',//默认的标题是"总览"
  isSearch: true,
});

// 根据 isSearch 属性控制搜索框显示
const showSearch = computed(() => {
  return props.isSearch !== false; // 只有明确设置为 false 时才不显示
});

const emit = defineEmits<{
  (e: 'search', value: string): void;
}>();

const search = (value: string) => {
  emit('search', value);
};

const cancelSearch = () => {
  SearchData.value = '';
  emit('search', '');
};

// 组件卸载时清理
onUnmounted(() => {
  SearchData.value = '';
});
</script>

<style lang="less" scoped>
.top-title {
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title-container {
    flex: 0 0 auto;
    margin-right: auto;
  }
  
  .right-container {
    flex: 0 0 auto;
    margin-left: auto;
    align-items: center;
    
    .search-container {
      flex: 0 0 auto;
      margin-left: auto;
      
      .yk-input-search {
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
      
      .yk-button {
        transition: all 0.2s ease;
      }
    }
  }
}
</style>