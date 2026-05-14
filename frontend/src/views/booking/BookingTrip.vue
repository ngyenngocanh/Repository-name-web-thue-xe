<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button & Breadcrumb -->
      <div class="flex items-center space-x-4 mb-6">
        <button 
          @click="router.back()" 
          class="flex items-center text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors group"
        >
          <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </div>
          Quay lại
        </button>
        <div class="h-4 w-px bg-gray-200"></div>
        <span class="text-xs font-black uppercase tracking-widest text-gray-400">Đặt dịch vụ theo chuyến</span>
      </div>

      <!-- Car Info Summary -->
      <div v-if="car" class="bg-white rounded-[2.5rem] p-8 mb-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div class="relative group">
          <img 
            :src="car.images?.[0]?.url || '/logo.png'" 
            class="w-40 h-40 rounded-[2rem] object-cover border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
          >
          <div v-if="car.owner?.isVerified" class="absolute -top-3 -right-3 bg-purple-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">Dịch vụ đang chọn</p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">
            {{ car.brand }} {{ car.model }}
          </h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div class="flex items-center text-sm font-bold text-gray-500">
               <svg class="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
               {{ car.location?.city }}
            </div>
            <div class="px-3 py-1 bg-purple-50 rounded-full text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100">
              Theo chuyến
            </div>
          </div>
        </div>

        <div class="text-right">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá cước</p>
          <div class="flex flex-col items-end">
             <span class="text-2xl font-black text-gray-900">
               {{ formatPrice(displayPricePerKm) }}
             </span>
             <span class="text-[10px] font-bold text-gray-400 uppercase">/ KM</span>
          </div>
        </div>
      </div>

      <!-- Booking Form -->
      <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <h2 class="text-2xl font-black text-gray-900 mb-8">Thông tin đặt dịch vụ</h2>

        <form @submit.prevent="submitBooking" class="space-y-8">
          <!-- Trip Type Selection -->
          <div>
            <label class="text-sm font-black text-gray-900 mb-4 block uppercase tracking-widest text-[11px]">Dịch vụ lộ trình</label>
            <div class="flex items-center space-x-2 bg-purple-100/50 p-1.5 rounded-2xl border border-purple-50">
              <button 
                v-show="bookingForm.tripType === 'short' || !isTypeLocked"
                type="button" 
                @click="bookingForm.tripType = 'short'; isTypeLocked = true" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" 
                :class="bookingForm.tripType === 'short' ? 'bg-white text-purple-700 shadow-sm border border-purple-50' : 'text-purple-400 hover:text-purple-600'"
              >
                Quãng ngắn
              </button>
              <button 
                v-show="bookingForm.tripType === 'long' || !isTypeLocked"
                type="button" 
                @click="bookingForm.tripType = 'long'; isTypeLocked = true" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" 
                :class="bookingForm.tripType === 'long' ? 'bg-white text-purple-700 shadow-sm border border-purple-50' : 'text-purple-400 hover:text-purple-600'"
              >
                Đường dài
              </button>
              <button 
                v-show="bookingForm.tripType === 'business' || !isTypeLocked"
                type="button" 
                @click="bookingForm.tripType = 'business'; isTypeLocked = true" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" 
                :class="bookingForm.tripType === 'business' ? 'bg-white text-purple-700 shadow-sm border border-purple-50' : 'text-purple-400 hover:text-purple-600'"
              >
                Công tác
              </button>
              <button v-if="isTypeLocked" @click="isTypeLocked = false" type="button" class="px-4 py-3 text-[9px] font-black text-purple-500 uppercase hover:text-purple-700">
                Thay đổi
              </button>
            </div>
            <!-- Pricing Info Row -->
            <div class="mt-4 flex flex-wrap gap-3">
              <div class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center shadow-sm">
                <span class="text-[10px] font-black text-gray-400 uppercase mr-2">Giá cước:</span>
                <span class="text-xs font-black text-purple-700">{{ formatPrice(displayPricePerKm) }}/km</span>
              </div>
              <div class="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center shadow-sm">
                 <span class="text-[10px] font-black text-indigo-400 uppercase mr-2">Tài xế:</span>
                 <span class="text-xs font-black text-indigo-700">{{ formatPrice(displayDriverFee) }}/ngày</span>
              </div>
              <div class="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg flex items-center shadow-sm">
                <span class="text-[10px] font-black text-orange-400 uppercase mr-2">Ngoài giờ:</span>
                <span class="text-xs font-black text-orange-700">{{ formatPrice(displayOverTimeFee) }}/giờ</span>
              </div>
            </div>
          </div>

          <!-- Date/Time Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Ngày đi</label>
                  <input v-model="bookingForm.startDate" type="date" class="input input-bordered w-full rounded-xl" required>
               </div>
               <div>
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Giờ đón</label>
                  <input v-model="bookingForm.pickupTime" type="time" class="input input-bordered w-full rounded-xl" required>
               </div>
            </div>
            
            <div v-if="bookingForm.tripType === 'business'" class="grid grid-cols-2 gap-4">
               <div>
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Ngày về</label>
                  <input v-model="bookingForm.endDate" type="date" class="input input-bordered w-full rounded-xl" :min="bookingForm.startDate" required>
               </div>
               <div>
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Giờ về trả xe</label>
                  <input v-model="bookingForm.returnTime" type="time" class="input input-bordered w-full rounded-xl" required>
               </div>
            </div>
          </div>

          <!-- Route Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Điểm khởi hành (A)</label>
              <input v-model="bookingForm.startLocation" type="text" placeholder="VD: TP. Hồ Chí Minh" class="input input-bordered w-full rounded-xl" required>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Điểm đến (B)</label>
              <input v-model="bookingForm.endLocation" type="text" placeholder="VD: Vũng Tàu" class="input input-bordered w-full rounded-xl" required>
            </div>
          </div>

          <!-- MAP AND DISTANCE CALCULATION -->
          <div class="space-y-4">
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-gray-900 block">Lộ trình và khoảng cách</label>
                <button 
                  type="button"
                  @click="calculateRoute"
                  :disabled="isCalculating"
                  class="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-all disabled:opacity-50"
                >
                  <svg v-if="isCalculating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isCalculating ? 'Đang tính toán...' : 'Tự động tính km' }}
                </button>
             </div>
             
             <!-- Map Container -->
             <div id="map-container" class="relative group">
                <div id="booking-map" class="h-64 md:h-80 w-full rounded-2xl border-4 border-white shadow-lg overflow-hidden z-0"></div>
                <div v-if="!mapInitialized" class="absolute inset-0 bg-gray-100/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                    <p class="text-sm font-bold text-gray-500 italic">Bản đồ đang khởi tạo...</p>
                </div>
             </div>

             <div class="mt-4">
                <label class="text-sm font-bold text-gray-900 mb-2 block">Quãng đường dự kiến (km)</label>
                <div class="relative">
                  <input 
                    v-model="bookingForm.distance" 
                    type="number" 
                    min="1"
                    placeholder="VD: 150"
                    class="input input-bordered w-full font-black text-purple-600 bg-purple-50/50 rounded-xl" 
                    required
                  >
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-purple-600 uppercase">KM</div>
                </div>
                <p class="text-[10px] text-gray-400 mt-2 italic">* Số km được tính dựa trên đường ô tô ngắn nhất. Giá sẽ tự động cập nhật theo số KM này.</p>
             </div>
          </div>

          <!-- Passenger Information (Read-only) -->
          <div class="border-t pt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[11px] flex items-center">
              <span class="w-1.5 h-4 bg-purple-600 rounded-full mr-3"></span>
              Thông tin người đặt (Bạn)
            </h3>

            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Họ tên</p>
                <p class="font-bold text-gray-900">{{ bookingForm.passengerName }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                <p class="font-bold text-gray-900">{{ bookingForm.passengerPhone }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p class="font-bold text-gray-900">{{ bookingForm.passengerEmail }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số CMND/CCCD</p>
                <p class="font-bold text-gray-900">{{ bookingForm.passengerIdCard }}</p>
              </div>
            </div>

            <!-- Profile Warning -->
            <div v-if="!isProfileComplete" class="mt-6 p-6 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center text-center">
              <div class="bg-purple-100 p-4 rounded-full mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 class="text-lg font-black text-purple-900 uppercase tracking-wider mb-2">Hồ sơ chưa hoàn thiện</h3>
              <p class="text-sm text-purple-700 max-w-md mb-6">
                Bạn cần cập nhật đầy đủ thông tin cá nhân (CCCD) để sử dụng dịch vụ thuê xe.
              </p>
              <button 
                type="button"
                @click="goToProfile"
                class="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg shadow-purple-200 uppercase tracking-widest transition-all text-xs"
              >
                Cập nhật ngay
              </button>
            </div>
          </div>

          <!-- Insurance & Options -->
          <div class="border-t pt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Bảo hiểm & Tùy chọn</h3>
            <div class="space-y-4">
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.fullInsurance" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Bảo hiểm toàn diện</p>
                  <p class="text-xs text-gray-500">Bảo vệ lên đến 100 triệu VNĐ</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.gpsRequired" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Thiết bị GPS</p>
                  <p class="text-xs text-gray-500">Định vị trong suốt chuyến đi</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.fuelFull" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Xe giao với bình xăng đầy</p>
                  <p class="text-xs text-gray-500">Tiết kiệm chi phí đổ xăng</p>
                </div>
              </label>
            </div>
          </div>



          <!-- Additional Info -->
          <div class="border-t pt-8">
            <label class="text-sm font-bold text-gray-900 mb-2 block">Lưu ý & Yêu cầu thêm</label>
            <textarea v-model="bookingForm.notes" class="textarea textarea-bordered w-full rounded-2xl" rows="4" placeholder="Lịch trình chi tiết, yêu cầu đặc biệt, chú ý về hành trình..."></textarea>
          </div>

          <!-- Booking Summary -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-black text-gray-900 mb-8 flex items-center">
               <span class="w-1.5 h-6 bg-purple-600 rounded-full mr-3"></span>
               Chi phí ước tính
            </h3>
            
            <div class="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 shadow-inner">
               <div class="space-y-4">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Cước phí di chuyển (Dự kiến {{ bookingForm.distance }}km - Giá {{ formatPrice(displayPricePerKm) }}/km)</span>
                    <span class="font-black text-gray-900">{{ formatPrice(displayPricePerKm * bookingForm.distance) }}</span>
                  </div>

                  <div v-if="bookingForm.tripType === 'business'" class="flex justify-between items-center text-sm">
                    <span class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Phụ phí tài xế lưu đêm ({{ numDays }} ngày)</span>
                    <span class="font-black text-gray-900">{{ formatPrice(displayDriverFee * numDays) }}</span>
                  </div>
                  
                  <div v-if="deliveryFee > 0" class="flex justify-between items-center text-sm bg-blue-50 p-2 rounded-lg">
                    <div class="flex flex-col">
                      <span class="text-blue-700 font-medium">Phí giao xe ({{ deliveryDistance }} km)</span>
                      <span class="text-xs text-blue-500">Từ vị trí xe → điểm khởi hành</span>
                    </div>
                    <span class="font-bold text-blue-700">{{ formatPrice(deliveryFee) }}</span>
                  </div>

                  <div v-if="optionsFee > 0" class="flex justify-between items-center text-sm">
                    <span class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Tùy chọn bổ sung</span>
                    <span class="font-black text-gray-900">{{ formatPrice(optionsFee) }}</span>
                  </div>

                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Phí sàn dịch vụ</span>
                    <span class="font-black text-gray-900">{{ formatPrice(serviceFee) }}</span>
                  </div>

                  <div class="pt-6 border-t border-gray-200 mt-6 flex justify-between items-center">
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng cộng hóa đơn</p>
                      <p class="text-3xl font-black text-purple-600 leading-none">{{ formatPrice(totalAmount) }}</p>
                    </div>
                    <div class="text-right">
                       <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Đặt cọc thanh toán (30%)</p>
                       <p class="text-xl font-black text-gray-900 leading-none">{{ formatPrice(deposit) }}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-8">
            <button 
              type="submit"
              :disabled="!isProfileComplete || loading"
              class="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-purple-200 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none flex items-center justify-center gap-3"
            >
              <svg v-if="!loading" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ loading ? 'Đang xử lý...' : 'Xác nhận đặt chuyến' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

const RATE_PER_KM = 1000 // 1,000 VND per km

const car = ref(null)
const locations = ref([])
const isTypeLocked = ref(true)
const loading = ref(false)

const bookingForm = ref({
  tripType: 'business',
  startDate: '',
  endDate: '',
  pickupTime: '08:00',
  returnTime: '18:00',
  startLocation: '',
  endLocation: '',
  distance: 0,
  direction: 'one-way',
  renterType: 'self',
  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',
  passengerIdCard: '',
  dateOfBirth: '',
  driverPreference: '',
  fullInsurance: false,
  gpsRequired: false,
  fuelFull: false,
  notes: '',
  paymentMethod: 'cash'
})

const isProfileComplete = computed(() => {
  const u = authStore.user
  if (!u) return false
  if (!u.fullName || !u.phone) return false
  const hasIdCard = !!(u.idCard?.number || (typeof u.idCard === 'string' && u.idCard.length > 5))
  return hasIdCard
})

const goToProfile = () => {
  localStorage.setItem('redirectAfterProfileUpdate', route.fullPath)
  router.push('/profile')
}

const isCalculating = ref(false)
const mapInitialized = ref(false)
let map = null
let routeLine = null
let startMarker = null
let endMarker = null

// Delivery fee calculation for trip service
const deliveryData = ref({
  pickupDistance: 0,
  loading: false
})

// Geocode address to coordinates
const geocode = async (address) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: `${address}, Việt Nam`, format: 'json', limit: 1 }
    })
    if (res.data && res.data[0]) {
      return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) }
    }
    return null
  } catch (err) {
    console.error('[GEOCODE] Error:', err)
    return null
  }
}

