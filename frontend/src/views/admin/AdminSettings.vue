<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Cài đặt hệ thống</h2>
          <p class="text-gray-600 mt-1">Cấu hình các thiết lập chung của hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <button @click="resetToDefaults" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all">
            Đặt lại mặc định
          </button>
          <button @click="saveSettings" :disabled="isLoading" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- General Settings -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Site Settings -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt trang web</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tên trang web</label>
              <input
                v-model="settings.siteName"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="CarRental"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
              <input
                v-model="settings.contactEmail"
                type="email"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="contact@carrental.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                v-model="settings.contactPhone"
                type="tel"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0123456789"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
              <textarea
                v-model="settings.address"
                rows="3"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Booking Settings -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt đặt xe</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Thời gian đặt xe tối thiểu (giờ)</label>
              <input
                v-model.number="settings.minBookingHours"
                type="number"
                min="1"
                max="24"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Thời gian hủy đặt xe (giờ)</label>
              <input
                v-model.number="settings.cancellationHours"
                type="number"
                min="1"
                max="72"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phí hủy đặt xe (%)</label>
              <input
                v-model.number="settings.cancellationFee"
                type="number"
                min="0"
                max="100"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div class="flex items-center">
              <input
                v-model="settings.autoConfirmBookings"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-700">Tự động xác nhận đặt xe</label>
            </div>
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt thanh toán</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phí dịch vụ (%)</label>
              <input
                v-model.number="settings.serviceFee"
                type="number"
                min="0"
                max="50"
                step="0.1"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phí tối thiểu (VNĐ)</label>
              <input
                v-model.number="settings.minFee"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="settings.paymentMethods"
                    type="checkbox"
                    value="credit_card"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Thẻ tín dụng</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="settings.paymentMethods"
                    type="checkbox"
                    value="bank_transfer"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Chuyển khoản ngân hàng</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="settings.paymentMethods"
                    type="checkbox"
                    value="ewallet"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Ví điện tử</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="settings.paymentMethods"
                    type="checkbox"
                    value="cash"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Tiền mặt</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Settings -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Cài đặt email</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email gửi (SMTP)</label>
              <input
                v-model="settings.smtpEmail"
                type="email"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="noreply@carrental.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mật khẩu SMTP</label>
              <input
                v-model="settings.smtpPassword"
                type="password"
                class="w-full border border-gray-300 rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                v-model="settings.smtpHost"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="smtp.gmail.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                v-model.number="settings.smtpPort"
                type="number"
                class="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="587"
              >
            </div>
            <div class="flex items-center">
              <input
                v-model="settings.emailNotifications"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-700">Gửi thông báo email</label>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="space-y-6">
        <!-- System Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Phiên bản:</span>
              <span class="text-sm font-medium">v1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Node.js:</span>
              <span class="text-sm font-medium">v18.17.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Database:</span>
              <span class="text-sm font-medium">MongoDB v6.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Uptime:</span>
              <span class="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Lần cập nhật cuối:</span>
              <span class="text-sm font-medium">20/03/2024</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div class="space-y-3">
            <button @click="clearCache" class="w-full btn btn-outline text-left">
              <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
              </svg>
              Xóa cache hệ thống
            </button>
            <button @click="backupDatabase" class="w-full btn btn-outline text-left">
              <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
              </svg>
              Sao lưu dữ liệu
            </button>
            <button @click="sendTestEmail" class="w-full btn btn-outline text-left">
              <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              Gửi email kiểm tra
            </button>
            <button @click="viewLogs" class="w-full btn btn-outline text-left">
              <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 10-2 0v3a1 1 0 102 0v-3zm-4 3a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clip-rule="evenodd"/>
              </svg>
              Xem logs hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const toast = useToast()

const settings = ref({
  siteName: 'CarRental',
  contactEmail: 'contact@carrental.com',
  contactPhone: '0123456789',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  minBookingHours: 2,
  cancellationHours: 24,
  cancellationFee: 10,
  autoConfirmBookings: false,
  serviceFee: 5,
  minFee: 50000,
  paymentMethods: ['credit_card', 'bank_transfer'],
  smtpEmail: 'noreply@carrental.com',
  smtpPassword: '',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  emailNotifications: true
})

const isLoading = ref(false)

const loadSettings = async () => {
  try {
    const response = await api.get('/admin/settings')
    if (response.data) {
      settings.value = { ...settings.value, ...response.data }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    // Use default settings if API fails
  }
}

const saveSettings = async () => {
  try {
    isLoading.value = true
    toast.info('Đang lưu cài đặt...')
    
    await api.put('/admin/settings', settings.value)
    
    toast.success('Cài đặt đã được lưu thành công!')
  } catch (error) {
    toast.error('Không thể lưu cài đặt')
    console.error('Failed to save settings:', error)
  } finally {
    isLoading.value = false
  }
}

const clearCache = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa cache hệ thống?')) return
  
  try {
    toast.info('Đang xóa cache hệ thống...')
    
    await api.post('/admin/clear-cache')
    
    toast.success('Cache hệ thống đã được xóa!')
  } catch (error) {
    toast.error('Không thể xóa cache')
    console.error('Failed to clear cache:', error)
  }
}

const backupDatabase = async () => {
  try {
    toast.info('Đang tạo sao lưu dữ liệu...')
    
    const response = await api.post('/admin/backup-database')
    
    // Download backup file
    if (response.data.backupUrl) {
      const link = document.createElement('a')
      link.href = response.data.backupUrl
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`
      link.click()
    }
    
    toast.success('Sao lưu dữ liệu thành công!')
  } catch (error) {
    toast.error('Không thể tạo sao lưu')
    console.error('Failed to backup database:', error)
  }
}

const sendTestEmail = async () => {
  try {
    toast.info('Đang gửi email kiểm tra...')
    
    await api.post('/admin/send-test-email', {
      to: settings.value.contactEmail,
      subject: 'Email kiểm tra từ hệ thống',
      message: 'Đây là email kiểm tra từ hệ thống CarRental.'
    })
    
    toast.success('Email kiểm tra đã được gửi thành công!')
  } catch (error) {
    toast.error('Không thể gửi email kiểm tra')
    console.error('Failed to send test email:', error)
  }
}

const viewLogs = () => {
  // Open logs in a new window or modal
  window.open('/admin/logs', '_blank')
}

const resetToDefaults = () => {
  if (!confirm('Bạn có chắc chắn muốn đặt lại cài đặt về mặc định?')) return
  
  settings.value = {
    siteName: 'CarRental',
    contactEmail: 'contact@carrental.com',
    contactPhone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    minBookingHours: 2,
    cancellationHours: 24,
    cancellationFee: 10,
    autoConfirmBookings: false,
    serviceFee: 5,
    minFee: 50000,
    paymentMethods: ['credit_card', 'bank_transfer'],
    smtpEmail: 'noreply@carrental.com',
    smtpPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    emailNotifications: true
  }
  
  toast.info('Cài đặt đã được đặt lại về mặc định')
}

onMounted(() => {
  loadSettings()
})
</script>
