<template>
  <head-bar/>
  <router-view></router-view>
  <footer class="site-footer">
    <p>
      <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">苏ICP备2026078874号</a>
      <span> · </span>
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=32050602014783" target="_blank" rel="noopener">
        <img src="/beian.png" alt="公安备案图标">苏公网安备32050602014783号
      </a>
    </p>
    <p>© 2026 zzlabai.top · Zhang</p>
  </footer>
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

.site-footer {
  padding: 24px 16px 32px;
  text-align: center;
  font-size: 13px;
  color: #999;
  border-top: 1px solid #eee;

  p { margin: 6px 0; }

  a {
    color: #999;
    text-decoration: none;

    &:hover { color: #666; }
  }

  img { height: 14px; vertical-align: -2px; margin-right: 3px; }
}
</style>
