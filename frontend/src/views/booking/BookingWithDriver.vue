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
        <span class="text-xs font-black uppercase tracking-widest text-gray-400">Đặt dịch vụ kèm tài xế</span>
      </div>

      <!-- Car Info Summary -->
      <div v-if="car" class="bg-white rounded-[2.5rem] p-8 mb-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div class="relative group">
          <img 
            :src="car.images?.[0]?.url || '/logo.png'" 
            class="w-40 h-40 rounded-[2rem] object-cover border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
          >
          <div v-if="car.owner?.isVerified" class="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Dịch vụ đang chọn</p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">
            {{ car.brand }} {{ car.model }}
          </h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div class="flex items-center text-sm font-bold text-gray-500">
               <svg class="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
               {{ car.location?.city }}
            </div>
            <div class="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
              Kèm tài xế
            </div>
          </div>
        </div>

        <div class="text-right">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá cơ bản</p>
          <div class="flex flex-col items-end">
             <span class="text-2xl font-black text-gray-900">
               {{ formatPrice(bookingForm.mode === 'hourly' ? car.pricePerHourWithDriver : car.pricePerDayWithDriver) }}
             </span>
             <span class="text-[10px] font-bold text-gray-400 uppercase">/ {{ bookingForm.mode === 'daily' ? 'Ngày' : 'Giờ' }}</span>
          </div>
        </div>
      </div>

      <!-- Booking Form (Simplified) -->
      <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <h2 class="text-2xl font-black text-gray-900 mb-8">Thông tin đặt dịch vụ</h2>

        <form @submit.prevent="submitBooking" class="space-y-8">
          <!-- Mode Selection (Hide if pre-selected) -->
          <div v-if="!isModePreselected">
            <label class="text-sm font-bold text-gray-900 mb-4 block">Loại thuê</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="bookingForm.mode = 'daily'"
                :class="bookingForm.mode === 'daily' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'"
                class="p-4 border-2 rounded-2xl font-bold transition-all"
              >
                Theo ngày
              </button>
              <button
                type="button"
                @click="bookingForm.mode = 'hourly'"
                :class="bookingForm.mode === 'hourly' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'"
                class="p-4 border-2 rounded-2xl font-bold transition-all"
              >
                Theo giờ
              </button>
            </div>
          </div>

          <!-- Date/Time Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Ngày nhận xe</label>
              <input v-model="bookingForm.startDate" type="date" class="input input-bordered w-full" required>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">{{ bookingForm.mode === 'daily' ? 'Ngày trả' : 'Giờ nhận' }}</label>
              <input 
                v-model="bookingForm.endDate" 
                :type="bookingForm.mode === 'daily' ? 'date' : 'time'" 
                class="input input-bordered w-full" 
                required
              >
            </div>
          </div>

          <!-- Time Selection for Daily Mode -->
          <div v-if="bookingForm.mode === 'daily'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Giờ nhận xe</label>
              <input v-model="bookingForm.pickupTime" type="time" class="input input-bordered w-full" required>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Giờ trả xe</label>
              <input v-model="bookingForm.returnTime" type="time" class="input input-bordered w-full" required>
            </div>
          </div>

          <!-- Hours Selection for Hourly Mode -->
          <div v-if="bookingForm.mode === 'hourly'" class="mb-6">
            <label class="text-sm font-bold text-gray-900 mb-2 block">Số giờ thuê</label>
            <input 
              v-model="bookingForm.hours" 
              type="number" 
              min="1" 
              max="24" 
              class="input input-bordered w-full md:w-1/2" 
              placeholder="Nhập số giờ"
              required
            >
          </div>

          <!-- Pickup/Return Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Địa điểm nhận xe</label>
              <input
                v-model="bookingForm.pickupLocation.street"
                type="text"
                placeholder="Số nhà, tên đường"
                class="input input-bordered w-full mb-2"
                required
              >
              <div class="grid grid-cols-2 gap-2">
                <select
                  v-model="bookingForm.pickupLocation.city"
                  class="select select-bordered"
                  required
                >
                  <option value="">Chọn Tỉnh/TP</option>
                  <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                </select>
                <select
                  v-model="bookingForm.pickupLocation.district"
                  class="select select-bordered"
                  :disabled="!pickupFilteredWards.length"
                  required
                >
                  <option value="">Chọn Phường/Xã</option>
                  <option v-for="ward in pickupFilteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Địa điểm trả xe</label>
              <input
                v-model="bookingForm.returnLocation.street"
                type="text"
                placeholder="Số nhà, tên đường"
                class="input input-bordered w-full mb-2"
                required
              >
              <div class="grid grid-cols-2 gap-2">
                <select
                  v-model="bookingForm.returnLocation.city"
                  class="select select-bordered"
                  required
                >
                  <option value="">Chọn Tỉnh/TP</option>
                  <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                </select>
                <select
                  v-model="bookingForm.returnLocation.district"
                  class="select select-bordered"
                  :disabled="!returnFilteredWards.length"
                  required
                >
                  <option value="">Chọn Phường/Xã</option>
                  <option v-for="ward in returnFilteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Passenger & Contact Information -->
          <div class="border-t pt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[11px] flex items-center">
              <span class="w-1.5 h-4 bg-blue-600 rounded-full mr-3"></span>
              Thông tin liên hệ đặt chuyến
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

            <div class="mt-6">
               <label class="text-sm font-bold text-gray-900 mb-2 block">Yêu cầu tài xế (nếu có)</label>
               <select v-model="bookingForm.driverPreference" class="select select-bordered w-full md:w-1/2 rounded-xl">
                 <option value="">Không yêu cầu đặc biệt</option>
                 <option value="non-smoking">Không hút thuốc</option>
                 <option value="female">Tài xế nữ</option>
                 <option value="experienced">Tài xế giàu kinh nghiệm</option>
               </select>
            </div>

            <!-- Profile Warning -->
            <div v-if="!isProfileComplete" class="mt-10 p-8 bg-blue-50 rounded-[2.5rem] border-2 border-dashed border-blue-200 flex flex-col items-center text-center">
              <div class="bg-blue-100 p-4 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 class="text-lg font-black text-blue-900 uppercase tracking-wider mb-2">Hồ sơ chưa hoàn thiện</h3>
              <p class="text-sm text-blue-700 max-w-md mb-6">
                Bạn cần cập nhật đầy đủ thông tin cá nhân (CCCD) để sử dụng dịch vụ thuê xe kèm tài xế.
              </p>
              <button 
                type="button"
                @click="goToProfile"
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 uppercase tracking-widest transition-all text-xs"
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
                  <p class="text-xs text-gray-500">+500,000 VNĐ (Bao gồm chiều dài, nhỏ vết xước)</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.gpsRequired" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Thiết bị GPS</p>
                  <p class="text-xs text-gray-500">+100,000 VNĐ/ngày (Định vị trong suốt chuyến đi)</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.fuelFull" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Xe giao với bình xăng đầy</p>
                  <p class="text-xs text-gray-500">+200,000 VNĐ (Tiết kiệm chi phí xăng)</p>
                </div>
              </label>
            </div>
          </div>



          <!-- Additional Info -->
          <div class="border-t pt-8">
            <label class="text-sm font-bold text-gray-900 mb-2 block">Ghi chú thêm</label>
            <textarea v-model="bookingForm.notes" class="textarea textarea-bordered w-full" rows="4" placeholder="Yêu cầu đặc biệt về tài xế..."></textarea>
          </div>

          <!-- Booking Summary -->
          <div class="border-t pt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Tóm tắt đặt xe</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Giá thuê xe & tài xế ({{ bookingForm.mode === 'daily' ? rentalDays + ' ngày' : bookingForm.hours + ' giờ' }})</span>
                  <span class="font-bold text-gray-900">{{ formatPrice(rentalFee) }}</span>
                </div>
                <div v-if="deliveryDistance.pickup > 0" class="flex justify-between items-start text-sm bg-blue-50 p-3 rounded-lg">
                  <div class="flex flex-col gap-1">
                    <span class="text-blue-700 font-bold">Phí giao xe ({{ deliveryDistance.pickup }} km × 5,000đ/km)</span>
                    <span class="text-xs text-blue-600">
                      <span class="font-semibold">Từ:</span> {{ car?.location?.district || car?.addressId?.ward?.name }}, {{ car?.location?.city || car?.addressId?.province?.name }}
                    </span>
                    <span class="text-xs text-blue-600">
                      <span class="font-semibold">Đến:</span> {{ bookingForm.pickupLocation.district }}, {{ bookingForm.pickupLocation.city }}
                    </span>
                  </div>
                  <span class="font-bold text-blue-700 text-right min-w-[100px]">{{ formatPrice(pickupDeliveryFee) }}</span>
                </div>
                <div v-if="extraFee > 0" class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Phí di chuyển ngoại tỉnh</span>
                  <span class="font-bold text-gray-900">{{ formatPrice(extraFee) }}</span>
                </div>
                <div v-if="optionsFee > 0" class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Bảo hiểm & Tùy chọn</span>
                  <span class="font-bold text-gray-900">{{ formatPrice(optionsFee) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Phí dịch vụ hệ thống (5%)</span>
                  <span class="font-bold text-gray-900">{{ formatPrice(serviceFee) }}</span>
                </div>
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center text-lg mt-4 pt-4 border-t border-gray-100">
                    <span class="font-black text-gray-900">Tổng cộng</span>
                    <span class="font-black text-primary-600 text-2xl font-mono">{{ formatPrice(totalAmount) }}</span>
                  </div>
                </div>
                <div class="pt-2 flex justify-between items-center text-sm italic text-gray-400">
                  <span>Tiền cọc cần thanh toán (30%)</span>
                  <span>{{ formatPrice(deposit) }}</span>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Thông tin địa điểm</p>
                <p class="text-xs font-bold text-gray-800">
                  Đón: {{ bookingForm.pickupLocation.street }}, {{ bookingForm.pickupLocation.district }}, {{ bookingForm.pickupLocation.city }}
                </p>
                <p class="text-xs font-bold text-gray-800">
                  Trả: {{ bookingForm.returnLocation.street }}, {{ bookingForm.returnLocation.district }}, {{ bookingForm.returnLocation.city }}
                </p>
              </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!isProfileComplete || loading"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 uppercase tracking-widest transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
             {{ loading ? 'Đang xử lý...' : 'Đặt xe ngay' }}
          </button>
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
const loading = ref(false)

const bookingForm = ref({
  mode: route.query.mode || 'daily',
  startDate: route.query.startDate || '',
  endDate: route.query.endDate || '',
  pickupTime: route.query.pickupTime || '',
  returnTime: route.query.returnTime || '',
  hours: route.query.hours || '',
  pickupLocation: {
    street: '',
    city: '',
    district: ''
  },
  returnLocation: {
    street: '',
    city: '',
    district: ''
  },
  renterType: 'self',
  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',
  passengerIdCard: '',
  dateOfBirth: '',
  passengerCount: 1,
  driverPreference: '',
  fullInsurance: false,
  gpsRequired: false,
  fuelFull: false,
  babyCarSeat: false,
  paymentMethod: 'cash',
  notes: ''
})

const isProfileComplete = computed(() => {
  const u = authStore.user
  if (!u) return false
  
  // Basic info check
  if (!u.fullName || !u.phone) return false
  
  // ID Card check (accept string or object with number)
  const hasIdCard = !!(u.idCard?.number || (typeof u.idCard === 'string' && u.idCard.length > 5))
  
  return hasIdCard
})

// Delivery fee calculation state
const deliveryData = ref({
  pickupDistance: 0,
  loading: false
})

// Geocode address to coordinates using Nominatim
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

// Calculate actual driving distance using OSRM
const calculateDeliveryDistance = async () => {
  if (!car.value || !bookingForm.value.pickupLocation.city) {
    console.log('[DELIVERY] Skip - missing car or pickup location')
    return
  }
  
  deliveryData.value.loading = true
  
  try {
    // Build full address strings
    const carLocation = car.value.location?.city || car.value.addressId?.province?.name || ''
    const carDistrict = car.value.location?.district || car.value.addressId?.ward?.name || ''
    const carAddress = `${carDistrict}, ${carLocation}`
    
    const pickupAddress = `${bookingForm.value.pickupLocation.district}, ${bookingForm.value.pickupLocation.city}`
    
    console.log('[DELIVERY] WithDriver - Calculating from:', carAddress, 'to:', pickupAddress)
    
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
      console.log('[DELIVERY] WithDriver - Actual distance:', distanceKm, 'km')
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

// Estimate distance based on province/district when geocoding fails
const estimateDeliveryDistance = () => {
  if (!car.value || !locations.value.length) return 0
  
  const carCity = car.value.location?.city || car.value.addressId?.city || car.value.addressId?.province?.name || ''
  const carDist = car.value.location?.district || car.value.addressId?.district || car.value.addressId?.ward?.name || ''
  const carCode = getProvinceCode(carCity)
  const carDistN = normalizeProvince(carDist)
  
  const pCode = getProvinceCode(bookingForm.value.pickupLocation.city)
  const pDistN = normalizeProvince(bookingForm.value.pickupLocation.district)
  
  if (!carCode || !pCode) return 0
  
  if (pCode !== carCode) return 100
  if (pDistN && carDistN && pDistN !== carDistN) return 25
  return 5
}

const deliveryDistance = computed(() => ({
  pickup: deliveryData.value.pickupDistance || 0,
  total: deliveryData.value.pickupDistance || 0
}))

const deliveryFee = computed(() => {
  return Math.round((deliveryData.value.pickupDistance || 0) * RATE_PER_KM)
})

const pickupDeliveryFee = computed(() => deliveryFee.value)

// Watch for location changes and recalculate delivery fee
watch(() => bookingForm.value.pickupLocation.district, (newDistrict) => {
  if (newDistrict) {
    console.log('[WATCH] WithDriver - District selected, calculating delivery...')
    calculateDeliveryDistance()
  }
})

const normalizeProvince = (str) => {
  if (!str) return ''
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\b(tinh|thanh pho|tp\.|tp|quan|huyen|phuong|xa|thi tran)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

const getProvinceCode = (provinceName) => {
  if (!provinceName || !locations.value.length) return null
  const normSearch = normalizeProvince(provinceName)
  const found = locations.value.find(loc => normalizeProvince(loc.name) === normSearch || normalizeProvince(loc.short_name) === normSearch)
  return found ? found.province_code : null
}

const isModePreselected = computed(() => !!route.query.mode)

const rentalDays = computed(() => {
  if (!bookingForm.value.startDate || !bookingForm.value.endDate) return 1
  const start = new Date(bookingForm.value.startDate)
  const end = new Date(bookingForm.value.endDate)
  const diffTime = Math.abs(end - start)
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days === 0 ? 1 : days
})

const rentalFee = computed(() => {
  if (!car.value) return 0
  if (bookingForm.value.mode === 'daily') {
    return (car.value.pricePerDayWithDriver || car.value.pricePerDay + 500000) * rentalDays.value
  } else {
    return (car.value.pricePerHourWithDriver || (car.value.pricePerHour || Math.round(car.value.pricePerDay / 10)) + 100000) * (bookingForm.value.hours || 1)
  }
})

const extraFee = computed(() => {
  if (!car.value || !locations.value.length) return 0
  const carCity = car.value.location?.city || car.value.addressId?.city || car.value.addressId?.province?.name || ''
  const carDist = car.value.location?.district || car.value.addressId?.district || car.value.addressId?.ward?.name || ''
  const carCode = getProvinceCode(carCity)
  const carDistN = normalizeProvince(carDist)
  const oFee = Number(car.value.outOfProvinceFee || 200000)
  const iFee = Number(car.value.inProvinceFee || 100000)
  const pCode = getProvinceCode(bookingForm.value.pickupLocation.city)
  const pDistN = normalizeProvince(bookingForm.value.pickupLocation.district)

  let totalExtra = 0
  if (carCode) {
    if (pCode && pCode !== carCode) totalExtra += oFee
    if (pCode && pCode === carCode) {
       if (pDistN && carDistN && pDistN !== carDistN) totalExtra += iFee
    }
  }
  return totalExtra
})

const optionsFee = computed(() => {
  let fee = 0
  if (bookingForm.value.fullInsurance) fee += 500000
  if (bookingForm.value.gpsRequired) fee += 100000 * (bookingForm.value.mode === 'daily' ? rentalDays.value : 1)
  if (bookingForm.value.fuelFull) fee += 200000
  return fee
})

const serviceFee = computed(() => Math.round(rentalFee.value * 0.05))
const totalAmount = computed(() => rentalFee.value + optionsFee.value + serviceFee.value + deliveryFee.value)
const deposit = computed(() => Math.round(totalAmount.value * 0.3))

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const pickupFilteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.pickupLocation.city)
  return prov ? prov.wards : []
})

const returnFilteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.returnLocation.city)
  return prov ? prov.wards : []
})

