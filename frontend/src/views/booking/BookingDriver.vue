<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button & Breadcrumb -->
      <div class="flex items-center space-x-6 mb-10">
        <button 
          @click="router.back()" 
          class="flex items-center text-xs font-black text-gray-500 hover:text-gray-900 transition-all uppercase tracking-[0.2em] group active-scale"
        >
          <div class="bg-white p-3 rounded-2xl shadow-ux border border-gray-100 mr-4 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </div>
          QUAY LẠI
        </button>
        <div class="h-6 w-px bg-gray-200"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100">Xác nhận đặt tài xế</span>
      </div>

      <!-- Driver Info Summary (Lux Version) -->
      <div v-if="driver" class="bg-white rounded-[3rem] p-10 mb-12 shadow-ux-lg border border-gray-100 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group">
        <!-- Abstract Decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary-50 group-hover:scale-150 transition-transform duration-1000 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div class="relative z-10 shrink-0">
          <div class="w-40 h-40 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-primary-600 to-primary-100 shadow-2xl group-hover:rotate-3 transition-transform duration-500">
            <img 
              :src="driver.avatar || '/placeholder-avatar.svg'" 
              class="w-full h-full rounded-[2.2rem] object-cover border-4 border-white shadow-inner"
            >
          </div>
          <div v-if="driver.isVerified" class="absolute -top-4 -right-4 bg-primary-600 text-white p-2.5 rounded-2xl border-4 border-white shadow-xl">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left z-10">
          <div class="inline-block px-3 py-1 bg-primary-50 border border-primary-100 rounded-full text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3">Tài xế ưu tú đã chọn</div>
          <h2 class="text-4xl font-black text-gray-900 tracking-tighter mb-4 leading-none">
            {{ driver.fullName }}
          </h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-6 font-black text-xs uppercase tracking-widest text-gray-500">
            <div class="flex items-center">
               <span class="text-yellow-500 text-lg mr-2 leading-none">★</span>
               <span class="text-gray-900">{{ driver.rating?.average?.toFixed(1) || '5.0' }}</span> 
               <span class="text-gray-200 mx-3">|</span>
               <span class="text-gray-900">{{ (driver.totalTrips?.asOwner || 0) + (driver.totalTrips?.asRenter || 0) }} Chuyến đi</span>
            </div>
          </div>
        </div>

        <div class="text-right z-10 hidden md:block border-l border-gray-50 pl-10">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Đơn giá hợp đồng</p>
          <div class="flex flex-col items-end">
             <span class="text-3xl font-black text-primary-600 tracking-tighter">
               {{ formatPrice(bookingForm.mode === 'hourly' ? driver.driverInfo?.driverRatePerHour : driver.driverInfo?.driverRatePerDay) }}
             </span>
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {{ bookingForm.mode === 'daily' ? 'NGÀY' : 'GIỜ' }}</span>
          </div>
        </div>
      </div>

      <!-- Booking Form (Simplified) -->
      <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <h2 class="text-2xl font-black text-gray-900 mb-8">Thông tin đặt tài xế</h2>

        <form @submit.prevent="submitBooking" class="space-y-8">
          <!-- Mode Selection -->
          <div v-if="!$route.query.mode">
            <label class="text-sm font-bold text-gray-900 mb-4 block">Loại thuê</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="bookingForm.mode = 'daily'"
                :class="bookingForm.mode === 'daily' 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400'"
                class="p-4 border-2 rounded-2xl font-bold transition-all"
              >
                Theo ngày
              </button>
              <button
                type="button"
                @click="bookingForm.mode = 'hourly'"
                :class="bookingForm.mode === 'hourly' 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400'"
                class="p-4 border-2 rounded-2xl font-bold transition-all"
              >
                Theo giờ
              </button>
            </div>
          </div>
          <div v-else>
            <label class="text-sm font-bold text-gray-900 mb-4 block">Loại thuê đang chọn</label>
            <div class="inline-block px-6 py-3 bg-amber-50 border-2 border-amber-500 text-amber-900 rounded-2xl font-black uppercase tracking-widest text-xs">
              {{ bookingForm.mode === 'daily' ? 'Thuê theo ngày' : 'Thuê theo giờ' }}
            </div>
          </div>

          <!-- Date/Time Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Ngày bắt đầu</label>
              <input v-model="bookingForm.startDate" type="date" class="input input-bordered w-full" required>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">{{ bookingForm.mode === 'daily' ? 'Ngày kết thúc' : 'Giờ bắt đầu' }}</label>
              <input v-model="bookingForm.endDate" :type="bookingForm.mode === 'daily' ? 'date' : 'time'" class="input input-bordered w-full" required>
            </div>
          </div>

          <!-- Trip Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Loại hình chuyến</label>
              <select v-model="bookingForm.tripType" class="select select-bordered w-full">
                <option value="" disabled>Chọn loại hình...</option>
                <option value="personal">Cá nhân</option>
                <option value="business">Công tác</option>
                <option value="tourism">Du lịch</option>
                <option value="airport">Sân bay</option>
              </select>
              <p v-if="bookingForm.tripType === 'business' || bookingForm.tripType === 'tourism'" class="text-[10px] text-amber-600 font-bold mt-1">
                * Phụ phí công tác/du lịch: +300,000 VNĐ (Phí đi lại, lưu trú cho tài xế)
              </p>
            </div>
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Khoảng cách dự kiến (km)</label>
              <div class="relative">
                <input v-model.number="bookingForm.estimatedDistance" type="number" placeholder="Ví dụ: 350" class="input input-bordered w-full pr-24">
                <button 
                  type="button"
                  @click="calculateDistance"
                  :disabled="calculatingDist"
                  class="absolute right-2 top-2 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg hover:bg-amber-200 uppercase transition-all disabled:opacity-50"
                >
                  {{ calculatingDist ? 'Đang tính...' : 'Tính km' }}
                </button>
              </div>
              <p v-if="bookingForm.estimatedDistance > 300" class="text-[10px] text-amber-600 font-bold mt-1">
                * Phụ phí đi xa (>300km): +500,000 VNĐ
              </p>
            </div>
          </div>

          <!-- Pickup/Drop-off Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-bold text-gray-900 mb-2 block">Địa điểm đón</label>
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
              <label class="text-sm font-bold text-gray-900 mb-2 block">Địa điểm trả</label>
              <input
                v-model="bookingForm.dropoffLocation.street"
                type="text"
                placeholder="Số nhà, tên đường"
                class="input input-bordered w-full mb-2"
                required
              >
              <div class="grid grid-cols-2 gap-2">
                <select
                  v-model="bookingForm.dropoffLocation.city"
                  class="select select-bordered"
                  required
                >
                  <option value="">Chọn Tỉnh/TP</option>
                  <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                </select>
                <select
                  v-model="bookingForm.dropoffLocation.district"
                  class="select select-bordered"
                  :disabled="!dropoffFilteredWards.length"
                  required
                >
                  <option value="">Chọn Phường/Xã</option>
                  <option v-for="ward in dropoffFilteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                </select>
              </div>
            </div>
          </div>

         

          <!-- Passenger & Contact Information -->
          <div class="border-t border-gray-50 pt-12">
            <h3 class="text-[11px] font-black text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center">
              <span class="w-2 h-4 bg-primary-600 rounded-full mr-4"></span>
              Thông tin liên hệ quý khách
            </h3>

            <div class="bg-gray-50/80 rounded-[2rem] p-10 border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="group">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Họ và tên</p>
                <p class="font-black text-gray-900 text-lg tracking-tight">{{ bookingForm.passengerName }}</p>
              </div>
              <div class="group">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Số điện thoại</p>
                <p class="font-black text-gray-900 text-lg tracking-tight">{{ bookingForm.passengerPhone }}</p>
              </div>
              <div class="group">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Địa chỉ Email</p>
                <p class="font-black text-gray-900 text-lg tracking-tight">{{ bookingForm.passengerEmail }}</p>
              </div>
              <div class="group">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Số căn cước công dân</p>
                <p class="font-black text-gray-900 text-lg tracking-tight">{{ bookingForm.passengerIdCard }}</p>
              </div>
            </div>

            <!-- Profile Warning -->
            <div v-if="!isProfileComplete" class="mt-12 p-12 bg-primary-50 rounded-[3rem] border-2 border-dashed border-primary-200 flex flex-col items-center text-center animate-pulse">
              <div class="bg-white p-5 rounded-[1.5rem] mb-6 shadow-ux text-primary-600">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 uppercase tracking-[0.2em] mb-3">Hồ sơ chưa hoàn thiện</h3>
              <p class="text-sm text-gray-600 max-w-md mb-8 font-medium">
                Để bảo vệ quyền lợi và xác thực hợp đồng, quý khách cần cập nhật đầy đủ thông tin định danh (CCCD) trước khi tiếp tục.
              </p>
              <button 
                type="button"
                @click="goToProfile"
                class="px-10 py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-2xl uppercase tracking-[0.3em] transition-all text-[10px] active-scale"
              >
                CẬP NHẬT NGAY
              </button>
            </div>
          </div>

          <!-- Insurance & Options -->
          <div class="border-t pt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Bảo hiểm & Tùy chọn</h3>
            <div class="space-y-4">
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.accidentInsurance" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Bảo hiểm tai nạn</p>
                  <p class="text-xs text-gray-500">+50,000 VNĐ (Bảo vệ toàn diện cho hành khách)</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.gpsRequired" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">Thiết bị GPS</p>
                  <p class="text-xs text-gray-500">+50,000 VNĐ/ngày (Định vị, kết nối điện thoại)</p>
                </div>
              </label>
              <label class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input v-model="bookingForm.wifi" type="checkbox" class="checkbox checkbox-primary">
                <div>
                  <p class="font-bold text-gray-900">WiFi di động</p>
                  <p class="text-xs text-gray-500">+30,000 VNĐ (Internet cao tốc 4G)</p>
                </div>
              </label>
            </div>
          </div>



          <!-- Additional Info -->
          <div class="border-t pt-8">
            <label class="text-sm font-bold text-gray-900 mb-2 block">Ghi chú thêm</label>
            <textarea v-model="bookingForm.notes" class="textarea textarea-bordered w-full" rows="4" placeholder="Yêu cầu đặc biệt, lịch trình, ghi chú về tài xế..."></textarea>
          </div>

          <!-- Booking Summary (Premium Receipt Design) -->
          <div class="border-t border-gray-50 pt-12">
            <h3 class="text-[11px] font-black text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center">
              <span class="w-2 h-4 bg-primary-600 rounded-full mr-4"></span>
              Bản tóm tắt hợp đồng dự kiến
            </h3>
            
            <div class="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <!-- Texture/Pattern Overlay -->
               <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               
               <div class="relative z-10 space-y-6">
                 <div class="flex justify-between items-center pb-6 border-b border-white/10">
                   <span class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Phí dịch vụ cơ bản</span>
                   <span class="text-xl font-black">{{ formatPrice(rentalFee) }}</span>
                 </div>
                 
                 <div v-if="optionsFee > 0" class="flex justify-between items-center text-sm py-2">
                   <span class="text-gray-400 font-medium">Tiện ích bổ sung</span>
                   <span class="font-black text-white">{{ formatPrice(optionsFee) }}</span>
                 </div>

                 <div v-if="extraTripFee > 0" class="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div v-if="bookingForm.tripType === 'business' || bookingForm.tripType === 'tourism'" class="flex justify-between items-center text-xs">
                     <span class="text-amber-400/80 font-black uppercase tracking-widest">Phụ phí liên tỉnh (Ăn nghỉ tài xế)</span>
                     <span class="font-black text-amber-400">+{{ formatPrice(300000) }}</span>
                   </div>
                   <div v-if="bookingForm.estimatedDistance > 300" class="flex justify-between items-center text-xs">
                     <span class="text-amber-400/80 font-black uppercase tracking-widest">Phụ phí di chuyển xa (>300km)</span>
                     <span class="font-black text-amber-400">+{{ formatPrice(500000) }}</span>
                   </div>
                 </div>

                 <div class="flex justify-between items-center text-xs text-gray-400">
                   <span class="font-medium">Phí quản lý hệ thống (5%)</span>
                   <span class="font-black">{{ formatPrice(serviceFee) }}</span>
                 </div>

                 <div class="pt-8 border-t border-white/10">
                   <div class="flex justify-between items-end">
                     <div>
                       <p class="text-[9px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2 font-black">Tổng cộng giá trị</p>
                       <span class="text-4xl font-black text-white tracking-tighter">{{ formatPrice(totalAmount) }}</span>
                     </div>
                     <div class="text-right">
                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 font-black">Cọc cần thanh toán (30%)</p>
                        <span class="text-2xl font-black text-primary-500 tracking-tighter">{{ formatPrice(deposit) }}</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!isProfileComplete || loading"
            class="w-full mt-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-[2rem] shadow-2xl shadow-primary-900/20 uppercase tracking-[0.3em] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none active-scale text-[11px]"
          >
            {{ loading ? 'Đang khởi tạo hợp đồng...' : 'XÁC NHẬN & THANH TOÁN TIỀN CỌC' }}
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
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

