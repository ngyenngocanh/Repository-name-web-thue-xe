<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      <div class="relative z-10">
        <h1 class="text-3xl font-black mb-2 tracking-tight">Hành trình của tôi</h1>
        <p class="text-indigo-100 text-lg font-medium opacity-90">Theo dõi và quản lý tất cả các chuyến đi được phân công</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <div class="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          </div>
          <h2 class="text-lg font-black text-gray-900 uppercase tracking-widest text-[13px]">Bộ lọc chuyến đi</h2>
        </div>
        <div class="flex gap-2">
          <select 
            v-model="statusFilter" 
            @change="fetchTrips"
            class="px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-black text-gray-700 focus:border-indigo-500 transition-all outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="active">Đang diễn ra</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Trips Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
        <div class="w-full h-48 bg-gray-100 rounded-2xl mb-4"></div>
        <div class="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="trips.length === 0" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center">
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
         <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h3 class="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Chưa có chuyến đi</h3>
      <p class="text-gray-400 font-medium mb-8">Danh sách chuyến đi của bạn hiện đang trống theo bộ lọc này.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="trip in trips" 
        :key="trip._id" 
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group flex flex-col"
        @click="viewDetails(trip._id)"
      >
        <div class="relative h-56 overflow-hidden bg-gray-100">
          <img 
            v-if="trip.car"
            :src="getCarImageUrl(trip.car, 0)" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
             <div class="text-4xl">👨‍✈️</div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p class="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Mã chuyến: #{{ trip._id.slice(-6).toUpperCase() }}</p>
              <h3 v-if="trip.car" class="text-lg font-black text-white uppercase tracking-tight">{{ trip.car.brand }} {{ trip.car.model }}</h3>
              <h3 v-else class="text-lg font-black text-white uppercase tracking-tight">Dịch vụ Tài xế</h3>
            </div>
            <span 
              class="px-3 py-1 text-[9px] font-black rounded-lg shadow-lg uppercase tracking-widest"
              :class="getStatusBadgeClass(trip.status)"
            >
              {{ getStatusLabel(trip.status) }}
            </span>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-3">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</p>
                <p class="font-black text-gray-900">{{ trip.renter?.fullName }}</p>
              </div>
            </div>
            <div class="text-right">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Doanh thu</p>
               <p class="text-lg font-black text-indigo-600">{{ formatPrice(trip.pricing.totalAmount) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 mt-auto">
            <div class="space-y-1">
              <p class="text-[9px] uppercase font-black text-gray-400 tracking-wider">Thời gian đi</p>
              <p class="text-xs font-black text-gray-900">{{ formatDate(trip.startDate) }} ({{ trip.pickupTime }})</p>
            </div>
            <div class="space-y-1 text-right">
              <p class="text-[9px] uppercase font-black text-gray-400 tracking-wider">Trạng thái xe</p>
              <p v-if="trip.car" class="text-xs font-black text-emerald-600">{{ trip.car.licensePlate }}</p>
              <p v-else class="text-xs font-black text-indigo-400 italic">Không có xe</p>
            </div>
          </div>
          
          <div class="mt-6">
             <button class="w-full py-3 bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 group-hover:border-indigo-600">
               Chi tiết hành trình ➔
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center mt-8">
      <nav class="flex items-center space-x-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
        >
          &larr;
        </button>
        <span class="px-6 py-2 bg-gray-50 rounded-full font-bold text-sm">
          Trang {{ currentPage }} / {{ pagination.pages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === pagination.pages"
          class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
        >
          &rarr;
        </button>
      </nav>
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

const trips = ref([])
const loading = ref(true)
const statusFilter = ref('')
const currentPage = ref(1)
const pagination = ref({ pages: 1 })

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    active: 'Đang diễn ra',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-blue-100 text-blue-800'
}

const fetchTrips = async () => {
  try {
    loading.value = true
    const response = await api.get('/driver/trips', {
      params: {
        page: currentPage.value,
        limit: 9,
        status: statusFilter.value
      }
    })
    trips.value = response.data.trips
    pagination.value = response.data.pagination
  } catch (error) {
    toast.error('Không thể tải danh sách chuyến đi')
  } finally {
    loading.value = false
  }
}

const viewDetails = (tripId) => {
  router.push(`/driver/trips/${tripId}`)
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchTrips()
  }
}

const nextPage = () => {
  if (currentPage.value < pagination.value.pages) {
    currentPage.value++
    fetchTrips()
  }
}

onMounted(() => {
  fetchTrips()
})
</script>
