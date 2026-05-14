<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button 
        @click="router.back()" 
        class="flex items-center text-sm font-bold text-gray-400 hover:text-primary-600 mb-6 transition-colors group"
      >
        <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </div>
        Quay lại danh sách
      </button>

      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="h-64 bg-gray-200 rounded-[2.5rem]"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="h-48 bg-gray-200 rounded-[2rem]"></div>
          <div class="h-48 bg-gray-200 rounded-[2rem]"></div>
        </div>
      </div>

      <div v-else-if="booking" class="space-y-8">
        <!-- Status Header Card -->
        <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center">
            <div class="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mr-4">
               <svg v-if="booking.status === 'pending'" class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <svg v-else-if="booking.status === 'confirmed'" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <svg v-else class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" stroke-width="2" /></svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã đơn #{{ booking._id.slice(-8) }}</p>
              <h2 class="text-2xl font-black text-gray-900 leading-none">{{ getStatusLabel(booking.status) }}</h2>
            </div>
          </div>
          <div class="flex gap-3">
             <button v-if="canCancel" @click="handleCancel" class="px-6 py-3 bg-red-50 text-red-600 font-black rounded-xl text-xs uppercase hover:bg-red-100 transition-all">Hủy chuyến</button>
             <button v-if="canComplete" @click="handleComplete" class="px-8 py-3 bg-green-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-green-200 hover:scale-105 transition-all">Hoàn thành ngay</button>
             <button v-if="canReview && !hasReviewed" @click="handleReview" class="px-8 py-3 bg-primary-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-primary-200 hover:scale-105 transition-all">Đánh giá ngay</button>
             <button v-if="canReview && hasReviewed" @click="handleReview" class="px-8 py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-blue-200 hover:scale-105 transition-all">Xem đánh giá</button>
          </div>
        </div>

        <!-- Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <!-- Main Content -->
          <div class="space-y-8">
            <!-- Service Info -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <span class="w-1.5 h-6 bg-primary-600 rounded-full mr-3"></span>
                 Thông tin dịch vụ
              </h3>
              
              <!-- Car Section (if any) -->
              <div v-if="booking.car" class="flex items-start gap-6 mb-8">
                 <img :src="booking.car ? getCarImageUrl(booking.car, 0) : '/logo.png'" class="w-32 h-32 rounded-3xl object-cover border border-gray-50 shadow-sm" @error="handleImageError">
                 <div class="flex-1">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phương tiện</p>
                    <h4 class="text-2xl font-black text-gray-900">{{ booking.car.brand }} {{ booking.car.model }}</h4>
                    <p class="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">
                       {{ getRentalTypeLabel(booking.rentalType) }}
                    </p>
                    <div class="flex gap-4 mt-4 text-xs font-bold text-gray-500">
                       <span class="px-3 py-1 bg-gray-100 rounded-lg">BS: {{ booking.car.licensePlate }}</span>
                       <span class="px-3 py-1 bg-gray-100 rounded-lg">Đời: {{ booking.car.year }}</span>
                    </div>
                 </div>
              </div>

              <!-- Driver Section (if any) -->
              <div v-if="booking.driver" class="flex items-center gap-6 p-6 bg-primary-50/50 rounded-[2rem] border border-primary-100">
                 <img :src="booking.driver.avatar || '/placeholder-avatar.svg'" class="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm">
                 <div class="flex-1">
                    <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Tài xế phụ trách</p>
                    <h4 class="text-lg font-black text-gray-900">{{ booking.driver.fullName }}</h4>
                    <div class="flex gap-4 mt-1 font-bold text-xs text-gray-500">
                       <span>📞 {{ booking.driver.phone || 'N/A' }}</span>
                       <span v-if="booking.driver.email">📧 {{ booking.driver.email }}</span>
                    </div>
                 </div>
                 <div class="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-200 cursor-pointer hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.87 4.87l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C10.12 18 2 9.88 2 2V3z"/></svg>
                 </div>
              </div>

              <!-- General Stats -->
              <div class="grid grid-cols-2 gap-4 mt-8">
                  <div class="p-4 bg-gray-50 rounded-2xl">
                     <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Thời gian / Quãng đường</p>
                     <p v-if="booking.rentalType === 'trip'" class="font-bold text-gray-900 leading-none">{{ booking.trip?.distance || booking.distance || 0 }} KM</p>
                     <p v-else class="font-bold text-gray-900 leading-none">{{ booking.mode === 'hourly' ? `${booking.hours} Giờ` : `${booking.duration.days} Ngày` }}</p>
                  </div>
                 <div class="p-4 bg-gray-50 rounded-2xl">
                    <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Phương thức</p>
                    <p class="font-bold text-gray-900 leading-none italic">{{ booking.rentalType === 'trip' ? 'Hợp đồng theo chuyến' : (booking.mode === 'hourly' ? 'Hợp đồng theo giờ' : 'Hợp đồng theo ngày') }}</p>
                 </div>
              </div>
            </div>

            <!-- Schedule & Location -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
               <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <span class="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                 Lịch trình & Địa điểm
              </h3>
              <div class="space-y-6">
                 <div class="relative pl-8 border-l-2 border-dashed border-gray-200 pb-6">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm font-bold"></div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ booking.rentalType === 'trip' ? 'Điểm đi (A)' : 'Điểm đón' }}</p>
                    <p class="font-bold text-gray-900 mt-1">{{ booking.trip?.startLocation || booking.pickupLocation }}</p>
                    <p class="text-sm font-medium text-gray-500 mt-1">{{ formatDate(booking.startDate) }} ({{ booking.pickupTime }})</p>
                 </div>
                 <div class="relative pl-8">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm font-bold"></div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ booking.rentalType === 'trip' ? 'Điểm đến (B)' : 'Điểm trả' }}</p>
                    <p class="font-bold text-gray-900 mt-1">{{ booking.trip?.endLocation || booking.returnLocation }}</p>
                    <p class="text-sm font-medium text-gray-500 mt-1">{{ formatDate(booking.endDate) }} ({{ booking.returnTime }})</p>
                 </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Payment Card -->
            <div class="bg-primary-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary-200/50 min-w-[360px]">
               <h3 class="text-xl font-black mb-6 flex items-center opacity-90">
                 Thanh toán
              </h3>
              <div class="space-y-4">
                  <!-- Pure Data Display (Matching 100% of saved data) -->
                  <div class="flex flex-col gap-1 opacity-70">
                     <div class="flex justify-between items-center">
                        <span class="text-sm font-bold">{{ booking.rentalType === 'trip' ? 'Cước phí di chuyển (' + (booking.pricing?.distance || 0) + 'km)' : 'Phí thuê chính' }}</span>
                        <span class="font-black">{{ formatPrice(booking.pricing?.distanceFee || booking.pricing?.totalRentalFee || booking.pricing?.rentalFee || 0) }}</span>
                     </div>
                     <div v-if="(booking.rentalType === 'trip' || booking.rentalType === 'driver_only') && booking.pricing?.pricePerKm" class="text-[10px] text-gray-400 font-bold">
                        Đơn giá: {{ formatPrice(booking.pricing?.pricePerKm) }}/km {{ (booking.pricing?.multiplier && booking.pricing.multiplier !== 1) ? ' x Hệ số ' + booking.pricing.multiplier : '' }}
                     </div>
                  </div>

                  <!-- Delivery Fee -->
                  <div v-if="booking.pricing?.deliveryFee > 0" class="flex justify-between items-center opacity-70 text-blue-400">
                     <div class="flex flex-col">
                        <span class="text-sm font-bold">Phí giao xe ({{ booking.pricing?.deliveryDistance || 0 }} km)</span>
                        <span class="text-[10px] opacity-70">{{ booking.pricing?.deliveryDistance || 0 }} km × 5,000đ/km</span>
                     </div>
                     <span class="font-black">{{ formatPrice(booking.pricing.deliveryFee) }}</span>
                  </div>

                  <!-- Driver Fee -->
                  <div v-if="booking.pricing?.driverTripFee" class="flex justify-between items-center opacity-70">
                     <span class="text-sm font-bold">Phụ phí tài xế</span>
                     <span class="font-black">{{ formatPrice(booking.pricing.driverTripFee) }}</span>
                  </div>

                  <!-- Service Fee -->
                  <div class="flex justify-between items-center opacity-70">
                     <span class="text-sm font-bold">Phí sàn dịch vụ (5%)</span>
                     <span class="font-black">{{ formatPrice(booking.pricing?.serviceFee || 0) }}</span>
                  </div>

                  <!-- Options Fee -->
                  <div v-if="booking.pricing?.optionsFee" class="flex justify-between items-center opacity-70">
                     <span class="text-sm font-bold">Tùy chọn bổ sung</span>
                     <span class="font-black">{{ formatPrice(booking.pricing.optionsFee) }}</span>
                  </div>

                  <!-- Deposit -->
                  <div v-if="booking.pricing?.deposit" class="flex justify-between items-center opacity-70 border-t border-white/10 pt-4">
                     <span class="text-sm font-bold">Tiền cọc đã trả (30%)</span>
                     <span class="font-black">- {{ formatPrice(booking.pricing.deposit) }}</span>
                  </div>

                  <!-- Final Total Saved in DB -->
                  <div class="pt-6 border-t border-white/20 flex justify-between items-end">
                     <div>
                        <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tổng tiền hóa đơn</p>
                        <span class="text-3xl font-black leading-none text-white">{{ formatPrice(booking.pricing?.totalAmount || 0) }}</span>
                     </div>
                  </div>
                 
                 <div class="pt-2 text-center">
                    <span class="text-[10px] opacity-50">(Đã trừ tiền cọc, phí sàn + phụ phí)</span>
                 </div>
                  
                  <!-- Hành động đã được chuyển lên trên tiêu đề -->
                 <div class="pt-6">
                    <div class="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                       <span class="text-[10px] font-black uppercase tracking-widest opacity-70">Hình thức:</span>
                       <span class="font-black text-xs uppercase">{{ booking.payment?.method || 'Chưa chọn' }}</span>
                    </div>
                 </div>
              </div>
            </div>

            <!-- Contract Section -->
            <ContractDisplay
              :booking="booking"
              @contract-generated="onContractGenerated"
            />
            
            <!-- VietQR Payment Section -->
            <div v-if="vietQrUrl" class="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 shadow-sm text-center mt-8">
              <h4 class="font-black text-blue-800 text-lg uppercase tracking-widest mb-4">Mã thanh toán VietQR</h4>
              <div class="bg-white p-4 rounded-3xl inline-block shadow-sm border border-gray-100">
                <img :src="vietQrUrl" alt="VietQR" class="w-48 h-48 object-contain mx-auto">
              </div>
              <p class="text-sm font-bold text-gray-700 mt-4">Sử dụng App Ngân hàng (MB, VCB...) để quét mã này</p>
              <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Vui lòng giữ nguyên nội dung chuyển khoản (Mã Đơn) để hệ thống tự động nhận diện.</p>
              <button @click="toast.success('Ghi nhận yêu cầu. Yêu cầu của bạn đang chờ Admin xác nhận!')" class="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">Tôi đã chuyển khoản thành công</button>
            </div>

            <!-- Support info -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center">
               <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </div>
               <h4 class="font-black text-gray-900">Cần hỗ trợ?</h4>
               <p class="text-xs text-gray-500 mt-2 font-medium">Nếu có vấn đề gì xảy ra, vui lòng liên hệ bộ phận hỗ trợ</p>
               <button class="mt-6 w-full py-3 border-2 border-gray-100 rounded-xl text-xs font-black uppercase hover:border-primary-100 hover:text-primary-600 transition-all">Hotline: 1900 1234</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import ContractDisplay from '@/components/ContractDisplay.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const booking = ref(null)
