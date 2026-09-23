import axios from 'axios'
import { YkMessage } from '@yike-design/ui'
import { baseUrl } from './env'
import { clearStoredUser, getAccessToken } from './auth'

const service = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
})

service.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      if (config.method === 'post' && config.data && !(config.data instanceof FormData)) {
        config.data = { ...config.data, token: config.data.token || token }
      }
    }
    return config
  },
  (error) => {
    YkMessage.error(error.message)
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data?.code === 300) {
      clearStoredUser()
      YkMessage({ type: 'warning', message: '登录已过期，请重新登录' })
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      clearStoredUser()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    YkMessage({ type: 'warning', message: error.message })
    return Promise.reject(error)
  },
)

export default service
