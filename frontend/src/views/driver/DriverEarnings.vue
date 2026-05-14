<template>
  <div class="min-h-screen bg-gray-50/50 pb-20">
    <!-- Main Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      
      <!-- Premium Hero Header -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-[#0f172a] p-8 md:p-12 shadow-2xl">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Tài chính trực tuyến
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">Trung tâm Thu nhập</h1>
            <p class="text-slate-400 text-lg max-w-xl">Theo dõi dòng tiền, đối soát doanh thu và tối ưu hóa hiệu quả kinh doanh vận tải của bạn.</p>
          </div>
          
          <div class="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
            <button 
              v-for="p in periods" 
              :key="p.val"
              @click="setPeriod(p.val)"
              :class="[
                'px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider',
                period === p.val 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              ]"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>

    <!-- Financial Summary Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Earnings Card -->
      <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-8">
          <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500">📈</div>
        </div>
        <div>
          <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Lợi nhuận thực nhận ({{ getPeriodLabel }})</p>
          <h2 class="text-6xl font-black text-slate-900 tracking-tighter tabular-nums mb-2">
            {{ formatPrice(summary.totalEarnings) }}
          </h2>
          <div class="flex items-center gap-3 text-emerald-600 font-black text-sm">
            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-[10px]">↑</span>
            <span>Đã hoàn thành {{ summary.totalTrips }} chuyến đi</span>
          </div>
        </div>
        
        <!-- NEW DETAILED BREAKDOWN TABLE -->
        <div class="mt-8 pt-8 border-t border-gray-50">
           <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">BẢNG PHÂN TÍCH THU NHẬP</h3>
           </div>
           <div class="space-y-3">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">👷</span>
                    <span class="text-xs font-bold text-slate-600">Tiền công tài (Kèm tài, theo chuyến)</span>
                 </div>
                 <span class="text-sm font-black text-slate-900">{{ formatPrice(getSummaryBreakdown.driverFee) }}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">🚗</span>
                    <span class="text-xs font-bold text-slate-600">Lợi nhuận thuê xe (Đã trừ phí)</span>
                 </div>
                 <span class="text-sm font-black text-slate-900">{{ formatPrice(getSummaryBreakdown.ownerProfit) }}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">🎁</span>
                    <span class="text-xs font-bold text-slate-600">Hoa hồng giới thiệu (CTV 30%)</span>
                 </div>
                 <span class="text-sm font-black text-purple-600">{{ formatPrice(getSummaryBreakdown.ctvCommission) }}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl shadow-lg">
                 <span class="text-xs font-black uppercase">TỔNG THỰC NHẬN</span>
                 <span class="text-base font-black">{{ formatPrice(summary.totalEarnings) }}</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Quick Actions / Secondary Stats -->
      <div class="space-y-8">
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
           <div class="relative z-10">
             <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Ví tài xế</p>
             <h3 class="text-3xl font-black mb-6">{{ formatPrice(summary.totalEarnings) }}</h3>
             <button class="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">
               Rút tiền về ngân hàng
             </button>
           </div>
           <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">🛡️</div>
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng thành viên</p>
              <p class="text-sm font-black text-slate-900">Driver Platinum</p>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed font-medium">Bạn đang nhận được mức hoa hồng ưu đãi 85% dành cho đối tác chiến lược.</p>
        </div>
      </div>
    </div>

      <!-- Transaction List Section -->
      <div class="space-y-6 pb-20">
        <div class="flex items-center justify-between px-4">
          <h2 class="text-xl font-black text-slate-900 tracking-tight text-emerald-600">BẢNG ĐỐI SOÁT CHI TIẾT TỪNG CHUYẾN</h2>
          <span class="text-xs font-bold text-slate-400 italic">Dữ liệu theo {{ getPeriodLabel }}</span>
        </div>

        <!-- NEW DETAILED TABLE -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-gray-100">
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình / Xe</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày hoàn thành</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Tiền công tài</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Lợi nhuận xe</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Hoa hồng CTV</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Tổng thực nhận</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="loading" v-for="i in 5" :key="i" class="animate-pulse">
                  <td colspan="6" class="px-8 py-6 h-20 bg-gray-50/50"></td>
                </tr>
                <tr v-else-if="detailedBookings.length === 0">
                  <td colspan="6" class="px-8 py-20 text-center text-slate-400 font-bold">Chưa có dữ liệu giao dịch chi tiết.</td>
                </tr>
                <tr v-else v-for="b in detailedBookings" :key="b._id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-6">
                    <p class="text-sm font-black text-slate-900 mb-1">{{ b.carName }}</p>
                    <span class="px-2 py-0.5 bg-slate-100 text-[8px] font-black rounded uppercase text-slate-500 tracking-widest">{{ b.type }}</span>
                  </td>
                  <td class="px-8 py-6">
                    <p class="text-xs font-bold text-slate-600 tracking-tight">{{ formatDate(b.date) }}</p>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-xs font-black" :class="b.pricing.driverFee > 0 ? 'text-emerald-600' : 'text-slate-300'">
                      {{ formatPrice(b.pricing.driverFee) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-xs font-black" :class="b.pricing.ownerProfit > 0 ? 'text-blue-600' : 'text-slate-300'">
                      {{ formatPrice(b.pricing.ownerProfit) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-xs font-black" :class="b.pricing.ctvCommission > 0 ? 'text-purple-600' : 'text-slate-300'">
                      {{ formatPrice(b.pricing.ctvCommission) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-sm font-black text-slate-900">{{ formatPrice(b.pricing.total) }}</span>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full">ĐỐI SOÁT XONG</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- OLD LIST CARDS (Fallback / Mobile) -->
        <div class="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div 
            v-for="item in earnings" 
            :key="item._id"
            class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all"
          >
            <!-- (existing item template) -->
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const period = ref('month')
const earnings = ref([])
const detailedBookings = ref([])
const summary = ref({ totalEarnings: 0, totalTrips: 0 })
const loading = ref(true)

const periods = [
  { val: 'week', label: 'Tuần' },
  { val: 'month', label: 'Tháng' },
  { val: 'year', label: 'Năm' },
  { val: 'all', label: 'Tất cả' }
]

const getPeriodLabel = computed(() => {
  return periods.find(p => p.val === period.value)?.label || 'Tháng'
})

const getSummaryBreakdown = computed(() => {
  return earnings.value.reduce((acc, item) => {
    acc.driverFee += (item.driverFee || 0);
    acc.ownerProfit += (item.ownerProfit || 0);
    acc.ctvCommission += (item.ctvCommission || 0);
    return acc;
  }, { driverFee: 0, ownerProfit: 0, ctvCommission: 0 });
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price || 0).replace('₫', 'đ')
}

const formatDateDay = (date) => new Date(date).getDate()
const formatDateMonth = (date) => new Date(date).getMonth() + 1
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN')

const setPeriod = (val) => {
  period.value = val
  fetchEarnings()
}

const fetchEarnings = async () => {
  try {
    loading.value = true
    const response = await api.get('/driver/earnings', { 
      params: { period: period.value } 
    })
    
    earnings.value = response.data.earnings || []
    detailedBookings.value = response.data.bookings || []
    summary.value = response.data.summary || { totalEarnings: 0, totalTrips: 0 }
    
  } catch (error) {
    console.error('Fetch Earnings Error:', error)
    toast.error('Không thể tải dữ liệu thu nhập. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEarnings()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
