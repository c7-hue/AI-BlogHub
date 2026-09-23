import { ref, getCurrentInstance,onMounted  } from 'vue'
// 临时占位，moment 工具函数待补充
import { times } from '../utils/moment'
import { createArticleApi,updateArticleApi,articleApi,deleteArticleApi,gainArticleApi } from '../api/index'
import { useCode } from '../hooks/code'
import {useUserStore} from '../store/user'
import {useRouter} from 'vue-router'
import type { ArticleData } from '../utils/interface';
export function useArticle(){
  const proxy:any=getCurrentInstance()?.proxy
  const router=useRouter()  
  const userStore=useUserStore()
  const {tackleCode} = useCode()

  // 文章ID
  const id = ref<number>()

  const articleData=ref()

  // 收取form内容
  const form=ref()
  const formData=(e:any)=>{
    form.value=e
  }

  // 收取editor内容
  const editors=ref()
  const editorData=(e:any)=>{
    editors.value=e
  }

  // 收取cover封面
  const cover = ref()
  const coverData=(e:any)=>{
    cover.value=e
  }

  // 发布文章
  const nowMoment=ref()
  const submit=(e:number)=>{
  
    if(form.value && form.value.title&&!id.value){
      if(e==0){
      let nowTime=new Date()
      nowMoment.value=times(nowTime)
    }
    
      let value={
        ...form.value,
        ...{
          content:editors.value,
          state:e,
          moment:new Date()
        }
      }
      if(cover.value){
        value.cover=cover.value
      }
      let request={
        ...value,
        token:userStore.token
      }
      createArticleApi(request).then((res:any)=>{
        if(tackleCode(res.code)){
          if(e==0){
            id.value=res.data
            proxy.$message({ type:'primary', message:'保存成功'})
          }else if(e==1){
            proxy.$message({ type:'primary', message:'发布成功'})
            router.push('/')
          }
        }
      })  
    }else if(id.value){
      // 存在id说明已经保存过，更新
      let value={
        ...form.value,
        ...{
          content:editors.value,
          id:id.value,
          state:e,
        }
      }
      if(cover.value){
        value.cover=cover.value
      }
      let request={
        token:userStore.token,
        value,
      }
      updateArticleApi(request).then((res:any)=>{
        if(tackleCode(res.code)){
          if(e==0){
            proxy.$message({ type:'primary', message:'保存成功'})
          }else if(e==1){
            proxy.$message({ type:'primary', message:'发布成功'})
            router.push('/')
          }
        }
      })
    }else{
       proxy.$message({ type:'warning', message:'请输入标题'})

    }
  }

  // 获取文章
const articleList = ref<ArticleData[]>([]);
// 文章总数
const count = ref<number>(0);

const getData=(req:any)=>{
  articleApi(req).then((res:any)=>{
    if(tackleCode(res.code)){
      // 尝试从不同位置获取数据
      const data = res.data || res;
      
      // 检查 count 是否存在
      if('count' in res || 'count' in data){
        count.value = res.count || data.count || 0;
      }
      
      // 检查文章列表是否存在，API 返回的字段名是 result
      let listData: ArticleData[] = [];
      if(res.list){
        listData = Array.isArray(res.list) ? [...res.list] : [];
      } else if(data.list){
        listData = Array.isArray(data.list) ? [...data.list] : [];
      } else if(res.result){
        listData = Array.isArray(res.result) ? [...res.result] : [];
      } else if(data.result){
        listData = Array.isArray(data.result) ? [...data.result] : [];
      } else {
        listData = [];
      }
      
      // 如果有搜索关键词，进行前端过滤
      if(req.searchTerm && req.searchTerm.trim()){
        const searchTerm = req.searchTerm.toLowerCase();
        articleList.value = listData.filter(item => {
          return item.title.toLowerCase().includes(searchTerm) || 
                 (item.introduce && item.introduce.toLowerCase().includes(searchTerm)) ||
                 (item.label && item.label.some(label => label.toLowerCase().includes(searchTerm)));
        });
        // 更新count为过滤后的数量
        count.value = articleList.value.length;
      } else {
        articleList.value = listData;
      }
    }
  }).catch((error:any)=>{
    console.error('API error:', error);
  })
}

// 删除文章
const deleteArticle = (id: number) => {
  const request = {
    token: userStore.token,
    articleId: id,
  }

  deleteArticleApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      articleList.value = articleList.value.filter((obj: any) => {
        return obj.id !== id
      })
      proxy.$message({ type: 'primary', message: '删除完成' })
    }
  })
}

//获取文章详情
const defaultArticle = ref()
const getArticleDetail = () => {
    let request = {
        token: userStore.token,
        articleId: id.value,
    }
    gainArticleApi(request).then((res: any) => {
        if (tackleCode(res.code)) {
            let content = res.data.content
            let cover = res.data.cover
            let formData = res.data
            delete formData.id
            delete formData.views
            delete formData.moment
            delete formData.content
            delete formData.state
            if(formData.label){
              formData.label=formData.label.split(',')
            }

            defaultArticle.value = [content, formData,cover]
        }
    })
}

onMounted(()=>{
  if(id.value){
    getArticleDetail()
  }
})
  return {
    articleData,
    form,
    editors,
    submit,
    nowMoment,
    formData,
    defaultArticle,
    id,
    getArticleDetail,
    editorData,
    deleteArticle,
    createArticleApi,
    tackleCode,
    userStore,
    getData,
    articleList,
    count,
    cover,
    coverData,
     }  
}
