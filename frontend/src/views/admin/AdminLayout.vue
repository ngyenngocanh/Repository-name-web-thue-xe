<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-72 bg-white shadow-xl fixed left-0 top-0 h-full z-40 border-r border-gray-100 flex flex-col">
      <!-- Logo Section -->
      <div class="p-6 border-b border-gray-100 shrink-0">
        <Logo />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div class="mb-4 px-2">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu chính</p>
        </div>
        
        <div class="px-2 space-y-1">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.path"
            class="group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 ease-in-out"
            :class="$route.path === item.path 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" :class="$route.path === item.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span class="flex-1 whitespace-nowrap truncate">{{ item.name }}</span>
            <span 
              v-if="$route.path === item.path"
              class="ml-2 inline-block w-2 h-2 bg-indigo-600 rounded-full"
            ></span>
          </router-link>
        </div>

        <!-- Management Section -->
        <div class="mt-8 mb-4 px-2">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quản lý hệ thống</p>
        </div>
        
        <div class="px-2 space-y-1">
          <router-link
            v-for="item in managementItems"
            :key="item.name"
            :to="item.path"
            class="group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 ease-in-out"
            :class="$route.path === item.path 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" :class="$route.path === item.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span class="flex-1 whitespace-nowrap truncate">{{ item.name }}</span>
            <span 
              v-if="$route.path === item.path"
              class="ml-2 inline-block w-2 h-2 bg-green-600 rounded-full"
            ></span>
          </router-link>
        </div>

        <!-- User Info -->
        <div class="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-4 shrink-0">
          <!-- Profile Card -->
          <div class="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group">
            <div 
              @click="$refs.avatarInput.click()"
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-inner relative shrink-0 cursor-pointer overflow-hidden border-2 border-transparent group-hover:border-indigo-300 transition-colors bg-indigo-600 text-white"
              title="Nhấn để đổi ảnh đại diện"
            >
              <img 
                v-if="getUserAvatarUrl(user?._id || user?.id, user?.avatar)" 
                :src="getUserAvatarUrl(user?._id || user?.id, user?.avatar)" 
                class="w-full h-full object-cover" 
                @error="$event.target.src = '/placeholder-avatar.svg'"
              />
              <span v-else>{{ user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A' }}</span>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10"></div>
            </div>
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleAvatarUpload"
            >
            <div class="flex-1 min-w-0">
              <p class="text-base font-bold text-gray-900 truncate">{{ user?.fullName || 'Admin' }}</p>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Hoạt động</p>
            </div>
          </div>

          <!-- Logout Button -->
          <button @click="logout" class="w-full flex items-center justify-center px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 font-black rounded-xl shadow-sm transition-all text-xs uppercase tracking-widest mt-1">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-72 min-h-screen flex flex-col">
      <!-- Top bar: thông báo admin -->
      <header class="sticky top-0 z-30 flex items-center justify-end gap-3 px-6 py-3 border-b border-gray-200/80 bg-gray-50/95 backdrop-blur-sm shrink-0">
        <div ref="notifPanelRoot" class="relative">
          <button
            type="button"
            class="relative p-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all shadow-sm bg-white/80"
            aria-label="Thông báo"
            :aria-expanded="notifOpen"
            @click.stop="toggleNotif"
          >
            <BellIcon class="w-6 h-6" />
            <span
              v-if="notifTotal > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black leading-none"
            >
              {{ notifTotal > 99 ? '99+' : notifTotal }}
            </span>
          </button>

          <div
            v-if="notifOpen"
            class="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
            role="menu"
            @click.stop
          >
            <div class="px-4 py-3 border-b border-gray-100 bg-indigo-50/50">
              <p class="text-sm font-black text-gray-900">Thông báo</p>
              <p class="text-[11px] text-gray-500 mt-0.5">Đơn chờ xử lý · CTV / tài xế chờ duyệt</p>
            </div>
            <div v-if="notifLoading" class="p-8 text-center text-sm text-gray-500">Đang tải…</div>
            <div v-else-if="!notifItems.length" class="p-8 text-center text-sm text-gray-500">Không có việc cần xử lý.</div>
            <ul v-else class="max-h-[min(70vh,20rem)] overflow-y-auto divide-y divide-gray-50">
              <li v-for="item in notifItems" :key="item.id">
                <button
                  type="button"
                  class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col gap-0.5"
                  @click="goNotif(item)"
                >
                  <span class="text-sm font-bold text-gray-900 leading-snug">{{ item.title }}</span>
                  <span class="text-xs text-gray-500 line-clamp-2">{{ item.subtitle }}</span>
                  <span class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mt-1">{{ formatNotifTime(item.createdAt) }}</span>
                </button>
              </li>
            </ul>
            <div v-if="notifItems.length" class="px-3 py-2 border-t border-gray-100 bg-gray-50/80 text-center">
              <router-link
                to="/admin/bookings"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                @click="notifOpen = false"
              >
                Mở quản lý đặt xe
              </router-link>
              <span class="text-gray-300 mx-2">|</span>
              <router-link
                to="/admin/user-approvals"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                @click="notifOpen = false"
              >
                Phê duyệt người dùng
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <div class="p-6 flex-1">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/common/Logo.vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { getUserAvatarUrl } from '@/utils/avatar'

// Icons
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  TruckIcon,
  CalendarIcon,
  CogIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const avatarInput = ref(null)

const user = computed(() => authStore.user)

const notifOpen = ref(false)
const notifLoading = ref(false)
const notifItems = ref([])
const notifCounts = ref({ pendingBookings: 0, pendingCollaborators: 0, pendingDrivers: 0 })
const notifPanelRoot = ref(null)
let notifPollId = null

const notifTotal = computed(() => {
  const c = notifCounts.value
  return (c.pendingBookings || 0) + (c.pendingCollaborators || 0) + (c.pendingDrivers || 0)
})

const formatNotifTime = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const fetchNotifications = async () => {
  try {
    notifLoading.value = true
    const { data } = await api.get('/admin/notifications/summary')
    notifCounts.value = data.counts || {}
    notifItems.value = Array.isArray(data.items) ? data.items : []
  } catch {
    /* im lặng khi lỗi mạng để không làm phiền admin */
  } finally {
    notifLoading.value = false
  }
}

const toggleNotif = () => {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value) fetchNotifications()
}

const goNotif = (item) => {
  notifOpen.value = false
  if (item?.link) router.push(item.link)
}

const onDocMousedown = (e) => {
  if (!notifOpen.value) return
  const root = notifPanelRoot.value
  if (root && !root.contains(e.target)) notifOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    notifOpen.value = false
  }
)

