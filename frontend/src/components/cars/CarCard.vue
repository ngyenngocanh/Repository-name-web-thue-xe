<template>
  <div
    class="bg-white rounded-[2.5rem] border border-gray-100 shadow-ux hover-lift transition-all duration-500 overflow-hidden group p-2"
  >
    <div class="relative overflow-hidden rounded-[2.2rem] aspect-video-card">
      <img
        :src="getCarImageUrl(car, 0)"
        :alt="`${car.brand} ${car.model}`"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        @error="handleImageError"
      >
      
      <!-- Badges -->
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        <span v-if="(car.rating?.average || 0) > 0" class="glass px-3 py-1.5 rounded-full text-xs font-black text-gray-900 flex items-center shadow-sm">
          <svg class="w-3 h-3 text-yellow-500 mr-1 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          {{ (car.rating?.average || 0).toFixed(1) }}
        </span>
        <span v-if="car.owner?.isVerified" class="glass px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
          Verified
        </span>
      </div>

      <!-- Busy Mask -->
      <div v-if="isCarBusy" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
         <div class="bg-white/90 px-6 py-2 rounded-full text-xs font-black text-red-600 uppercase tracking-widest shadow-xl">
           Hiện đang bận
         </div>
      </div>

      <!-- Favorite Button -->
      <button 
        @click.stop="toggleFavorite"
        class="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center shadow-lg active-scale group/fav"
      >
        <svg 
          class="w-5 h-5 transition-all duration-300 transform group-hover/fav:scale-125"
          :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-900'"
          fill="none" 
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>
    </div>

    <div class="p-5">
      <!-- Car Info -->
      <div class="mb-4">
        <div class="flex justify-between items-start mb-1">
          <h3 class="text-xl font-black text-gray-900 tracking-tight leading-tight">
            {{ car.brand }} <span class="text-primary-600">{{ car.model }}</span>
          </h3>
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ car.year }}</span>
        </div>
        <div class="flex items-center text-gray-400 group-hover:text-primary-500 transition-colors">
          <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="text-xs font-bold">{{ car.location?.city || car.addressId?.province?.name || '' }}</span>
        </div>
      </div>

      <!-- Specs Grid -->
      <div class="grid grid-cols-3 gap-2 mb-6">
        <div class="bg-gray-50 rounded-2xl p-2 text-center border border-gray-100 flex flex-col items-center">
          <svg class="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span class="text-[10px] font-black text-gray-900">{{ car.seats }} chỗ</span>
        </div>
        <div class="bg-gray-50 rounded-2xl p-2 text-center border border-gray-100 flex flex-col items-center">
           <svg class="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          <span class="text-[10px] font-black text-gray-900">{{ car.transmission === 'automatic' ? 'Số tự động' : 'Số sàn' }}</span>
        </div>
        <div class="bg-gray-50 rounded-2xl p-2 text-center border border-gray-100 flex flex-col items-center">
          <svg class="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span class="text-[10px] font-black text-gray-900">{{ getFuelLabel(car.fuel) }}</span>
        </div>
      </div>

      <!-- Owner -->
      <div class="flex items-center justify-between py-4 border-t border-dashed border-gray-100">
        <div class="flex items-center">
          <div class="relative">
            <img 
              :src="getUserAvatarUrl(car.owner?._id, car.owner?.avatar) || '/placeholder-avatar.svg'" 
              class="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100"
              @error="$event.target.src = '/placeholder-avatar.svg'"
            >
            <div v-if="car.owner?.isVerified" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div class="ml-2">
            <p class="text-[10px] font-black text-gray-900 leading-tight">{{ car.owner?.fullName }}</p>
            <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{{ car.totalTrips }} chuyến đi</p>
          </div>
        </div>
        
        <div class="text-right">
          <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Giá mỗi ngày</p>
          <p class="text-xl font-black text-primary-600 leading-tight">{{ formatPrice(car.pricePerDay) }}</p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="relative">
        <button 
          @click.stop="toggleRentalMenu"
          :disabled="isCarBusy"
          class="w-full py-4 px-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center shadow-lg active-scale disabled:opacity-50 disabled:grayscale"
        >
          <span v-if="isCarBusy">Xe đang bận</span>
          <span v-else>Đặt xe ngay</span>
          <svg v-if="!isCarBusy" class="w-3 h-3 ml-2 transition-transform" :class="showRentalMenu ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
        </button>

        <!-- Dropdown Menu (Premium Variant) -->
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 translate-y-2 scale-95"
          enter-to-class="transform opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="transform opacity-100 translate-y-0 scale-100"
          leave-to-class="transform opacity-0 translate-y-2 scale-95"
        >
          <div 
            v-if="showRentalMenu"
            class="absolute bottom-full left-0 right-0 mb-4 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-2 overflow-hidden z-20"
          >
            <div class="space-y-1">
              <button 
                v-if="props.car.isSelfDrive"
                @click.prevent.stop="handleRental('self-drive')"
                class="w-full px-4 py-3 text-left hover:bg-primary-50 rounded-2xl transition-all group/item flex items-center"
              >
                <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div>
                  <div class="font-black text-xs text-gray-900 uppercase">Tự lái</div>
                  <div class="text-[9px] font-bold text-gray-400">Tự do khám phá</div>
                </div>
              </button>
              
              <button 
                v-if="props.car.isWithDriver"
                @click.stop="handleRental('with-driver')"
                class="w-full px-4 py-3 text-left hover:bg-primary-50 rounded-2xl transition-all group/item flex items-center"
              >
                <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </div>
                <div>
                  <div class="font-black text-xs text-gray-900 uppercase">Kèm tài</div>
                  <div class="text-[9px] font-bold text-gray-400">An toàn, chu đáo</div>
                </div>
              </button>
              
              <button 
                v-if="props.car.isWithDriver"
                @click.prevent.stop="handleRental('trip')"
                class="w-full px-4 py-3 text-left hover:bg-primary-50 rounded-2xl transition-all group/item flex items-center"
              >
                <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </div>
                <div>
                  <div class="font-black text-xs text-gray-900 uppercase">Theo chuyến</div>
                  <div class="text-[9px] font-bold text-gray-400">Tiết kiệm, linh hoạt</div>
                </div>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { getUserAvatarUrl } from '@/utils/avatar'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([])

