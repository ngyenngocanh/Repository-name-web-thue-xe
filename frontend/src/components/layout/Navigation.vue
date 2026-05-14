<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="isScrolled ? 'glass-dark py-2' : 'bg-white/80 backdrop-blur-md py-4 shadow-sm text-gray-900 border-b border-gray-100'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-1">
        <!-- Logo -->
        <Logo />

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center lg:space-x-8 space-x-4">
          <router-link
            v-for="link in [
              { to: '/', label: 'Trang chủ' },
              { to: '/cars', label: 'Thuê xe' },
              { to: '/drivers', label: 'Thuê tài xế' },
              { to: '/about', label: 'Về chúng tôi' },
              { to: '/contact', label: 'Liên hệ' }
            ]"
            :key="link.to"
            :to="link.to"
            class="text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary-500 relative group whitespace-nowrap"
            :class="[
              $route.path === link.to ? 'text-primary-600' : (isScrolled ? 'text-gray-300' : 'text-gray-600')
            ]"
          >
            {{ link.label }}
            <span class="absolute -bottom-2 left-0 h-[2px] bg-primary-500 transition-all duration-300 group-hover:w-full" :class="[$route.path === link.to ? 'w-full' : 'w-0']"></span>
          </router-link>


          <template v-if="isAuthenticated">
            <div class="h-4 w-px bg-gray-200 mx-1"></div>
            <router-link
              to="/my-bookings"
              class="text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors whitespace-nowrap"
            >
              Chuyến đi
            </router-link>

            <!-- Show CTA based on user role -->
            <router-link
              v-if="user && (user.role === 'collaborator' || user.role === 'driver')"
              to="/add-car"
              class="bg-primary-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-500 transition-all shadow-xl shadow-primary-900/20 active-scale whitespace-nowrap"
            >
              ĐĂNG XE
            </router-link>
            <router-link
              v-else
              to="/become-collaborator"
              class="bg-primary-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-500 transition-all shadow-xl shadow-primary-900/20 active-scale whitespace-nowrap"
            >
              CỘNG TÁC
            </router-link>
          </template>
        </div>

        <!-- User Menu & Notifications -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="isAuthenticated && user">
            <!-- Notification Bell -->
            <div class="relative group" @click="showNotifMenu = !showNotifMenu">
              <button class="p-2 text-gray-500 hover:text-primary-600 transition-colors relative focus:outline-none focus:ring-0 outline-none border-none cursor-pointer">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span v-if="notificationStore.unreadCount > 0" class="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
              </button>
              
              <!-- Notification Dropdown -->
              <div v-if="showNotifMenu" class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div class="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 class="font-black text-gray-900 text-sm">Thông báo</h3>
                  <button @click.stop="handleMarkAllRead" class="text-[10px] uppercase font-bold text-primary-600 hover:text-primary-700 tracking-widest focus:outline-none">Đánh dấu đã đọc</button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <div v-if="notificationStore.loading && notificationStore.notifications.length === 0" class="p-8 text-center text-gray-400">
                     <span class="animate-pulse text-xs font-bold uppercase tracking-widest">Đang tải...</span>
                  </div>
                  <div v-else-if="notificationStore.notifications.length === 0" class="p-8 text-center text-gray-400">
                    <div class="text-3xl mb-2">📭</div>
                    <p class="text-[10px] font-bold uppercase tracking-widest">Chưa có thông báo</p>
                  </div>
                  <div v-else class="divide-y divide-gray-50">
                    <div v-for="notif in notificationStore.notifications" :key="notif._id" 
                         @click.stop="handleNotifClick(notif)"
                         class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                         :class="{ 'bg-blue-50/10': !notif.read }">
                      <div class="flex items-start gap-3">
                        <div class="w-1.5 h-1.5 rounded-full mt-2 shrink-0" :class="notif.read ? 'bg-transparent' : 'bg-primary-500'"></div>
                        <div class="flex-1">
                          <p class="text-sm font-bold text-gray-900 leading-tight mb-1" :class="{ 'text-primary-700': !notif.read }">{{ notif.title }}</p>
                          <p class="text-xs text-gray-600 leading-relaxed">{{ notif.message }}</p>
                          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-2">{{ new Date(notif.createdAt).toLocaleString('vi-VN') }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative group">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <div
                  class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"
                >
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.fullName"
                    class="w-full h-full rounded-full object-cover"
                  />
                  <svg
                    v-else
                    class="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span class="text-sm font-medium whitespace-nowrap max-w-[120px] truncate">{{ user.fullName }}</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
                @click="showUserMenu = false"
              >
                <!-- Debug logging -->
                <div v-if="false" class="px-4 py-2 text-xs text-gray-500 border-b">
                  User Role: {{ user?.role || 'undefined' }}
                </div>
                
                <router-link
                  v-if="user.role === 'admin'"
                  to="/admin"
                  class="block px-4 py-2 text-sm text-primary-600 font-bold hover:bg-gray-100"
                >
                  Admin Dashboard
                </router-link>
                <router-link
                  v-if="user.role === 'driver' || (user.role === 'collaborator' && user.driverInfo) || user.role === 'admin'"
                  to="/driver"
                  class="block px-4 py-2 text-sm text-primary-600 font-bold hover:bg-gray-100"
                >
                  Dashboard Tài xế
                </router-link>
                <router-link
                  v-if="user.role === 'owner' || user.role === 'collaborator' || user.role === 'driver'"
                  to="/my-cars"
                  class="block px-4 py-2 text-sm text-primary-600 font-bold hover:bg-gray-100"
                >
                  Quản lý xe
                </router-link>
                <router-link
                  :to="user.role === 'driver' ? '/driver/profile' : '/profile'"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hồ sơ cá nhân
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="btn btn-outline btn-sm">
              Đăng nhập
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">
              Đăng ký
            </router-link>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div
      v-if="showMobileMenu"
      class="md:hidden bg-white border-t border-gray-200"
    >
      <div class="px-4 py-2 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Trang chủ
        </router-link>

        <router-link
          to="/cars"
          class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Thuê xe
        </router-link>

        <template v-if="isAuthenticated">
          <router-link
            v-if="user && (user.role === 'collaborator' || user.role === 'owner')"
            to="/my-cars"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Xe của tôi
          </router-link>

          <router-link
            to="/my-bookings"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Chuyến đi
          </router-link>

          <router-link
            v-if="user && (user.role === 'collaborator' || user.role === 'driver')"
            to="/add-car"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Đăng xe
          </router-link>
          <router-link
            v-else
            to="/become-collaborator"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Trở thành cộng tác viên
          </router-link>

          <router-link
            v-if="user && (user.role === 'driver' || (user.role === 'collaborator' && user.driverInfo))"
            to="/driver"
            class="block px-3 py-2 text-green-600 font-bold hover:text-green-700 hover:bg-green-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Dashboard Tài xế
          </router-link>

          <router-link
            :to="user.role === 'driver' ? '/driver/profile' : '/profile'"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Hồ sơ cá nhân
          </router-link>

          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          >
            Đăng xuất
          </button>
        </template>

        <template v-else>
          <router-link
            to="/login"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Đăng nhập
          </router-link>

          <router-link
            to="/register"
            class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            @click="showMobileMenu = false"
          >
            Đăng ký
          </router-link>
        </template>

        <router-link
          to="/about"
          class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Về chúng tôi
        </router-link>

        <router-link
          to="/contact"
          class="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Liên hệ
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useToast } from "vue-toastification";
import Logo from "@/components/common/Logo.vue";
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toast = useToast();