watch(() => bookingForm.value.pickupLocation.city, () => {
  bookingForm.value.pickupLocation.district = ''
})

watch(() => bookingForm.value.returnLocation.city, () => {
  bookingForm.value.returnLocation.district = ''
})

watch(() => bookingForm.value.mode, (newMode) => {
  if (newMode === 'hourly') {
    bookingForm.value.endDate = ''
    bookingForm.value.pickupTime = ''
    bookingForm.value.returnTime = ''
  } else {
    bookingForm.value.hours = ''
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
    car.value = response.data.car
    return true
  } catch (error) {
    toast.error('Không tìm thấy xe')
    router.back()
    return false
  }
}

const submitBooking = async () => {
  try {
    loading.value = true
    
    let pickupTime = bookingForm.value.pickupTime
    let returnTime = bookingForm.value.returnTime
    
    // In hourly mode, the 'endDate' field is reused for 'pickupTime' input in the UI
    if (bookingForm.value.mode === 'hourly') {
      pickupTime = bookingForm.value.endDate
      if (pickupTime && bookingForm.value.hours) {
        const [h, m] = pickupTime.split(':').map(Number)
        const totalMinutes = h * 60 + m + Number(bookingForm.value.hours) * 60
        const rh = Math.floor(totalMinutes / 60) % 24
        const rm = totalMinutes % 60
        returnTime = `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`
      }
    }

    if (!pickupTime || !returnTime || !/^\d{2}:\d{2}$/.test(pickupTime) || !/^\d{2}:\d{2}$/.test(returnTime)) {
      toast.error('Vui lòng chọn thời gian nhận và trả xe hợp lệ')
      loading.value = false
      return
    }

    // Check driver availability before submitting
    try {
      const availabilityCheck = await api.post('/bookings/check-driver-availability', {
        carId: route.params.id,
        startDate: bookingForm.value.startDate,
        endDate: bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate,
        pickupTime: pickupTime,
        returnTime: returnTime,
        mode: bookingForm.value.mode
      })
      
      if (!availabilityCheck.data.available) {
        toast.error(availabilityCheck.data.message || 'Tài xế đã có lịch vào thời gian này. Vui lòng chọn thời gian khác hoặc lựa chọn tài xế khác.')
        loading.value = false
        return
      }
    } catch (checkError) {
      // Check if error response contains availability info
      if (checkError.response?.data?.available === false) {
        toast.error(checkError.response.data.message || 'Tài xế đã có lịch vào thời gian này. Vui lòng chọn thời gian khác hoặc lựa chọn tài xế khác.')
        loading.value = false
        return
      }
      // If the API doesn't exist or fails, log but continue with booking
      console.log('Driver availability check failed:', checkError)
    }
    
    // Check car availability and blocked schedules before submitting
    try {
      const carAvailabilityCheck = await api.post('/bookings/check-car-availability', {
        carId: route.params.id,
        startDate: bookingForm.value.startDate,
        endDate: bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate,
        pickupTime: pickupTime,
        returnTime: returnTime,
        mode: bookingForm.value.mode
      })
      
      if (!carAvailabilityCheck.data.available) {
        toast.error(carAvailabilityCheck.data.message || 'Lịch xe bị chặn trong thời gian này. Vui lòng chọn thời gian khác.')
        loading.value = false
        return
      }
    } catch (carCheckError) {
      // Check if error response contains availability info
      if (carCheckError.response?.data?.available === false) {
        toast.error(carCheckError.response.data.message || 'Lịch xe bị chặn trong thời gian này. Vui lòng chọn thời gian khác.')
        loading.value = false
        return
      }
      console.log('Car availability check failed:', carCheckError)
      // Continue with booking if API doesn't exist
    }

    const formData = new FormData()
    formData.append('car', route.params.id)
    formData.append('rentalType', 'with_driver')
    formData.append('mode', bookingForm.value.mode)
    formData.append('startDate', bookingForm.value.startDate)
    formData.append('endDate', bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate)
    formData.append('pickupTime', pickupTime)
    formData.append('returnTime', returnTime)
    formData.append('hours', bookingForm.value.hours)
    formData.append('pickupLocation', JSON.stringify(bookingForm.value.pickupLocation))
    formData.append('returnLocation', JSON.stringify(bookingForm.value.returnLocation))
    formData.append('renterType', 'self')
    formData.append('passengerName', bookingForm.value.passengerName)
    formData.append('passengerPhone', bookingForm.value.passengerPhone)
    formData.append('passengerEmail', bookingForm.value.passengerEmail)
    formData.append('passengerIdCard', bookingForm.value.passengerIdCard)
    formData.append('dateOfBirth', bookingForm.value.dateOfBirth)
    formData.append('fullInsurance', bookingForm.value.fullInsurance)
    formData.append('gpsRequired', bookingForm.value.gpsRequired)
    formData.append('fuelFull', bookingForm.value.fuelFull)
    formData.append('babyCarSeat', bookingForm.value.babyCarSeat)
    formData.append('notes', bookingForm.value.notes)
    
    formData.append('pricing', JSON.stringify({
      totalAmount: totalAmount.value,
      deposit: deposit.value,
      serviceFee: serviceFee.value,
      rentalFee: rentalFee.value,
      extraFee: 0,
      optionsFee: optionsFee.value,
      deliveryDistance: Number(deliveryData.value.pickupDistance) || 0,
      deliveryFee: Number(deliveryFee.value) || 0,
      deliveryRatePerKm: RATE_PER_KM
    }))

    const response = await api.post('/bookings', formData)
    if (response.data.success) {
      const bookingId = response.data.booking?._id || response.data.booking?.id;
      toast.success('Gửi yêu cầu đặt xe thành công!');
      // Chuyển sang trang thanh toán chuyên nghiệp
      router.push(`/payment/checkout/${bookingId}`);
    }
  } catch (error) {
    console.error('Booking error:', error)
    const msg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : 'Lỗi khi tạo đơn đặt hàng')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.fetchUser().then(() => fillUserInfo())
  fetchCar()
  fetch('/data.json')
    .then(res => res.json())
    .then(data => {
      locations.value = data
    })
    .catch(err => console.error('Error loading locations:', err))
})
</script>
