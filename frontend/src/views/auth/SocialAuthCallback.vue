<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">Đang xác thực đăng nhập</h1>
      <p class="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const redirectByRole = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'driver' || role === 'collaborator') return '/driver'
  return '/'
}

onMounted(async () => {
  const token = route.query.token ? String(route.query.token) : ''
  if (!token) {
    toast.error('Thiếu dữ liệu đăng nhập từ mạng xã hội')
    router.replace('/login')
    return
  }

  try {
    authStore.setAuthSession({ authToken: token, userData: null })
    const user = await authStore.fetchUser()
    toast.success('Đăng nhập thành công!')
    router.replace(redirectByRole(user?.role))
  } catch (error) {
    authStore.logout()
    toast.error(error.message || 'Không thể đăng nhập bằng mạng xã hội')
    router.replace('/login')
  }
})
</script>
