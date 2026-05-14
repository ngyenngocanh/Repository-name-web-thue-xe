<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans shadow-none">
    <!-- Nút Chatbot hiển thị khi đóng -->
    <button 
      v-if="!isOpen"
      @click="toggleChat"
      class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center animate-bounce-slow no-print"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>

    <!-- Khung Chatbot khi mở -->
    <div 
      v-else
      class="bg-white/95 backdrop-blur-md w-[380px] h-[550px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 origin-bottom-right"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center shrink-0 shadow-md">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
            <span class="text-indigo-600 font-bold text-xl">C</span>
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight tracking-wide">Trợ lý CaRental</h3>
            <p class="text-xs text-blue-100 flex items-center font-medium mt-0.5">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
              Đang hoạt động (AI)
            </p>
          </div>
        </div>
        <button @click="toggleChat" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Vùng tin nhắn -->
      <div 
        class="flex-1 p-5 overflow-y-auto space-y-4 scroll-smooth bg-gray-50/50"
        ref="messagesContainer"
      >
        <div class="text-center text-xs text-gray-400 mb-6 font-medium">Hôm nay</div>
        
        <div v-for="(msg, index) in messages" :key="index" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div 
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-[15px] break-words',
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            ]"
          >
            <p class="whitespace-pre-wrap leading-relaxed" v-html="formatMessage(msg.content)"></p>
          </div>
        </div>
        
        <!-- Loading bong bóng khi AI đang trả lời -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>

      <!-- Ô nhập liệu -->
      <div class="p-4 bg-white border-t border-gray-100 shrink-0">
        <form @submit.prevent="sendMessage" class="flex items-center space-x-2 bg-gray-50 rounded-full border border-gray-200 px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
          <input 
            v-model="inputMsg" 
            type="text" 
            placeholder="Nhắn tin cho tư vấn viên..." 
            class="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-[15px] text-gray-700"
            :disabled="isLoading"
          />
          <button 
            type="submit" 
            :disabled="!inputMsg.trim() || isLoading"
            class="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(0); }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>

<script setup>
import { ref, nextTick } from 'vue';
import axios from 'axios';

const isOpen = ref(false);
const inputMsg = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);

const messages = ref([
  {
    role: 'model',
    content: 'Xin chào! 👋\nMình là Trợ lý AI của CaRental.\nBạn đang tìm thuê xe tự lái hay xe có kèm tài xế vậy ạ?'
  }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if(isOpen.value) {
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatMessage = (text) => {
  if (!text) return '';
  // Định dạng in đậm cơ bản
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return formatted;
};

const sendMessage = async () => {
  if (!inputMsg.value.trim() || isLoading.value) return;

  const userMsg = inputMsg.value.trim();
  messages.value.push({ role: 'user', content: userMsg });
  inputMsg.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    // Chỉ gửi 10 tin nhắn gần nhất để làm ngữ cảnh tránh quá tải
    const history = messages.value.slice(-10, -1); 
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Gọi đến Backend API
    const response = await axios.post(`${API_URL}/api/chat`, { 
      message: userMsg, 
      history 
    });
    
    if (response.data && response.data.reply) {
      messages.value.push({ role: 'model', content: response.data.reply });
    } else {
      throw new Error('No reply from server');
    }
  } catch (error) {
    console.error('Chat error:', error);
    messages.value.push({ role: 'model', content: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau chút nhé!' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>
