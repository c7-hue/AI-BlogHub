import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import { isAuthenticated } from '../utils/auth'

const routes = [
  {
    path: '/',
    redirect: '/overview',
    component: IndexView,
    children: [
      { path: '/overview', component: () => import('../views/OverView.vue') },
      { path: '/localfile', component: () => import('../views/FileView.vue') },
      { path: '/article', component: () => import('../views/ArticleView.vue') },
      { path: '/gallery', component: () => import('../views/GalleryView.vue') },
      { path: '/diary', component: () => import('../views/DiaryView.vue') },
      { path: '/setting', component: () => import('../views/SettingView.vue') },
      { path: '/login', component: () => import('../views/Login.vue') },
      { path: '/register', component: () => import('../views/Register.vue') },
    ],
  },
  { path: '/editgallery', component: () => import('../views/EditGallery.vue') },
  { path: '/editdiary', component: () => import('../views/EditDiary.vue') },
  { path: '/editarticle', component: () => import('../views/EditArticle.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    next(from.fullPath || '/')
    return
  }

  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  if (isAuthenticated()) {
    next()
    return
  }

  next({ path: '/login', query: { redirect: to.fullPath } })
})

export default router
