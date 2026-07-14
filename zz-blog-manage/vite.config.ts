import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// @ts-ignore
import { YikeResolver } from '@yike-design/resolver'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ resolvers: [YikeResolver] }),
    Components({ resolvers: [YikeResolver] }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@wangeditor')) return 'editor'
          if (id.includes('echarts')) return 'charts'
          if (id.includes('@yike-design')) return 'ui'
          if (id.includes('node_modules/vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'vue-vendor'
          }
        },
      },
    },
  },
  // css预处理器配置
  css:{
    preprocessorOptions:{
      less:{
        charset: false,
        // 添加 yike-design 的基础变量
        additionalData: `@import "@yike-design/ui/es/components/styles/basis.less";`,
      },
    },
  },
  // 开发服务器代理配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
