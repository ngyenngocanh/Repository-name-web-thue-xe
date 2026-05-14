<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Fixed Sidebar for Desktop -->
    <aside
      class="w-64 bg-white shadow-xl hidden lg:flex flex-col border-r border-gray-200 fixed inset-y-0 left-0 z-40"
    >
      <div class="p-6 border-b border-gray-200">
        <Logo />
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group border-l-4"
          :class="[
            $route.path === item.path
              ? 'bg-indigo-50 text-indigo-700 border-indigo-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent',
          ]"
        >
          <span
            class="mr-3 transition-transform group-hover:scale-110"
            v-html="item.icon"
          ></span>
          <span class="flex-1">{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- Profile Section -->
      <div
        class="p-4 border-t border-gray-100 bg-gray-50/50"
      >
        <div
          class="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all mb-4 group cursor-pointer"
          @click="$router.push('/driver/profile')"
        >
          <div class="relative flex-shrink-0">
            <div
              class="w-10 h-10 rounded-lg shadow-lg mr-3 group-hover:scale-110 transition-transform overflow-hidden"
            >
              <img
                v-if="driver?.avatar"
                :src="driver.avatar"
                :alt="driver?.fullName"
                class="w-full h-full object-cover rounded-lg"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white rounded-lg"
              >
                {{ driver?.fullName?.[0]?.toUpperCase() || "D" }}
              </div>
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm"
              :class="isOnline ? 'bg-emerald-500' : 'bg-gray-400'"
            ></div>
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors"
            >
              {{ driver?.fullName || "Tài xế" }}
            </p>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              {{ isOnline ? "Hoạt động" : "Offline" }}
            </p>
          </div>
        </div>

        <button
          @click="logout"
          class="w-full flex items-center justify-center px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 font-black rounded-xl shadow-sm transition-all text-xs uppercase tracking-widest"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      <!-- Desktop/Mobile Header (Sticky) -->
      <header
        class="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between h-20 border-b border-gray-100"
      >
        <!-- Title/Breadcrumb -->
        <div class="flex items-center gap-4">
           <!-- Toggle for Mobile -->
           <button
             @click="isMobileMenuOpen = !isMobileMenuOpen"
             class="p-2.5 rounded-xl bg-gray-50 text-gray-500 lg:hidden hover:bg-gray-100 transition-all"
           >
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
           </button>
           <h1 class="text-sm font-black text-gray-900 uppercase tracking-widest hidden md:block">
              {{ $route.meta.title || 'Điều khiển' }}
           </h1>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Online Toggle -->
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <label
              class="relative inline-flex items-center cursor-pointer mr-3"
            >
              <input
                type="checkbox"
                v-model="isOnline"
                @change="toggleStatus"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-sm"
              ></div>
            </label>
            <span
              class="font-black text-[10px] uppercase tracking-widest hidden sm:block"
              :class="isOnline ? 'text-emerald-600' : 'text-gray-400'"
            >
              {{ isOnline ? "Online" : "Offline" }}
            </span>
          </div>
        </div>
      </header>

      <!-- Mobile Menu Overlay -->
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
        @click="isMobileMenuOpen = false"
      ></div>
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 transform transition-transform"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="p-6 border-b">
          <div class="flex items-center">
            <div class="w-14 h-14 rounded-2xl shadow-xl overflow-hidden mr-4 flex-shrink-0">
              <img
                v-if="driver?.avatar"
                :src="driver.avatar"
                :alt="driver?.fullName"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-black text-white"
              >
                {{ driver?.fullName?.[0]?.toUpperCase() || "D" }}
              </div>
            </div>
            <div>
              <p class="font-bold text-lg">{{ driver?.fullName }}</p>
              <p class="text-sm text-gray-600 flex items-center">
                <span
                  class="w-2 h-2 rounded-full mr-2"
                  :class="isOnline ? 'bg-emerald-400' : 'bg-gray-400'"
                ></span>
                {{ isOnline ? "Hoạt động" : "Ngoại tuyến" }}
              </p>
            </div>
          </div>
        </div>
        <nav class="px-4 py-8 space-y-2 flex-1">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            @click="isMobileMenuOpen = false"
            class="flex items-center px-6 py-5 rounded-2xl text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-bold transition-all"
            :class="
              $route.path === item.path
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl'
                : ''
            "
          >
            <span
              class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
              :class="$route.path === item.path ? 'bg-white/50' : ''"
            >
              <span v-html="item.icon"></span>
            </span>
            <span class="text-lg">{{ item.title }}</span>
          </router-link>
        </nav>
        <div class="p-6 border-t">
          <button
            @click="logout"
            class="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            <svg
              class="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>

      <!-- Main scrollable area -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-10">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import Logo from "@/components/common/Logo.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const isMobileMenuOpen = ref(false);
const isOnline = ref(false);
const isDriverLayoutLoading = ref(true);

const driver = computed(() => authStore.user);

const menuItems = computed(() => {
  const baseMenu = [
    {
      title: "Tổng quan",
      path: "/driver",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    },
    {
      title: "Chuyến đi",
      path: "/driver/trips",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    }
  ];

  if (authStore.user?.role === 'collaborator') {
    baseMenu.push({
      title: "Hoa hồng CTV",
      path: "/driver/earnings-ctv",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    });
  } else {
    baseMenu.push({
      title: "Thu nhập",
      path: "/driver/earnings",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    });
  }

  baseMenu.push(
    {
      title: "Xe của tôi",
      path: "/driver/cars",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    },
    {
      title: "Hồ sơ",
      path: "/driver/profile",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
    }
  );

  if (authStore.user?.role === 'driver') {
    baseMenu.push({
      title: "Lịch làm việc",
      path: "/driver/schedule",
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    });
  }

  return baseMenu;
});

const toggleStatus = async () => {
  try {
    await api.put("/driver/status", { isOnline: isOnline.value });
    toast.success(`Đã ${isOnline.value ? "bật" : "tắt"} chế độ hoạt động`);
  } catch (error) {
    isOnline.value = !isOnline.value;
    toast.error("Không thể cập nhật trạng thái");
  }
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const fetchDriverStatus = async () => {
  try {
    const response = await api.get("/driver/dashboard");
    isOnline.value = response.data.isOnline || false;
  } catch (error) {
    console.error("Failed to fetch driver status:", error);
  } finally {
    isDriverLayoutLoading.value = false;
  }
};

onMounted(async () => {
  // Fetch fresh user data (includes avatar)
  try {
    await authStore.fetchUser();
  } catch (e) { /* ignore */ }
  
  // Both drivers and collaborators share this layout
  if (['driver', 'collaborator', 'admin'].includes(authStore.user?.role)) {
    fetchDriverStatus();
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
