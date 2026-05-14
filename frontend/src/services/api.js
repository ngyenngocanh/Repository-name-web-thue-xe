import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {}
})

// Flag chống redirect loop
let isRedirecting = false

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || ''
      
      // Bỏ qua 401 cho login endpoint (sai mật khẩu) và notification endpoints
      const ignoredPaths = ['/auth/login', '/notifications']
      const shouldIgnore = ignoredPaths.some(path => requestUrl.includes(path))
      
      if (!shouldIgnore && !isRedirecting) {
        isRedirecting = true
        const authStore = useAuthStore()
        authStore.logout()
        
        // Chỉ redirect nếu không đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        // Reset flag sau 3 giây
        setTimeout(() => {
          isRedirecting = false
        }, 3000)
      }
      return Promise.reject(error)
    }
    
    if (error.message === 'Network Error') {
      // Import toast dynamically để tránh lỗi context
      try {
        const { useToast } = require('vue-toastification')
        const toast = useToast()
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      } catch (e) {
        console.error('Không thể kết nối đến server.')
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