// Calculate delivery distance from car to pickup location
const calculateDeliveryDistance = async () => {
  if (!car.value || !bookingForm.value.startLocation) {
    console.log('[DELIVERY] Skip - missing car or start location')
    return
  }
  
  deliveryData.value.loading = true
  
  try {
    // Build car address
    const carLocation = car.value.location?.city || car.value.addressId?.province?.name || ''
    const carDistrict = car.value.location?.district || car.value.addressId?.ward?.name || ''
    const carAddress = `${carDistrict}, ${carLocation}`
    
    const pickupAddress = bookingForm.value.startLocation
    
    console.log('[DELIVERY] Trip - Calculating from:', carAddress, 'to:', pickupAddress)
    
    // Geocode both locations
    const [carCoords, pickupCoords] = await Promise.all([
      geocode(carAddress),
      geocode(pickupAddress)
    ])
    
    if (!carCoords || !pickupCoords) {
      console.log('[DELIVERY] Geocoding failed, using estimate')
      deliveryData.value.pickupDistance = estimateDeliveryDistance()
      deliveryData.value.loading = false
      return
    }
    
    console.log('[DELIVERY] Car coords:', carCoords, 'Pickup coords:', pickupCoords)
    
    // Call OSRM for actual driving distance
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${carCoords.lon},${carCoords.lat};${pickupCoords.lon},${pickupCoords.lat}?overview=false`
    const res = await axios.get(osrmUrl)
    
    if (res.data?.routes?.[0]) {
      const distanceKm = Math.round(res.data.routes[0].distance / 1000)
      deliveryData.value.pickupDistance = distanceKm
      console.log('[DELIVERY] Trip - Actual distance:', distanceKm, 'km')
    } else {
      console.log('[DELIVERY] No route found, using estimate')
      deliveryData.value.pickupDistance = estimateDeliveryDistance()
    }
  } catch (err) {
    console.error('[DELIVERY] OSRM error:', err.message)
    deliveryData.value.pickupDistance = estimateDeliveryDistance()
  } finally {
    deliveryData.value.loading = false
  }
}

// Estimate delivery distance based on province comparison
const estimateDeliveryDistance = () => {
  if (!car.value) return 0
  const carCity = car.value.location?.city || car.value.addressId?.province?.name || ''
  const pickupCity = bookingForm.value.startLocation
  
  // Simple estimate: if same city, 10km; different city, 50km
  if (!carCity || !pickupCity) return 0
  
  const carCityNorm = carCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const pickupCityNorm = pickupCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  if (pickupCityNorm.includes(carCityNorm) || carCityNorm.includes(pickupCityNorm)) {
    return 10
  }
  return 50
}

const deliveryDistance = computed(() => deliveryData.value.pickupDistance || 0)
const deliveryFee = computed(() => Math.round(deliveryDistance.value * RATE_PER_KM))

// Watch for start location changes to recalculate delivery fee
watch(() => bookingForm.value.startLocation, (newLoc) => {
  if (newLoc && newLoc.length > 3) {
    console.log('[WATCH] Trip start location changed, calculating delivery...')
    setTimeout(() => calculateDeliveryDistance(), 500)
  }
})

const tripSettings = ref(null)
const fetchTripSettings = async () => {
  try {
    const res = await api.get('/trip-settings')
    tripSettings.value = res.data
  } catch (error) {
    console.error('Error fetching global settings:', error)
  }
}

const numDays = computed(() => {
  if (bookingForm.value.tripType !== 'business') return 1
  const start = new Date(bookingForm.value.startDate || new Date())
  const end = new Date(bookingForm.value.endDate || new Date())
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
  return diffDays
})

const currentTier = computed(() => {
  if (!tripSettings.value) return { pricePerKm: 1000, driverFeePerDay: 500000, overTimeFee: 100000 }
  return tripSettings.value.tiers[bookingForm.value.tripType] || tripSettings.value.tiers.short
})

const displayPricePerKm = computed(() => currentTier.value.pricePerKm)
const displayDriverFee = computed(() => currentTier.value.driverFeePerDay)
const displayOverTimeFee = computed(() => currentTier.value.overTimeFee)

const rentalFee = computed(() => {
  if (!car.value) return 0
  const kmsFee = displayPricePerKm.value * (bookingForm.value.distance || 0)
  
  let driverTotalFee = 0
  if (bookingForm.value.tripType === 'business') {
    driverTotalFee = displayDriverFee.value * numDays.value
  }
  return Math.round(kmsFee + driverTotalFee)
})

const optionsFee = computed(() => {
  let fee = 0
  if (bookingForm.value.fullInsurance) fee += 500000
  if (bookingForm.value.gpsRequired) fee += 100000
  if (bookingForm.value.fuelFull) fee += 200000
  return fee
})

const serviceFee = computed(() => 30000)
const totalAmount = computed(() => rentalFee.value + optionsFee.value + serviceFee.value + deliveryFee.value)
const deposit = computed(() => Math.round(totalAmount.value * 0.3))

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

watch(() => bookingForm.value.distance, (newDist) => {
  if (newDist > 100) {
    if (bookingForm.value.tripType !== 'business') {
      bookingForm.value.tripType = 'business'
      toast.info('Khoảng cách > 100km, hệ thống tự động chuyển sang lộ trình Công tác')
    }
    const hours = newDist / 60
    const daysToAdd = Math.ceil(hours / 10)
    const date = new Date(bookingForm.value.startDate || new Date())
    date.setDate(date.getDate() + daysToAdd)
    bookingForm.value.endDate = date.toISOString().split('T')[0]
  } else if (newDist > 10) {
    if (bookingForm.value.tripType === 'short') {
      bookingForm.value.tripType = 'long'
      toast.info('Khoảng cách > 10km, hệ thống tự động chuyển sang lộ trình Đường dài')
    }
  } else {
    if (bookingForm.value.tripType !== 'short') {
      bookingForm.value.tripType = 'short'
      toast.info('Khoảng cách < 10km, hệ thống tự động chuyển sang lộ trình Quãng ngắn')
    }
  }
})

const fillUserInfo = () => {
  if (authStore.user) {
    bookingForm.value.passengerName = authStore.user.fullName || authStore.user.name || ''
    bookingForm.value.passengerPhone = authStore.user.phone || ''
    bookingForm.value.passengerEmail = authStore.user.email || ''
    bookingForm.value.passengerIdCard = authStore.user.idCard?.number || ''
    bookingForm.value.dateOfBirth = authStore.user.dateOfBirth ? authStore.user.dateOfBirth.split('T')[0] : ''
  }
}

watch(() => authStore.user, (u) => {
  if (u) fillUserInfo()
}, { immediate: true })

const fetchCar = async () => {
  try {
    const response = await api.get(`/cars/${route.params.id}`)
    car.value = response.data.car || response.data
    if (route.query.startDate) bookingForm.value.startDate = route.query.startDate
    if (route.query.pickupTime) bookingForm.value.pickupTime = route.query.pickupTime
    if (route.query.returnTime) bookingForm.value.returnTime = route.query.returnTime
    if (route.query.startLocation) bookingForm.value.startLocation = route.query.startLocation
    if (route.query.endLocation) bookingForm.value.endLocation = route.query.endLocation
    if (route.query.distance) bookingForm.value.distance = Number(route.query.distance)
    if (route.query.routeType) bookingForm.value.tripType = route.query.routeType
    if (bookingForm.value.startLocation && bookingForm.value.endLocation) {
      setTimeout(calculateRoute, 1000)
    }
  } catch (error) {
    toast.error('Không tìm thấy xe')
    router.back()
  }
}

const submitBooking = async () => {
  try {
    loading.value = true
    const formData = new FormData()
    formData.append('car', route.params.id)
    formData.append('rentalType', 'trip')
    formData.append('tripType', bookingForm.value.tripType)
    formData.append('startDate', bookingForm.value.startDate)
    formData.append('endDate', bookingForm.value.endDate || bookingForm.value.startDate)
    formData.append('pickupTime', bookingForm.value.pickupTime)
    formData.append('returnTime', bookingForm.value.returnTime)
    formData.append('pickupLocation', bookingForm.value.startLocation)
    formData.append('returnLocation', bookingForm.value.endLocation)
    formData.append('distance', String(bookingForm.value.distance || 0))
    formData.append('extraFee', "0")
    
    const dFee = displayPricePerKm.value * bookingForm.value.distance
    const dfFee = bookingForm.value.tripType === 'business' ? displayDriverFee.value * (numDays.value || 1) : 0
    formData.append('distanceFee', String(dFee))
    formData.append('driverTripFee', String(dfFee))
    formData.append('renterType', 'self')
    formData.append('passengerName', bookingForm.value.passengerName)
    formData.append('passengerPhone', bookingForm.value.passengerPhone)
    formData.append('passengerEmail', bookingForm.value.passengerEmail)
    formData.append('passengerIdCard', bookingForm.value.passengerIdCard)
    formData.append('fullInsurance', bookingForm.value.fullInsurance)
    formData.append('gpsRequired', bookingForm.value.gpsRequired)
    formData.append('notes', bookingForm.value.notes)
    formData.append('payment', JSON.stringify({ method: bookingForm.value.paymentMethod }))
    formData.append('trip', JSON.stringify({
      tripType: bookingForm.value.tripType,
      startLocation: bookingForm.value.startLocation,
      endLocation: bookingForm.value.endLocation,
      distance: bookingForm.value.distance,
      totalTripPrice: rentalFee.value
    }))
    formData.append('pricing', JSON.stringify({
      totalAmount: totalAmount.value,
      deposit: deposit.value,
      serviceFee: serviceFee.value,
      rentalFee: rentalFee.value,
      extraFee: 0,
      optionsFee: optionsFee.value,
      deliveryDistance: deliveryDistance.value,
      deliveryFee: deliveryFee.value,
      deliveryRatePerKm: RATE_PER_KM,
      distance: bookingForm.value.distance,
      pricePerKm: displayPricePerKm.value,
      multiplier: 1,
      distanceFee: dFee,
      driverTripFee: dfFee,
      tripType: bookingForm.value.tripType
    }))

    const response = await api.post('/bookings', formData)
    if (response.data.success || response.data.booking) {
      const bookingId = response.data.booking._id || response.data.booking.id;
      toast.success('Đặt chuyến thành công!')
      // Chuyển sang trang thanh toán chuyên nghiệp
      router.push(`/payment/checkout/${bookingId}`)
    }
  } catch (error) {
    console.error('Submit error:', error)
    const msg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : 'Lỗi khi đặt chuyến')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

const initMap = () => {
  if (typeof window.L === 'undefined' || map) return
  map = window.L.map('booking-map').setView([16.0544, 108.2022], 6)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
  mapInitialized.value = true
}

const calculateRoute = async () => {
  if (!bookingForm.value.startLocation || !bookingForm.value.endLocation) return
  isCalculating.value = true
  try {
    const start = await geocode(bookingForm.value.startLocation)
    const end = await geocode(bookingForm.value.endLocation)
    if (!start || !end) {
      toast.error('Không tìm thấy vị trí địa điểm trên bản đồ')
      return
    }
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
    const res = await axios.get(osrmUrl)
    if (res.data && res.data.routes && res.data.routes[0]) {
      const route = res.data.routes[0]
      const distanceKm = Math.round(route.distance / 1000)
      bookingForm.value.distance = distanceKm
      if (routeLine) map.removeLayer(routeLine)
      if (startMarker) map.removeLayer(startMarker)
      if (endMarker) map.removeLayer(endMarker)
      startMarker = window.L.marker([start.lat, start.lon]).addTo(map).bindPopup('Điểm đi').openPopup()
      endMarker = window.L.marker([end.lat, end.lon]).addTo(map).bindPopup('Điểm đến')
      routeLine = window.L.geoJSON(route.geometry, { style: { color: '#8b5cf6', weight: 5, opacity: 0.7 } }).addTo(map)
      map.fitBounds(routeLine.getBounds(), { padding: [30, 30] })
    }
  } catch (err) {
    toast.error('Lỗi khi tính toán quãng đường')
  } finally {
    isCalculating.value = false
  }
}

onMounted(() => {
  authStore.fetchUser().then(() => fillUserInfo())
  Promise.all([fetchCar(), fetchTripSettings()])
  
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setTimeout(initMap, 500)
    document.head.appendChild(script)
  } else {
    setTimeout(initMap, 500)
  }

  fetch('/data.json')
    .then(res => res.json())
    .then(data => {
      locations.value = data
    })
    .catch(err => console.error('Error loading locations:', err))
})
</script>
