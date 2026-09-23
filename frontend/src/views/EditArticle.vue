<template>
  <div class="edit-article">
    <div class="edit-article__topbar">
      <p class="edit-article__topbar__title">新建博客</p> 
      <yk-space align="center">
        <yk-text type="secondary" v-show="nowMoment">{{ nowMoment }}保存</yk-text>  
        <yk-button type="secondary" @click="submit(0)">保存</yk-button>
        <yk-button type="primary" @click="submit(1)">发布</yk-button>  
      </yk-space>
    </div>
    <div class="edit-article__workspace">
      <div ref="editorShellRef" class="edit-article__editor-shell">
        <editor
          ref="editorRef"
          style="width: 1200px;"
          @editors="editorData"
          :content="defaultArticle?.[0]"
        >
          <Forms
            ref="formsRef"
            :classify="0"
            @formData="formData"
            style="width: 820px;"
            :form="defaultArticle?.[1]"
          ></Forms>  
        </editor>
      </div>
      <div class="edit-article__side" :style="sideStyle">
        <ArticleAIWriter
          :get-content="getEditorContent"
          :get-selected-text="getSelectedText"
          :current-title="form?.title"
          :current-summary="form?.introduce"
          @insert-html="insertAIHtml"
          @replace-selection="replaceAISelection"
          @apply-meta="applyAIMeta"
          @before-apply="saveVersionBeforeAI"
        />
        <ArticleVersionPanel
          ref="versionPanelRef"
          :storage-key="versionStorageKey"
          :get-snapshot="getArticleSnapshot"
          @restore="restoreArticleSnapshot"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import editor from "../components/editor/editor.vue"
import Forms from "../components/forms/forms.vue"
import ArticleAIWriter from "../components/ai/ArticleAIWriter.vue"
import ArticleVersionPanel from "../components/ai/ArticleVersionPanel.vue"
// 临时占位，moment 工具函数待补充
import { useArticle } from '../hooks/article'
import { onBeforeRouteLeave, useRouter } from 'vue-router'


const {submit,nowMoment,formData,editorData,defaultArticle,id,getArticleDetail,form}=useArticle()

const router=useRouter()
const editorRef = ref<InstanceType<typeof editor> | null>(null)
const formsRef = ref<InstanceType<typeof Forms> | null>(null)
const versionPanelRef = ref<InstanceType<typeof ArticleVersionPanel> | null>(null)
const editorShellRef = ref<HTMLElement | null>(null)
const editorShellHeight = ref(0)
let editorResizeObserver: ResizeObserver | null = null

const sideStyle = computed(() => {
  return editorShellHeight.value
    ? { height: `${editorShellHeight.value}px` }
    : {}
})

type ArticleVersionSnapshot = {
  title?: string
  introduce?: string
  label?: string[]
  subset_id?: number
  cover?: string
  content?: string
}

const versionStorageKey = computed(() => {
  return `article-version:${id.value || 'new'}`
})

const getEditorContent = () => {
  return editorRef.value?.getHtml() || ''
}

const getSelectedText = () => {
  return editorRef.value?.getSelectionText() || ''
}

const insertAIHtml = (html: string) => {
  editorRef.value?.insertHtml(html)
}

const replaceAISelection = (html: string) => {
  editorRef.value?.replaceSelection(html)
}

const applyAIMeta = (suggestion: {
  title?: string;
  introduce?: string;
  tags?: string[];
  categoryName?: string;
}) => {
  formsRef.value?.applyAISuggestion(suggestion)
}

const saveVersionBeforeAI = () => {
  versionPanelRef.value?.saveManual()
}
const getArticleSnapshot = (): ArticleVersionSnapshot => {
  return {
    title: form.value?.title || '',
    introduce: form.value?.introduce || '',
    label: Array.isArray(form.value?.label) ? [...form.value.label] : [],
    subset_id: form.value?.subset_id,
    cover: form.value?.cover || '',
    content: getEditorContent(),
  }
}

const restoreArticleSnapshot = (snapshot: ArticleVersionSnapshot) => {
  formsRef.value?.setFormData({
    title: snapshot.title || '',
    introduce: snapshot.introduce || '',
    label: Array.isArray(snapshot.label) ? snapshot.label : [],
    subset_id: snapshot.subset_id,
    cover: snapshot.cover || '',
  })
  editorRef.value?.setHtml(snapshot.content || '')
}
const syncSideHeight = () => {
  editorShellHeight.value = editorShellRef.value?.offsetHeight || 0
}

onMounted(() => {
  nextTick(() => {
    syncSideHeight()
    if (editorShellRef.value) {
      editorResizeObserver = new ResizeObserver(syncSideHeight)
      editorResizeObserver.observe(editorShellRef.value)
    }
  })
})

onBeforeUnmount(() => {
  editorResizeObserver?.disconnect()
})

onBeforeRouteLeave(() => {
  versionPanelRef.value?.saveDraft()
  return true
})

if(router.currentRoute.value.query.id){
  id.value=Number(router.currentRoute.value.query.id)
  console.log(id.value);
  getArticleDetail()
}

</script>

<style lang="less" scoped>
.edit-article{
  padding:@space-xl 80px;//上下80px 左右120px
  display: flex;// 弹性布局
  flex-direction: column;// 垂直布局
  align-items: center;// 居中对齐

  &__topbar{
    border-radius: @radius-m;
    background: @bg-color-l;
    padding:@space-l @space-xl;
    margin-bottom: @space-l;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 1540px;// 与下方编辑器和 AI 面板对齐

    &__title{
      .font-xl();
      font-weight: 600;
    }
  }

  &__content{
    display: flex;// 主内容区域 左右布局
    gap: @space-l;// 主内容区域 左右间距
  }

  &__workspace{
    display: grid;
    grid-template-columns: 1200px 320px;
    align-items: start;
    gap: @space-l;
    width: 1540px;
  }

  &__editor-shell{
    width: 1200px;
    min-height: 0;
  }

  &__side{
    display: flex;
    flex-direction: column;
    gap: @space-l;
    width: 320px;
    min-height: 0;
    overflow: hidden;
  }

  .edit-form{
    width: 100%;
    background: @bg-color-l;
    border-radius: @radius-m;
    flex: none;
    display: flex;// 弹性布局
    flex-direction: column;// 垂直布局
    padding: 24px;// 内边距 24px
    justify-content: center;// 表单居中
    align-items: center;// 表单居中
  }
}
</style>
