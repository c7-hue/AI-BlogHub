<template>
  <yk-space class="reply">
    <yk-badge is-dot :hidden="content?.isread === 1">
    <yk-avatar img-url="image.png" v-if="isComment" @click="changeIsread(props.content!.id)"></yk-avatar>
    </yk-badge>
    <yk-space dir="vertical" size="s" class="reply__main">
      <div class="reply__name">
        <yk-text strong>{{ content?.user?.name || content?.user_name}}</yk-text>
        <yk-text style="font-size:12px;" type="third">{{ momentl(content?.moment) }}</yk-text>
      </div>
      <yk-text type="secondary">{{ content?.content }}</yk-text>
      <yk-space size="s" align="center" v-if="isComment">
        <yk-tag type="primary" v-if="content?.article?.id > -1">  
          {{ content?.article?.title }}
        </yk-tag>
        <yk-tag v-else>
          文章已被删除
        </yk-tag>
        <yk-text type="danger" v-show="content?.complaint !== 0">举报 {{ content?.complaint }}</yk-text>
      </yk-space>
      <IconDeleteOutline class="reply__main--delete" @click.stop="deleteReply(props.content!.id)"/>
    </yk-space>
  </yk-space>

</template>

<script setup lang="ts">
import {momentl} from '../../utils/moment'

const props = defineProps({
  content: {
    type: Object,
    default: () => ({
      id: 0,
      user: {
        id: '',
        name: '',
        imgurl: ''
      },
      comment: '',
      moment: ''
    })
  },
  isComment: {
    type: Boolean,
    default: true // 是否是评论，默认是评论
  }
})



const emits = defineEmits(['delete','isread'])  
//删除
const deleteReply = (e: number) => {
  emits('delete', e)
}
//将评论设为已读
const changeIsread = (e: number) => {
  emits('isread', e)
}

</script>

<style lang="less" scoped>
.reply{
  width: 100%;
  &__main{
    border-bottom:1px solid @line-color-s;// 下边框
    padding-bottom: @space-l;// 下内边距
    flex: 1;
    position:relative;
    &--delete{
      position:absolute;
      top:0;
      right:0;
      width: 16px;
      height: 16px;
      cursor: pointer;
      color:@font-color-s;
      display:none;
    }
  }
  &__name{
    display: flex;
    flex-direction: column;// 姓名和时间垂直排列，上下布局
  }

  &:hover{
    .reply__main--delete{
      display:block;// 鼠标悬停时显示删除图标
    }
  }
}
</style>