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
            <h1 class="text-xl font-black text-gray-900 leading-none">Hợp Đồng Cho Thuê Xe Tự Lái</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dịch vụ thuê xe không người lái</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="exportPDF" :disabled="loading" class="px-5 py-2.5 bg-gray-900 text-white text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-lg shadow-gray-200">
            <svg v-if="exporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            {{ exporting ? 'Đang tạo PDF...' : 'Tải PDF hợp đồng' }}
          </button>
          <button @click="signContract" :disabled="isSigned || signing" class="px-5 py-2.5 bg-primary-600 text-white text-xs font-black uppercase rounded-xl hover:bg-primary-700 transition-all disabled:bg-gray-300 shadow-lg shadow-primary-100">
            <svg v-if="signing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ isSigned ? 'Hợp đồng đã ký' : 'Ký hợp đồng điện tử' }}
          </button>
        </div>
      </div>

      <!-- Contract Paper -->
      <div v-if="loading" class="animate-pulse space-y-8 bg-white rounded-[2.5rem] p-20 shadow-xl border border-gray-100 h-[800px]"></div>
      
      <div v-else-if="booking" class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 md:p-20 contract-paper overflow-hidden relative" ref="contractRef">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        
        <!-- Header Section -->
        <div class="text-center mb-16 relative">
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1 font-serif">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
          <p class="text-lg font-bold text-gray-800 mb-4 font-serif">Độc lập - Tự do - Hạnh phúc</p>
          <div class="w-32 h-0.5 bg-gray-900 mx-auto mb-12"></div>
          
          <h1 class="text-4xl font-black text-gray-900 uppercase mt-8 mb-2 tracking-tight">Hợp Đồng Thuê Xe Tự Lái</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Số: {{ contractNumber || booking?._id?.slice(-8).toUpperCase() }}/HĐ-TXL</p>
        </div>

        <div class="space-y-12 text-gray-800">
          <!-- Section 1: Parties -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Party A: Owner -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-primary-200 mr-3"></span> Bên Cho Thuê (Bên A)
              </h3>
              <div class="space-y-3 font-medium">
                <p class="font-black text-gray-900 mb-2">{{ owner?.businessName || owner?.fullName }}</p>
                <div class="text-sm space-y-2">
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Đại diện:</span>
                    <span>{{ owner?.fullName }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">CCCD:</span>
                    <span>{{ owner?.idCard?.number || owner?.idCard }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Điện thoại:</span>
                    <span>{{ owner?.phone }}</span>
                  </div>
                  <div class="text-xs text-gray-400 mt-2 line-clamp-2 italic">{{ owner?.address }}</div>
                </div>
              </div>
            </div>

            <!-- Party B: Renter -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-indigo-200 mr-3"></span> Bên Thuê (Bên B)
              </h3>
              <div class="space-y-3 font-medium">
                <p class="font-black text-gray-900 mb-2">{{ renter?.fullName }}</p>
                <div class="text-sm space-y-2">
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">CCCD:</span>
                    <span>{{ renter?.idCard?.number || renter?.idCard }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">GPLX số:</span>
                    <span>{{ renter?.driverLicense || renter?.drivingLicense?.number }}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xs text-gray-400">Điện thoại:</span>
                    <span>{{ renter?.phone }}</span>
                  </div>
                  <div class="text-xs text-gray-400 mt-2 line-clamp-2 italic">{{ renter?.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Vehicle & Duration -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-primary-600 pl-4">Điều 1: Thông tin phương tiện & Thời hạn</h3>
            <div class="bg-gray-50/50 p-8 rounded-[2rem] border border-dashed border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
               <div class="space-y-3">
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phương tiện chi tiết</span>
                  <div class="font-black text-xl text-primary-600 uppercase tracking-tight">{{ car?.brand }} {{ car?.model }}</div>
                  <div class="grid grid-cols-2 gap-4 text-sm font-bold text-gray-700">
                    <span class="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">BS: {{ car?.licensePlate }}</span>
                    <span class="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">Năm: {{ car?.year }}</span>
                  </div>
               </div>
               <div class="space-y-3">
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn thuê</span>
                  <div class="font-black text-lg text-gray-900">Từ {{ formatDate(booking?.startDate) }}</div>
                  <div class="font-black text-lg text-gray-900">Đến {{ formatDate(booking?.endDate) }}</div>
                  <p class="text-xs font-bold text-amber-600">Tổng cộng: {{ totalDays }} ngày</p>
               </div>
            </div>
          </div>

          <!-- Section 3: Detailed Terms & Responsibilities -->
          <div class="space-y-8">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-amber-600 pl-4">Điều 2: Các điều khoản & Trách nhiệm dân sự</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] leading-relaxed">
               <div class="space-y-4">
                  <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                     <p class="font-black text-gray-900 uppercase mb-2">2.1 Nghĩa vụ bên cho thuê (Bên A)</p>
                     <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                        <li>Giao xe đúng tình trạng kĩ thuật, nội thất sạch sẽ, đầy đủ xăng dầu.</li>
                        <li>Cung cấp bản sao giấy đăng ký xe, bảo hiểm TNDS bắt buộc còn hiệu lực.</li>
                        <li>Hỗ trợ xử lý sự cố kĩ thuật 24/7 trong suốt quá trình thuê.</li>
                     </ul>
                  </div>
                  <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                     <p class="font-black text-gray-900 uppercase mb-2">2.2 Nghĩa vụ bên thuê (Bên B)</p>
                     <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                        <li>Sử dụng xe đúng mục đích, không cho người khác thuê lại hoặc cầm cố.</li>
                        <li>Chi trả toàn bộ phí cầu đường, bến bãi, xăng dầu và tiền phạt vi phạm GT.</li>
                        <li>Kiểm tra kĩ tình trạng xe trước khi nhận và trả xe đúng thời hạn.</li>
                     </ul>
                  </div>
               </div>
               <div class="space-y-4">
                  <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                     <p class="font-black text-gray-900 uppercase mb-2">2.3 Quy định phạt vi phạm</p>
                     <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                        <li>Trả xe muộn 1-3 giờ: Phụ thu 50.000đ - 100.000đ/giờ tùy loại xe.</li>
                        <li>Trả xe muộn trên 6 giờ: Tính thêm 1 ngày tiền thuê xe.</li>
                        <li>Xe bị bẩn/ám mùi (thuốc lá, hải sản): Phạt 300.000đ - 500.000đ phí vệ sinh.</li>
                     </ul>
                  </div>
                  <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                     <p class="font-black text-gray-900 uppercase mb-2">2.4 Bảo hiểm & Va chạm</p>
                     <ul class="space-y-1.5 opacity-80 list-disc pl-4 font-medium">
                        <li>Bên B chịu 100% chi phí sửa chữa nếu xảy ra va chạm do lỗi chủ quan.</li>
                        <li>Trường hợp có bảo hiểm thân vỏ: Bên B chịu phí miễn thường (2-5 triệu VNĐ).</li>
                        <li>Đền bù thu nhập nhỡ (Opportunity cost) cho chủ xe trong thời gian dừng chờ sửa chữa.</li>
                     </ul>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 4: Pricing -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-indigo-600 pl-4">Điều 3: Giá trị & Phương thức thanh toán</h3>
            <div class="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
               <div class="space-y-5 relative">
                  <div class="flex justify-between items-center opacity-70 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm">Giá thuê chính thực tế ({{ totalDays }} ngày)</span>
                    <span class="font-black text-2xl font-mono">{{ formatPrice(pricing?.totalRentalFee) }}</span>
                  </div>
                  
                  <!-- Delivery Fee -->
                  <div v-if="pricing?.deliveryFee > 0" class="flex justify-between items-center opacity-90 border-b border-white/5 pb-3 text-blue-300">
                    <div class="flex flex-col">
                       <span class="font-bold text-sm">Phí giao xe ({{ pricing?.deliveryDistance || 0 }} km)</span>
                       <span class="text-xs opacity-70">{{ pricing?.deliveryDistance || 0 }} km × 5,000đ/km</span>
                    </div>
                    <span class="font-black text-2xl font-mono">+ {{ formatPrice(pricing?.deliveryFee) }}</span>
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
                  
                  <div v-if="pricing?.ctvCommission" class="flex justify-between items-center text-green-400 border-b border-white/5 pb-3">
                    <span class="font-bold text-sm uppercase tracking-widest">Hoa hồng CTV (30%)</span>
                    <span class="font-black text-2xl font-mono">{{ formatPrice(pricing.ctvCommission) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-primary-400">
                    <span class="font-bold text-sm uppercase tracking-widest">Tiền cọc đảm bảo (Đã nhận)</span>
                    <span class="font-black text-2xl font-mono">- {{ formatPrice(pricing?.deposit) }}</span>
                  </div>
                  <div class="pt-6">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Tổng tiền thanh toán cuối cùng</p>
                    <div class="flex justify-between items-end">
                       <span class="text-5xl font-black text-white font-mono tracking-tighter">{{ formatPrice(pricing?.totalAmount) }}</span>
                       <span class="text-[10px] font-bold opacity-40 uppercase mb-2">Thanh toán bằng {{ paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod }}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 4: Signature Simulation -->
           <div class="pt-20 grid grid-cols-2 gap-20 text-center">
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Bên Cho Thuê (Bên A)</p>
               <div class="relative group">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 rotate-12 pointer-events-none">
                     <span class="text-6xl font-black uppercase text-primary-600 border-8 border-primary-600 p-4">XÁC MINH</span>
                  </div>
                  <p class="font-black text-2xl italic text-gray-900 font-serif decoration-primary-500 underline underline-offset-8">{{ owner?.fullName }}</p>
               </div>
            </div>
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Bên Thuê Xe (Bên B)</p>
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

        <div class="mt-32 pt-12 border-t border-gray-50 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] space-y-2">
           <p>Chứng thực bởi {{ car?.brand?.toUpperCase() }} PARTNER | Hệ thống CarRental Việt Nam</p>
           <p>Ngày ký: {{ new Date().toLocaleDateString('vi-VN') }} | ID: {{ booking?._id?.toUpperCase() }}</p>
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

const owner = computed(() => contractData.value?.owner || {})
const renter = computed(() => contractData.value?.renter || {})
const car = computed(() => contractData.value?.car || {})
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
    const bookingId = route.params.id
    const response = await api.get(`/contracts/booking/${bookingId}`)
    contractData.value = response.data
    if (response.data.booking?.status === 'confirmed' || response.data.booking?.status === 'active') {
       isSigned.value = true
    }
    const date = new Date()
    contractNumber.value = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}${Math.floor(Math.random()*1000)}`
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
      filename:     `HopDong_${renter.value?.fullName || 'CarRental'}_${new Date().getTime()}.pdf`,
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
  background-image: radial-gradient(#f1f1f1 1px, transparent 1px);
  background-size: 30px 30px;
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
