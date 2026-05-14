<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Xe của tôi</h1>
        <p class="text-gray-500">Quản lý và theo dõi trạng thái các xe bạn sở hữu</p>
      </div>
      <router-link to="/driver/cars/add" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5">
        + Đăng xe mới
      </router-link>
    </div>

    <!-- Cars Grid -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="spinner mr-4"></div>
      <span class="text-gray-500 font-medium">Đang tải danh sách...</span>
    </div>

    <div v-else-if="cars.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚗</div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Bạn chưa có xe nào</h3>
      <p class="text-gray-500 mb-6">Bạn có thể bắt đầu bằng cách đăng một chiếc xe lên hệ thống.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="car in cars" 
        :key="car._id" 
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
      >
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="getCarImageUrl(car, 0)" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          >
          <div class="absolute top-4 right-4 flex flex-col gap-2">
            <!-- Trạng thái phê duyệt -->
            <span 
              class="px-3 py-1 text-xs font-bold rounded-full shadow-lg"
              :class="getApprovalStatusBadgeClass(car.approvalStatus || car.status)"
            >
              {{ getApprovalStatusLabel(car.approvalStatus || car.status) }}
            </span>
            <!-- Trạng thái hoạt động (chỉ hiện khi đã duyệt) -->
            <span 
              v-if="(car.approvalStatus === 'approved' || car.status === 'available') && car.operationalStatus"
              class="px-3 py-1 text-xs font-bold rounded-full shadow-lg"
              :class="getOperationalStatusBadgeClass(car.operationalStatus)"
            >
              {{ getOperationalStatusLabel(car.operationalStatus) }}
            </span>
          </div>
        </div>

        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ car.brand }} {{ car.model }}</h3>
                <p class="text-sm font-medium text-gray-500">{{ car.licensePlate }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-sm font-bold text-primary-600">{{ formatPrice(car.pricing?.basePrice) }}</span>
                  <span class="text-[10px] text-gray-400">/ngày</span>
                </div>
                <!-- Rating -->
                <div class="flex items-center gap-1 mt-1" v-if="car.rating?.count > 0">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm font-medium">{{ car.rating?.average?.toFixed(1) || '0.0' }}</span>
                  <span class="text-xs text-gray-500">({{ car.rating?.count }} đánh giá)</span>
                </div>
              </div>
            </div>

          <div class="space-y-4 pt-4 border-t border-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400">📊</div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Số KM</p>
                  <p class="text-sm font-bold text-gray-900">{{ car.mileage }} KM</p>
                </div>
              </div>
              <!-- Trips count -->
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400">🚗</div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Chuyến</p>
                  <p class="text-sm font-bold text-gray-900">{{ car.totalTrips || 0 }}</p>
                </div>
              </div>
            </div>
            
            <!-- Buttons -->
            <div class="flex gap-2 pt-2">
              <button 
                @click="viewCarDetail(car._id)" 
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Xem chi tiết
              </button>
              <button 
                @click="openOperationalStatusModal(car)" 
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Đổi trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Operational Status Modal -->
    <div 
      v-if="showStatusModal" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showStatusModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-xl font-bold text-gray-900 mb-4">Đổi Trạng Thái Hoạt Động</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            Xe: <strong>{{ selectedCar?.brand }} {{ selectedCar?.model }}</strong>
          </p>
          <p class="text-sm text-gray-600">
            Trạng thái hiện tại: 
            <span 
              class="font-medium px-2 py-1 rounded-full text-xs"
              :class="getOperationalStatusBadgeClass(selectedCar?.operationalStatus)"
            >
              {{ getOperationalStatusLabel(selectedCar?.operationalStatus) }}
            </span>
          </p>
        </div>

        <div class="space-y-2 mb-6">
          <label 
            v-for="status in operationalStatuses" 
            :key="status.value"
            class="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            :class="selectedOperationalStatus === status.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
          >
            <input
              type="radio"
              v-model="selectedOperationalStatus"
              :value="status.value"
              class="mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div class="flex-1">
              <div class="font-medium" :class="selectedOperationalStatus === status.value ? 'text-primary-700' : 'text-gray-700'">
                {{ status.label }}
              </div>
              <div class="text-sm text-gray-500">{{ status.description }}</div>
            </div>
          </label>
        </div>

        <div class="flex gap-3">
          <button
            @click="showStatusModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            @click="updateOperationalStatus"
            :disabled="!selectedOperationalStatus || selectedOperationalStatus === selectedCar?.operationalStatus"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const cars = ref([])
const loading = ref(true)

// Modal state
const showStatusModal = ref(false)
const selectedCar = ref(null)
const selectedOperationalStatus = ref('')

const operationalStatuses = [
  { value: 'available', label: 'Sẵn sàng', description: 'Xe sẵn sàng cho thuê' },
  { value: 'rented', label: 'Đang cho thuê', description: 'Xe đang được thuê' },
  { value: 'maintenance', label: 'Bảo dưỡng', description: 'Xe đang bảo trì định kỳ' },
  { value: 'repair', label: 'Sửa chữa', description: 'Xe đang sửa chữa' },
  { value: 'inactive', label: 'Ngưng hoạt động', description: 'Xe tạm ngưng hoạt động' }
]

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const resolveImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
}