const driver = ref(null)
const locations = ref([])
const loading = ref(false)

const bookingForm = ref({
  mode: route.query.mode || 'daily',
  startDate: route.query.startDate || new Date().toISOString().split('T')[0],
  endDate: route.query.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
  pickupLocation: {
    street: '',
    city: '',
    district: ''
  },
  dropoffLocation: {
    street: '',
    city: '',
    district: ''
  },
  tripType: route.query.tripType || '',
  passengerCount: 1,
  estimatedDistance: '',
  renterType: 'self',
  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',
  passengerIdCard: '',
  accidentInsurance: false,
  gpsRequired: false,
  wifi: false,
  notes: '',
  paymentMethod: 'cash'
})

const isProfileComplete = computed(() => {
  const u = authStore.user
  if (!u) return false
  return !!(
    u.fullName && 
    u.phone && 
    u.idCard?.number && 
    u.idCard?.frontImage && 
    u.idCard?.backImage
  )
})

const goToProfile = () => {
  localStorage.setItem('redirectAfterProfileUpdate', route.fullPath)
  router.push('/profile')
}

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

const dropoffFilteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.dropoffLocation.city)
  return prov ? prov.wards : []
})

watch(() => bookingForm.value.pickupLocation.city, () => {
  bookingForm.value.pickupLocation.district = ''
})

