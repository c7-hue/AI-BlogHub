<template>
  <yk-space dir="vertical" class="menu-bar" size="m">
    <router-link :to="item.path" v-for="item in navList":key="item.path" class="menu-bar__nav">
      <yk-space align="center" size="m">
        <component :is="item.icon" />
        <yk-text>{{ item.name }}</yk-text>
      </yk-space>
    </router-link>
  </yk-space>
</template>

<script setup lang="ts">
import { navList } from '../../utils/menu';
</script>

<style lang="less" scoped>
.menu-bar{
  // width: 160px;
  padding: @space-l;
  position: fixed;//将菜单栏 固定定位 在页面上：距离顶部 72px，距离左侧 8px
  top: 72px;
  left: 8px;

  &__nav{
    width: 160px;
    height: 40px;
    padding: 0 @space-l; //内边距
    border-radius: @radius-m; //设置圆角
    display: flex;
    align-items: center;
    text-decoration: none;

    .yk-icon{//图片
      color: @font-color-ss;
      width: 16px;
      height: 16px;
    }
    &:hover{//鼠标悬停时
      background-color: @bg-color-l;
      .yk-text{//文字
        font-weight: 600;
      }
    }
  }
  .router-link-active{
    background: linear-gradient(180deg,#2b5aedde 0%,#2B5AED 100%);
    
    .yk-icon{
      color: @bg-color-l;
    }

    .yk-text{
      color: @bg-color-l;
      font-weight: 600;
    }
  }
}
</style>