<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Steps Indicator -->
      <div class="flex items-center justify-center mb-12">
        <div class="flex items-center space-x-4">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold">1</div>
          <span class="text-sm font-bold text-gray-500">Đặt xe</span>
          <div class="w-12 h-px bg-gray-300"></div>
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold ring-4 ring-blue-100">2</div>
          <span class="text-sm font-bold text-gray-900">Thanh toán</span>
          <div class="w-12 h-px bg-gray-300"></div>
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-white font-bold">3</div>
          <span class="text-sm font-bold text-gray-500">Hoàn tất</span>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-500 font-bold">Đang tải thông tin đơn hàng...</p>
      </div>

      <div v-else-if="booking" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Payment Selection Card -->
          <div class="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <h2 class="text-2xl font-black text-gray-900 mb-8 flex items-center">
              <span class="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
              Chọn phương thức thanh toán
            </h2>

            <div class="grid grid-cols-1 gap-4" v-if="!bankTransferQr">
              <!-- VNPay -->
              <button
                @click="paymentMethod = 'vnpay'"
                :class="paymentMethod === 'vnpay' ? 'border-red-500 bg-gradient-to-br from-red-50 to-white shadow-lg shadow-red-100/50 ring-4 ring-red-50 scale-[1.02] z-10' : 'border-gray-100 hover:border-red-300 hover:shadow-md bg-white hover:-translate-y-1'"
                class="relative p-6 border-2 rounded-3xl transition-all duration-300 ease-out text-left flex items-center justify-between group overflow-hidden"
              >
                <!-- Active Indicator Background Shine -->
                <div v-if="paymentMethod === 'vnpay'" class="absolute -right-12 -top-12 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-60"></div>
                
                <div class="flex items-center space-x-4 relative z-10">
                  <div :class="paymentMethod === 'vnpay' ? 'border-red-200 shadow-md scale-105' : 'border-gray-100 shadow-sm'" class="w-16 h-16 flex-none bg-white rounded-2xl border flex items-center justify-center p-2 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 overflow-hidden">
                    <img src="/payments/vnpay.svg" alt="VNPay" class="w-full h-auto object-contain scale-[1.2] group-hover:scale-[1.3] transition-transform duration-300 drop-shadow-sm" loading="lazy" />
                  </div>
                  <div>
                    <p :class="paymentMethod === 'vnpay' ? 'text-red-700' : 'text-gray-900'" class="font-black text-lg transition-colors">Ví điện tử VNPay</p>
                    <p class="text-sm text-gray-500 mt-0.5">Thanh toán qua mã QR hoặc thẻ ngân hàng</p>
                  </div>
                </div>
                <div :class="paymentMethod === 'vnpay' ? 'bg-red-500 ring-4 ring-red-100 scale-110' : 'bg-gray-200'" class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10">
                  <div class="w-2.5 h-2.5 bg-white rounded-full transition-transform duration-300" :class="paymentMethod === 'vnpay' ? 'scale-100' : 'scale-0'"></div>
                </div>
              </button>

              <!-- PayOS -->
              <button
                @click="paymentMethod = 'payos'"
                :class="paymentMethod === 'payos' ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50 scale-[1.02] z-10' : 'border-gray-100 hover:border-blue-300 hover:shadow-md bg-white hover:-translate-y-1'"
                class="relative p-6 border-2 rounded-3xl transition-all duration-300 ease-out text-left flex items-center justify-between group overflow-hidden"
              >
                <!-- Active Indicator Background Shine -->
                <div v-if="paymentMethod === 'payos'" class="absolute -right-12 -top-12 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                
                <div class="flex items-center space-x-4 relative z-10">
                  <div :class="paymentMethod === 'payos' ? 'border-blue-200 shadow-md scale-105' : 'border-gray-100 shadow-sm'" class="w-16 h-16 flex-none bg-white rounded-2xl border flex items-center justify-center p-2 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 overflow-hidden">
                    <img src="/payments/payos.svg" alt="PayOS" class="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" loading="lazy" />
                  </div>
                  <div>
                    <p :class="paymentMethod === 'payos' ? 'text-blue-800' : 'text-gray-900'" class="font-black text-lg transition-colors">Cổng thanh toán PayOS</p>
                    <p class="text-sm text-gray-500 mt-0.5">Thanh toán qua mã QR ngân hàng (VietQR)</p>
                  </div>
                </div>
                <div :class="paymentMethod === 'payos' ? 'bg-blue-600 ring-4 ring-blue-100 scale-110' : 'bg-gray-200'" class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10">
                  <div class="w-2.5 h-2.5 bg-white rounded-full transition-transform duration-300" :class="paymentMethod === 'payos' ? 'scale-100' : 'scale-0'"></div>
                </div>
              </button>

              <!-- Bank Transfer -->
              <button
                @click="paymentMethod = 'bank_transfer'"
                :class="paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/50 ring-4 ring-blue-50 scale-[1.02] z-10' : 'border-gray-100 hover:border-blue-300 hover:shadow-md bg-white hover:-translate-y-1'"
                class="relative p-6 border-2 rounded-3xl transition-all duration-300 ease-out text-left flex items-center justify-between group overflow-hidden"
              >
                <!-- Active Indicator Background Shine -->
                <div v-if="paymentMethod === 'bank_transfer'" class="absolute -right-12 -top-12 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                
                <div class="flex items-center space-x-4 relative z-10">
                  <div :class="paymentMethod === 'bank_transfer' ? 'border-blue-200 shadow-md scale-105 text-blue-600' : 'border-gray-100 shadow-sm text-gray-500'" class="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center p-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 group-hover:text-blue-500">
                    <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
                  </div>
                  <div>
                    <p :class="paymentMethod === 'bank_transfer' ? 'text-blue-700' : 'text-gray-900'" class="font-black text-lg transition-colors">Chuyển khoản</p>
                    <p class="text-sm text-gray-500 mt-0.5">Quét mã QR để thanh toán nhanh chóng</p>
                  </div>
                </div>
                <div :class="paymentMethod === 'bank_transfer' ? 'bg-blue-500 ring-4 ring-blue-100 scale-110' : 'bg-gray-200'" class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10">
                  <div class="w-2.5 h-2.5 bg-white rounded-full transition-transform duration-300" :class="paymentMethod === 'bank_transfer' ? 'scale-100' : 'scale-0'"></div>
                </div>
              </button>

              <!-- Cash -->
              <button
                @click="paymentMethod = 'cash'"
                :class="paymentMethod === 'cash' ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg shadow-emerald-100/50 ring-4 ring-emerald-50 scale-[1.02] z-10' : 'border-gray-100 hover:border-emerald-300 hover:shadow-md bg-white hover:-translate-y-1'"
                class="relative p-6 border-2 rounded-3xl transition-all duration-300 ease-out text-left flex items-center justify-between group overflow-hidden"
              >
                <!-- Active Indicator Background Shine -->
                <div v-if="paymentMethod === 'cash'" class="absolute -right-12 -top-12 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
                
                <div class="flex items-center space-x-4 relative z-10">
                  <div :class="paymentMethod === 'cash' ? 'border-emerald-200 shadow-md scale-105 text-emerald-600' : 'border-gray-100 shadow-sm text-gray-500'" class="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center p-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 group-hover:text-emerald-500">
                    <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div>
                    <p :class="paymentMethod === 'cash' ? 'text-emerald-700' : 'text-gray-900'" class="font-black text-lg transition-colors">Tiền mặt</p>
                    <p class="text-sm text-gray-500 mt-0.5">Thanh toán trực tiếp khi nhận xe</p>
                  </div>
                </div>
                <div :class="paymentMethod === 'cash' ? 'bg-emerald-500 ring-4 ring-emerald-100 scale-110' : 'bg-gray-200'" class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10">
                  <div class="w-2.5 h-2.5 bg-white rounded-full transition-transform duration-300" :class="paymentMethod === 'cash' ? 'scale-100' : 'scale-0'"></div>
                </div>
              </button>
            </div>

            <!-- VietQR Display -->
            <div v-else class="flex flex-col items-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
               <div class="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 shadow-inner flex flex-col items-center text-center">
                  <h3 class="text-xl font-black text-blue-900 uppercase tracking-widest mb-6">Quét mã VietQR</h3>
                  <div class="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 relative group">
                     <img :src="bankTransferQr" alt="VietQR" class="w-64 h-64 object-contain transition-transform group-hover:scale-110">
                  </div>
                  <div class="mt-8 space-y-4">
                     <p class="text-sm font-bold text-gray-700">Mở app ngân hàng để quét mã QR</p>
                     
                     <div class="bg-gray-100 p-4 rounded-2xl text-left space-y-2 border border-gray-200">
                        <div class="flex justify-between items-center">
                           <span class="text-xs text-gray-500 font-bold uppercase">Số tài khoản</span>
                           <div class="flex items-center gap-2">
                              <span class="font-black text-gray-900">{{ bankAccountNo }}</span>
                              <button @click="copyToClipboard(bankAccountNo)" class="p-1 hover:bg-gray-200 rounded text-blue-600 transition-colors">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                              </button>
                           </div>
                        </div>
                        <div class="flex justify-between items-center">
                           <span class="text-xs text-gray-500 font-bold uppercase">Nội dung</span>
                           <div class="flex items-center gap-2">
                              <span class="font-black text-blue-600">Thanh toan don {{ booking._id.slice(-8).toUpperCase() }}</span>
                              <button @click="copyToClipboard('Thanh toan don ' + booking._id.slice(-8).toUpperCase())" class="p-1 hover:bg-gray-200 rounded text-blue-600 transition-colors">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                              </button>
                           </div>
                        </div>
                     </div>

                     <p class="text-[10px] text-gray-400 font-medium italic underline decoration-blue-200 decoration-2 underline-offset-4">Hệ thống sẽ tự động xác nhận sau khi nhận được tiền</p>
                  </div>
               </div>
               
               <div class="flex gap-4">
                  <button @click="bankTransferQr = null" class="px-8 py-3 bg-gray-100 text-gray-600 font-black rounded-2xl text-xs uppercase hover:bg-gray-200 transition-all">Quay lại</button>
                  <button @click="router.push(`/bookings/${booking._id}`)" class="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase shadow-xl shadow-blue-200 hover:scale-105 transition-all">Tôi đã chuyển xong</button>
               </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Summary -->
        <div class="space-y-6">
          <div class="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div v-if="!bankTransferQr">
                <h3 class="text-lg font-black uppercase tracking-widest text-blue-400 mb-6 font-mono">Tóm tắt đơn hàng</h3>
                
                <div class="space-y-4 mb-8" v-if="booking">
                  <div class="flex justify-between text-sm opacity-70">
                    <span>Mã đặt xe</span>
                    <span class="font-bold">#{{ booking._id.slice(-8).toUpperCase() }}</span>
                  </div>
                  <div class="flex justify-between text-sm opacity-70">
                    <span>Dịch vụ</span>
                    <span class="font-bold">{{ getServiceLabel(booking.rentalType) }}</span>
                  </div>
                  <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span class="text-lg font-bold">Tiền cần thanh toán</span>
                    <span class="text-2xl font-black text-blue-400">{{ formatPrice(booking.pricing?.deposit || 0) }}</span>
                  </div>
                </div>

                <button
                  @click="processPayment"
                  :disabled="processing"
                  class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <svg v-if="processing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ processing ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN NGAY' }}
                </button>
                
                <p class="text-[10px] text-center mt-4 opacity-40 font-bold uppercase tracking-widest">Giao dịch an toàn & bảo mật</p>
             </div>
          </div>

          <div class="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center" v-if="booking.car">
             <div class="bg-gray-50 p-4 rounded-3xl mb-4 w-full aspect-video flex items-center justify-center overflow-hidden">
                <img v-if="booking.car.images?.[0]" :src="booking.car.images[0].url" class="w-full h-full object-cover rounded-2xl" />
                <div v-else class="text-gray-300">
                   <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
             </div>
             <p class="font-black text-gray-900 leading-tight mb-1">
                {{ booking.car.brand }} {{ booking.car.model }}
             </p>
             <p class="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                {{ booking.car.location?.city || 'Hồ Chí Minh' }}
             </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const booking = ref(null)
