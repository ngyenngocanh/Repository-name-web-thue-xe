<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Thống kê & Phân tích</h2>
          <p class="text-gray-600 mt-1">Phân tích dữ liệu và xu hướng hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <select v-model="selectedPeriod" class="border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">1 năm qua</option>
          </select>
          <button @click="refreshData" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.totalUsers || 0 }}</div>
            <div class="text-gray-600">Người dùng mới</div>
            <div class="text-xs text-green-600 mt-1">
              <span>+{{ calculateGrowth(analytics.userGrowth) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.totalBookings || 0 }}</div>
            <div class="text-gray-600">Đặt xe mới</div>
            <div class="text-xs text-green-600 mt-1">
              <span>+{{ calculateGrowth(analytics.bookingGrowth) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.activeBookings || 0 }}</div>
            <div class="text-gray-600">Đang hoạt động</div>
            <div class="text-xs text-blue-600 mt-1">
              <span>{{ analytics.activeBookings }} chuyến</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ formatPrice(analytics.revenue) }}</div>
            <div class="text-gray-600">Doanh thu</div>
            <div class="text-xs text-green-600 mt-1">
              <span>+{{ calculateGrowth(analytics.revenueGrowth) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Booking Trend Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Xu hướng đặt xe</h3>
        <div class="h-64">
          <canvas ref="bookingChartRef"></canvas>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo thời gian</h3>
        <div class="h-64">
          <canvas ref="revenueChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Additional Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Car Status Distribution -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Phân bố trạng thái xe</h3>
        <div class="h-64">
          <canvas ref="carStatusChartRef"></canvas>
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tăng trưởng người dùng</h3>
        <div class="h-64">
          <canvas ref="userGrowthChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Lists -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Top Cars -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Xe được thuê nhiều nhất</h3>
        <div class="space-y-3">
          <div v-for="(car, index) in topCars" :key="car._id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-indigo-600">{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ car.brand }} {{ car.model }}</p>
                <p class="text-xs text-gray-500">{{ car.bookings }} chuyến</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ formatPrice(car.revenue) }}</p>
              <p class="text-xs text-gray-500">doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Khách hàng tích cực</h3>
        <div class="space-y-3">
          <div v-for="(user, index) in topUsers" :key="user._id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-green-600">{{ index + 1 }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.fullName }}</p>
                <p class="text-xs text-gray-500">{{ user.bookings }} chuyến</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ formatPrice(user.totalSpent) }}</p>
              <p class="text-xs text-gray-500">đã chi tiêu</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div class="space-y-3">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-3">
            <div :class="`p-2 rounded-full ${activity.color}`">
              <component :is="activity.icon" class="w-4 h-4 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import {
  UserGroupIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

import { Chart as ChartJS, registerables } from 'chart.js'
ChartJS.register(...registerables)

const toast = useToast()

// Chart refs
const bookingChartRef = ref(null)
const revenueChartRef = ref(null)
const carStatusChartRef = ref(null)
const userGrowthChartRef = ref(null)

// Chart instances
let bookingChart = null
let revenueChart = null
let carStatusChart = null
let userGrowthChart = null

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
  carStatusData: [0, 0, 0, 0]
})

const topCars = ref([])
const topUsers = ref([])
const recentActivity = ref([])

const calculateGrowth = (value) => {
  return value || 0
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
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
      userTrend: data.userTrend || [],
      carStatusData: data.carStatusData || [0, 0, 0, 0]
    }
    
    topCars.value = data.topCars || []
    topUsers.value = data.topUsers || []
    
    // Map recent activities with icons
    recentActivity.value = (data.recentActivities || []).map(act => ({
      ...act,
      icon: DocumentTextIcon,
      color: act.color || 'bg-blue-500'
    }))
    
    await nextTick()
    updateCharts()
  } catch (error) {
    toast.error('Không thể tải dữ liệu thống kê')
    console.error('Analytics fetch error:', error)
  }
}

const createBookingTrendChart = () => {
  if (!bookingChartRef.value) return
  const ctx = bookingChartRef.value.getContext('2d')
  if (bookingChart) bookingChart.destroy()
  
  const data = analytics.value.bookingTrend.length ? analytics.value.bookingTrend : [0,0,0,0,0,0,0]
  
  bookingChart = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: generateDateLabels(data.length),
      datasets: [{
        label: 'Số lượt đặt xe',
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  })
}

const createRevenueChart = () => {
  if (!revenueChartRef.value) return
  const ctx = revenueChartRef.value.getContext('2d')
  if (revenueChart) revenueChart.destroy()
  
  const data = analytics.value.revenueTrend.length ? analytics.value.revenueTrend : [0,0,0,0,0,0,0]
  
  revenueChart = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: generateDateLabels(data.length),
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: data,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatPrice(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value.toLocaleString()
          }
        }
      }
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
        data: analytics.value.carStatusData.slice(0, 3) || [0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(250, 204, 21, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
    }
  })
}

const createUserGrowthChart = () => {
  if (!userGrowthChartRef.value) return
  const ctx = userGrowthChartRef.value.getContext('2d')
  if (userGrowthChart) userGrowthChart.destroy()
  
  const data = analytics.value.userTrend?.length ? analytics.value.userTrend : [0,0,0,0,0,0,0]
  
  userGrowthChart = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: generateDateLabels(data.length),
      datasets: [{
        label: 'Người dùng mới',
        data: data,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  })
}

const updateCharts = () => {
  createBookingTrendChart()
  createRevenueChart()
  createCarStatusChart()
  createUserGrowthChart()
}

const generateDateLabels = (count) => {
  const labels = []
  const today = new Date()
  
  if (selectedPeriod.value === 'year') {
    for (let i = (count || 12) - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      labels.push(d.toLocaleDateString('vi-VN', { month: 'short' }))
    }
  } else {
    for (let i = (count || 7) - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }))
    }
  }
  return labels
}

const refreshData = () => {
  fetchAnalytics()
  toast.success('Dữ liệu đã được làm mới')
}

watch(selectedPeriod, () => {
  fetchAnalytics()
})

onMounted(() => {
  fetchAnalytics()
})
</script>