const toast = useToast()
const router = useRouter()
const isFavorite = ref(false)
const showRentalMenu = ref(false)
const isCarBusy = computed(() => {
  // Xe bận khi operationalStatus không phải 'available'
  const busyStatuses = ['rented', 'on_trip', 'maintenance', 'repair']
  const isBusy = busyStatuses.includes(props.car.operationalStatus) || 
         (props.car.availability?.unavailableDates?.length > 0)
  console.log(`[CarCard ${props.car._id}] ${props.car.brand} ${props.car.model} - operationalStatus: ${props.car.operationalStatus}, isBusy: ${isBusy}`)
  return isBusy
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const getFuelLabel = (fuel) => {
  const labels = {
    gasoline: 'Xăng',
    diesel: 'Diesel',
    electric: 'Điện',
    hybrid: 'Hybrid'
  }
  return labels[fuel] || fuel
}

const getTopFeatures = (features) => {
  // Hiển thị tối đa 5 features phổ biến nhất
  const priorityFeatures = ['air_conditioning', 'gps', 'bluetooth', 'camera', 'usb_charging']
  const filtered = features.filter(feature => priorityFeatures.includes(feature))
  return filtered.slice(0, 5)
}

const getFeatureIcon = (feature) => {
  const icons = {
    air_conditioning: 'AirConditioningIcon',
    gps: 'GpsIcon', 
    bluetooth: 'BluetoothIcon',
    camera: 'CameraIcon',
    usb_charging: 'UsbIcon',
    wifi: 'WifiIcon',
    leather_seats: 'ChairIcon',
    sunroof: 'SunIcon'
  }
  return icons[feature] || 'StarIcon'
}

const getFeatureLabel = (feature) => {
  const labels = {
    air_conditioning: 'Điều hòa',
    gps: 'GPS',
    bluetooth: 'Bluetooth',
    camera: 'Camera hành trình',
    usb_charging: 'Sạc USB',
    wifi: 'WiFi',
    leather_seats: 'Ghế da',
    sunroof: 'Cửa sổ trời'
  }
  return labels[feature] || feature
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

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  toast.info(isFavorite.value ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
}

const toggleRentalMenu = () => {
  showRentalMenu.value = !showRentalMenu.value
}

const handleRental = (type) => {
  showRentalMenu.value = false
  router.push(`/cars/${props.car._id}/${type}`)
}

const closeRentalMenu = () => {
  showRentalMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeRentalMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeRentalMenu)
})
</script>
