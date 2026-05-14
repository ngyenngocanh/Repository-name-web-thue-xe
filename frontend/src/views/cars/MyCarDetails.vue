<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header -->
    <div class="bg-white border-b sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/my-cars" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeftIcon class="w-6 h-6" />
          </router-link>
          <div>
            <h1 class="text-xl font-black text-gray-900 uppercase tracking-tight" v-if="car">
              {{ car.brand }} {{ car.model }}
              <span class="text-sm font-normal text-gray-400 ml-2">#{{ car._id.substring(0,8) }}</span>
            </h1>
            <div class="flex items-center space-x-2 mt-0.5" v-if="car">
               <span 
                 class="px-2 py-0.5 text-[10px] font-black uppercase rounded-md tracking-[0.1em]"
                 :class="getStatusBadgeClass(car.status)"
               >
                 {{ getStatusLabel(car.status) }}
               </span>
               <span class="text-xs text-gray-400 font-medium tracking-tight">Biển số: {{ car.licensePlate }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
           <button 
             @click="viewContract"
             class="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-xl font-bold text-xs flex items-center transition-all"
           >
             <DocumentTextIcon class="w-4 h-4 mr-2" />
             Xem hợp đồng
           </button>
           <button 
             @click="refreshData"
             class="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-all"
           >
             <ArrowPathIcon class="w-5 h-5" :class="{'animate-spin': loading}" />
           </button>
        </div>
      </div>
    </div>

    <div v-if="loading && !car" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
       <div class="h-64 bg-white rounded-3xl animate-pulse shadow-sm"></div>
       <div class="h-96 bg-white rounded-3xl animate-pulse shadow-sm"></div>
    </div>

    <div v-else-if="car" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Side: Core Info & Status -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doanh thu (Gộp)</p>
               <p class="text-2xl font-black text-gray-900 tracking-tighter">{{ formatPrice(stats.totalRevenue) }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Phí hệ thống</p>
               <p class="text-2xl font-black text-orange-600 tracking-tighter">-{{ formatPrice(stats.totalCommission) }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-primary-50 hover:shadow-md transition-shadow">
               <p class="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Thực nhận</p>
               <p class="text-2xl font-black text-primary-600 tracking-tighter">{{ formatPrice(stats.totalProfit) }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số chuyến đi</p>
               <p class="text-2xl font-black text-gray-900 tracking-tighter">{{ stats.totalTrips }}</p>
            </div>
          </div>

          <!-- Car Images -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div class="relative h-[400px]">
               <img 
                 :src="car.images?.[activeImageIndex]?.url || '/logo.png'" 
                 class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
               >
               <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex items-end justify-between">
                  <div class="flex space-x-2">
                    <button 
                      v-for="(img, idx) in car.images" 
                      :key="idx"
                      @click="activeImageIndex = idx"
                      class="w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5"
                      :class="activeImageIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-60'"
                    >
                      <img :src="img.url" class="w-full h-full object-cover rounded-lg">
                    </button>
                  </div>
               </div>
            </div>
          </div>

          <!-- Booking History -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-8 border-b border-gray-50 flex justify-between items-center">
               <h3 class="text-lg font-black text-gray-900 uppercase tracking-wider italic">Lịch sử đặt xe</h3>
               <span class="text-xs text-gray-400 font-bold uppercase tracking-widest">Gần đây nhất</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                   <tr>
                     <th class="px-8 py-4">Khách hàng</th>
                     <th class="px-8 py-4">Thời gian</th>
                     <th class="px-4 py-4 text-right">Tổng thanh toán</th>
                     <th class="px-4 py-4 text-right">Hoa hồng ({{ car?.commissionPercentage || 15 }}%)</th>
                     <th class="px-4 py-4 text-right">Thực nhận</th>
                     <th class="px-6 py-4 text-center">Quyết toán</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="booking in bookings" :key="booking._id" class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-8 py-4">
                       <div class="flex items-center space-x-3">
                          <img :src="getUserAvatarUrl(booking.renter?._id, booking.renter?.avatar) || '/placeholder-avatar.svg'" class="w-10 h-10 rounded-full shadow-sm" @error="$event.target.src = '/placeholder-avatar.svg'">
                          <div>
                            <p class="text-sm font-bold text-gray-900">{{ booking.renter?.fullName }}</p>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{{ booking.renter?.phone }}</p>
                          </div>
                       </div>
                    </td>
                    <td class="px-8 py-4">
                       <p class="text-sm font-medium text-gray-700 tracking-tight">
                         {{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}
                       </p>
                       <p class="text-[11px] text-gray-400 italic">({{ getRentalDuration(booking) }})</p>
                    </td>
                    <td class="px-4 py-4 text-right">
                       <p class="text-[12px] font-bold text-gray-900 tracking-tight">{{ formatPrice(booking.pricing?.totalAmount || 0) }}</p>
                    </td>
                    <td class="px-4 py-4 text-right">
                       <p class="text-[11px] font-medium text-orange-600 italic">-{{ formatPrice(calculateCommission(booking)) }}</p>
                    </td>
                    <td class="px-4 py-4 text-right">
                       <p class="text-[12px] font-black text-primary-600 tracking-tighter">{{ formatPrice(calculateNetProfit(booking)) }}</p>
                    </td>
                    <td class="px-6 py-4">
                       <div class="flex flex-col items-center space-y-1">
                          <span 
                            class="px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-widest"
                            :class="getSettlementStatusClass(booking.settlement?.status || 'pending')"
                          >
                             {{ getSettlementStatusLabel(booking.settlement?.status || 'pending') }}
                          </span>
                       </div>
                    </td>
                  </tr>
                  <tr v-if="bookings.length === 0">
                    <td colspan="4" class="px-8 py-12 text-center text-gray-400 italic font-medium">
                       Chưa có lượt đặt xe nào cho phương tiện này.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Side: Sidebar Status & Details -->
        <div class="space-y-8">
          
          <!-- Quick Status Actions -->
          <div class="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
             <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1 italic">Trạng thái hoạt động</h3>
             <div class="space-y-3">
                <button 
                  v-for="status in availableStatuses"
                  :key="status.value"
                  @click="updateStatus(status.value)"
                  class="w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2"
                  :class="car.status === status.value 
                    ? 'bg-primary-50 border-primary-100 text-primary-700 shadow-inner' 
                    : 'bg-white border-gray-50 text-gray-500 hover:border-primary-100 hover:text-primary-600'"
                >
                   <div class="flex items-center">
                      <div class="w-8 h-8 rounded-xl flex items-center justify-center mr-3" :class="status.color">
                         <component :is="status.icon" class="w-4 h-4" />
                      </div>
                      <span class="text-sm font-bold uppercase tracking-widest">{{ status.label }}</span>
                   </div>
                   <CheckIcon v-if="car.status === status.value" class="w-5 h-5" />
                </button>
             </div>
             <p class="mt-6 text-[11px] text-gray-400 italic leading-relaxed px-1">
                * Thay đổi trạng thái sang "Bảo trì" hoặc "Sửa chữa" sẽ tạm thời ẩn xe khỏi kết quả tìm kiếm của khách hàng.
             </p>
          </div>

          <!-- Technical Pricing Details -->
          <div class="bg-indigo-900 text-white p-8 rounded-[32px] shadow-2xl overflow-hidden relative group">
             <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <CurrencyDollarIcon class="w-16 h-16 text-white rotate-12" />
             </div>
             
             <h3 class="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 italic relative z-10">Bảng giá Đối tác</h3>
             <div class="space-y-6 relative z-10">
                <div class="flex justify-between items-center border-b border-white/5 pb-4">
                   <div class="flex flex-col">
                      <span class="text-[9px] text-gray-400 font-black uppercase">Gói 1 Ngày</span>
                      <span class="text-lg font-black tracking-tighter">{{ formatPrice(car.pricePerDay) }}</span>
                   </div>
                   <div class="text-right flex flex-col items-end">
                      <span class="text-[9px] text-gray-400 font-black uppercase">Thực nhận (Ước tính)</span>
                      <span class="text-sm font-black text-green-400 tracking-tighter">{{ formatPrice(car.pricePerDay * (1 - (car.commissionPercentage || 15)/100)) }}</span>
                   </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                   <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p class="text-[9px] text-gray-400 font-black uppercase mb-1">Cọc 15 Ngày</p>
                      <p class="text-sm font-black tracking-tighter">{{ car.pricePerHalfMonth ? formatPrice(car.pricePerHalfMonth) : 'N/A' }}</p>
                   </div>
                   <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p class="text-[9px] text-gray-400 font-black uppercase mb-1">Cọc 30 Ngày</p>
                      <p class="text-sm font-black tracking-tighter">{{ car.pricePerMonth ? formatPrice(car.pricePerMonth) : 'N/A' }}</p>
                   </div>
                </div>
                <div class="bg-orange-600/20 p-5 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                   <div class="flex items-center space-x-3">
                      <MapPinIcon class="w-4 h-4 text-orange-400" />
                      <span class="text-[10px] font-black uppercase tracking-widest text-orange-200">Giao xe ngoại tỉnh</span>
                   </div>
                   <span class="text-sm font-black text-orange-400">{{ formatPrice(car.outOfProvinceFee || 0) }}</span>
                </div>
             </div>
          </div>

          <!-- Technical Specs -->
          <div class="bg-gray-900 text-white p-8 rounded-[32px] shadow-2xl overflow-hidden relative group">
             <!-- Abstract background elements -->
             <div class="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                <div class="w-32 h-32 bg-primary-500 rounded-full"></div>
             </div>
             
             <h3 class="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 italic relative z-10">Thông số kỹ thuật</h3>
             <div class="space-y-6 relative z-10">
                <div class="flex justify-between items-center border-b border-white/5 pb-4">
                   <span class="text-xs text-gray-400 font-bold uppercase">Hộp số</span>
                   <span class="font-black tracking-widest uppercase text-xs">{{ car.transmission === 'automatic' ? 'Tự động' : 'Số sàn' }}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-4">
                   <span class="text-xs text-gray-400 font-bold uppercase">Nhiên liệu</span>
                   <span class="font-black tracking-widest uppercase text-xs">{{ car.fuel }}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-4">
                   <span class="text-xs text-gray-400 font-bold uppercase">Năm SX</span>
                   <span class="font-black tracking-widest uppercase text-xs">{{ car.year }}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-4">
                   <span class="text-xs text-gray-400 font-bold uppercase">Số ghế</span>
                   <span class="font-black tracking-widest uppercase text-xs">{{ car.seats }} chỗ</span>
                </div>
                <div class="flex justify-between items-center">
                   <span class="text-xs text-gray-400 font-bold uppercase">Số KM đã đi</span>
                   <span class="font-black tracking-widest uppercase text-xs text-primary-400">{{ car.mileage?.toLocaleString() }} KM</span>
                </div>
             </div>
             
             <div class="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10">
                <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Vị trí hiện tại</h4>
                <p class="text-xs font-bold text-gray-300">{{ car.location?.address || car.addressId?.fullAddress || '' }}</p>
                <p class="text-[11px] text-gray-400 mt-1">{{ car.location?.district || car.addressId?.ward?.name || '' }}, {{ car.location?.city || car.addressId?.province?.name || '' }}</p>
             </div>
          </div>
          
          <!-- Features -->
          <div class="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
             <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1 italic">Tiện nghi</h3>
             <div class="flex flex-wrap gap-2">
                <span 
                  v-for="feature in car.features" 
                  :key="feature"
                  class="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-tight border border-gray-100"
                >
                  {{ feature }}
                </span>
             </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <CarContractModal 
      :show="showContractModal" 
      :car="car" 
      :readOnly="true"
      @close="showContractModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { 
  ArrowLeftIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  StarIcon,
  CheckIcon,
  ShieldCheckIcon,
  WrenchIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'
import CarContractModal from '@/components/admin/CarContractModal.vue'
import { getUserAvatarUrl } from '@/utils/avatar'

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const car = ref(null)
const bookings = ref([])
const showContractModal = ref(false)
const activeImageIndex = ref(0)
const stats = reactive({
  totalRevenue: 0,
  totalCommission: 0,
  totalProfit: 0,
  totalTrips: 0,
  activeBookings: 0
})

const availableStatuses = [
  { value: 'approved', label: 'Sẵn sàng', icon: ShieldCheckIcon, color: 'bg-green-100 text-green-600' },
  { value: 'maintenance', label: 'Bảo trì', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-600' },
  { value: 'repair', label: 'Sửa chữa', icon: WrenchIcon, color: 'bg-red-100 text-red-600' }
]

const fetchData = async () => {
  try {
    loading.value = true
    const carId = route.params.id
    
    // Fetch car details and bookings in parallel
    const [carRes, bookingRes] = await Promise.all([
      api.get(`/cars/${carId}`),
      api.get('/bookings/my/bookings', { params: { carId } })
    ])
    
    car.value = carRes.data.car || carRes.data
    bookings.value = bookingRes.data.bookings
    
    // Calculate stats
    const validBookings = bookings.value.filter(b => b.status === 'completed' || b.status === 'confirmed' || b.status === 'active')
    
    stats.totalRevenue = validBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
    stats.totalCommission = validBookings.reduce((sum, b) => sum + calculateCommission(b), 0)
    stats.totalProfit = validBookings.reduce((sum, b) => sum + calculateNetProfit(b), 0)
    
    stats.totalTrips = bookings.value.filter(b => b.status === 'completed').length
    stats.activeBookings = bookings.value.filter(b => b.status === 'confirmed' || b.status === 'active').length
    
  } catch (error) {
    console.error('Fetch data error:', error)
    toast.error('Không thể tải thông tin xe')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

const updateStatus = async (newStatus) => {
  if (car.value.status === newStatus) return
  
  try {
    await api.put(`/cars/${car.value._id}`, { status: newStatus })
    car.value.status = newStatus
    toast.success(`Đã đổi trạng thái sang: ${getStatusLabel(newStatus)}`)
  } catch (error) {
    toast.error('Không thể cập nhật trạng thái')
  }
}

const viewContract = () => {
  showContractModal.value = true
}

const getStatusLabel = (status) => {
  const labels = {
    approved: 'Sẵn sàng',
    pending: 'Chờ duyệt',
    rejected: 'Bị từ chối',
    inactive: 'Không hoạt động',
    maintenance: 'Bảo trì',
    repair: 'Sửa chữa'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    approved: 'bg-green-100 text-green-700 border border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border border-red-200',
    maintenance: 'bg-orange-100 text-orange-700 border border-orange-200',
    repair: 'bg-red-50 text-red-600 border border-red-100'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getBookingStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getBookingStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    confirmed: 'bg-blue-50 text-blue-600 border border-blue-100',
    active: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    completed: 'bg-green-50 text-green-600 border border-green-100',
    cancelled: 'bg-red-50 text-red-500 border border-red-50'
  }
  return classes[status] || 'bg-gray-50 text-gray-500 border border-gray-100'
}

const getSettlementStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ quyết toán',
    settled: 'Đã thanh toán',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getSettlementStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-50 text-yellow-600',
    settled: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500'
  }
  return classes[status] || 'bg-gray-50 text-gray-500'
}

const calculateCommission = (booking) => {
  if (booking.pricing?.commission) return booking.pricing.commission
  const percentage = car.value?.commissionPercentage || 15
  return (booking.pricing?.totalAmount || 0) * (percentage / 100)
}

const calculateNetProfit = (booking) => {
  if (booking.pricing?.netAmount) return booking.pricing.netAmount
  return (booking.pricing?.totalAmount || 0) - calculateCommission(booking)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const getRentalDuration = (booking) => {
  const start = new Date(booking.startDate)
  const end = new Date(booking.endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} ngày`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.025em; }
.tracking-tighter { letter-spacing: -0.05em; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
