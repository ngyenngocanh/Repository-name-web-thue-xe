<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      <div class="relative z-10">
        <h1 class="text-3xl font-black mb-2 tracking-tight">Hệ thống Quản lý CarRental</h1>
        <p class="text-indigo-100 text-lg font-medium opacity-90">Xin chào, <span class="text-white font-bold">{{ user?.fullName || 'Quản trị viên' }}</span>. Chúc một ngày làm việc hiệu quả!</p>
      </div>
      <div class="flex mt-8 space-x-4">
        <div class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center">
          <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span class="text-xs font-bold uppercase tracking-widest text-white/80">Hệ thống đang ổn định</span>
        </div>
        <div class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center">
          <span class="text-xs font-black uppercase tracking-widest text-white/80">{{ new Date().toLocaleDateString('vi-VN') }}</span>
        </div>
      </div>
    </div>

    <!-- Header & Period Filter -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase tracking-widest">Thống kê & Phân tích</h2>
          <p class="text-gray-400 text-sm font-medium mt-1">Dữ liệu tổng quát về hoạt động của hệ thống kinh doanh</p>
        </div>
        <div class="flex items-center space-x-4">
          <select 
            v-model="selectedPeriod" 
            class="px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-black text-gray-700 focus:border-indigo-500 transition-all outline-none"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">1 năm qua</option>
          </select>
          <button 
            @click="refreshData" 
            class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all group"
            title="Làm mới dữ liệu"
          >
            <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Users Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
            <UserGroupIcon class="w-7 h-7 text-blue-600" />
          </div>
          <div class="text-right">
             <span class="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">+{{ calculateGrowth(analytics.userGrowth) }}%</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ (analytics.totalUsers || 0).toLocaleString() }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Người dùng mới</p>
        </div>
      </div>

      <!-- Bookings Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
            <CalendarIcon class="w-7 h-7 text-purple-600" />
          </div>
          <div class="text-right">
             <span class="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">+{{ calculateGrowth(analytics.bookingGrowth) }}%</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ (analytics.totalBookings || 0).toLocaleString() }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Đơn đặt xe mới</p>
        </div>
      </div>

      <!-- Active Fleet Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
            <TruckIcon class="w-7 h-7 text-emerald-600" />
          </div>
          <div class="text-right">
             <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">LIVE</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ (analytics.activeBookings || 0).toLocaleString() }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Chuyến đi đang chạy</p>
        </div>
      </div>

      <!-- Revenue Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
            <CurrencyDollarIcon class="w-7 h-7 text-amber-600" />
          </div>
          <div class="text-right">
             <span class="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">+{{ calculateGrowth(analytics.revenueGrowth) }}%</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ formatPrice(analytics.revenue || 0) }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Tổng doanh thu</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Booking Trends -->
      <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest">Xu hướng đặt xe</h3>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <div class="h-80">
          <canvas ref="bookingChartRef"></canvas>
        </div>
      </div>

      <!-- Revenue Trends -->
      <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest">Biểu đồ doanh thu</h3>
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div class="h-80">
          <canvas ref="revenueChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Analysis Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Top Fleet -->
      <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 lg:col-span-2">
         <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest mb-8">Đội xe hiệu suất cao</h3>
         <div class="overflow-x-auto">
           <table class="w-full">
             <thead>
               <tr class="text-left border-b border-gray-50">
                 <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hạng</th>
                 <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Thông tin xe</th>
                 <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Số chuyến</th>
                 <th class="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Doanh thu</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-50">
               <tr v-for="(car, index) in topCars" :key="car._id" class="group hover:bg-gray-50/50 transition-colors">
                 <td class="py-4 font-black text-gray-300">#{{ index + 1 }}</td>
                 <td class="py-4 px-4">
                   <div class="flex items-center">
                     <div class="w-10 h-10 bg-gray-100 rounded-xl mr-3 flex items-center justify-center font-black text-xs text-gray-400 uppercase">CAR</div>
                     <div>
                       <p class="text-sm font-black text-gray-900">{{ car.brand }} {{ car.model }}</p>
                       <p class="text-[10px] text-gray-400 font-bold uppercase">{{ car.licensePlate || 'N/A' }}</p>
                     </div>
                   </div>
                 </td>
                 <td class="py-4 text-center font-black text-sm text-indigo-600 bg-indigo-50/30 rounded-xl">{{ car.bookings }}</td>
                 <td class="py-4 text-right font-black text-sm text-gray-900">{{ formatPrice(car.revenue) }}</td>
               </tr>
             </tbody>
           </table>
         </div>
      </div>

      <!-- Top Customers -->
      <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
         <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest mb-8">Khách hàng VIP</h3>
         <div class="space-y-6">
           <div v-for="(user, index) in topUsers" :key="user._id" class="flex items-center group">
              <div class="relative mr-4">
                <div class="w-12 h-12 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-black text-gray-400">
                  {{ user.fullName?.charAt(0) || 'U' }}
                </div>
                <div class="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-white">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-black text-gray-900 truncate">{{ user.fullName }}</p>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-bold text-gray-400 uppercase">{{ user.bookings }} Chuyến đi</span>
                  <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span class="text-[10px] font-black text-indigo-600 uppercase">{{ formatPrice(user.totalSpent) }}</span>
                </div>
              </div>
           </div>
         </div>
      </div>
    </div>

    <!-- Stats & Activity Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <!-- Distribution Chart -->
       <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest mb-8">Trạng thái đội xe</h3>
          <div class="h-64 flex items-center justify-center">
             <canvas ref="carStatusChartRef"></canvas>
          </div>
       </div>

       <!-- Recent Activity Feed -->
       <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 relative overflow-hidden">
          <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest mb-8">Nhật ký hoạt động</h3>
          <div class="space-y-6 relative z-10 h-64 overflow-y-auto pr-4 scrollbar-thin">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-4">
               <div :class="`flex-shrink-0 w-8 h-8 rounded-xl ${activity.color || 'bg-gray-100'} flex items-center justify-center`">
                 <component :is="activity.icon || DocumentTextIcon" class="w-4 h-4 text-white" />
               </div>
               <div class="flex-1">
                 <p class="text-sm text-gray-700 font-medium">{{ activity.description }}</p>
                 <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{{ activity.time }}</p>
               </div>
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { 
  UserGroupIcon, 
  TruckIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

import { Chart as ChartJS, registerables } from 'chart.js'
ChartJS.register(...registerables)

const authStore = useAuthStore()
const toast = useToast()
const user = computed(() => authStore.user)

const selectedPeriod = ref('month')
const analytics = ref({
  totalUsers: 0,
  totalBookings: 0,
  activeBookings: 0,
  revenue: 0,
  userGrowth: 0,
  bookingGrowth: 0,
  revenueGrowth: 0,
  bookingTrend: [],
  revenueTrend: [],
  userTrend: [],
  carStatusData: [0, 0, 0]
})

const topCars = ref([])
const topUsers = ref([])
const recentActivity = ref([])

// Chart refs
const bookingChartRef = ref(null)
const revenueChartRef = ref(null)
const carStatusChartRef = ref(null)

// Chart instances
let bookingChart = null
let revenueChart = null
let carStatusChart = null

const calculateGrowth = (value) => {
  return value || 0
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const fetchAnalytics = async () => {
  try {
    const response = await api.get(`/admin/analytics?period=${selectedPeriod.value}`)
    const data = response.data
    
    analytics.value = {
      totalUsers: data.totalUsers || 0,
      totalBookings: data.totalBookings || 0,
      activeBookings: data.activeBookings || 0,
      revenue: data.revenue || 0,
      userGrowth: data.userGrowth || 0,
      bookingGrowth: data.bookingGrowth || 0,
      revenueGrowth: data.revenueGrowth || 0,
      bookingTrend: data.bookingTrend || [],
      revenueTrend: data.revenueTrend || [],
      carStatusData: data.carStatusData || [0, 0, 0]
    }
    
    topCars.value = data.topCars || []
    topUsers.value = data.topUsers || []
    recentActivity.value = data.recentActivities || []
    
    await nextTick()
    updateCharts()
  } catch (error) {
    toast.error('Không thể tải dữ liệu thống kê')
  }
}

const updateCharts = () => {
  createBookingTrendChart()
  createRevenueChart()
  createCarStatusChart()
}

const createBookingTrendChart = () => {
  if (!bookingChartRef.value) return
  const ctx = bookingChartRef.value.getContext('2d')
  if (bookingChart) bookingChart.destroy()
  
  bookingChart = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: generateDateLabels(analytics.value.bookingTrend.length || 7),
      datasets: [{
        label: 'Số lượt đặt xe',
        data: analytics.value.bookingTrend.length ? analytics.value.bookingTrend : [0,0,0,0,0,0,0],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { display: false }, ticks: { precision: 0 } }, x: { grid: { display: false } } }
    }
  })
}

