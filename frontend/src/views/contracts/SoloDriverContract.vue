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
            <h1 class="text-xl font-black text-gray-900 leading-none">Hợp Đồng Thuê Tài Xế Riêng</h1>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dịch vụ cung cấp nhân sự lái xe</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="exportPDF" :disabled="loading" class="px-5 py-2.5 bg-gray-900 text-white text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-lg shadow-gray-200">
            <svg v-if="exporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            {{ exporting ? 'Đang tạo PDF...' : 'Tải PDF hợp đồng' }}
          </button>
          <button @click="signContract" :disabled="isSigned || signing" class="px-5 py-2.5 bg-amber-500 text-white text-xs font-black uppercase rounded-xl hover:bg-amber-600 transition-all disabled:bg-gray-300 shadow-lg shadow-amber-100">
            {{ isSigned ? 'Đã ký điện tử' : 'Ký hợp đồng ngay' }}
          </button>
        </div>
      </div>

      <!-- Contract Paper -->
      <div v-if="loading" class="animate-pulse space-y-8 bg-white rounded-[2.5rem] p-20 shadow-xl border border-gray-100 h-[800px]"></div>
      
      <div v-else-if="booking" class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 md:p-20 contract-paper overflow-hidden relative" ref="contractRef">
        <div class="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        
        <!-- Header Section -->
        <div class="text-center mb-16 relative">
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
          <p class="text-lg font-bold text-gray-800 mb-4">Độc lập - Tự do - Hạnh phúc</p>
          <div class="w-32 h-0.5 bg-gray-900 mx-auto mb-12"></div>
          
          <h1 class="text-4xl font-black text-gray-900 uppercase mt-8 mb-2 tracking-tight">Hợp Đồng Dịch Vụ Tài Xế</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Số: {{ booking?._id?.slice(-8).toUpperCase() }}/HĐ-TXR</p>
        </div>

        <!-- Section 1: Parties -->
        <div class="space-y-12 text-gray-800">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Party A -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-amber-200 mr-3"></span> Bên A (Khách hàng)
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Họ và tên:</span>
                  <span class="font-black text-gray-900">{{ booking?.contactInfo?.name || booking?.renter?.fullName }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Số điện thoại:</span>
                  <span class="font-black text-gray-900">{{ booking?.contactInfo?.phone || booking?.renter?.phone }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Số CCCD:</span>
                  <span class="font-black text-gray-900">{{ booking?.contactInfo?.idCard || '....................' }}</span>
                </div>
              </div>
            </div>

            <!-- Party B -->
            <div class="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center">
                <span class="w-8 h-px bg-indigo-200 mr-3"></span> Bên B (Tài xế)
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Họ và tên:</span>
                  <span class="font-black text-gray-900">{{ booking?.driver?.fullName }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Số điện thoại:</span>
                  <span class="font-black text-gray-900">{{ booking?.driver?.phone }}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200 pb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Hạng bằng lái:</span>
                  <span class="font-black text-gray-900">{{ booking?.driver?.driverInfo?.licenseClass || 'B2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Trip Details -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-gray-900 pl-4">Điều 1: Nội dung dịch vụ</h3>
            <div class="bg-gray-50/50 p-8 rounded-[2rem] border border-dashed border-gray-200">
               <p class="text-base leading-relaxed mb-6 font-medium">Bên B đồng ý cung cấp dịch vụ lái xe cho Bên A theo lịch trình cụ thể như sau:</p>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase mb-1">Thời gian phục vụ</span>
                    <span class="font-bold text-gray-900">Từ {{ formatDate(booking?.startDate) }} đến {{ formatDate(booking?.endDate) }}</span>
                    <span class="text-xs font-bold text-amber-600 italic">({{ booking?.mode === 'hourly' ? 'Hợp đồng theo giờ' : 'Hợp đồng dài hạn' }})</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase mb-1">Địa điểm đón/trả</span>
                    <span class="font-bold text-gray-900">Đón tại: {{ booking?.pickupLocation }}</span>
                    <span class="font-bold text-gray-900">Trả tại: {{ booking?.returnLocation }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase mb-1">Loại hình chuyến đi</span>
                    <span class="font-bold text-gray-900 lowercase first-letter:uppercase">{{ getTripTypeLabel(booking?.pricing?.tripType) }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase mb-1">Quãng đường dự kiến</span>
                    <span class="font-bold text-gray-900">{{ booking?.pricing?.distance }} KM</span>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 3: Pricing -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-gray-900 pl-4">Điều 2: Giá trị hợp đồng & Thanh toán</h3>
            <div class="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-xl">
               <div class="space-y-4">
                  <div class="flex justify-between items-center opacity-70">
                    <span class="font-bold">Cước phí thuê tài xế chính</span>
                    <span class="font-black text-xl leading-none font-mono">{{ formatPrice(booking?.pricing?.totalRentalFee) }}</span>
                  </div>
                  <div v-if="booking?.pricing?.extraFee" class="flex justify-between items-center text-amber-400">
                    <span class="font-bold">Phụ phí (Lưu trú/Công tác/Đi xa)</span>
                    <span class="font-black text-xl leading-none font-mono">+ {{ formatPrice(booking?.pricing?.extraFee) }}</span>
                  </div>
                  <div class="flex justify-between items-center opacity-70">
                    <span class="font-bold">Phí nền tảng & Dịch vụ (5%)</span>
                    <span class="font-black text-xl leading-none font-mono">+ {{ formatPrice(booking?.pricing?.serviceFee) }}</span>
                  </div>
                  <div class="pt-6 border-t border-white/20 flex justify-between items-end">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tổng cộng giá trị hợp đồng</p>
                      <span class="text-5xl font-black text-amber-500 font-mono tracking-tighter">{{ formatPrice(booking?.pricing?.totalAmount) }}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Section 4: Terms -->
          <div class="space-y-6">
            <h3 class="text-lg font-black text-gray-900 uppercase border-l-4 border-gray-900 pl-4">Điều 3: Cam kết của các bên</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p class="font-black text-gray-900 uppercase text-xs mb-2 underline decoration-2 decoration-amber-500 underline-offset-4">Bên A cam kết:</p>
                <ul class="space-y-2 font-medium leading-relaxed opacity-80 list-disc pl-4">
                   <li>Cung cấp phương tiện đảm bảo an toàn kỹ thuật, đầy đủ xăng dầu và giấy tờ pháp lý.</li>
                   <li>Chỉ sử dụng tài xế cho mục đích hợp pháp, không vận chuyển hàng cấm.</li>
                   <li>Thanh toán đầy đủ cước phí sau khi chuyến đi kết thúc.</li>
                </ul>
              </div>
              <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p class="font-black text-gray-900 uppercase text-xs mb-2 underline decoration-2 decoration-indigo-500 underline-offset-4">Bên B cam kết:</p>
                <ul class="space-y-2 font-medium leading-relaxed opacity-80 list-disc pl-4">
                   <li>Có mặt đúng giờ, tác phong chuyên nghiệp, lịch sự.</li>
                   <li>Lái xe an toàn, tuân thủ tuyệt đối luật giao thông đường bộ.</li>
                   <li>Giữ bí mật thông tin hành trình của khách hàng.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="pt-20 grid grid-cols-2 gap-20 text-center">
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Đại diện bên A</p>
               <div v-if="isSigned" class="relative group">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 -rotate-12 pointer-events-none">
                     <span class="text-6xl font-black uppercase text-amber-600 border-8 border-amber-600 p-4">ĐÃ KÝ</span>
                  </div>
                  <p class="font-black text-xl italic text-gray-900 font-serif decoration-amber-500 decoration-wavy underline underline-offset-8">{{ booking?.contactInfo?.name || booking?.renter?.fullName }}</p>
               </div>
               <div v-else class="h-20 border-b-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold uppercase italic">Chờ ký kết</div>
            </div>
            <div class="space-y-20">
               <p class="font-black uppercase tracking-widest text-sm">Đại diện bên B</p>
               <div class="relative">
                  <div class="absolute inset-0 flex items-center justify-center opacity-10 rotate-12 pointer-events-none">
                     <span class="text-6xl font-black uppercase text-indigo-600 border-8 border-indigo-600 p-4">XÁC MINH</span>
                  </div>
                  <p class="font-black text-xl italic text-gray-900 font-serif decoration-indigo-500 underline underline-offset-8">{{ booking?.driver?.fullName }}</p>
               </div>
            </div>
          </div>
        </div>

        <!-- Footer Seal -->
        <div class="mt-32 pt-12 border-t border-gray-100 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] space-y-2">
           <p>CarRental Platform - Chứng thực hợp đồng điện tử</p>
           <p>Mã băm: {{ booking?._id?.toUpperCase() }} / UID-{{ booking?._id?.slice(0,6) }}</p>
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
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const contractRef = ref(null)

const booking = ref(null)
const loading = ref(true)
const exporting = ref(false)
const signing = ref(false)
const isSigned = ref(false)

const getTripTypeLabel = (type) => {
  const types = {
    personal: 'Cá nhân',
    business: 'Công tác',
    tourism: 'Du lịch',
    airport: 'Sân bay'
  }
  return types[type] || 'Cá nhân'
}

const signContract = async () => {
  try {
    signing.value = true
    await api.post(`/contracts/sign/${booking.value._id}`, {
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

const exportImage = async () => {
  if (!contractRef.value) return
  try {
    exporting.value = true
    const canvas = await html2canvas(contractRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const image = canvas.toDataURL('image/jpeg', 0.9)
    const link = document.createElement('a')
    link.href = image
    link.download = `HopDong_Driver_${booking.value?.contactInfo?.name || 'Driver'}_${new Date().getTime()}.jpg`
    link.click()
    toast.success('Đã xuất ảnh hợp đồng!')
  } catch (err) {
    console.error('Export error:', err)
    toast.error('Lỗi khi xuất ảnh hợp đồng')
  } finally {
    exporting.value = false
  }
}

const fetchBooking = async () => {
  try {
    loading.value = true
    const response = await api.get(`/bookings/${route.params.id}`)
    booking.value = response.data.booking
    
    // Check if contract is already signed
    const contractRes = await api.get(`/contracts/booking/${route.params.id}`)
    if (contractRes.data && contractRes.data.signedAt) {
      isSigned.value = true
    }
  } catch (error) {
    // Contract might not exist yet, that's okay
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
.contract-paper {
  background-image: radial-gradient(#f1f1f1 1px, transparent 1px);
  background-size: 20px 20px;
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