const loading = ref(true)
const vietQrUrl = ref(null)

const canComplete = computed(() => {
  return booking.value && ['active', 'confirmed'].includes(booking.value.status)
})

const canReview = computed(() => {
  return booking.value && booking.value.status === 'completed'
})

const hasReviewed = computed(() => {
  return booking.value && (booking.value.reviews?.renterReview || booking.value.reviews?.carReview)
})

const handleComplete = async () => {
  if (!confirm('Bạn có chắc chắn muốn kết thúc chuyến đi này?')) return
  
  try {
    const response = await api.put(`/bookings/${booking.value._id}/status`, {
      status: 'completed'
    })
    if (response.data) {
      toast.success('Chúc mừng! Chuyến đi đã hoàn thành và tất toán.')
      await fetchBooking()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành chuyến đi')
  }
}

const handleReview = () => {
  router.push(`/bookings/${booking.value._id}/review`)
}

const fetchBooking = async () => {
  try {
    loading.value = true
    const response = await api.get(`/bookings/${route.params.id}`)
    booking.value = response.data.booking
    
    // Check if we need to show VietQR
    if (booking.value?.payment?.method === 'bank_transfer' && booking.value?.payment?.status === 'pending') {
      const amount = booking.value.pricing?.deposit || booking.value.pricing?.totalAmount || 100000;
      try {
        const qrRes = await api.get(`/vietqr/generate?amount=${amount}&bookingId=${booking.value._id}`);
        if (qrRes.data.success) {
           vietQrUrl.value = qrRes.data.qrUrl;
        }
      } catch (err) {
        console.error('Failed to load QR', err);
      }
    }
  } catch (error) {
    toast.error('Không tìm thấy chuyến đi')
    router.push('/my-bookings')
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getRentalTypeLabel = (type) => {
  switch (type) {
    case 'self_drive': return 'Thuê tự lái'
    case 'with_driver': return 'Thuê kèm tài'
    case 'driver_only': return 'Thuê tài xế'
    case 'trip': return 'Thuê theo chuyến'
    default: return type
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Đang chờ duyệt',
    confirmed: 'Đã được xác nhận',
    active: 'Đang diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy bỏ',
    disputed: 'Đang khiếu nại'
  }
  return labels[status] || status
}

const handleCancel = async () => {
  if (!confirm('Bạn có chắc chắn muốn hủy chuyến đi này?')) return
  try {
    await api.put(`/bookings/${booking.value._id}/status`, { status: 'cancelled' })
    toast.success('Hủy thành công')
    fetchBooking()
  } catch (error) {
    toast.error('Không thể hủy chuyến đi')
  }
}


const onContractGenerated = (contract) => {
  toast.success('Hợp đồng đã được tạo thành công!')
  // Optionally refresh booking data if needed
}

onMounted(fetchBooking)
</script>
