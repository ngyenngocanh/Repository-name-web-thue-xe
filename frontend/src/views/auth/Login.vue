<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center mb-8">
          <div class="w-48 h-48 bg-white rounded-full overflow-hidden shadow-2xl border-6 border-white transition-all duration-500 hover:scale-105">
            <img src="/logo.png" alt="CarRental Logo" class="w-full h-full object-cover" />
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập tài khoản
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Hoặc 
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            đăng ký tài khoản mới
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="input mt-1"
              :class="{ 'input-error': errors.email }"
              placeholder="Nhập email của bạn"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-error-600">
              {{ errors.email }}
            </p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input mt-1 pr-10"
                :class="{ 'input-error': errors.password }"
                placeholder="Nhập mật khẩu"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    v-if="showPassword"
                    fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else
                    d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                  />
                  <path
                    v-if="showPassword"
                    fill-rule="evenodd"
                    d="M10 18a8.949 8.949 0 004.951-1.488A3.987 3.987 0 0018 13a3.987 3.987 0 00-3.049-3.512A8.949 8.949 0 0010 2a8.949 8.949 0 00-4.951 1.488A3.987 3.987 0 002 7a3.987 3.987 0 003.049 3.512A8.949 8.949 0 0010 18z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else
                    fill-rule="evenodd"
                    d="M10 18a8.949 8.949 0 004.951-1.488A3.987 3.987 0 0018 13a3.987 3.987 0 00-3.049-3.512A8.949 8.949 0 0010 2a8.949 8.949 0 00-4.951 1.488A3.987 3.987 0 002 7a3.987 3.987 0 003.049 3.512A8.949 8.949 0 0010 18z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-error-600">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner mr-2"></span>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </div>

        <!-- Social Login -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleSocialLogin('google')"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              type="button"
              @click="handleSocialLogin('facebook')"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const showPassword = ref(false)
const errors = ref({})

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'Email là bắt buộc'
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.value.email)) {
    errors.value.email = 'Email không hợp lệ'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Mật khẩu là bắt buộc'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  try {
    loading.value = true
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    })
    
    toast.success('Đăng nhập thành công!')
    
    console.log('Login successful, user data:', authStore.user)
    console.log('User role:', authStore.user?.role)
    
    // Wait for user data to be properly set
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Redirect based on user role or intended page
    const redirect = route.query.redirect
    if (redirect) {
      router.push(redirect)
    } else {
      // Role-based redirect
      const userRole = authStore.user?.role
      
      switch (userRole) {
        case 'admin':
          router.push('/admin')
          break
        case 'driver':
        case 'collaborator':
          router.push('/driver')
          break
        default:
          router.push('/')
      }
    }
  } catch (error) {
    if (error.message) {
      toast.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider) => {
  window.location.href = `/api/auth/${provider}`
}

onMounted(() => {
  if (route.query.socialError) {
    toast.error(String(route.query.socialError))
  }

  // If already logged in, redirect based on role
  if (authStore.isAuthenticated) {
    const userRole = authStore.user?.role
    switch (userRole) {
      case 'admin':
        router.push('/admin')
        break
      case 'driver':
      case 'collaborator':
        router.push('/driver')
        break
      default:
        router.push('/')
    }
  }
})
</script>
