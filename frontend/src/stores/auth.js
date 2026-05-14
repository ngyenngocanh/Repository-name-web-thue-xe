import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  // Load user data from localStorage on initialization
  if (token.value) {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        user.value = JSON.parse(userData)
        // Set API header
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      token.value = null
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  const setAuthSession = ({ authToken, userData }) => {
    user.value = userData || null
    token.value = authToken || null

    if (authToken) {
      localStorage.setItem('token', authToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await api.post('/auth/login', credentials)
      
      const { user: userData, token: authToken } = response.data
      setAuthSession({ authToken, userData })
      
      return { success: true }
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      const response = await api.post('/auth/register', userData)
      
      const { user: registeredUser, token: authToken } = response.data
      setAuthSession({ authToken, userData: registeredUser })
      
      return { success: true }
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    setAuthSession({ authToken: null, userData: null })
  }

    const fetchUser = async () => {
      try {
        if (!token.value) return null
        
        const response = await api.get('/auth/me')
        user.value = response.data.user
        // Sync with localStorage so refreshes get the latest role/data
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data.user
      } catch (error) {
      // Don't logout here, let the interceptor handle it if it's a 401
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await api.put('/auth/profile', profileData)
      user.value = response.data.user
      return response.data
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      const response = await api.put('/auth/password', passwordData)
      return response.data
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const getErrorMessage = (error) => {
    // Handle different error types and return Vietnamese messages
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          if (data.message) {
            // Handle specific validation errors
            if (data.message.includes('email')) {
              return 'Email không hợp lệ hoặc đã được sử dụng'
            } else if (data.message.includes('password')) {
              return 'Mật khẩu không hợp lệ'
            } else if (data.message.includes('phone')) {
              return 'Số điện thoại không hợp lệ'
            } else if (data.message.includes('fullName')) {
              return 'Họ và tên không hợp lệ'
            } else if (data.message.includes('dateOfBirth')) {
              return 'Bạn phải đủ 18 tuổi để đăng ký'
            }
            return data.message
          }
          return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
          
        case 401:
          return 'Email hoặc mật khẩu không chính xác'
          
        case 403:
          return 'Bạn không có quyền truy cập'
          
        case 404:
          return 'Tài khoản không tồn tại'
          
        case 409:
          return 'Email đã được sử dụng. Vui lòng chọn email khác.'
          
        case 429:
          return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
          
        case 500:
          return 'Lỗi server. Vui lòng thử lại sau.'
          
        default:
          return data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
      }
    } else if (error.request) {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    } else {
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    setAuthSession,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword
  }
})
