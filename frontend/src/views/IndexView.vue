<template>
  <div class="index-view">
  <!-- 菜单 -->
  <menu-bar/>
   <router-view></router-view>
   </div>
</template>

<script lang="ts" setup>
import MenuBar from '../components/bar/MenuBar.vue';
</script>

<style lang="less" scoped>
.index-view{
  padding-top: 0;
  padding-left: 200px;
  padding-right: 200px;
  padding-bottom: 200px;
}
</style>