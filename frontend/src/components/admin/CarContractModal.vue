<template>
  <div v-if="show" class="fixed inset-0 z-[60] overflow-y-auto px-4 py-8 sm:px-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
      
      <!-- Header -->
      <div class="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight">Hợp đồng đối tác chiến lược</h3>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Xác nhận điều khoản hợp tác kinh doanh</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Contract Body -->
      <div class="flex-1 overflow-y-auto p-12 leading-relaxed text-gray-900 space-y-10 bg-white" style="font-family: 'Times New Roman', Times, serif;">
        
        <!-- Title -->
        <div class="text-center space-y-2">
          <h2 class="text-xl font-bold border-b-2 border-black pb-2 inline-block uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
          <p class="font-bold text-lg">Độc lập - Tự do - Hạnh phúc</p>
          <div class="py-8">
            <h1 class="text-3xl font-bold underline decoration-2 underline-offset-8 uppercase tracking-widest">HỢP ĐỒNG KHAI THÁC PHƯƠNG TIỆN VẬN TẢI</h1>
            <p class="text-sm italic mt-4 text-gray-500">Số: {{ car?._id?.substring(0, 8).toUpperCase() }}/HĐHT-{{ new Date().getFullYear() }}</p>
          </div>
        </div>

        <!-- Parties Section -->
        <div class="space-y-6 text-sm">
          <div>
            <p class="font-bold underline uppercase mb-2">Bên A (Nền tảng): CÔNG TY CỔ PHẦN CARRENTAL VIỆT NAM</p>
            <p>Đại diện bởi: Ban Quản Trị Hệ Thống</p>
            <p>Địa chỉ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM</p>
            <p>Điện thoại: 1900 1234 - Email: partners@carrental.vn</p>
          </div>

          <div>
            <p class="font-bold underline uppercase mb-2">Bên B (Cộng tác viên/Chủ xe): {{ car?.owner?.fullName }}</p>
            <p>Số CCCD: <span class="border-b border-dashed border-gray-400 inline-block min-w-[200px]">{{ car?.owner?.idCard?.number || '................................' }}</span></p>
            <p>Điện thoại: {{ car?.owner?.phone }}</p>
            <p>Email: {{ car?.owner?.email }}</p>
            <p>Địa chỉ: {{ car?.owner?.addressId?.fullAddress || 'Theo hồ sơ hệ thống' }}</p>
          </div>
        </div>

        <!-- Object Section -->
        <div class="space-y-4">
          <p class="text-sm font-bold italic border-l-4 border-primary-600 pl-4 py-1">Bên B đồng ý bàn giao quyền khai thác kinh doanh phương tiện sau cho Bên A:</p>
          <div class="bg-gray-50/50 p-8 rounded-2xl border-2 border-dashed border-gray-200 font-sans grid grid-cols-2 gap-x-8 gap-y-4 shadow-inner">
             <div class="space-y-1">
               <span class="text-gray-400 uppercase text-[9px] font-black block tracking-widest">Hãng xe & Dòng xe</span>
               <span class="font-black text-gray-900 block text-lg uppercase tracking-tight">{{ car?.brand }} {{ car?.model }}</span>
             </div>
             <div class="space-y-1">
               <span class="text-gray-400 uppercase text-[9px] font-black block tracking-widest">Biển kiểm soát</span>
               <span class="font-black text-primary-600 block text-lg">{{ car?.licensePlate }}</span>
             </div>
             <div class="space-y-1">
               <span class="text-gray-400 uppercase text-[9px] font-black block tracking-widest">Năm sản xuất</span>
               <span class="font-bold text-gray-700 block">{{ car?.year }}</span>
             </div>
             <div class="space-y-1">
               <span class="text-gray-400 uppercase text-[9px] font-black block tracking-widest">Số ghế ngồi</span>
               <span class="font-bold text-gray-700 block">{{ car?.seats }} chỗ</span>
             </div>
          </div>
        </div>

        <!-- Financial Terms (Editable Inputs for Admin) -->
        <div class="space-y-8 bg-primary-50/30 p-10 rounded-3xl border-2 border-primary-200 border-dashed relative overflow-hidden">
           <div class="absolute top-0 right-0 p-4 opacity-5 rotate-12">
             <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>
           </div>
           
           <h4 class="font-black text-primary-600 uppercase tracking-[0.25em] text-xs flex items-center">
             <span class="w-1.5 h-1.5 bg-primary-600 rounded-full mr-3"></span>
             Điều khoản kinh doanh (Cấu hình quản trị)
           </h4>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans relative z-10">
              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá thuê niêm yết (VND/Ngày)</label>
                <div class="relative">
                   <input 
                     v-model="contractData.pricePerDay" 
                     type="number" 
                     :disabled="readOnly"
                     class="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-black text-2xl text-primary-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                     placeholder="Ví dụ: 800000"
                   >
                   <span class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold uppercase text-[9px] tracking-widest">VND / Ngày</span>
                </div>
                <p class="text-[10px] text-gray-400 italic">Lưu ý: Đây là giá khách hàng sẽ nhìn thấy trên hệ thống.</p>
              </div>

              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Chiết khấu hệ thống (%)</label>
                <div class="relative">
                   <input 
                     v-model="contractData.commissionPercentage" 
                     type="number" 
                     max="100"
                     :disabled="readOnly"
                     class="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-black text-2xl text-orange-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                     placeholder="15"
                   >
                   <span class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold uppercase text-[9px] tracking-widest">% Platform fee</span>
                </div>
                <p class="text-[10px] text-gray-400 italic">Phần trăm hoa hồng mà CarRental sẽ giữ lại.</p>
              </div>
           </div>

           <div class="pt-8 mt-4 border-t border-primary-100/50 flex flex-col md:flex-row justify-between items-center bg-white/50 p-6 rounded-2xl">
              <div class="mb-4 md:mb-0">
                <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Thu nhập ước tính của CTV</p>
                <p class="text-sm text-gray-400 italic">(Dựa trên 1 ngày phát sinh giao dịch)</p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-black text-green-600 tracking-tighter">
                  {{ formatPrice(contractData.pricePerDay * (1 - contractData.commissionPercentage / 100)) }}
                </p>
                <span class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 block">Ròng sau phí hệ thống</span>
              </div>
           </div>
        </div>

        <!-- Contract Clauses -->
        <div class="text-sm space-y-6 text-justify text-gray-600 font-sans border-t pt-10 border-gray-100">
          <div>
            <p class="font-black text-gray-900 uppercase text-xs tracking-widest mb-3 italic">ĐIỀU 1: TRÁCH NHIỆM BÊN A</p>
            <ul class="list-disc pl-5 space-y-2 opacity-80">
              <li>Đảm bảo hệ thống vận hành ổn định và tiếp nhận thông tin thuê xe từ khách hàng.</li>
              <li>Thực hiện các chiến dịch Marketing hỗ trợ khai thác phương tiện cho Bên B.</li>
              <li>Xác minh danh tính khách hàng và hỗ trợ thủ tục hồ sơ pháp lý khi xảy ra sự cố.</li>
            </ul>
          </div>

          <div>
            <p class="font-black text-gray-900 uppercase text-xs tracking-widest mb-3 italic">ĐIỀU 2: TRÁCH NHIỆM BÊN B</p>
            <ul class="list-disc pl-5 space-y-2 opacity-80">
              <li>Đảm bảo phương tiện luôn ở tình trạng tốt nhất, được bảo trì định kỳ đầy đủ.</li>
              <li>Chịu trách nhiệm về tính pháp lý của phương tiện và các loại bảo hiểm trách nhiệm dân sự.</li>
              <li>Tuân thủ các điều khoản ký gửi và phối hợp giao nhận xe đúng thời gian thỏa thuận.</li>
              <li>Đối với thuê dài hạn: Bên B cam kết giữ xe sạch sẽ, bảo quản nội thất và linh kiện xe nguyên bản.</li>
            </ul>
          </div>

          <div>
            <p class="font-black text-gray-900 uppercase text-xs tracking-widest mb-3 italic">ĐIỀU 3: ĐIỀU KHOẢN THUÊ DÀI HẠN & TÀI XẾ</p>
            <ul class="list-disc pl-5 space-y-2 opacity-80">
              <li>Trong trường hợp thuê xe kèm tài xế: Bên thuê (khách hàng thông qua Bên A) có trách nhiệm đảm bảo điều kiện sinh hoạt bao gồm ăn uống và nghỉ ngơi cho tài xế trong suốt hành trình.</li>
              <li>Giá thuê dài hạn (15 ngày và 30 ngày) đã bao gồm ưu đãi đặc biệt dành cho khách hàng trung thành của hệ thống.</li>
              <li>Đối với dịch vụ tài xế theo chuyến (A-B): Chi phí sẽ được tính toán dựa trên số Kilomet thực tế và lộ trình được xác nhận bởi GPS trên hệ thống.</li>
              <li>Phụ phí giao xe ngoại tỉnh: Sẽ được tính thêm dựa trên khoảng cách giữa điểm nhà xe và điểm giao nhận ngoài phạm vi nội thị trung tâm.</li>
            </ul>
          </div>

          <div class="pt-10 flex justify-center opacity-40 grayscale">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.954 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="bg-gray-50 px-10 py-8 border-t border-gray-100 flex justify-end space-x-4 shrink-0">
        <template v-if="!readOnly">
          <button 
            @click="$emit('close')" 
            class="px-8 py-3 bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-100 font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button 
            @click="handleConfirm" 
            :disabled="loading || !contractData.pricePerDay"
            class="px-10 py-3 bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-200 font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center"
          >
            <span v-if="loading" class="spinner-white mr-3"></span>
            Ký duyệt & Kích hoạt xe
          </button>
        </template>
        <template v-else>
          <button 
            @click="$emit('close')" 
            class="px-12 py-3 bg-gray-900 text-white hover:bg-black shadow-xl font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all"
          >
            Đóng hợp đồng
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  car: Object,
  loading: Boolean,
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const contractData = reactive({
  pricePerDay: props.car?.pricePerDay || 0,
  pricePerHalfMonth: props.car?.pricePerHalfMonth || 0,
  pricePerMonth: props.car?.pricePerMonth || 0,
  commissionPercentage: props.car?.commissionPercentage || 15
})

// Update values when car prop changes
watch(() => props.car, (newCar) => {
  if (newCar) {
    contractData.pricePerDay = newCar.pricePerDay || 0
    contractData.pricePerHalfMonth = newCar.pricePerHalfMonth || 0
    contractData.pricePerMonth = newCar.pricePerMonth || 0
    contractData.commissionPercentage = newCar.commissionPercentage || 15
  }
}, { immediate: true })

const handleConfirm = () => {
  if (props.readOnly) return
  emit('confirm', {
    ...contractData
  })
}

const formatPrice = (price) => {
  if (!price) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}
</script>

<style scoped>
.spinner-white {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-zoom-in {
  animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.contract-input {
  @apply w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 font-black text-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400;
}

.input-unit {
  @apply absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold uppercase text-[9px] tracking-widest;
}

/* Custom scrollbar for contract */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
