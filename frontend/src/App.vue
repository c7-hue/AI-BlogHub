<template>
  <head-bar/>
  <router-view></router-view>
  <GlobalAIAssistant/>
</template>

<script setup lang="ts">
import HeadBar from './components/bar/HeadBar.vue';
import GlobalAIAssistant from './components/ai/GlobalAIAssistant.vue';

</script>

<style lang="less" scoped>
@color: @ecolor;
.test{
  color: @color;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
