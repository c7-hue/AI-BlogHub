<template>
    <yk-title :level="3">用户设置</yk-title>    
    <yk-space size="l" style="width: 100%;">  <!--//dir="vertical" 垂直方向排列  -->
      <!-- 左边部分 -->
       <yk-space class="user-settings">
        <yk-space class="user-settings__info">
            <yk-image src="https://www.huohuo90.com:3005/logo/yike.png" style="margin:20px" width="100"height="100":is-lazy="true"></yk-image> 
           <yk-space dir="vertical" size="0">
             <yk-title :level="4" size="0">张张</yk-title>
              <yk-text type="third">3077258497@qq.com</yk-text>
              <yk-text style="padding-top: 10px;">特征码</yk-text>  
              <yk-space size="0" class="user-settings__code"> 
                <yk-text :strong="true" type="primary" style="font-size: 22px;">{{ changeCode }}</yk-text>  
                <yk-popconfirm
                    title="修改特征码" placement="bottom" :arrow="false" @cancel="cancel" @confirm="confirm"
                  >
                   <template #content>
                      <div style="margin: 8px 4px 16px;"> <!--上  左右  下  -->
                      <yk-input show-counter :limit="16" placeholder="请输入..." style="width: 208px"  v-model="changeCode"/>
                      </div>
                  </template>
                   <IconModifyOutline class="user-settings__code__icon" />
                </yk-popconfirm>
              </yk-space>
           </yk-space>
        </yk-space>
        <yk-space class="user-settings__btn">
            <yk-button type="secondary">修改个人资料</yk-button>
            <yk-button>进入微博</yk-button>
        </yk-space>
       </yk-space>

       <!-- 右边部分 -->
       <yk-space class="user-settings__right" dir="vertical">
          <yk-space class="user-settings__right__progress" dir="vertical" > 
            <yk-space dir="vertical">
              <yk-space dir="horizontal" align="center" justify="between" style="width: 100%;">
                <yk-text type="third">图片空间</yk-text>
                <yk-text :strong="true">已用/24M</yk-text>
              </yk-space>
              <yk-progress :showText="false"></yk-progress>
            </yk-space>

            <yk-space dir="vertical">
              <yk-space dir="horizontal" align="center" justify="between" style="width: 100%;">
                <yk-text type="third">发布文章空间</yk-text>
                <yk-text :strong="true">已用/24篇</yk-text>
              </yk-space>
              <yk-progress :showText="false"></yk-progress>
            </yk-space>
            
          </yk-space>
          <yk-button style="position: absolute;bottom: 5px; right: 10px;"size="s">空间扩容</yk-button> 
       </yk-space>

    </yk-space>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { ref } from 'vue'

const changeCode = ref('111111111')  // 新增：存储特征码

const proxy: any = getCurrentInstance()?.proxy

function cancel() {
}
function confirm() {
  proxy.$message({ type: 'primary', message: '修改成功' })
}
</script>

<style lang="less" scoped>
.user-settings{
  background-color: white;
  width: 50%;
  height: 150px;
  display: flex;
  justify-content: left;
  align-items: center;
  &__info{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
  } 
  &__code{
    display: flex;
    justify-content: center;
    align-items: center;
    &__icon{
      margin-left: 8px;
      cursor: pointer;
      &:hover{
        color: #2B5AED;
      }
    }
  }
  
  
  &__btn{
    position: absolute;
     top: 20px; 
     right: 20px;
  }
}
.user-settings__right{
 background-color: white;
  width: 50%;
  height: 150px;
  display: flex;
  justify-content: left;
  align-items: center;
  &__progress{
    // display: flex;
    // justify-content: flex-start;// 水平方向对齐
    // align-items: flex-start;  // 垂直方向对齐
    
    position: absolute;
     top: 20px; 
     left: 20px;
    width: 100%; 
  } 
}
</style>