onMounted(() => {
  fetchNotifications()
  notifPollId = setInterval(fetchNotifications, 45000)
  document.addEventListener('mousedown', onDocMousedown)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  if (notifPollId) clearInterval(notifPollId)
  document.removeEventListener('mousedown', onDocMousedown)
  document.removeEventListener('visibilitychange', onVisibility)
})

function onVisibility () {
  if (document.visibilityState === 'visible') fetchNotifications()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const fd = new FormData()
    fd.append('avatar', file)
    
    // We use the same /users/profile endpoint since admin is also a User
    const response = await api.put('/users/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (response.data.user) {
      await authStore.fetchUser()
    }
    toast.success('Cập nhật ảnh đại diện thành công!')
  } catch (error) {
    toast.error(`Lỗi cập nhật ảnh: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`)
  } finally {
    // Reset input
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

const navigationItems = [
  { name: 'Tổng quan', path: '/admin', icon: HomeIcon },
  { name: 'Người dùng', path: '/admin/users', icon: UserGroupIcon },
  { name: 'Quản lý xe', path: '/admin/cars', icon: TruckIcon },
  { name: 'Đặt xe', path: '/admin/bookings', icon: CalendarIcon },
  { name: 'Đặt trước', path: '/admin/prebookings', icon: ClockIcon },
  { name: 'Báo cáo', path: '/admin/reports', icon: DocumentTextIcon },
  { name: 'Cài đặt', path: '/admin/settings', icon: CogIcon }
]

const managementItems = [
  { name: 'Quản lý tài xế', path: '/admin/drivers', icon: UserGroupIcon },
  { name: 'Phê duyệt xe', path: '/admin/car-approvals', icon: TruckIcon },
  { name: 'Quản lý cộng tác viên', path: '/admin/user-approvals', icon: UserGroupIcon },
  { name: 'Quản lý hợp đồng', path: '/admin/contracts', icon: DocumentIcon },
  { name: 'Trả Lương / Hoa Hồng', path: '/admin/payouts', icon: CurrencyDollarIcon },
  { name: 'Loại xe & Hệ thống', path: '/admin/system-settings', icon: CogIcon },
  { name: 'Lộ trình & Giá', path: '/admin/trips', icon: ChartBarIcon }
]

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Custom Scrollbar for Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #D1D5DB;
}
</style>
