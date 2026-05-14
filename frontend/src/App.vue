<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Navigation v-if="!isAuthPage" class="no-print" />
    <main :class="{ 'pt-24 md:pt-28': !isAuthPage }">
      <router-view />
    </main>
    <Footer v-if="!isAuthPage" class="no-print" />
    <!-- Tích hợp Chatbot AI hiển thị toàn trang -->
    <ChatbotAI v-if="!isAuthPage" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from './components/layout/Navigation.vue'
import Footer from './components/layout/Footer.vue'
import ChatbotAI from './components/common/ChatbotAI.vue'

const route = useRoute()

const isAuthPage = computed(() => {
  return route.path === '/login' || 
         route.path === '/register' || 
         route.path.startsWith('/admin') ||
         (route.path.startsWith('/driver') && !route.path.startsWith('/drivers'))
})
</script>
