<template>
  <div 
    class="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
  >
    <div class="flex flex-col md:flex-row">
      <!-- Image -->
      <div class="md:w-1/3 relative overflow-hidden rounded-l-lg">
        <img 
          :src="getCarImageUrl(car, 0)" 
          :alt="`${car.brand} ${car.model}`"
          class="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
          @error="handleImageError"
        >
        
        <!-- Badges -->
        <div class="absolute top-2 left-2 flex gap-2">
          <span v-if="car.isOnTrip || car.operationalStatus === 'on_trip'" class="badge badge-error">
            🔴 Bận
          </span>
          <span v-else-if="car.operationalStatus === 'maintenance'" class="badge badge-warning">
            🔧 Bảo trì
          </span>
          <span v-else-if="car.operationalStatus === 'repair'" class="badge badge-error">
            🛠️ Sửa chữa
          </span>
          <span v-else-if="(car.rating?.average || 0) > 0" class="badge badge-success">
            ⭐ {{ (car.rating?.average || 0).toFixed(1) }}
          </span>
          <span v-if="car.owner?.isVerified" class="badge badge-info">
            ✓ Đã xác minh
          </span>
        </div>

        <!-- Favorite Button -->
        <button 
          @click.stop="toggleFavorite"
          class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <svg 
            class="w-5 h-5 transition-colors"
            :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 p-6">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-1">
                {{ car.brand }} {{ car.model }}
              </h3>
              <p class="text-gray-600">{{ car.year }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-primary-600">
                {{ formatPrice(car.pricePerDay) }}
              </div>
              <div class="text-sm text-gray-500">/ngày</div>
            </div>
          </div>

          <!-- Location and Features -->
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm">{{ car.location?.city || car.addressId?.province?.name || '' }}</span>
            </div>
            
            <!-- Basic Info with Icons -->
            <div class="flex items-center gap-4">
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <span class="text-sm font-medium">{{ car.seats }}</span>
              </div>
              
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.43 3.5h1.38c.41 0 .75.34.75.75s-.34.75-.75.75H8.11l-.4 1.63c-.38 1.56-2.6 1.56-2.98 0l-.4-1.63H3.05c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.38l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.56c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08.33zM3 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5.12-3.17c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.38l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.56c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08.33zM14 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">{{ car.transmission === 'automatic' ? 'Tự động' : 'Số sàn' }}</span>
              </div>
              
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H10zm1 2a1 1 0 000 2h6a1 1 0 100-2H11zm0 4a1 1 0 000 2h6a1 1 0 100-2H11zm0 4a1 1 0 000 2h2a1 1 0 100-2H11zm4 0a1 1 0 100 2h2a1 1 0 100-2h-2z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">{{ getFuelLabel(car.fuel) }}</span>
              </div>
            </div>
          </div>

          <!-- Service Features Icons -->
          <div v-if="car.features && car.features.length > 0" class="flex items-center gap-2 mb-4">
            <div 
              v-for="feature in getTopFeatures(car.features)" 
              :key="feature"
              class="flex items-center justify-center w-7 h-7 bg-gray-50 rounded-md border border-gray-100"
              :title="getFeatureLabel(feature)"
            >
              <!-- Air Conditioning -->
              <svg v-if="feature === 'air_conditioning'" class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
              
              <!-- GPS -->
              <svg v-else-if="feature === 'gps'" class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              
              <!-- Bluetooth -->
              <svg v-else-if="feature === 'bluetooth'" class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-6.938-6.49a8.5 8.5 0 1112.776 0M12 12v4"/>
              </svg>
              
              <!-- Camera -->
              <svg v-else-if="feature === 'camera'" class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              
              <!-- USB Charging -->
              <svg v-else-if="feature === 'usb_charging'" class="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              
              <!-- WiFi -->
              <svg v-else-if="feature === 'wifi'" class="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-6.938-6.49a8.5 8.5 0 1112.776 0M12 12v4"/>
              </svg>
              
              <!-- Leather Seats -->
              <svg v-else-if="feature === 'leather_seats'" class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              
              <!-- Sunroof -->
              <svg v-else-if="feature === 'sunroof'" class="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              
              <!-- Default Star Icon -->
              <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          </div>

          <!-- Description -->
          <p v-if="car.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ car.description }}
          </p>

          <!-- Owner Info -->
          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center">
              <img 
                :src="car.owner?.avatar || '/placeholder-avatar.jpg'" 
                :alt="car.owner?.fullName"
                class="w-8 h-8 rounded-full mr-2"
              >
              <div>
                <div class="text-sm font-medium text-gray-900">{{ car.owner?.fullName }}</div>
                <div class="text-xs text-gray-500">{{ car.totalTrips }} chuyến</div>
              </div>
            </div>
            
            <!-- Rental Menu -->
            <div class="relative">
              <!-- Car is Busy -->
              <button 
                v-if="isCarBusy"
                disabled
                class="px-6 py-3 bg-gray-400 text-white font-black rounded-lg uppercase tracking-widest text-sm flex items-center cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Xe đang bận
              </button>
              
              <!-- Normal Rental Button -->
              <button 
                v-else
                @click.stop="toggleRentalMenu"
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg transition-all uppercase tracking-widest text-sm flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                Thuê xe
                <svg 
                  class="w-4 h-4 ml-2 transition-transform" 
                  :class="showRentalMenu ? 'rotate-180' : ''"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-if="showRentalMenu"
                  class="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 min-w-64"
                >
                  <div class="py-2">
                    <button 
                      v-if="car.isSelfDrive"
                      @click.stop="handleRental('self-drive')"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900 text-sm">Thuê tự lái</div>
                        <div class="text-xs text-gray-500">Tự do khám phá</div>
                      </div>
                    </button>
                    
                    <button 
                      v-if="car.isWithDriver"
                      @click.stop="handleRental('with-driver')"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900 text-sm">Kèm tài xế</div>
                        <div class="text-xs text-gray-500">Tài xế chuyên nghiệp</div>
                      </div>
                    </button>
                    
                    <button 
                      v-if="car.isWithDriver"
                      @click.stop="handleRental('trip')"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900 text-sm">Theo chuyến</div>
                        <div class="text-xs text-gray-500">Du lịch, công tác</div>
                      </div>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

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

// Computed property to check if car is busy
const isCarBusy = computed(() => {
  const busyStatuses = ['on_trip', 'maintenance', 'repair', 'rented']
  return props.car.isOnTrip || 
         busyStatuses.includes(props.car.operationalStatus) ||
         (props.car.availability?.unavailableDates?.length > 0)
})

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
