<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button 
        @click="router.back()" 
        class="flex items-center text-sm font-bold text-gray-400 hover:text-amber-600 mb-6 transition-colors group"
      >
        <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </div>
        Quay lại danh sách
      </button>

      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="h-64 bg-gray-200 rounded-[2.5rem]"></div>
      </div>

      <div v-else-if="booking" class="space-y-8">
        <!-- Status Header Card -->
        <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center">
            <div class="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mr-4 border border-amber-100">
               <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã đơn đặt #{{ booking._id.slice(-8) }}</p>
              <h2 class="text-2xl font-black text-gray-900 leading-none">{{ getStatusLabel(booking.status) }}</h2>
              <p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-2">Dịch vụ: Thuê Tài xế Riêng</p>
            </div>
          </div>
          <div class="flex gap-3">
             <button v-if="canCancel" @click="handleCancel" class="px-6 py-3 bg-red-50 text-red-600 font-black rounded-xl text-xs uppercase hover:bg-red-100 transition-all">Hủy đơn</button>
             <button v-if="canComplete" @click="handleComplete" class="px-8 py-3 bg-amber-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-amber-200 hover:scale-105 transition-all">Hoàn thành & Tất toán</button>
             <button v-if="canReview && !hasReviewed" @click="handleReview" class="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-indigo-200 hover:scale-105 transition-all">Đánh giá tài xế</button>
          </div>
        </div>

        <!-- Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <!-- Main Content -->
          <div class="space-y-8">
            <!-- Driver & Trip Type Info -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 right-0 p-6 opacity-5">
                <svg class="w-32 h-32 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              </div>
              
              <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <span class="w-1.5 h-6 bg-amber-600 rounded-full mr-3"></span>
                 Thông tin Tài xế & Hành trình
              </h3>
              
              <div v-if="booking.driver" class="flex items-center gap-6 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 mb-8">
                 <img :src="booking.driver.avatar || '/placeholder-avatar.svg'" class="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm">
                 <div class="flex-1">
                    <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Tài xế phụ trách</p>
                    <h4 class="text-lg font-black text-gray-900">{{ booking.driver.fullName }}</h4>
                    <div class="flex gap-4 mt-1 font-bold text-xs text-gray-500">
                       <span>📞 {{ booking.driver.phone || 'N/A' }}</span>
                    </div>
                 </div>
                 <a :href="'tel:' + booking.driver.phone" class="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-200 cursor-pointer hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.87 4.87l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C10.12 18 2 9.88 2 2V3z"/></svg>
                 </a>
              </div>

              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="p-4 bg-gray-50 rounded-2xl">
                     <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Loại hình</p>
                     <p class="font-bold text-gray-900 uppercase text-xs">{{ getTripTypeLabel(booking.pricing?.tripType || 'personal') }}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-2xl">
                     <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Quãng đường</p>
                     <p class="font-bold text-gray-900">{{ booking.pricing?.distance || 0 }} KM</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-2xl">
                     <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Thời gian</p>
                     <p class="font-bold text-gray-900">{{ booking.mode === 'hourly' ? 'Theo giờ' : 'Theo ngày' }}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-2xl">
                     <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Khách</p>
                     <p class="font-bold text-gray-900">{{ booking.passengerCount || 1 }} Người</p>
                  </div>
              </div>
            </div>

            <!-- Schedule & Location -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
               <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <span class="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                 Lịch trình đón trả
              </h3>
              <div class="space-y-8 relative">
                 <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-red-500 opacity-20"></div>
                 
                 <div class="relative pl-8">
                    <div class="absolute -left-[4px] top-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm font-bold"></div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Điểm đón</p>
                    <p class="font-black text-gray-900 mt-2 text-lg">{{ booking.pickupLocation }}</p>
                    <p class="text-xs font-bold text-gray-500 mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-gray-600 mr-2 border border-gray-200">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {{ formatDate(booking.startDate) }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {{ booking.pickupTime }}
                      </span>
                    </p>
                 </div>
                 
                 <div class="relative pl-8">
                    <div class="absolute -left-[4px] top-0 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm font-bold"></div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Điểm trả</p>
                    <p class="font-black text-gray-900 mt-2 text-lg">{{ booking.returnLocation }}</p>
                    <p class="text-xs font-bold text-gray-500 mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-gray-600 mr-2 border border-gray-200">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {{ formatDate(booking.endDate) }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {{ booking.returnTime }}
                      </span>
                    </p>
                 </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center">
                  <span class="w-1.5 h-6 bg-green-600 rounded-full mr-3"></span>
                  Thông tin hành khách
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Người đại diện</p>
                      <p class="font-black text-gray-900 text-lg">{{ booking.contactInfo?.name || booking.renter?.fullName }}</p>
                   </div>
                   <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p class="text-[10px] text-gray-400 font-black uppercase mb-1">Số điện thoại liên hệ</p>
                      <p class="font-black text-gray-900 text-lg">{{ booking.contactInfo?.phone || booking.renter?.phone }}</p>
                   </div>
                </div>
                <div v-if="booking.notes" class="mt-6 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                   <p class="text-[10px] text-amber-700 font-black uppercase mb-2">Ghi chú từ khách hàng</p>
                   <p class="text-sm font-bold text-amber-900 italic">"{{ booking.notes }}"</p>
                </div>
            </div>
          </div>

          <!-- Sidebar: Payment Summary -->
          <div class="space-y-8">
            <div class="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-gray-200/50 relative overflow-hidden">
               <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
               
               <h3 class="text-xl font-black mb-8 flex items-center opacity-90 border-b border-white/10 pb-4">
                  Chi tiết Thanh toán
               </h3>

               <div class="space-y-5">
                  <div class="flex justify-between items-center text-sm opacity-80">
                    <span class="font-bold">Tiền thuê tài xế</span>
                    <span class="font-black font-mono">{{ formatPrice(booking.pricing?.totalRentalFee || 0) }}</span>
                  </div>

                  <div v-if="booking.pricing?.extraFee" class="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                    <div class="flex justify-between items-center text-xs text-amber-400">
                      <span class="font-black uppercase tracking-widest">Phụ phí lộ trình</span>
                      <span class="font-black">+ {{ formatPrice(booking.pricing.extraFee) }}</span>
                    </div>
                    <p class="text-[9px] font-bold opacity-50 uppercase tracking-tighter">* Bao gồm phí lưu trú/đi xa/ngoại tỉnh</p>
                  </div>

                  <div v-if="booking.pricing?.optionsFee" class="flex justify-between items-center text-sm opacity-80">
                    <span class="font-bold">Tùy chọn bổ sung</span>
                    <span class="font-black font-mono">+ {{ formatPrice(booking.pricing.optionsFee) }}</span>
                  </div>

                  <div class="flex justify-between items-center text-sm opacity-80">
                    <span class="font-bold">Phí nền tảng (5%)</span>
                    <span class="font-black font-mono">+ {{ formatPrice(booking.pricing?.serviceFee || 0) }}</span>
                  </div>

                  <div class="pt-6 border-t border-white/20">
                    <div class="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tổng cộng hóa đơn</p>
                        <span class="text-3xl font-black text-amber-500 font-mono">{{ formatPrice(booking.pricing?.totalAmount || 0) }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="booking.pricing?.deposit" class="flex justify-between items-center p-4 border-2 border-dashed border-white/20 rounded-2xl opacity-60 bg-white/5">
                    <span class="text-[10px] font-black uppercase tracking-widest text-green-400">Tiền cọc đã trả</span>
                    <span class="font-black text-green-400">- {{ formatPrice(booking.pricing.deposit) }}</span>
                  </div>
                  
                  <div class="pt-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-widest opacity-50">Thanh toán qua</p>
                      <p class="text-xs font-black uppercase tracking-wider">{{ booking.payment?.method === 'cash' ? 'Tiền mặt' : booking.payment?.method }}</p>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Contract Display -->
            <div class="mt-8">
              <ContractDisplay 
                v-if="booking"
                :booking="booking" 
              />
            </div>

            <!-- Warning Box -->
            <div class="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex gap-4 mt-8">
              <svg class="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p class="text-xs font-black text-red-900 uppercase tracking-widest mb-1">Lưu ý quan trọng</p>
                <p class="text-[10px] font-bold text-red-700 leading-relaxed">Vui lòng thanh toán số tiền còn lại sau khi hoàn thành chuyến đi trực tiếp cho hệ thống hoặc tài xế tùy theo thỏa thuận.</p>
              </div>
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Đang chờ xác nhận',
    confirmed: 'Đã xác nhận',
    active: 'Đang trong chuyến',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    disputed: 'Đang khiếu nại'
  }
  return labels[status] || status
}

const getTripTypeLabel = (type) => {
  const types = {
    personal: 'Cá nhân',
    business: 'Công tác',
    tourism: 'Du lịch',
    airport: 'Sân bay'
  }
  return types[type] || 'Cá nhân'
}

const canCancel = computed(() => {
  return booking.value && ['pending', 'confirmed'].includes(booking.value.status)
})

const canComplete = computed(() => {
  return booking.value && ['active', 'confirmed'].includes(booking.value.status)
})

const canReview = computed(() => {
  return booking.value && booking.value.status === 'completed'
})

const handleCancel = async () => {
  const reason = prompt('Vui lòng nhập lý do hủy chuyến:')
  if (reason === null) return
  
  try {
    const response = await api.put(`/bookings/${booking.value._id}/status`, {
      status: 'cancelled',
      reason
    })
    if (response.data) {
      toast.success('Đã hủy chuyến đi thành công')
      await fetchBooking()
    }
  } catch (error) {
    toast.error('Có lỗi xảy ra khi hủy chuyến đi')
  }
}

const handleComplete = async () => {
  if (!confirm('Bạn xác nhận chuyến đi đã hoàn thành và tài xế đã phục vụ tốt?')) return
  
  try {
    const response = await api.put(`/bookings/${booking.value._id}/status`, {
      status: 'completed'
    })
    if (response.data) {
      toast.success('Chúc mừng! Chuyến đi đã hoàn tất tốt đẹp.')
      await fetchBooking()
    }
  } catch (error) {
    toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
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
  } catch (error) {
    toast.error('Không tìm thấy thông tin chuyến đi')
    router.back()
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchBooking()
})
</script>

<style scoped>
.font-mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}
</style>
