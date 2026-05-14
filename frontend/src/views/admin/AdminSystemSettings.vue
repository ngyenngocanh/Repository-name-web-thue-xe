<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl shadow-xl p-8 text-white">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold mb-2">Cài đặt hệ thống</h1>
          <p class="text-gray-300 text-lg">Quản lý cấu hình và bảo trì hệ thống</p>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Trạng thái server</p>
            <div class="flex items-center mt-2">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p class="text-lg font-semibold text-green-600">Online</p>
            </div>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Uptime</p>
            <p class="text-lg font-semibold text-gray-900">99.9%</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">CPU Usage</p>
            <p class="text-lg font-semibold text-gray-900">45%</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Memory</p>
            <p class="text-lg font-semibold text-gray-900">2.3GB</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
              <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- System Configuration -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 class="text-xl font-semibold text-gray-900 mb-6">Cấu hình hệ thống</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Database Settings -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Cài đặt Database</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Database Host</label>
            <input
              v-model="systemSettings.dbHost"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="localhost"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Database Port</label>
            <input
              v-model.number="systemSettings.dbPort"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="27017"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
            <input
              v-model="systemSettings.dbName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="carrental"
            >
          </div>
        </div>

        <!-- API Settings -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Cài đặt API</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (req/min)</label>
            <input
              v-model.number="systemSettings.apiRateLimit"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="100"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">JWT Secret</label>
            <input
              v-model="systemSettings.jwtSecret"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="••••••••"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              v-model.number="systemSettings.sessionTimeout"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="30"
            >
          </div>
        </div>

        <!-- File Upload Settings -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Cài đặt Upload</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
            <input
              v-model.number="systemSettings.maxFileSize"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="10"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
            <textarea
              v-model="systemSettings.allowedFileTypes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="jpg,png,pdf,doc"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Storage Path</label>
            <input
              v-model="systemSettings.storagePath"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="/uploads"
            >
          </div>
        </div>

        <!-- Email Settings -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Cài đặt Email</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
            <input
              v-model="systemSettings.smtpHost"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="smtp.gmail.com"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
            <input
              v-model.number="systemSettings.smtpPort"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="587"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email From</label>
            <input
              v-model="systemSettings.emailFrom"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="noreply@carrental.com"
            >
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button @click="testConnection" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
          Test kết nối
        </button>
        <button @click="saveSystemSettings" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Lưu cài đặt
        </button>
      </div>
    </div>

    <!-- Maintenance Tools -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 class="text-xl font-semibold text-gray-900 mb-6">Công cụ bảo trì</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button @click="clearCache" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">Xóa Cache</span>
          </div>
          <p class="text-sm text-gray-600">Xóa cache hệ thống để giải phóng bộ nhớ</p>
        </button>

        <button @click="backupDatabase" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
            </svg>
            <span class="font-medium">Sao lưu Database</span>
          </div>
          <p class="text-sm text-gray-600">Tạo bản sao lưu dữ liệu hệ thống</p>
        </button>

        <button @click="optimizeDatabase" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            <span class="font-medium">Tối ưu Database</span>
          </div>
          <p class="text-sm text-gray-600">Tối ưu hóa hiệu suất database</p>
        </button>

        <button @click="restartServer" class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">Khởi động lại</span>
          </div>
          <p class="text-sm text-gray-600">Khởi động lại server hệ thống</p>
        </button>
      </div>
    </div>

    <!-- System Logs -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900">Logs hệ thống</h3>
        <div class="flex space-x-2">
          <select v-model="logLevel" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Tất cả</option>
            <option value="error">Lỗi</option>
            <option value="warn">Cảnh báo</option>
            <option value="info">Thông tin</option>
          </select>
          <button @click="refreshLogs" class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
        <div v-for="log in filteredLogs" :key="log.id" class="font-mono text-sm mb-2">
          <span class="text-gray-400">[{{ log.timestamp }}]</span>
          <span 
            :class="{
              'text-red-400': log.level === 'error',
              'text-yellow-400': log.level === 'warn',
              'text-blue-400': log.level === 'info',
              'text-gray-300': log.level === 'debug'
            }"
          >
            [{{ log.level.toUpperCase() }}]
          </span>
          <span class="text-gray-300">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const systemSettings = ref({
  dbHost: 'localhost',
  dbPort: 27017,
  dbName: 'carrental',
  apiRateLimit: 100,
  jwtSecret: '',
  sessionTimeout: 30,
  maxFileSize: 10,
  allowedFileTypes: 'jpg,png,pdf,doc',
  storagePath: '/uploads',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  emailFrom: 'noreply@carrental.com'
})

const logLevel = ref('all')
const logs = ref([
  { id: 1, timestamp: '2024-03-20 10:30:45', level: 'info', message: 'Server started successfully' },
  { id: 2, timestamp: '2024-03-20 10:31:12', level: 'info', message: 'Database connected' },
  { id: 3, timestamp: '2024-03-20 10:32:05', level: 'warn', message: 'High memory usage detected: 85%' },
  { id: 4, timestamp: '2024-03-20 10:33:20', level: 'error', message: 'Failed to send email to user@example.com' },
  { id: 5, timestamp: '2024-03-20 10:34:15', level: 'info', message: 'User login: admin@carrental.com' },
  { id: 6, timestamp: '2024-03-20 10:35:30', level: 'warn', message: 'API rate limit exceeded for IP: 192.168.1.100' },
  { id: 7, timestamp: '2024-03-20 10:36:45', level: 'info', message: 'Cache cleared successfully' },
  { id: 8, timestamp: '2024-03-20 10:37:20', level: 'error', message: 'Database query timeout' }
])

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') {
    return logs.value
  }
  return logs.value.filter(log => log.level === logLevel.value)
})

const saveSystemSettings = () => {
  toast.success('Cài đặt hệ thống đã được lưu')
  console.log('System settings saved:', systemSettings.value)
}

const testConnection = () => {
  toast.info('Đang kiểm tra kết nối...')
  setTimeout(() => {
    toast.success('Kết nối thành công!')
  }, 2000)
}

const clearCache = () => {
  if (!confirm('Bạn có chắc chắn muốn xóa cache hệ thống?')) return
  
  toast.info('Đang xóa cache...')
  setTimeout(() => {
    toast.success('Cache đã được xóa thành công!')
  }, 1500)
}

const backupDatabase = () => {
  toast.info('Đang tạo bản sao lưu...')
  setTimeout(() => {
    toast.success('Sao lưu database thành công!')
  }, 2000)
}

const optimizeDatabase = () => {
  toast.info('Đang tối ưu database...')
  setTimeout(() => {
    toast.success('Database đã được tối ưu!')
  }, 3000)
}

const restartServer = () => {
  if (!confirm('Bạn có chắc chắn muốn khởi động lại server?')) return
  
  toast.info('Đang khởi động lại server...')
  setTimeout(() => {
    toast.success('Server đã được khởi động lại!')
  }, 3000)
}

const refreshLogs = () => {
  toast.info('Đang tải lại logs...')
  // Simulate adding new log
  const newLog = {
    id: logs.value.length + 1,
    timestamp: new Date().toLocaleString('vi-VN'),
    level: 'info',
    message: 'Logs refreshed manually'
  }
  logs.value.unshift(newLog)
  toast.success('Logs đã được tải lại!')
}

onMounted(() => {
  // Load system settings from API
  console.log('System settings loaded')
})
</script>
