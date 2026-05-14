<template>
  <div class="min-h-screen bg-gray-50 py-8 no-print">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Actions -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button @click="router.back()" class="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 class="text-xl font-black text-gray-900 leading-none">Hợp Đồng Thuê Xe Kèm Tài Xế</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dịch vụ vận tải hành khách cao cấp</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="exportPDF" :disabled="loading" class="px-5 py-2.5 bg-gray-900 text-white text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-lg shadow-gray-200">
            <svg v-if="exporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            {{ exporting ? 'Đang tạo PDF...' : 'Tải PDF hợp đồng' }}
          </button>
          <button @click="signContract" :disabled="isSigned || signing" class="px-5 py-2.5 bg-green-600 text-white text-xs font-black uppercase rounded-xl hover:bg-green-700 transition-all disabled:bg-gray-300 shadow-lg shadow-green-100">
            <svg v-if="signing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ isSigned ? 'Đã ký điện tử' : 'Ký hợp đồng ngay' }}
          </button>
        </div>
      </div>

      <!-- Contract Paper -->
      <div v-if="loading" class="animate-pulse space-y-8 bg-white rounded-[2.5rem] p-20 shadow-xl border border-gray-100 h-[800px]"></div>
      
      <div v-else-if="booking" class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 md:p-20 contract-paper overflow-hidden relative" ref="contractRef">
        <div class="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        
        <!-- Header Section -->
        <div class="text-center mb-16 relative">
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1 font-serif">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
          <p class="text-lg font-bold text-gray-800 mb-4 font-serif">Độc lập - Tự do - Hạnh phúc</p>
          <div class="w-32 h-0.5 bg-gray-900 mx-auto mb-12"></div>
          
          <h1 class="text-4xl font-black text-gray-900 uppercase mt-8 mb-2 tracking-tight">Hợp Đồng Thuê Xe Kèm Tài Xế</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Số: {{ contractNumber || booking?._id?.slice(-8).toUpperCase() }}/HĐ-TXK</p>
        </div>

        <div class="space-y-12 text-gray-800">
          <!-- Section 1: Parties -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
             <!-- Party A: Owner -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-green-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-green-200 mr-3"></span> Bên Cho Thuê (Bên A)
              </h3>
              <div class="space-y-3 font-medium text-sm">
                <p class="font-black text-gray-900 mb-2 text-base">{{ owner?.businessName || owner?.fullName }}</p>
                <div class="flex justify-between border-b border-gray-200 pb-1">
                  <span class="text-gray-400">Đại diện:</span>
                  <span class="font-bold">{{ owner?.fullName }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-1">
                  <span class="text-gray-400">Điện thoại:</span>
                  <span class="font-bold">{{ owner?.phone }}</span>
                </div>
                <div class="text-xs text-gray-400 italic">{{ owner?.address }}</div>
              </div>
            </div>

            <!-- Party B: Customer -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-indigo-200 mr-3"></span> Bên Thuê (Bên B)
              </h3>
              <div class="space-y-3 font-medium text-sm">
                <p class="font-black text-gray-900 mb-2 text-base">{{ renter?.fullName }}</p>
                <div class="flex justify-between border-b border-gray-200 pb-1">
                  <span class="text-gray-400">Số điện thoại:</span>
                  <span class="font-bold">{{ renter?.phone }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-1">
                  <span class="text-gray-400">CCCD:</span>
                  <span class="font-bold">{{ renter?.idCard?.number || renter?.idCard }}</span>
                </div>
                <div class="text-xs text-gray-400 italic">{{ renter?.address }}</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Technical Info -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div class="space-y-6">
                <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-green-600 pl-4">Thông tin xe phục vụ</h3>
                <div class="p-8 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                   <div class="font-black text-xl text-green-700 uppercase tracking-tight mb-4">{{ car?.brand }} {{ car?.model }}</div>
                   <div class="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div class="bg-white p-3 rounded-xl border shadow-sm">BKS: {{ car?.licensePlate }}</div>
                      <div class="bg-white p-3 rounded-xl border shadow-sm">{{ car?.seats }} chỗ ngồi</div>
                      <div class="bg-white p-3 rounded-xl border shadow-sm">Năm: {{ car?.year }}</div>
                      <div class="bg-white p-3 rounded-xl border shadow-sm">Màu: {{ car?.color }}</div>
                   </div>
                </div>
             </div>
             <div class="space-y-6">
                <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-amber-600 pl-4">Thông tin nhân sự lái xe</h3>
                <div class="p-8 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200 flex items-center gap-6">
                   <div class="flex-1">
                      <p class="font-black text-lg text-gray-900 mb-1">{{ driver?.fullName }}</p>
                      <p class="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Tài xế theo xe</p>
                      <div class="text-xs font-medium space-y-1 opacity-70">
                         <p>GPLX Hạng: {{ driver?.licenseClass || 'B2' }}</p>
                         <p>Kinh nghiệm: {{ driver?.experience || 5 }} năm</p>
                      </div>
                   </div>
                   <img :src="getUserAvatarUrl(driver?._id, driver?.avatar) || '/placeholder-avatar.svg'" class="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white" @error="$event.target.src = '/placeholder-avatar.svg'">
                </div>
             </div>
          </div>

          <!-- Section 3: Schedule -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-gray-900 pl-4">Điều 1: Lịch trình phục vụ</h3>
            <div class="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row gap-8 justify-between">
               <div class="flex-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Thời gian</p>
                  <p class="font-black text-gray-900">Từ {{ formatDate(booking?.startDate) }}</p>
                  <p class="font-black text-gray-900">Đến {{ formatDate(booking?.endDate) }}</p>
                  <p class="text-xs font-bold text-amber-600 italic mt-2">Tổng {{ totalDays }} ngày phục vụ</p>
               </div>
               <div class="flex-[2]">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lộ trình di chuyển</p>
                  <p class="font-bold text-gray-800">Đón: {{ booking?.pickupLocation }}</p>
                  <p class="font-bold text-gray-800">Trả: {{ booking?.returnLocation || booking?.dropoffLocation }}</p>
               </div>
            </div>
          </div>

          <!-- Section 4: Rules & Cancellation -->
          <div class="space-y-8">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-indigo-600 pl-4">Điều 2: Quy định dịch vụ & Trách nhiệm</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.1 Trách nhiệm của Tài xế</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Đảm bảo lái xe an toàn, tuân thủ luật GTĐB Việt Nam.</li>
                     <li>Có thái độ phục vụ lịch sự, trang phục chỉnh tề, đúng giờ.</li>
                     <li>Hỗ trợ khách hàng sắp xếp hành lý và chỉ dẫn địa điểm (nếu biết).</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.2 Quy định huỷ chuyến</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Huỷ trước 24h: Hoàn 100% cọc.</li>
                     <li>Huỷ trước 12h: Hoàn 50% cọc.</li>
                     <li>Huỷ dưới 6h: Không hoàn lại tiền cọc đã thanh toán.</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.3 Chi phí cầu đường & Ăn ở</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Phí cầu đường, bến bãi đỗ xe: Bên thuê chi trả trực tiếp.</li>
                     <li>Dịch vụ bao gồm nhiên liệu. Chỗ nghỉ tài xế: Bên thuê tự lo hoặc thanh toán phụ phí.</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.4 Giải quyết sự cố</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Bên cho thuê bồi thường 100% giá chuyến nếu xe hỏng dọc đường mà không có xe thay thế.</li>
                     <li>Mọi khiếu nại phải được gửi về hệ thống trong 24h sau chuyến đi.</li>
                  </ul>
               </div>
            </div>
          </div>

          <!-- Section 5: Pricing -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-indigo-600 pl-4">Điều 3: Chi phí & Thanh toán</h3>
            <div class="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
               <div class="space-y-5 relative">
                  <div class="flex justify-between items-center opacity-70 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm">Gói thuê (Xe + Tài xế) {{ totalDays }} ngày</span>
                    <span class="font-black text-2xl font-mono">{{ formatPrice(pricing?.totalRentalFee) }}</span>
                  </div>
                  
                  <!-- Delivery Fee for WithDriver -->
                  <div v-if="pricing?.deliveryFee > 0" class="flex justify-between items-center opacity-90 border-b border-white/5 pb-3 text-blue-300">
                    <div class="flex flex-col">
                       <span class="font-bold text-sm">Phí giao xe ({{ pricing?.deliveryDistance || 0 }} km)</span>
                       <span class="text-xs opacity-70">{{ pricing?.deliveryDistance || 0 }} km × 5,000đ/km</span>
                    </div>
                    <span class="font-black text-2xl font-mono">+ {{ formatPrice(pricing?.deliveryFee) }}</span>
                  </div>
                  
                  <div v-if="pricing?.ctvCommission" class="flex justify-between items-center text-green-400 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm uppercase tracking-widest">Hoa hồng CTV (30%)</span>
                    <span class="font-black text-2xl font-mono">{{ formatPrice(pricing.ctvCommission) }}</span>
                  </div>
                  
                  <!-- Service Fee -->
                  <div class="flex justify-between items-center opacity-70 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm">Phí sàn dịch vụ (5%)</span>
                    <span class="font-black text-2xl font-mono">+ {{ formatPrice(pricing?.serviceFee || 0) }}</span>
                  </div>
                  
                  <!-- Options Fee -->
                  <div v-if="pricing?.optionsFee" class="flex justify-between items-center opacity-70 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm">Bảo hiểm & Tùy chọn</span>
                    <span class="font-black text-2xl font-mono">+ {{ formatPrice(pricing?.optionsFee) }}</span>
                  </div>
                  
                  <div class="pt-6">
                    <div class="flex justify-between items-end">
                       <div>
                          <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Tổng cộng (Đã bao gồm VAT)</p>
                          <span class="text-5xl font-black text-green-400 font-mono tracking-tighter">{{ formatPrice(pricing?.totalAmount) }}</span>
                       </div>
                       <div class="text-right">
                          <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Cọc đã trả</p>
                          <span class="font-black text-xl text-white/80 font-mono">- {{ formatPrice(pricing?.deposit) }}</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 5: Signatures -->
          <div class="pt-20 grid grid-cols-2 gap-20 text-center">
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Đại diện bên A</p>
               <div class="relative">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 rotate-12 pointer-events-none">
                     <span class="text-6xl font-black uppercase text-green-600 border-8 border-green-600 p-4">XÁC MINH</span>
                  </div>
                  <p class="font-black text-2xl italic text-gray-900 font-serif decoration-green-500 underline underline-offset-8">{{ owner?.fullName }}</p>
               </div>
            </div>
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Đại diện bên B</p>
               <div v-if="isSigned" class="relative">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 -rotate-12 pointer-events-none">
                     <span class="text-6xl font-black uppercase text-indigo-600 border-8 border-indigo-600 p-4">ĐÃ KÝ</span>
                  </div>
                  <p class="font-black text-2xl italic text-gray-900 font-serif decoration-indigo-500 decoration-wavy underline underline-offset-8">{{ renter?.fullName }}</p>
               </div>
               <div v-else class="h-20 border-b-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold uppercase italic">Chờ ký điện tử</div>
            </div>
          </div>
        </div>

        <div class="mt-32 pt-12 border-t border-gray-50 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] space-y-2">
           <p>CarRental Luxury Service - Đối tác tin cậy của bạn</p>
           <p>Mã hóa hợp đồng: {{ booking?._id?.toUpperCase() }} / TIME: {{ new Date().toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import html2pdf from 'html2pdf.js'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const contractRef = ref(null)

const loading = ref(true)
const exporting = ref(false)
const error = ref(null)
const contractData = ref({})
const contractNumber = ref('')
const signing = ref(false)
const isSigned = ref(false)

const owner = computed(() => contractData.value?.owner || {})
const renter = computed(() => contractData.value?.renter || {})
const car = computed(() => contractData.value?.car || {})
const driver = computed(() => contractData.value?.driver || {})
const booking = computed(() => contractData.value?.booking || {})
const pricing = computed(() => booking.value?.pricing || {})
const paymentMethod = computed(() => booking.value?.payment?.method || '')

const totalDays = computed(() => {
  if (booking.value?.duration?.days) return booking.value.duration.days
  if (booking.value?.startDate && booking.value?.endDate) {
    return Math.ceil((new Date(booking.value.endDate) - new Date(booking.value.startDate)) / (1000 * 60 * 60 * 24))
  }
  return 0
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

const fetchContractData = async () => {
  try {
    loading.value = true
    const response = await api.get(`/contracts/booking/${route.params.id}`)
    contractData.value = response.data
    if (['confirmed', 'active', 'completed'].includes(response.data.booking?.status)) {
       isSigned.value = true
    }
  } catch (err) {
    error.value = 'Không thể tải hợp đồng'
  } finally {
    loading.value = false
  }
}

const signContract = async () => {
  try {
    signing.value = true
    await api.post(`/contracts/sign/${route.params.id}`, {
      signature: 'digital-signature-' + Date.now(),
      signedAt: new Date().toISOString()
    })
    isSigned.value = true
    toast.success('Ký kết thành công!')
  } catch (err) {
    toast.error('Lỗi khi ký hợp đồng')
  } finally {
    signing.value = false
  }
}

const exportPDF = async () => {
  if (!contractRef.value) return
  try {
    exporting.value = true
    const element = contractRef.value
    const opt = {
      margin:       10,
      filename:     `HopDong_XeKemTaiXe_${renter.value?.fullName || 'Khach'}_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save()
    toast.success('Đã tải xuống PDF hợp đồng!')
  } catch (err) {
    console.error('Export error:', err)
    toast.error('Lỗi khi tải PDF hợp đồng')
  } finally {
    exporting.value = false
  }
}
onMounted(fetchContractData)
</script>

<style scoped>
.contract-paper {
  background-image: 
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}
.font-mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}
@media print {
  .no-print { display: none !important; }
  .contract-paper {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  body { background: white !important; }
}
</style>
