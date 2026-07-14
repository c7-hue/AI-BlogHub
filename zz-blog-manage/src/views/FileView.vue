<template>
  <yk-space size="1" dir="vertical" class="file-view">
    <top-title name="本地文件" :isSearch="false" style="margin-bottom:8px;">
      <template #custom>
        <yk-space align="center">
          <yk-text type="third">图片、视频、音频大小不超过20M</yk-text>
          <yk-upload :upload-url="uploadUrl" @handle-success="handleSuccess"></yk-upload>   
        </yk-space>
      </template>
    </top-title>

    <subsetVue :classify="2" @nowSubset="nowSelect" />
    <filesVue :subsetId="nowSubset" :pageSize="16" />
  </yk-space>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import TopTitle from '../components/bar/TopTitle.vue';
import filesVue from '../components/files/files.vue';
import subsetVue from '../components/subset/subset.vue';
import { baseUrl } from '../utils/env';
import {useCode} from '../hooks/code'

const {tackleCode}=useCode()

const nowSubset = ref<number | string>(-1)

const uploadUrl = `${baseUrl}/upload`

const nowSelect = (e: { id: number | string; type: string }) => {
  // console.log(e)
  if (e.type === "all") {
    nowSubset.value = -1
  } else if (e.type === "subset" || e.type === "exclude") {
    nowSubset.value = e.id
  }
}

// <!-- 图片提交 -->
const handleSuccess = (e: any) => {
  if (tackleCode(e.code)) {
    // 刷新当前页面
    location.reload()
  }
}

</script>

<style lang="less" scoped>
.file-view {
  width: 100%;
}
</style>
<style lang="less">
.file-view {
  .yk-upload {
    width: auto !important;
  }
  .yk-upload__file-button {
    margin-right: 0;
  }
}
</style>