watch(() => bookingForm.value.dropoffLocation.city, () => {
  bookingForm.value.dropoffLocation.district = ''
})

const fillUserInfo = () => {
  if (authStore.user) {
    bookingForm.value.passengerName = authStore.user.fullName || authStore.user.name || ''
    bookingForm.value.passengerPhone = authStore.user.phone || ''
    bookingForm.value.passengerEmail = authStore.user.email || ''
    bookingForm.value.passengerIdCard = authStore.user.idCard?.number || ''
    
    // Fill address if available
    const addr = authStore.user.address || authStore.user.addressId || {}
    const queryPickup = route.query.pickup
    
    if (queryPickup && typeof queryPickup === 'string') {
      const parts = queryPickup.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        // Likely: Street, District, City
        bookingForm.value.pickupLocation.city = parts[parts.length - 1]
        bookingForm.value.pickupLocation.district = parts[parts.length - 2]
        bookingForm.value.pickupLocation.street = parts.slice(0, parts.length - 2).join(', ')
      } else {
        bookingForm.value.pickupLocation.street = queryPickup
      }
    } else {
      if (addr.street) bookingForm.value.pickupLocation.street = addr.street
      if (addr.province?.name || addr.city) bookingForm.value.pickupLocation.city = addr.province?.name || addr.city
      if (addr.ward?.name || addr.district) bookingForm.value.pickupLocation.district = addr.ward?.name || addr.district
    }
  }
}