const loading = ref(true)
const processing = ref(false)
const paymentMethod = ref('vnpay')
const bankTransferQr = ref(null)
const bankAccountNo = ref('8999921102005') // Matching .env for convenience in display

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  toast.success('Đã sao chép vào bộ nhớ tạm')
}

const fetchBooking = async () => {
  try {
    loading.value = true
    const response = await api.get(`/bookings/${route.params.id}`)
    booking.value = response.data.booking || response.data
    // Default payment method if already set in booking
    if (booking.value.payment?.method && booking.value.payment.method !== 'cash') {
        paymentMethod.value = booking.value.payment.method
    }
  } catch (error) {
    console.error('Fetch booking error:', error)
    toast.error('Không tìm thấy thông tin chuyến đi')
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

const getServiceLabel = (type) => {
  const types = {
    'self-drive': 'Thuê xe tự lái',
    'with-driver': 'Thuê xe kèm tài xế',
    'trip': 'Thuê xe theo chuyến',
    'solo-driver': 'Thuê tài xế riêng'
  }
  return types[type] || 'Dịch vụ thuê xe'
}

const processPayment = async () => {
  try {
    processing.value = true
    
    // Update payment method and finalize choice
    await api.put(`/bookings/${booking.value._id}/finalize`, {
        payment: { 
            method: paymentMethod.value 
        }
    })

    if (paymentMethod.value === 'cash') {
      toast.success('Xác nhận thanh toán bằng tiền mặt thành công!')
      router.push(`/bookings/${booking.value._id}`)
      return
    }
    
    if (paymentMethod.value === 'bank_transfer') {
      const amount = booking.value.pricing?.deposit || booking.value.pricing?.totalAmount || 100000;
      const qrRes = await api.get(`/vietqr/generate?amount=${amount}&bookingId=${booking.value._id}`);
      if (qrRes.data.success) {
         bankTransferQr.value = qrRes.data.qrUrl;
         toast.info('Vui lòng quét mã QR để chuyển khoản');
      } else {
         toast.error('Không thể tạo mã QR, vui lòng liên hệ hỗ trợ');
      }
      return
    }

    const payableAmount = booking.value.pricing?.deposit || booking.value.pricing?.totalAmount || 100000

    if (paymentMethod.value === 'vnpay') {
      const response = await api.post('/vnpay/create_payment_url', {
        bookingId: booking.value._id,
        amount: payableAmount
      })
      if (response.data.success) {
        window.location.href = response.data.vnpUrl
      } else {
        toast.error(response.data.message || 'Lỗi kết nối VNPay')
      }
    } else if (paymentMethod.value === 'payos') {
      const response = await api.post('/payos/create-payment-link', {
        bookingId: booking.value._id,
        amount: payableAmount
      })
      if (response.data.success) {
        window.location.href = response.data.checkoutUrl
      } else {
        toast.error(response.data.message || 'Lỗi kết nối PayOS')
      }
    }
  } catch (error) {
    console.error('Payment error:', error)
    const msg = error.response?.data?.message || 'Lỗi khi khởi tạo thanh toán. Vui lòng thử lại.'
    toast.error(msg)
  } finally {
    processing.value = false
  }
}

onMounted(fetchBooking)
</script>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
