<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">
          404 - Trang không tìm thấy
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      
      <div class="mt-8">
        <div class="space-y-4">
          <router-link 
            to="/"
            class="btn btn-primary btn-lg w-full"
          >
            Về trang chủ
          </router-link>
          
          <router-link 
            to="/cars"
            class="btn btn-outline btn-lg w-full"
          >
            Tìm xe
          </router-link>
        </div>
        
        <div class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Có thể bạn quan tâm:</h3>
          <div class="space-y-2">
            <router-link 
              to="/about"
              class="block text-primary-600 hover:text-primary-500"
            >
              Về chúng tôi
            </router-link>
            <router-link 
              to="/contact"
              class="block text-primary-600 hover:text-primary-500"
            >
              Liên hệ
            </router-link>
            <router-link 
              to="/add-car"
              class="block text-primary-600 hover:text-primary-500"
            >
              Đăng xe cho thuê
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 page component
</script>
