<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản lý đặt trước</h2>
          <p class="text-gray-600 mt-1">Quản lý tất cả các đơn đặt trước giữ chỗ trong hệ thống</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm đặt trước..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.holding }}</div>
            <div class="text-gray-600">Đang giữ chỗ</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.converted }}</div>
            <div class="text-gray-600">Đã chuyển đổi</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-gray-100 rounded-full">
            <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.expired }}</div>
            <div class="text-gray-600">Đã hết hạn</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.cancelled }}</div>
            <div class="text-gray-600">Đã hủy</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-wrap gap-4">
        <select v-model="filters.status" class="border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="holding">Đang giữ chỗ</option>
          <option value="converted">Đã chuyển đổi</option>
          <option value="expired">Đã hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <input
          v-model="filters.startDate"
          type="date"
          class="border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Từ ngày"
        >
        <input
          v-model="filters.endDate"
          type="date"
          class="border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Đến ngày"
        >
        <button @click="resetFilters" class="text-gray-600 hover:text-gray-800 text-sm">
          Đặt lại bộ lọc
        </button>
      </div>
    </div>

    <!-- Pre-bookings Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đặt trước</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian thuê</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cọc giữ chỗ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn chót</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="booking in filteredPreBookings" :key="booking._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">#{{ booking._id?.slice(-6) }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ booking.renter?.fullName }}</div>
                <div class="text-sm text-gray-500">{{ booking.renter?.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ booking.car?.brand }} {{ booking.car?.model }}</div>
                <div class="text-sm text-gray-500">{{ booking.car?.licensePlate }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ formatDate(booking.startDate) }}</div>
                <div class="text-sm text-gray-500">→ {{ formatDate(booking.endDate) }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-blue-600">{{ formatPrice(booking.prebook?.holdDeposit) }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm" :class="isExpired(booking.prebook?.deadline) ? 'text-red-600 font-medium' : 'text-gray-900'">
                  {{ formatDateTime(booking.prebook?.deadline) }}
                </div>
                <div v-if="isExpired(booking.prebook?.deadline) && booking.prebook?.status === 'holding'" class="text-xs text-red-500">
                  Đã quá hạn
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusBadgeClass(booking.prebook?.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getPrebookStatusLabel(booking.prebook?.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button 
                    v-if="booking.prebook?.status === 'holding' && !isExpired(booking.prebook?.deadline)"
                    @click="confirmPreBooking(booking)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Xác nhận
                  </button>
                  <button 
                    v-if="booking.prebook?.status === 'holding'"
                    @click="cancelPreBooking(booking)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hủy
                  </button>
                  <button 
                    @click="viewDetails(booking)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Chi tiết
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">Chi tiết đặt trước #{{ selectedBooking?._id?.slice(-6) }}</h3>
            <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4" v-if="selectedBooking">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500 uppercase">Khách hàng</label>
              <p class="font-medium">{{ selectedBooking.renter?.fullName }}</p>
              <p class="text-sm text-gray-500">{{ selectedBooking.renter?.email }}</p>
              <p class="text-sm text-gray-500">{{ selectedBooking.renter?.phone }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 uppercase">Xe</label>
              <p class="font-medium">{{ selectedBooking.car?.brand }} {{ selectedBooking.car?.model }}</p>
              <p class="text-sm text-gray-500">{{ selectedBooking.car?.licensePlate }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500 uppercase">Thời gian thuê</label>
              <p class="font-medium">{{ formatDate(selectedBooking.startDate) }} → {{ formatDate(selectedBooking.endDate) }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 uppercase">Tổng tiền</label>
              <p class="font-medium text-lg">{{ formatPrice(selectedBooking.pricing?.totalAmount) }}</p>
            </div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-bold text-blue-800 mb-2">Thông tin đặt trước</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-600">Trạng thái:</span>
                <span class="font-medium ml-1">{{ getPrebookStatusLabel(selectedBooking.prebook?.status) }}</span>
              </div>
              <div>
                <span class="text-blue-600">Cọc giữ chỗ:</span>
                <span class="font-medium ml-1">{{ formatPrice(selectedBooking.prebook?.holdDeposit) }}</span>
              </div>
              <div>
                <span class="text-blue-600">Hạn chót:</span>
                <span class="font-medium ml-1" :class="isExpired(selectedBooking.prebook?.deadline) ? 'text-red-600' : ''">
                  {{ formatDateTime(selectedBooking.prebook?.deadline) }}
                </span>
              </div>
              <div v-if="selectedBooking.prebook?.convertedAt">
                <span class="text-blue-600">Chuyển đổi lúc:</span>
                <span class="font-medium ml-1">{{ formatDateTime(selectedBooking.prebook?.convertedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            v-if="selectedBooking?.prebook?.status === 'holding' && !isExpired(selectedBooking?.prebook?.deadline)"
            @click="confirmPreBooking(selectedBooking); showDetailsModal = false"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Xác nhận đặt trước
          </button>
          <button 
            v-if="selectedBooking?.prebook?.status === 'holding'"
            @click="cancelPreBooking(selectedBooking); showDetailsModal = false"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Hủy đặt trước
          </button>
          <button @click="showDetailsModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const toast = useToast()
const preBookings = ref([])
const searchQuery = ref('')
const filters = ref({
  status: '',
  startDate: '',
  endDate: ''
})
const showDetailsModal = ref(false)
const selectedBooking = ref(null)

const stats = computed(() => ({
  holding: preBookings.value.filter(b => b.prebook?.status === 'holding').length,
  converted: preBookings.value.filter(b => b.prebook?.status === 'converted').length,
  expired: preBookings.value.filter(b => b.prebook?.status === 'expired').length,
  cancelled: preBookings.value.filter(b => b.prebook?.status === 'cancelled').length
}))

const filteredPreBookings = computed(() => {
  return preBookings.value.filter(booking => {
    // Search filter
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      const matchRenter = (booking.renter?.fullName || '').toLowerCase().includes(search)
      const matchCar = `${booking.car?.brand || ''} ${booking.car?.model || ''}`.toLowerCase().includes(search)
      const matchId = (booking._id || '').toLowerCase().includes(search)
      if (!matchRenter && !matchCar && !matchId) return false
    }
    
    // Status filter
    if (filters.value.status && booking.prebook?.status !== filters.value.status) {
      return false
    }
    
    return true
  })
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  if (!price) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const isExpired = (deadline) => {
  if (!deadline) return false
  return new Date() > new Date(deadline)
}

const getPrebookStatusLabel = (status) => {
  const labels = {
    holding: 'Đang giữ chỗ',
    converted: 'Đã chuyển đổi',
    expired: 'Đã hết hạn',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    holding: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const fetchPreBookings = async () => {
  try {
    const response = await api.get('/admin/prebookings')
    preBookings.value = response.data.preBookings || response.data
  } catch (error) {
    toast.error('Không thể tải danh sách đặt trước')
  }
}

const confirmPreBooking = async (booking) => {
  try {
    await api.post(`/bookings/${booking._id}/confirm`)
    toast.success('Xác nhận đặt trước thành công')
    fetchPreBookings()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Xác nhận thất bại')
  }
}

const cancelPreBooking = async (booking) => {
  if (!confirm('Bạn có chắc chắn muốn hủy đặt trước này?')) return
  
  try {
    await api.put(`/admin/bookings/${booking._id}/cancel`)
    toast.success('Hủy đặt trước thành công')
    fetchPreBookings()
  } catch (error) {
    toast.error('Hủy đặt trước thất bại')
  }
}

const viewDetails = (booking) => {
  selectedBooking.value = booking
  showDetailsModal.value = true
}

const resetFilters = () => {
  filters.value = {
    status: '',
    startDate: '',
    endDate: ''
  }
  searchQuery.value = ''
}

onMounted(() => {
  fetchPreBookings()
})
</script>