// Hàm lấy ảnh xe - kiểm tra nếu có url thì dùng url, nếu không thì gọi API
const getCarImageUrl = (car, index) => {
  if (!car || !car.images || !car.images[index]) return '/logo.png'
  const image = car.images[index]
  // Nếu ảnh có url, dùng url
  if (image.url) {
    return resolveImageUrl(image.url)
  }
  // Nếu không có url, gọi API để lấy binary data
  return `/api/cars/${car._id}/images/${index}`
}

const handleImageError = (event) => {
  event.target.src = '/logo.png'
}

// Trạng thái phê duyệt
const getApprovalStatusLabel = (status) => {
  const labels = {
    approved: 'Đã duyệt',
    available: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Bị từ chối'
  }
  return labels[status] || status
}

const getApprovalStatusBadgeClass = (status) => {
  const classes = {
    approved: 'bg-green-100 text-green-800',
    available: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Trạng thái hoạt động
const getOperationalStatusLabel = (status) => {
  const labels = {
    available: 'Sẵn sàng',
    rented: 'Đang cho thuê',
    maintenance: 'Bảo dưỡng',
    repair: 'Sửa chữa',
    inactive: 'Ngưng hoạt động'
  }
  return labels[status] || status || 'Chưa xác định'
}

const getOperationalStatusBadgeClass = (status) => {
  const classes = {
    available: 'bg-blue-100 text-blue-800',
    rented: 'bg-purple-100 text-purple-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    repair: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const fetchCars = async () => {
  try {
    loading.value = true
    const response = await api.get('/driver/cars')
    cars.value = response.data
  } catch (error) {
    toast.error('Không thể tải danh sách xe')
  } finally {
    loading.value = false
  }
}

const viewCarDetail = (carId) => {
  router.push(`/driver/cars/${carId}`)
}

// Open modal to change operational status
const openOperationalStatusModal = (car) => {
  selectedCar.value = car
  selectedOperationalStatus.value = car.operationalStatus || 'available'
  showStatusModal.value = true
}

// Update operational status
const updateOperationalStatus = async () => {
  if (!selectedCar.value || !selectedOperationalStatus.value) return

  try {
    await api.put(`/cars/${selectedCar.value._id}/operational-status`, {
      operationalStatus: selectedOperationalStatus.value
    })

    toast.success('Cập nhật trạng thái hoạt động thành công')
    showStatusModal.value = false
    selectedCar.value = null
    selectedOperationalStatus.value = ''
    fetchCars()
  } catch (error) {
    toast.error('Không thể cập nhật trạng thái hoạt động')
  }
}

onMounted(() => {
  fetchCars()
})
</script>