const createRevenueChart = () => {
  if (!revenueChartRef.value) return
  const ctx = revenueChartRef.value.getContext('2d')
  if (revenueChart) revenueChart.destroy()
  
  revenueChart = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: generateDateLabels(analytics.value.revenueTrend.length || 7),
      datasets: [{
        label: 'Doanh thu',
        data: analytics.value.revenueTrend.length ? analytics.value.revenueTrend : [0,0,0,0,0,0,0],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => v/1000000 + 'M' } } }
    }
  })
}

const createCarStatusChart = () => {
  if (!carStatusChartRef.value) return
  const ctx = carStatusChartRef.value.getContext('2d')
  if (carStatusChart) carStatusChart.destroy()
  
  carStatusChart = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Đang trống', 'Chờ duyệt', 'Đang cho thuê'],
      datasets: [{
        data: analytics.value.carStatusData || [0, 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
    }
  })
}

const generateDateLabels = (count) => {
  const labels = []
  const today = new Date()
  if (count === 12) {
    // 12 Months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today); d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }))
    }
  } else {
    // Days
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }))
    }
  }
  return labels
}

const generateMockData = (len, min, max) => Array.from({ length: len }, () => Math.floor(Math.random() * (max - min + 1)) + min)

const refreshData = () => {
  fetchAnalytics()
  toast.success('Dữ liệu đã được làm mới')
}

watch(selectedPeriod, fetchAnalytics)
onMounted(fetchAnalytics)
</script>
