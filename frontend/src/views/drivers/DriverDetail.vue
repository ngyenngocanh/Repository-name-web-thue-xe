<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="driver" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <!-- Breadcrumbs -->
      <nav class="flex mb-8 text-sm font-medium text-gray-400">
        <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link>
        <span class="mx-2">/</span>
        <router-link to="/drivers" class="hover:text-primary-600">Danh sách tài xế</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ driver.fullName }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content (Left Col) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Profile Card -->
          <div class="bg-white rounded-[2.5rem] shadow-ux-lg overflow-hidden border border-gray-100 group">
            <div class="h-56 bg-[#0f172a] relative overflow-hidden">
               <!-- Abstract Lux Pattern -->
               <div class="absolute inset-0 opacity-20">
                 <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 blur-3xl rounded-full"></div>
                 <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 blur-3xl rounded-full"></div>
               </div>
               
              <div class="absolute -bottom-16 left-10 p-2 bg-white rounded-full shadow-2xl z-10">
                <div class="relative">
                  <img 
                    :src="getUserAvatarUrl(driver._id, driver.avatar) || '/placeholder-avatar.svg'" 
                    :alt="driver.fullName"
                    class="w-36 h-36 rounded-full object-cover border-4 border-white shadow-inner group-hover:scale-105 transition-transform duration-700"
                    @error="$event.target.src = '/placeholder-avatar.svg'"
                  >
                  <div v-if="driver.isVerified" class="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="pt-24 px-10 pb-10">
              <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-3 mb-4">
                    <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                      {{ driver.fullName }}
                    </h1>
                  </div>
                  
                  <div class="flex flex-wrap gap-4 items-center mb-6">
                    <span 
                      class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
                      :class="getStatusClass(driver.driverInfo?.driverStatus)"
                    >
                      {{ getStatusLabel(driver.driverInfo?.driverStatus) }}
                    </span>
                    <div class="flex items-center text-gray-900 font-black text-xs uppercase tracking-widest">
                      <svg class="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ driver.driverInfo?.operatingCity || 'TP. Hồ Chí Minh' }}
                    </div>
                  </div>
                  
                  <div class="relative p-6 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-700 font-medium text-lg leading-relaxed shadow-inner">
                    <svg class="absolute -top-3 -left-3 w-8 h-8 text-primary-100 fill-current opacity-50" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V21H14.017ZM6.017 21L6.017 18C6.017 16.8954 6.91241 16 8.017 16H11.017C11.5693 16 12.017 15.5523 12.017 15V9C12.017 8.44772 11.5693 8 11.017 8H7.01701C6.46473 8 6.017 8.44772 6.017 9V11C6.017 11.5523 5.56928 12 5.017 12H4.017V21H6.017Z"/></svg>
                    "{{ driver.driverInfo?.driverExperienceDescription || 'Tôi là tài xế chuyên nghiệp với kinh nghiệm lái xe an toàn.' }}"
                  </div>
                </div>
                
                <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-ux min-w-[140px] text-center">
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Chỉ số uy tín</div>
                  <div class="flex items-center justify-center gap-2 mb-1">
                    <span class="text-4xl font-black text-gray-900 tracking-tighter">{{ driver.rating?.average?.toFixed(1) || '5.0' }}</span>
                    <span class="text-yellow-400 text-3xl">★</span>
                  </div>
                  <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{{ reviews.length || 0 }} Đánh giá</p>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-3 gap-6 mt-10 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div class="text-center">
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Kinh nghiệm</p>
                  <p class="font-black text-gray-900 text-lg">{{ driver.driverInfo?.experience || '5+' }} năm</p>
                </div>
                <div class="text-center border-x border-gray-200">
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Số chuyến</p>
                  <p class="font-black text-gray-900 text-lg">{{ (driver.totalTrips?.asOwner || 0) + (driver.totalTrips?.asRenter || 0) }}+</p>
                </div>
                <div class="text-center">
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Hạng bằng</p>
                  <p class="font-black text-indigo-600 text-lg">{{ driver.driverInfo?.vehicleType || 'B2' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-primary-600 rounded-full mr-3"></span>
              Thông tin chi tiết
            </h2>
            <div class="prose prose-primary max-w-none text-gray-600">
              <p>{{ driver.driverInfo?.driverExperienceDescription || 'Thông tin chi tiết đang được cập nhật.' }}</p>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-2xl font-black text-gray-900 flex items-center">
                <span class="w-2 h-8 bg-yellow-400 rounded-full mr-3"></span>
                Đánh giá từ khách hàng
              </h2>
              <div class="text-3xl font-black text-gray-900">
                {{ driver.rating?.average?.toFixed(1) || '5.0' }} <span class="text-yellow-400">★</span>
              </div>
            </div>

            <div v-if="reviews.length > 0" class="space-y-6">
              <div v-for="review in reviews" :key="review._id" class="p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center">
                    <img :src="getUserAvatarUrl(review.reviewer?._id, review.reviewer?.avatar) || '/placeholder-avatar.svg'" class="w-10 h-10 rounded-full object-cover mr-3 border-2 border-white shadow-sm" @error="$event.target.src = '/placeholder-avatar.svg'">
                    <div>
                      <h4 class="font-bold text-gray-900">{{ review.reviewer?.fullName }}</h4>
                      <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest">{{ formatDate(review.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex text-yellow-400 text-xs">
                    <span v-for="i in 5" :key="i">{{ i <= review.rating ? '★' : '☆' }}</span>
                  </div>
                </div>
                <p class="text-gray-600 text-sm italic">"{{ review.comment }}"</p>
                <div v-if="review.car" class="mt-3 text-[10px] font-bold text-primary-600 bg-primary-50 inline-block px-3 py-1 rounded-full uppercase tracking-tighter">
                  Thuê cùng xe: {{ review.car.brand }} {{ review.car.model }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-10 text-gray-400 italic">
              Tài xế hiện chưa có đánh giá nào.
            </div>
          </div>

          <!-- Driver Commitment -->
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-10 text-white relative overflow-hidden">
            <div class="relative z-10">
              <h2 class="text-2xl font-black mb-6">Cam kết của tài xế</h2>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li v-for="commit in commitments" :key="commit" class="flex items-center space-x-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div class="bg-green-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span class="font-medium">{{ commit }}</span>
                </li>
              </ul>
            </div>
            <svg class="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
        </div>

         <!-- Sidebar (Right Col) -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- Booking Card (Lux Glass Variant) -->
            <div class="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-ux-lg animate-fade-in">
              <!-- Rental Mode Switch -->
              <div class="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
                <button 
                  @click="rentalMode = 'daily'"
                  class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  :class="rentalMode === 'daily' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-white'"
                >Theo ngày</button>
                <button 
                  @click="rentalMode = 'hourly'"
                  class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  :class="rentalMode === 'hourly' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-white'"
                >Theo giờ</button>
              </div>

              <div class="mb-8">
                <p class="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mb-3">
                  Cẩm nang bảng giá
                </p>
                <div class="flex items-baseline space-x-2">
                  <span class="text-4xl font-black text-white tracking-tighter">
                    {{ rentalMode === 'daily' ? formatPrice(driver.driverInfo?.driverRatePerDay || 500000) : formatPrice(driver.driverInfo?.driverRatePerHour || 80000) }}
                  </span>
                  <span class="text-gray-400 font-black text-xs uppercase tracking-widest">/ {{ rentalMode === 'daily' ? 'ngày' : 'giờ' }}</span>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <div class="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary-500/50 transition-colors">
                  <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">{{ rentalMode === 'daily' ? 'Thời gian thuê' : 'Ngày thuê' }}</label>
                  <div class="flex items-center justify-between" v-if="rentalMode === 'daily'">
                    <input v-model="startDate" type="date" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 [color-scheme:dark] w-full">
                    <span class="text-gray-600 mx-2">→</span>
                    <input v-model="endDate" type="date" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 [color-scheme:dark] w-full">
                  </div>
                  <input v-else v-model="startDate" type="date" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 [color-scheme:dark] w-full">
                </div>
                
                <div v-if="rentalMode === 'hourly'" class="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Số lượng giờ</label>
                  <div class="flex items-center justify-between">
                    <button @click="hoursCount > 1 && hoursCount--" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white hover:bg-white/10 transition-colors">-</button>
                    <span class="text-xl font-black text-white">{{ hoursCount }} Giờ</span>
                    <button @click="hoursCount++" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white hover:bg-white/10 transition-colors">+</button>
                  </div>
                </div>

                <div class="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary-500/50 transition-colors">
                  <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Địa điểm đón quý khách</label>
                  <input v-model="pickupLocation" type="text" placeholder="Thành phố, Quận, Phường..." class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 w-full placeholder-gray-600">
                </div>

                <div class="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary-500/50 transition-colors">
                  <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Loại hình di chuyển</label>
                  <select v-model="tripType" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 w-full appearance-none outline-none cursor-pointer [color-scheme:dark]">
                    <option value="" disabled class="bg-[#0f172a]">Chọn loại chuyến đi...</option>
                    <option value="personal" class="bg-[#0f172a]">Cá nhân (Nội thành)</option>
                    <option value="business" class="bg-[#0f172a]">Công tác (Liên tỉnh)</option>
                    <option value="tourism" class="bg-[#0f172a]">Du lịch (Dài ngày)</option>
                    <option value="airport" class="bg-[#0f172a]">Đón tiễn Sân bay</option>
                  </select>
                </div>
              </div>

              <div class="pt-6 border-t border-white/10 space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium">Đơn giá thuê</span>
                  <span class="font-black text-white">{{ formatPrice(baseSidebarPrice) }}</span>
                </div>
                <div v-if="extraSidebarFee > 0" class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium">Phụ phí liên tỉnh</span>
                  <span class="font-black text-amber-500">+{{ formatPrice(extraSidebarFee) }}</span>
                </div>
                <div class="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                  <div class="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Tổng cộng dự kiến</div>
                  <span class="text-3xl font-black text-primary-500 tracking-tighter leading-none">{{ formatPrice(totalSidebarPrice) }}</span>
                </div>
              </div>

              <button @click="handleHiring" class="w-full mt-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-2xl shadow-primary-900/40 transition-all active-scale text-[10px] uppercase tracking-[0.3em]">
                TIẾP TỤC ĐẶT LỊCH
              </button>
            </div>
            
            <div class="p-8 bg-gray-900 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full"></div>
              <div class="relative z-10 flex items-start space-x-4">
                <div class="bg-primary-500/20 text-primary-400 p-3 rounded-2xl shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-black text-white text-sm uppercase tracking-wider mb-2">Bảo hiểm & An toàn</h4>
                  <p class="text-xs text-gray-400 leading-relaxed font-medium">Mọi chuyến đi đều được bảo hiểm trách nhiệm dân sự và hành khách tối đa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'

const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const driver = ref(null)
const reviews = ref([])
const rentalMode = ref('daily')
const hoursCount = ref(4)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])
const pickupLocation = ref('')
const tripType = ref('personal')

const baseSidebarPrice = computed(() => {
  if (!driver.value) return 0
  if (rentalMode.value === 'daily') {
    return driver.value.driverInfo?.driverRatePerDay || 500000
  }
  return (driver.value.driverInfo?.driverRatePerHour || 80000) * hoursCount.value
})

const extraSidebarFee = computed(() => {
  if (tripType.value === 'business' || tripType.value === 'tourism') return 300000
  return 0
})

const totalSidebarPrice = computed(() => baseSidebarPrice.value + extraSidebarFee.value)

const commitments = [
  'Đúng giờ và lịch sự',
  'Lái xe an toàn & điềm đạm',
  'Không hút thuốc trong xe',
  'Thành thạo đường sá',
  'Bảo mật thông tin khách hàng',
  'Hỗ trợ mang vác hành lý'
]

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusLabel = (status) => {
  const labels = {
    available: 'Sẵn sàng',
    busy: 'Đang bận',
    resting: 'Đang nghỉ'
  }
  return labels[status] || 'Sẵn sàng'
}

const getStatusClass = (status) => {
  const classes = {
    available: 'bg-green-100 text-green-600',
    busy: 'bg-red-100 text-red-600',
    resting: 'bg-yellow-100 text-yellow-600'
  }
  return classes[status] || 'bg-green-100 text-green-600'
}

const fetchDriver = async () => {
  try {
    loading.value = true
    const response = await api.get(`/users/${route.params.id}`)
    driver.value = response.data.user
    reviews.value = response.data.recentReviews || []
  } catch (error) {
    toast.error('Không tìm thấy thông tin tài xế')
    router.push('/drivers')
  } finally {
    loading.value = false
  }
}

const handleHiring = () => {
  router.push({
    path: `/drivers/${driver.value._id}/booking`,
    query: { 
      mode: rentalMode.value,
      hours: hoursCount.value,
      startDate: startDate.value,
      endDate: endDate.value,
      pickup: pickupLocation.value,
      tripType: tripType.value
    }
  })
}

const contactDriver = () => {
  toast.info('Tính năng nhắn tin đang được phát triển')
}

onMounted(async () => {
  fetchDriver()
  
  // Fill user info if available
  if (authStore.user) {
    const addr = authStore.user.address || authStore.user.addressId || {}
    const street = addr.street || ''
    const district = addr.ward?.name || addr.district || ''
    const city = addr.province?.name || addr.city || ''
    
    if (street) {
      pickupLocation.value = `${street}${district ? ', ' + district : ''}${city ? ', ' + city : ''}`
    }
  }
})
</script>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
