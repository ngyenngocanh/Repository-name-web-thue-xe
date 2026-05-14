<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Chuyến đi của tôi</h1>
        <div class="flex space-x-4">
           <button @click="handleCancelAll" class="px-6 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-xs uppercase hover:bg-red-200 transition-all shadow-sm">Hủy tất cả chuyến đi</button>
           <button @click="handleClearAll" class="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs uppercase hover:bg-gray-200 transition-all shadow-sm">Dọn dẹp danh sách</button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="py-4 px-6 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.label }}
              <span v-if="tab.count > 0" class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Bookings List -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="card">
          <div class="p-6">
            <div class="skeleton skeleton-title mb-4"></div>
            <div class="grid grid-cols-4 gap-4">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredBookings.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h4a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Chưa có chuyến đi nào
        </h3>
        <p class="text-gray-600 mb-4">
          {{ viewType === 'renter' ? 'Bắt đầu tìm xe và đặt chuyến đi đầu tiên của bạn.' : 'Chưa có ai thuê xe của bạn.' }}
        </p>
        <router-link 
          :to="viewType === 'renter' ? '/cars' : '/add-car'" 
          class="btn btn-primary"
        >
          {{ viewType === 'renter' ? 'Tìm xe ngay' : 'Đăng xe cho thuê' }}
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div v-for="booking in filteredBookings" :key="booking._id" class="card">
          <div class="p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <!-- Car Info -->
              <div class="flex items-center mb-4 lg:mb-0">
                <img
                  :src="booking.car ? getCarImageUrl(booking.car, 0) : (booking.driver?.avatar || '/placeholder-avatar.svg')"
                  :alt="booking.car ? `${booking.car.brand} ${booking.car.model}` : booking.driver?.fullName"
                  class="w-20 h-20 object-cover rounded-lg mr-4"
                  @error="handleImageError"
                >
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    <template v-if="booking.car">
                      {{ booking.car.brand }} {{ booking.car.model }}
                    </template>
                    <template v-else>
                      Dịch vụ tài xế: {{ booking.driver?.fullName }}
                    </template>
                  </h3>
                  <div class="flex items-center text-gray-600 text-sm">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    {{ booking.car ? booking.car.location?.city : booking.pickupLocation?.split(',').pop() }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formatDateRange(booking.startDate, booking.endDate) }}
                  </div>
                </div>
              </div>

              <!-- Status and Actions -->
              <div class="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div class="flex items-center gap-2">
                  <!-- Pre-booking tag -->
                  <span 
                    v-if="booking.bookingType === 'prebook'"
                    class="badge bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {{ getPrebookTypeLabel(booking.prebook?.status) }}
                  </span>
                  <span 
                    class="badge"
                    :class="getStatusBadgeClass(booking.status)"
                  >
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </div>
                
                <div class="text-right">
                  <div class="text-lg font-bold text-primary-600">
                    {{ formatPrice(booking.pricing?.totalAmount) }}
                  </div>
                  <div class="text-sm text-gray-600">Tổng cộng</div>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="viewDetails(booking._id)"
                    class="btn btn-outline btn-sm"
                  >
                    Chi tiết
                  </button>
                  
                  <button 
                    v-if="canCancel(booking)"
                    @click="cancelBooking(booking._id)"
                    class="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Hủy
                  </button>
                  
                  <button 
                    v-if="canReview(booking)"
                    @click="reviewBooking(booking._id)"
                    class="btn btn-primary btn-sm"
                  >
                    Đánh giá
                  </button>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Người {{ viewType === 'owner' ? 'thuê' : 'cho thuê' }}:</span>
                <div class="font-medium">
                  {{ viewType === 'owner' ? booking.renter?.fullName : booking.owner?.fullName }}
                </div>
              </div>
              <div>
                <span class="text-gray-600">Thời gian:</span>
                <div class="font-medium">
                  {{ booking.duration?.days || 0 }} ngày
                </div>
              </div>
              <div>
                <span class="text-gray-600">Thanh toán:</span>
                <div class="font-medium">
                  {{ getPaymentStatusLabel(booking.payment?.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-8">
        <Pagination 
          :current-page="pagination.page"
          :total-pages="pagination.pages"
          :total="pagination.total"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const bookings = ref([])
const viewType = ref('renter')
const activeTab = ref('all')
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const tabs = computed(() => {
  const counts = {
    all: bookings.value.length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
    active: bookings.value.filter(b => b.status === 'active').length,
    completed: bookings.value.filter(b => b.status === 'completed').length,
    cancelled: bookings.value.filter(b => b.status === 'cancelled').length
  }
  
  return [
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'pending', label: 'Chờ xác nhận', count: counts.pending },
    { key: 'confirmed', label: 'Đã xác nhận', count: counts.confirmed },
    { key: 'active', label: 'Đang diễn ra', count: counts.active },
    { key: 'completed', label: 'Hoàn thành', count: counts.completed },
    { key: 'cancelled', label: 'Đã hủy', count: counts.cancelled }
  ]
})

const filteredBookings = computed(() => {
  if (activeTab.value === 'all') return bookings.value
  return bookings.value.filter(booking => booking.status === activeTab.value)
})

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    active: 'Đang diễn ra',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    disputed: 'Tranh chấp'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    active: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-error',
    disputed: 'badge-error'
  }
  return classes[status] || 'badge-info'
}