watch(() => authStore.user, (u) => {
  if (u) fillUserInfo()
}, { immediate: true })

const fetchDriver = async () => {
  try {
    const response = await api.get(`/users/${route.params.id}`)
    driver.value = response.data.user
  } catch (error) {
    toast.error('Không tìm thấy tài xế')
    router.back()
  }
}

const calculatingDist = ref(false)

const calculateDistance = async () => {
  const pickup = bookingForm.value.pickupLocation
  const dropoff = bookingForm.value.dropoffLocation
  
  if (!pickup.city || !dropoff.city) {
    toast.warning('Vui lòng nhập đầy đủ Tỉnh/Thành cho cả nơi đón và nơi trả')
    return
  }

  const pickupStr = `${pickup.street}, ${pickup.district}, ${pickup.city}, Việt Nam`
  const dropoffStr = `${dropoff.street}, ${dropoff.district}, ${dropoff.city}, Việt Nam`

  try {
    calculatingDist.value = true
    
    // Geocode function with fallback
    const geocode = async (addr, fallbackAddr) => {
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`)
      let data = await res.json()
      
      if ((!data || data.length === 0) && fallbackAddr) {
        // Retry with just district and city
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddr)}&limit=1`)
        data = await res.json()
      }

      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
      return null
    }

    const pickupFull = `${pickup.street}, ${pickup.district}, ${pickup.city}, Việt Nam`
    const pickupFallback = `${pickup.district}, ${pickup.city}, Việt Nam`
    
    const dropoffFull = `${dropoff.street}, ${dropoff.district}, ${dropoff.city}, Việt Nam`
    const dropoffFallback = `${dropoff.district}, ${dropoff.city}, Việt Nam`

    const pCoords = await geocode(pickupFull, pickupFallback)
    const dCoords = await geocode(dropoffFull, dropoffFallback)

    if (!pCoords || !dCoords) {
      toast.error('Không tìm thấy tọa độ của một trong hai địa điểm. Vui lòng kiểm tra lại địa chỉ.')
      return
    }

    // Use a simple Haversine formula and add ~30% for real road distance
    const R = 6371 // Earth radius in km
    const dLat = (dCoords.lat - pCoords.lat) * Math.PI / 180
    const dLon = (dCoords.lon - pCoords.lon) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pCoords.lat * Math.PI / 180) * Math.cos(dCoords.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c
    
    // Road distance factor (heuristic)
    const estimatedKm = Math.round(d * 1.3)
    
    bookingForm.value.estimatedDistance = estimatedKm
    toast.success(`Đã ước tính quãng đường: ~${estimatedKm} km`)
  } catch (error) {
    toast.error('Lỗi khi tính toán quãng đường')
  } finally {
    calculatingDist.value = false
  }
}

