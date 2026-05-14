<template>
  <div class="min-h-screen bg-gray-50/50 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      
      <!-- Premium Hero Header -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-[#1e293b] p-8 md:p-12 shadow-2xl">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Trung tâm đối tác CTV
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">Thu nhập Cộng tác viên</h1>
            <p class="text-slate-400 text-lg max-w-xl">Theo dõi hoa hồng 30% từ mỗi chuyến xe bạn giới thiệu thành công.</p>
          </div>
          
          <div class="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
            <button 
              v-for="p in periods" 
              :key="p.val"
              @click="setPeriod(p.val)"
              :class="[
                'px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider',
                period === p.val 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              ]"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-8">
            <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500">💰</div>
          </div>
          <div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tổng hoa hồng thực nhận ({{ getPeriodLabel }})</p>
            <h2 class="text-6xl font-black text-slate-900 tracking-tighter tabular-nums mb-2">
              {{ formatPrice(summary.totalEarnings) }}
            </h2>
            <div class="flex items-center gap-3 text-indigo-600 font-black text-sm">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-[10px]">✓</span>
              <span>Đã hoàn thành {{ summary.totalTrips }} đơn hàng giới thiệu</span>
            </div>
          </div>
          
          <div class="mt-8 pt-8 border-t border-gray-50">
             <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">PHÂN TÍCH HIỆU QUẢ</h3>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Tỷ lệ hoa hồng</p>
                   <p class="text-xl font-black text-indigo-600">30% / đơn</p>
                </div>
                <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Doanh thu giới thiệu</p>
                   <p class="text-xl font-black text-slate-900">{{ formatPrice(totalSales) }}</p>
                </div>
             </div>
          </div>
        </div>

        <div class="space-y-8">
          <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div class="relative z-10">
               <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Số dư khả dụng</p>
               <h3 class="text-3xl font-black mb-6">{{ formatPrice(summary.totalEarnings) }}</h3>
               <button class="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                 Yêu cầu rút tiền
               </button>
             </div>
             <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          
          <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Mẹo tăng thu nhập</h4>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Chia sẻ liên kết xe trên mạng xã hội để tiếp cận nhiều khách hàng hơn và nhận 30% hoa hồng cho mỗi chuyến đi hoàn thành.</p>
          </div>
        </div>
      </div>

      <!-- Transaction List -->
      <div class="space-y-6">
        <div class="flex items-center justify-between px-4">
          <h2 class="text-xl font-black text-slate-900">Chi tiết hoa hồng đơn hàng</h2>
        </div>

        <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-gray-100">
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm / Xe</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày hoàn thành</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Giá trị đơn</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Hoa hồng (30%)</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="loading" v-for="i in 5" :key="i" class="animate-pulse">
                  <td colspan="5" class="px-8 py-6 h-20 bg-gray-50/50"></td>
                </tr>
                <tr v-else-if="detailedBookings.length === 0">
                  <td colspan="5" class="px-8 py-20 text-center text-slate-400 font-bold">Chưa có dữ liệu hoa hồng nào.</td>
                </tr>
                <tr v-else v-for="b in detailedBookings" :key="b._id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-6">
                    <p class="text-sm font-black text-slate-900 mb-1">{{ b.carName }}</p>
                    <span class="px-2 py-0.5 bg-indigo-50 text-[8px] font-black rounded uppercase text-indigo-500 tracking-widest">{{ b.type }}</span>
                  </td>
                  <td class="px-8 py-6">
                    <p class="text-xs font-bold text-slate-600 tracking-tight">{{ formatDate(b.date) }}</p>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-xs font-bold text-slate-500">
                      {{ formatPrice(b.totalAmount) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right tabular-nums">
                    <span class="text-sm font-black text-indigo-600">{{ formatPrice(b.commission) }}</span>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full">Đã đối soát</span>
                  </td>
                </tr>
              </tbody>
            </table>
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

const totalSales = computed(() => {
  return detailedBookings.value.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price || 0).replace('₫', 'đ')
}

const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN')

const setPeriod = (val) => {
  period.value = val
  fetchEarnings()
}

const fetchEarnings = async () => {
  try {
    loading.value = true
    const response = await api.get('/collaborator/earnings', { 
      params: { period: period.value } 
    })
    
    earnings.value = response.data.earnings || []
    detailedBookings.value = response.data.bookings || []
    summary.value = response.data.summary || { totalEarnings: 0, totalTrips: 0 }
    
  } catch (error) {
    console.error('Fetch CTV Earnings Error:', error)
    toast.error('Không thể tải dữ liệu thu nhập CTV.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchEarnings)
</script>