const getPrebookTypeLabel = (prebookStatus) => {
  const labels = {
    holding: 'Đặt cọc giữ chỗ',
    converted: 'Đã chuyển đổi',
    expired: 'Hết hạn giữ chỗ',
    cancelled: 'Đã hủy giữ chỗ'
  }
  return labels[prebookStatus] || 'Đặt trước'
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    refunded: 'Đã hoàn tiền',
    failed: 'Thất bại'
  }
  return labels[status] || status
}

const formatDateRange = (start, end) => {
  if (!start) return ''
  const s = new Date(start).toLocaleDateString('vi-VN')
  if (!end) return s
  const e = new Date(end).toLocaleDateString('vi-VN')
  return `${s} - ${e}`
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const canCancel = (booking) => {
  return ['pending', 'confirmed'].includes(booking.status)
}

const canReview = (booking) => {
  return booking.status === 'completed' && !booking.reviews?.renterReview
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

const fetchBookings = async () => {
  try {
    loading.value = true
    const endpoint = viewType.value === 'renter' ? '/bookings/my/rentals' : '/bookings/my/bookings'
    
    const response = await api.get(endpoint, {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: activeTab.value !== 'all' ? activeTab.value : undefined
      }
    })
    
    bookings.value = response.data.bookings
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('FETCH BOOKINGS ERROR:', error.response?.data || error)
    toast.error('Không thể tải danh sách chuyến đi: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchBookings()
}

const viewDetails = (bookingId) => {
  router.push(`/bookings/${bookingId}`)
}

const cancelBooking = async (bookingId) => {
  if (!confirm('Bạn có chắc chắn muốn hủy chuyến đi này?')) return
  
  try {
    await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' })
    toast.success('Hủy chuyến đi thành công')
    fetchBookings()
  } catch (error) {
    toast.error('Không thể hủy chuyến đi')
  }
}

const reviewBooking = (bookingId) => {
  router.push(`/bookings/${bookingId}/review`)
}

watch(viewType, () => {
  pagination.value.page = 1
  fetchBookings()
})

const handleCancelAll = async () => {
  if (!confirm('Bạn có chắc chắn muốn hủy tất cả chuyến đi đang chờ? Hành động này không thể hoàn tác.')) return
  try {
    const res = await api.put('/bookings/my/cancel-all')
    toast.success(res.data.message)
    fetchBookings()
  } catch (error) {
    toast.error('Không thể thực hiện hủy hàng loạt')
  }
}

const handleClearAll = async () => {
  if (!confirm('Bạn có chắc muốn xóa vĩnh viễn lịch sử các chuyến đã hủy/hoàn thành?')) return
  try {
    const res = await api.delete('/bookings/my/clear-history')
    toast.success(res.data.message)
    fetchBookings()
  } catch (error) {
    toast.error('Không thể dọn dẹp danh sách')
  }
}

watch(activeTab, () => {
  pagination.value.page = 1
  fetchBookings()
})

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  fetchBookings()
})
</script>
