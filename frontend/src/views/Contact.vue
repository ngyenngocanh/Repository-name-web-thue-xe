<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white -mt-24 pt-28 pb-20 md:-mt-28 md:pt-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Liên hệ với chúng tôi
        </h1>
        <p class="text-xl text-primary-100 max-w-3xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với CarRental ngay hôm nay!
        </p>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>
              
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      id="fullName"
                      v-model="form.fullName"
                      type="text"
                      required
                      class="input"
                      :class="{ 'input-error': errors.fullName }"
                      placeholder="Nhập họ và tên của bạn"
                    >
                    <p v-if="errors.fullName" class="mt-1 text-sm text-error-600">
                      {{ errors.fullName }}
                    </p>
                  </div>

                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      class="input"
                      :class="{ 'input-error': errors.email }"
                      placeholder="Nhập email của bạn"
                    >
                    <p v-if="errors.email" class="mt-1 text-sm text-error-600">
                      {{ errors.email }}
                    </p>
                  </div>
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="input"
                    placeholder="Nhập số điện thoại của bạn"
                  >
                </div>

                <div>
                  <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    v-model="form.subject"
                    required
                    class="input"
                    :class="{ 'input-error': errors.subject }"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Thắc mắc chung</option>
                    <option value="booking">Về đặt xe</option>
                    <option value="payment">Về thanh toán</option>
                    <option value="technical">Lỗi kỹ thuật</option>
                    <option value="partnership">Hợp tác</option>
                    <option value="feedback">Góp ý</option>
                  </select>
                  <p v-if="errors.subject" class="mt-1 text-sm text-error-600">
                    {{ errors.subject }}
                  </p>
                </div>

                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="6"
                    required
                    class="input"
                    :class="{ 'input-error': errors.message }"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  ></textarea>
                  <p v-if="errors.message" class="mt-1 text-sm text-error-600">
                    {{ errors.message }}
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg w-full"
                    :disabled="submitting"
                  >
                    <span v-if="submitting" class="spinner mr-2"></span>
                    {{ submitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="space-y-8">
            <!-- Contact Details -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Thông tin liên hệ
              </h3>
              
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">Địa chỉ</h4>
                    <p class="text-gray-600">123 Nguyễn Huệ, Quận 1<br>TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">Điện thoại</h4>
                    <p class="text-gray-600">Hotline: 1900 1234<br>Support: 028 1234 5678</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">Email</h4>
                    <p class="text-gray-600">support@carrental.vn<br>info@carrental.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Hours -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Giờ làm việc
              </h3>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Thứ Hai - Thứ Sáu</span>
                  <span class="font-medium">8:00 - 18:00</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Thứ Bảy</span>
                  <span class="font-medium">8:00 - 17:00</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Chủ Nhật</span>
                  <span class="font-medium">9:00 - 16:00</span>
                </div>
              </div>
              
              <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p class="text-sm text-yellow-800">
                  <strong>Hỗ trợ khẩn cấp:</strong> Có sẵn 24/7 cho các vấn đề khẩn cấp liên quan đến việc thuê xe.
                </p>
              </div>
            </div>

            <!-- Social Media -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Kết nối với chúng tôi
              </h3>
              
              <div class="flex space-x-4">
                <a href="#" class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a href="#" class="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                
                <a href="#" class="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                </a>
                
                <a href="#" class="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const submitting = ref(false)
const errors = ref({})

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.fullName) {
    errors.value.fullName = 'Họ và tên là bắt buộc'
  }
  
  if (!form.value.email) {
    errors.value.email = 'Email là bắt buộc'
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.value.email)) {
    errors.value.email = 'Email không hợp lệ'
  }
  
  if (!form.value.subject) {
    errors.value.subject = 'Vui lòng chọn chủ đề'
  }
  
  if (!form.value.message) {
    errors.value.message = 'Nội dung tin nhắn là bắt buộc'
  } else if (form.value.message.length < 10) {
    errors.value.message = 'Nội dung tin nhắn phải có ít nhất 10 ký tự'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    submitting.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('Tin nhắn của bạn đã được gửi thành công!')
    
    // Reset form
    form.value = {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.')
  } finally {
    submitting.value = false
  }
}
</script>
