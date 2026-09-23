<template>
   <yk-space dir="vertical" size="l" style="width: 100%;"> 
     <User_Settings></User_Settings>
     <Website_Logo_and_Homepage></Website_Logo_and_Homepage>
     <About_Page></About_Page>
    </yk-space>

</template>

<script setup lang="ts">
import User_Settings from '@/components/settings/User_Settings.vue'
import About_Page from '@/components/settings/About_Page.vue'
import Website_Logo_and_Homepage from '@/components/settings/Website_Logo_and_Homepage.vue'
</script>

<style lang="less" scoped>

</style>