const showMobileMenu = ref(false);
const showUserMenu = ref(false);
const showNotifMenu = ref(false);
const isScrolled = ref(false);

watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) {
    notificationStore.startPolling();
  } else {
    notificationStore.stopPolling();
  }
});

// Named handlers để có thể remove đúng cách
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const handleClickOutside = (e) => {
  const isMenuOrButton = e.target.closest('.group');
  if (!isMenuOrButton) {
    showUserMenu.value = false;
    showNotifMenu.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  if (authStore.isAuthenticated) {
    notificationStore.startPolling();
  }
  
  // Close menus when clicking outside
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  notificationStore.stopPolling();
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
});

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
}

const handleNotifClick = async (notif) => {
  if (!notif.read) {
    await notificationStore.markAsRead(notif._id);
  }
  showNotifMenu.value = false;
  
  if (notif.metadata?.bookingId) {
     const role = authStore.user?.role;
     if (role === 'driver' || role === 'collaborator') {
       router.push(`/driver/trips/${notif.metadata.bookingId}`);
     } else if (role === 'admin') {
       router.push(`/admin/bookings`); // Adjust to specific booking later if available
     } else {
       router.push(`/bookings/${notif.metadata.bookingId}`);
     }
  }
}

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

// Debug logging (commented out to avoid syntax errors)
// if (import.meta.env.DEV) {
//   console.log('Navigation - User object:', user.value);
//   console.log('Navigation - User role:', user.value?.role);
// }

const handleLogout = () => {
  authStore.logout();
  toast.success("Đăng xuất thành công");
  router.push("/");
};
</script>