const submitBooking = async () => {
  try {
    loading.value = true

    // Check driver availability before submitting
    try {
      const availabilityCheck = await api.post('/bookings/check-driver-availability', {
        driverId: route.params.id,
        startDate: bookingForm.value.startDate,
        endDate: bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate,
        pickupTime: '08:00',
        returnTime: '18:00',
        mode: bookingForm.value.mode
      })
      
      if (!availabilityCheck.data.available) {
        toast.error(availabilityCheck.data.message || 'Tài xế đã có lịch vào thời gian này. Vui lòng chọn thời gian khác hoặc lựa chọn tài xế khác.')
        loading.value = false
        return
      }
    } catch (checkError) {
      // If the API doesn't exist or fails, log but continue with booking
      console.log('Driver availability check failed:', checkError)
    }

    const formData = new FormData()
    formData.append('driver', route.params.id)
    formData.append('rentalType', 'driver_only')
    formData.append('mode', bookingForm.value.mode)
    formData.append('startDate', bookingForm.value.startDate)
    formData.append('endDate', bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate)
    formData.append('pickupTime', bookingForm.value.pickupTime || '09:00')
    formData.append('returnTime', bookingForm.value.returnTime || '09:00')
    formData.append('pickupLocation', typeof bookingForm.value.pickupLocation === 'string' ? bookingForm.value.pickupLocation : (bookingForm.value.pickupLocation.city + ', ' + bookingForm.value.pickupLocation.district))
    formData.append('returnLocation', typeof bookingForm.value.returnLocation === 'string' ? bookingForm.value.returnLocation : (bookingForm.value.pickupLocation.city + ', ' + bookingForm.value.pickupLocation.district))

    formData.append('tripType', bookingForm.value.tripType)
    formData.append('passengerCount', bookingForm.value.passengerCount)
    formData.append('estimatedDistance', bookingForm.value.estimatedDistance)
    formData.append('renterType', 'self')
    formData.append('passengerName', bookingForm.value.passengerName)
    formData.append('passengerPhone', bookingForm.value.passengerPhone)
    formData.append('passengerEmail', bookingForm.value.passengerEmail)
    formData.append('passengerIdCard', bookingForm.value.passengerIdCard)
    formData.append('accidentInsurance', bookingForm.value.accidentInsurance)
    formData.append('gpsRequired', bookingForm.value.gpsRequired)
    formData.append('wifi', bookingForm.value.wifi)
    formData.append('notes', bookingForm.value.notes)
    
    formData.append('payment', JSON.stringify({ method: bookingForm.value.paymentMethod }))
    
    formData.append('pricing', JSON.stringify({
      totalAmount: totalAmount.value,
      deposit: deposit.value,
      serviceFee: serviceFee.value,
      totalRentalFee: rentalFee.value,
      optionsFee: optionsFee.value,
      extraFee: extraTripFee.value
    }))

    const response = await api.post('/bookings', formData)
    if (response.data.success || response.data.booking) {
      const bookingId = response.data.booking._id;
      toast.success('Gửi yêu cầu đặt tài xế thành công!')
      // Chuyển sang trang thanh toán chuyên nghiệp
      router.push(`/payment/checkout/${bookingId}`)
    }
  } catch (error) {
    console.error('Booking error:', error)
    toast.error(error.response?.data?.message || 'Lỗi khi tạo đơn đặt hàng')
  } finally {
    loading.value = false
  }
}

