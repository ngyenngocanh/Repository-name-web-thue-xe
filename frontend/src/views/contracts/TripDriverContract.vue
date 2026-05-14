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
            <h1 class="text-xl font-black text-gray-900 leading-none">Hợp Đồng Tài Xế Theo Chuyến</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dịch vụ đưa đón điểm đến cố định</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="exportPDF" :disabled="loading" class="px-5 py-2.5 bg-gray-900 text-white text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-lg shadow-gray-200">
            <svg v-if="exporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            {{ exporting ? 'Đang tạo PDF...' : 'Tải PDF hợp đồng' }}
          </button>
          <button @click="signContract" :disabled="isSigned || signing" class="px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-300 shadow-lg shadow-blue-100">
            <svg v-if="signing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ isSigned ? 'Xác nhận chữ ký' : 'Ký hợp đồng ngay' }}
          </button>
        </div>
      </div>

      <!-- Contract Paper -->
      <div v-if="loading" class="animate-pulse space-y-8 bg-white rounded-[2.5rem] p-20 shadow-xl border border-gray-100 h-[800px]"></div>
      
      <div v-else-if="booking" class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 md:p-20 contract-paper overflow-hidden relative" ref="contractRef">
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        
        <!-- Header Section -->
        <div class="text-center mb-16 relative">
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1 font-serif">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
          <p class="text-lg font-bold text-gray-800 mb-4 font-serif">Độc lập - Tự do - Hạnh phúc</p>
          <div class="w-32 h-0.5 bg-gray-900 mx-auto mb-12"></div>
          
          <h1 class="text-4xl font-black text-gray-900 uppercase mt-8 mb-2 tracking-tight">Hợp Đồng Tài Xế Theo Chuyến</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Số: {{ contractNumber || booking?._id?.slice(-8).toUpperCase() }}/HĐ-TXC</p>
        </div>

        <div class="space-y-12 text-gray-800">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Party A: Renter -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-blue-200 mr-3"></span> Bên Sử Dụng (Bên A)
              </h3>
              <div class="space-y-3 font-medium">
                <p class="font-black text-gray-900 mb-2">{{ renter?.fullName }}</p>
                <div class="text-sm space-y-2">
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">CCCD:</span>
                    <span>{{ renter?.idCard?.number || renter?.idCard }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Điện thoại:</span>
                    <span>{{ renter?.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Party B: Driver -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-indigo-200 mr-3"></span> Bên Khách Phục Vụ (Bên B)
              </h3>
              <div class="space-y-3 font-medium">
                <p class="font-black text-gray-900 mb-2">{{ driver?.fullName }}</p>
                <div class="text-sm space-y-2">
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Số GPLX:</span>
                    <span>{{ driver?.driverLicense || driver?.drivingLicense?.number }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Điện thoại:</span>
                    <span>{{ driver?.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Trip Timeline -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-blue-600 pl-4">Điều 1: Lộ trình & Thời gian</h3>
            <div class="bg-gray-50/50 p-8 rounded-[2rem] border border-dashed border-gray-200 relative">
               <div class="flex flex-col md:flex-row gap-12 justify-between items-center text-center">
                  <div class="flex-1 space-y-2">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Điểm khởi hành</p>
                    <p class="font-black text-gray-900 text-lg line-clamp-2">{{ booking?.pickupLocation }}</p>
                    <p class="text-xs font-bold text-blue-600 italic">Đón khách vào: {{ booking?.pickupTime }}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <svg class="w-12 h-12 text-blue-200 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  </div>
                  <div class="flex-1 space-y-2">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Điểm kết thúc</p>
                    <p class="font-black text-gray-900 text-lg line-clamp-2">{{ booking?.returnLocation || booking?.dropoffLocation }}</p>
                    <p class="text-xs font-bold text-indigo-600 italic">Dự kiến ngày: {{ formatDate(booking?.startDate) }}</p>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 3: Shared Commitments -->
          <div class="space-y-8">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-amber-600 pl-4">Điều 2: Cam kết dịch vụ trọn gói</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] leading-relaxed">
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.1 Phạm vi trọn gói (All-inclusive)</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Giá cước đã bao gồm chi phí nhiên liệu, lương tài xế, phí cầu đường (BOT).</li>
                     <li>Không phát sinh thêm chi phí nếu hành trình diễn ra đúng lộ trình đã cam kết.</li>
                     <li>Miễn phí chờ đợi trong vòng 30 phút kể từ giờ hẹn.</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.2 Chất lượng chuyến đi</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Đảm bảo đón khách đúng giờ tại địa điểm đã thống nhất.</li>
                     <li>Xe sạch sẽ, đầy đủ thiết bị tiện nghi, máy lạnh hoạt động tốt.</li>
                     <li>Lái xe có thái độ lịch sự, chuyên nghiệp, hỗ trợ hành lý chu đáo.</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.3 Chính sách huỷ & Thay đổi</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Thay đổi lộ trình hoặc điểm dừng: Vui lòng báo trước và thanh toán phụ phí (nếu có).</li>
                     <li>Huỷ chuyến muộn (dưới 12h): Phạt 50% tổng giá trị chuyến đi.</li>
                     <li>Không có mặt tại điểm đón quá 1 giờ: Chuyến đi sẽ tự động huỷ (không hoàn tiền).</li>
                  </ul>
               </div>
               <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="font-black text-gray-900 uppercase mb-3">2.4 An toàn & Bảo hiểm</p>
                  <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                     <li>Bảo hiểm hành khách theo luật định trong suốt thời gian trên xe.</li>
                     <li>Dừng nghỉ đúng điểm quy định hoặc theo yêu cầu hợp lý của khách hàng.</li>
                  </ul>
               </div>
            </div>
          </div>

          <!-- Section 4: Pricing Summary -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-indigo-600 pl-4">Điều 3: Giá trị trọn gói</h3>
            <div class="bg-gray-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700"></div>
               <div class="space-y-6 relative">
                  <div class="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Giá cước trọn chuyến (Fix-price)</p>
                      <span class="text-5xl font-black text-white font-mono tracking-tighter">{{ formatPrice(pricing?.totalAmount) }}</span>
                    </div>
                    <div class="text-right">
                       <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Cọc đã thanh toán</p>
                       <span class="text-2xl font-black text-blue-400 font-mono tracking-tighter">{{ formatPrice(pricing?.deposit) }}</span>
                    </div>
                  </div>
                  
                  <!-- Delivery Fee for Trip -->
                  <div v-if="pricing?.deliveryFee > 0" class="flex justify-between items-center text-blue-300 border-t border-white/5 pt-3">
                    <div class="flex flex-col">
                       <span class="font-bold text-xs uppercase tracking-widest">Phí giao xe đến điểm đón ({{ pricing?.deliveryDistance || 0 }} km)</span>
                       <span class="text-[10px] opacity-70">{{ pricing?.deliveryDistance || 0 }} km × 5,000đ/km</span>
                    </div>
                    <span class="font-black text-xl font-mono">+ {{ formatPrice(pricing?.deliveryFee) }}</span>
                  </div>
                  
                  <div v-if="pricing?.ctvCommission" class="flex justify-between items-center text-green-400 border-t border-white/5 pt-3">
                    <span class="font-bold text-xs uppercase tracking-widest">Hoa hồng CTV (30%)</span>
                    <span class="font-black text-2xl font-mono">{{ formatPrice(pricing.ctvCommission) }}</span>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] font-black uppercase opacity-60">
                    <div class="bg-white/5 p-4 rounded-xl border border-white/5 text-center">Vé cầu đường: Bao gồm</div>
                    <div class="bg-white/5 p-4 rounded-xl border border-white/5 text-center">Nhiên liệu: Bao gồm</div>
                    <div class="bg-white/5 p-4 rounded-xl border border-white/5 text-center">Phí tài xế: Bao gồm</div>
                    <div class="bg-white/5 p-4 rounded-xl border border-white/5 text-center">Service: 5%</div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 4: Signature Area -->
          <div class="pt-24 grid grid-cols-2 gap-20 text-center">
            <div class="space-y-24">
               <p class="font-black uppercase tracking-[0.2em] text-xs opacity-40">Bên sử dụng chữ ký điện tử</p>
               <div v-if="isSigned" class="relative group">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 rotate-12 pointer-events-none">
                     <span class="text-7xl font-black uppercase text-blue-600 border-8 border-blue-600 p-6">XÁC THỰC</span>
                  </div>
                  <p class="font-black text-3xl italic text-gray-900 font-serif decoration-blue-500 decoration-wavy underline underline-offset-8">{{ renter?.fullName }}</p>
               </div>
               <div v-else class="h-20 border-b-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold uppercase italic">Người thuê chưa ký</div>
            </div>
            <div class="space-y-24">
               <p class="font-black uppercase tracking-[0.2em] text-xs opacity-40">Tài xế xác nhận phục vụ</p>
               <div class="relative">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 -rotate-12 pointer-events-none">
                     <span class="text-7xl font-black uppercase text-indigo-600 border-8 border-indigo-600 p-6">SẴN SÀNG</span>
                  </div>
                  <p class="font-black text-3xl italic text-gray-900 font-serif decoration-indigo-500 underline underline-offset-8">{{ driver?.fullName }}</p>
               </div>
            </div>
          </div>
        </div>

        <div class="mt-40 pt-16 border-t border-gray-50 flex justify-between items-center text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
           <span>E-Contract v2.0 | Power by TripDriver Global</span>
           <span>Hash: {{ booking?._id?.toUpperCase() }} / TS: {{ new Date().getTime() }}</span>
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

const renter = computed(() => contractData.value?.renter || {})
const driver = computed(() => contractData.value?.driver || {})
const booking = computed(() => contractData.value?.booking || {})
const pricing = computed(() => booking.value?.pricing || {})

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
    const response = await api.get(`/contracts/booking/${route.params.id || route.query.bookingId}`)
    contractData.value = response.data
    if (['confirmed', 'active', 'completed'].includes(response.data.booking?.status)) {
       isSigned.value = true
    }
  } catch (err) {
    error.value = 'Hợp đồng không khả dụng'
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
    toast.success('Ký hợp đồng thành công!')
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
      filename:     `HopDong_Trip_${renter.value?.fullName || 'Khach'}_${new Date().getTime()}.pdf`,
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
    linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
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
}
</style>