const rentalFee = computed(() => {
  if (!driver.value) return 0
  const rate = bookingForm.value.mode === 'hourly' 
    ? (driver.value.driverInfo?.driverRatePerHour || 100000)
    : (driver.value.driverInfo?.driverRatePerDay || 500000)
  
  if (bookingForm.value.mode === 'daily') {
    const start = new Date(bookingForm.value.startDate || new Date())
    const end = new Date(bookingForm.value.endDate || new Date())
    const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1
    return rate * days
  }
  return rate * (bookingForm.value.hours || 1)
})

const optionsFee = computed(() => {
  let fee = 0
  if (bookingForm.value.accidentInsurance) fee += 50000
  if (bookingForm.value.gpsRequired) fee += 50000
  if (bookingForm.value.wifi) fee += 30000
  return fee
})

const extraTripFee = computed(() => {
  let fee = 0
  if (bookingForm.value.tripType === 'business' || bookingForm.value.tripType === 'tourism') {
    fee += 300000 // Accommodation & travel fee
  }
  if (Number(bookingForm.value.estimatedDistance) > 300) {
    fee += 500000 // Long distance allowance
  }
  return fee
})

const serviceFee = computed(() => Math.round((rentalFee.value + extraTripFee.value) * 0.05))
const totalAmount = computed(() => rentalFee.value + optionsFee.value + extraTripFee.value + serviceFee.value)
const deposit = computed(() => Math.round(totalAmount.value * 0.3))

onMounted(async () => {
  await fetchDriver()
  try {
    const locRes = await fetch('/data.json')
    locations.value = await locRes.json()
  } catch (err) {}
  fillUserInfo()
})
</script>
