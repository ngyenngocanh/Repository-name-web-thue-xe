<template>
  <div class="space-y-6 animate-fade-in pb-12 relative">
    <!-- Notifications Bell -->
    <div
      v-if="notifications.length > 0"
      class="fixed top-20 right-8 z-50 md:top-24"
    >
      <div class="notification-bell animate-pulse">
        <button
          @click="showNotifications = !showNotifications"
          class="relative p-3 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
        >
          <svg
            class="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"
            />
            <path
              fill-rule="evenodd"
              d="M10 18a2 2 0 100-4 2 2 0 000 4z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
            >{{ unreadNotifications }}</span
          >
        </button>
        <div
          v-if="showNotifications"
          class="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 animate-slide-down z-50"
        >
          <div
            v-for="notification in notifications.slice(0, 5)"
            :key="notification.id"
            class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
            @click="markNotificationRead(notification.id)"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-500 truncate">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatDateTime(notification.createdAt) }}
                </p>
              </div>
              <div
                v-if="!notification.read"
                class="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0 mt-1"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      <div class="relative z-10">
        <h1 class="text-3xl font-black mb-2 tracking-tight">Trung tâm Tài xế CarRental</h1>
        <p class="text-indigo-50 text-lg font-medium opacity-90">Xin chào, <span class="text-white font-bold">{{ driver?.fullName || 'Tài xế' }}</span>. Bạn đã sẵn sàng cho những chuyến đi mới?</p>
      </div>
      <div class="flex mt-8 space-x-4">
        <div class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center">
          <div :class="['w-2 h-2 rounded-full mr-2 animate-pulse', isOnline ? 'bg-green-400' : 'bg-red-400']"></div>
          <span class="text-xs font-bold uppercase tracking-widest text-white/80">
            {{ isOnline ? 'Đang trực tuyến' : 'Đang ngoại tuyến' }}
          </span>
        </div>
        <div class="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 flex items-center">
          <span class="text-xs font-black uppercase tracking-widest text-white/80">{{ new Date().toLocaleDateString('vi-VN') }}</span>
        </div>
      </div>
    </div>

    <!-- Header & Status Toggle -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase tracking-widest">Tổng quan hoạt động</h2>
          <p class="text-gray-400 text-sm font-medium mt-1">Theo dõi thu nhập và hiệu suất làm việc của bạn</p>
        </div>
        <div class="flex items-center space-x-6 bg-gray-50 px-6 py-3 rounded-2xl border-2 border-gray-100">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái Online</p>
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="isOnline"
                  @change="toggleStatus"
                  class="sr-only peer"
                  :disabled="loading"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-sm"></div>
              </label>
              <span class="text-sm font-black uppercase tracking-tight" :class="isOnline ? 'text-emerald-600' : 'text-gray-400'">
                {{ isOnline ? "Hoạt động" : "Ngoại tuyến" }}
              </span>
            </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Earnings Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
            <CurrencyDollarIcon class="w-7 h-7 text-emerald-600" />
          </div>
          <div class="text-right">
             <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg italic">Thu nhập thuần</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ formatPrice(driverStats.totalEarnings || 0) }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Lợi nhuận khả dụng</p>
        </div>
      </div>

      <!-- Total Trips Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
            <TruckIcon class="w-7 h-7 text-indigo-600" />
          </div>
          <div class="text-right">
             <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Tổng chuyến</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ (driverStats.totalTrips || 0).toLocaleString() }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Đã hoàn tất</p>
        </div>
      </div>

      <!-- Average Rating Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
            <HeroStarIcon class="w-7 h-7 text-amber-500" />
          </div>
          <div class="text-right">
             <span class="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Uy tín</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ (driverStats.averageRating || 0).toFixed(1) }} / 5.0</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Đánh giá trung bình</p>
        </div>
      </div>

      <!-- Today's Potential Metric -->
      <div class="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 group hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
            <CalendarIcon class="w-7 h-7 text-purple-600" />
          </div>
          <div class="text-right">
             <span class="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Hôm nay</span>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ todayTrips.length }}</p>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Đơn cần xử lý</p>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
        <div class="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
          <div class="space-y-4">
            <div class="h-12 w-32 bg-gray-200 rounded-xl"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-12 w-32 bg-gray-200 rounded-xl"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-lg p-6 h-28"></div>
        <div class="bg-white rounded-xl shadow-lg p-6 h-28"></div>
        <div class="bg-white rounded-xl shadow-lg p-6 h-28"></div>
      </div>
      <div class="bg-white rounded-2xl shadow-xl p-8 h-96"></div>
    </div>

    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <!-- Left Column - Current Trip & Schedule -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Next Schedule Summary (High Prominence) -->
        <div v-if="nextSchedule" class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-indigo-50/30">
            <h3 class="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon class="w-4 h-4" /> Lịch biểu khả dụng tiếp theo
            </h3>
            <div class="flex items-center gap-4">
               <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black rounded uppercase">{{ nextSchedule.type === 'fulltime' ? 'Toàn thời gian' : 'Bán thời gian' }}</span>
               <router-link to="/driver/schedule" class="text-[9px] font-black text-indigo-500 hover:text-indigo-700 uppercase">Quản lý</router-link>
            </div>
          </div>
          
          <div class="p-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2">
                <p class="text-lg font-black text-gray-900 tracking-tight">{{ formatDate(nextSchedule.startDate) }} → {{ formatDate(nextSchedule.endDate) }}</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="shift in nextSchedule.shifts.slice(0, 5)" 
                    :key="shift._id" 
                    class="px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-tighter"
                  >
                    {{ shift.dayOfWeek }} {{ shift.startTime }} - {{ shift.endTime }}
                  </span>
                  <span v-if="nextSchedule.shifts.length > 5" class="px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    +{{ nextSchedule.shifts.length - 5 }} ca khác
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-4 border-l border-gray-100 pl-8">
                 <div class="text-right">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Chế độ nhận chuyến</p>
                    <p class="text-sm font-black" :class="nextSchedule.isOnline ? 'text-emerald-600' : 'text-gray-400'">{{ nextSchedule.isOnline ? 'ĐANG TRỰC TUYẾN' : 'NGOẠI TUYẾN' }}</p>
                 </div>
                 <button 
                   @click="toggleScheduleOnline(nextSchedule)"
                   class="w-14 h-8 bg-gray-100 rounded-full p-1 relative transition-colors duration-300 flex items-center"
                   :class="{'bg-emerald-500': nextSchedule.isOnline}"
                 >
                   <div 
                     class="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300"
                     :class="{'translate-x-6': nextSchedule.isOnline}"
                   ></div>
                 </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule (Today's Trips) -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest">Lịch trình hôm nay</h3>
              <p class="text-gray-400 text-sm font-medium mt-1">Danh sách {{ todayTrips.length }} đơn đặt xe cần xử lý</p>
            </div>
            <router-link to="/driver/trips" class="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Xem tất cả</router-link>
          </div>
          
          <div class="p-4">
            <div v-if="todayTrips.length" class="space-y-3">
              <div v-for="trip in todayTrips" :key="trip._id" class="p-4 rounded-3xl hover:bg-gray-50 transition-all group flex items-center justify-between border border-transparent hover:border-gray-100">
                <div class="flex items-center flex-1">
                  <div class="w-14 h-14 bg-gray-100 rounded-2xl mr-4 flex items-center justify-center relative overflow-hidden">
                    <img v-if="trip.car" :src="getCarImageUrl(trip.car, 0)" class="absolute inset-0 w-full h-full object-cover" @error="handleImageError">
                    <div v-else class="text-xl">👨‍✈️</div>
                  </div>
                  <div>
                    <h4 v-if="trip.car" class="font-black text-gray-900">{{ trip.car.brand }} {{ trip.car.model }}</h4>
                    <h4 v-else class="font-black text-gray-900">Dịch vụ Tài xế</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ formatTime(trip.pickupTime) }}</span>
                      <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span class="text-[10px] font-bold text-gray-400 uppercase">{{ trip.renter?.fullName }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-black text-emerald-600">{{ formatPrice(trip.pricing.totalAmount) }}</p>
                  <span :class="['inline-block mt-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest', getStatusBadgeClass(trip.status)]">
                    {{ getStatusLabel(trip.status) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="py-20 text-center">
              <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon class="w-10 h-10 text-gray-300" />
              </div>
              <p class="text-gray-400 font-bold">Không có lịch trình hôm nay</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Performance & Trends -->
      <div class="space-y-6">
        <!-- Quick Actions (Modern Grid) -->
        <div class="grid grid-cols-2 lg:grid-cols-1 gap-4">
           <router-link to="/driver/trips" class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden">
             <div class="relative z-10">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Quản lý</p>
                <h4 class="text-lg font-black uppercase leading-tight">Hành trình<br>Vận tải</h4>
             </div>
             <TruckIcon class="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
           </router-link>
           
           <router-link to="/driver/schedule" class="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden">
             <div class="relative z-10">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Thiết lập</p>
                <h4 class="text-lg font-black uppercase leading-tight">Lịch làm<br>Việc mới</h4>
             </div>
             <CalendarIcon class="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
           </router-link>
        </div>

        <!-- Performance Indicators -->
        <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest mb-8 text-center">Hiệu suất thu nhập</h3>
          
          <div class="space-y-4">
            <!-- Today -->
            <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 group">
              <div class="flex justify-between items-center">
                <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Thu nhập ngày</p>
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p class="text-2xl font-black text-emerald-700 mt-2">{{ formatPrice(earnings.today || 0) }}</p>
            </div>

            <!-- Month -->
            <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 group">
              <div class="flex justify-between items-center">
                <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Trong tháng này</p>
                <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
              <p class="text-2xl font-black text-indigo-700 mt-2">{{ formatPrice(earnings.month || 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Weekly Chart (Admin Style) -->
        <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-lg font-black text-gray-900 uppercase tracking-widest">Xu hướng tuần</h3>
            <div class="p-2 bg-indigo-50 rounded-lg">
              <ChartBarIcon class="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Quick Actions (Modern Grid) -->
        <div class="grid grid-cols-3 gap-4">
          <router-link to="/driver/trips" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group">
             <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <TruckIcon class="w-6 h-6 text-blue-600" />
             </div>
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hành trình</p>
          </router-link>
          <router-link to="/driver/schedule" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group">
             <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <CalendarIcon class="w-6 h-6 text-indigo-600" />
             </div>
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lịch làm việc</p>
          </router-link>
          <router-link to="/driver/profile" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group">
             <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <HeroStarIcon class="w-6 h-6 text-amber-500" />
             </div>
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uy tín</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { 
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon as HeroStarIcon,
  CalendarIcon,
  ChartBarIcon
} from "@heroicons/vue/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const isOnline = ref(false);
const showNotifications = ref(false);
const currentTrip = ref(null);
const todayTrips = ref([]);
const recentTrips = ref([]);
const notifications = ref([]);
const nextSchedule = ref(null);

const driverStats = ref({
  totalTrips: 0,
  totalEarnings: 0,
  averageRating: 0,
  todayBookings: 0,
});

const earnings = ref({
  today: 0,
  week: 0,
  month: 0,
});

const weeklyEarningsData = ref([]);
const weeklyLabels = ref(["CN", "T2", "T3", "T4", "T5", "T6", "T7"]);

// Chart data - real weekly earnings from backend
const chartData = computed(() => ({
  labels: weeklyLabels.value,
  datasets: [
    {
      label: "Thu nhập (triệu)",
      data: weeklyEarningsData.value.length > 0 
        ? weeklyEarningsData.value.map(v => v / 1000000)
        : [
            earnings.value.today || 0,
            2.5,
            1.8,
            3.2,
            2.1,
            4.0,
            earnings.value.week || 0,
          ].map((v) => v / 1000000),
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#10B981",
      pointBorderColor: "#fff",
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0,0,0,0.05)",
      },
      ticks: {
        callback: function (value) {
          return value + "tr";
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

const unreadNotifications = computed(
  () => notifications.value.filter((n) => !n.read).length,
);

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");
const formatDateTime = (date) => new Date(date).toLocaleString("vi-VN");
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const resolveImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
}

// Hàm lấy ảnh xe - kiểm tra nếu có url thì dùng url, nếu không thì gọi API
const getCarImageUrl = (car, index) => {
  if (!car || !car.images || !car.images[index]) return '/logo.png'
  const image = car.images[index]
  // Nếu ảnh có url, dùng url
  if (image.url) {
    return resolveImageUrl(image.url)
  }
  // Nếu không có url, gọi API để lấy binary data
  return `/api/cars/${car._id}/images/${index}`
}

const handleImageError = (event) => {
  event.target.src = '/logo.png'
}

const formatDateRange = (start, end) => {
  const s = new Date(start).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
  const e = new Date(end).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
  return `${s} → ${e}`;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    active: "Đang diễn ra",
    completed: "✅ Hoàn thành",
    cancelled: "❌ Đã hủy",
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    active: "bg-emerald-100 text-emerald-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const fetchDriverData = async () => {
  try {
    loading.value = true;
    const response = await api.get("/driver/dashboard");

    driverStats.value = { ...driverStats.value, ...response.data.stats };
    earnings.value = response.data.earnings;
    currentTrip.value = response.data.currentTrip;
    todayTrips.value = response.data.todayTrips;
    recentTrips.value = response.data.recentTrips;
    notifications.value = response.data.notifications || [];
    isOnline.value = response.data.isOnline || false;
    
    // Assign schedules
    const allSchedules = response.data.schedules || [];
    if (allSchedules.length > 0) {
      // Pick the first one or find the one that is current
      nextSchedule.value = allSchedules[0];
    } else {
      nextSchedule.value = null;
    }

    // 🛠️ FIX: Balanced & Align Chart Data to last 7 days
    const earningsRes = await api.get('/driver/earnings?period=week');
    if (earningsRes.data && earningsRes.data.earnings) {
      const dailyMap = {};
      earningsRes.data.earnings.forEach(d => { dailyMap[d._id] = d.totalEarnings; });
      
      const last7DaysData = [];
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Match backend grouping format (YYYY-MM-DD local)
        const dateStr = d.toLocaleDateString('en-CA');
        last7DaysData.push(dailyMap[dateStr] || 0);
        
        // Dynamic labels: CN, T2...
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        labels.push(i === 0 ? "H.Nay" : dayNames[d.getDay()]);
      }
      weeklyEarningsData.value = last7DaysData;
      weeklyLabels.value = labels;
    }

    // Calculate additional stats
    driverStats.value.totalTrips = response.data.stats?.totalTrips || 0;
    driverStats.value.totalEarnings = response.data.earnings?.allTime || response.data.stats?.totalEarnings || 0;
    driverStats.value.averageRating = response.data.stats?.averageRating || 0;
    driverStats.value.todayBookings = response.data.stats?.todayBookings || 0;
  } catch (error) {
    toast.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    console.error("Dashboard error:", error);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async () => {
  try {
    await api.put("/driver/status", { isOnline: isOnline.value });
    toast.success(
      `Bạn đã ${isOnline.value ? "bật chế độ Online 🟢" : "tắt chế độ Online 🔴"}`,
    );
  } catch (error) {
    isOnline.value = !isOnline.value;
    toast.error("Không thể cập nhật trạng thái");
  }
};

const toggleScheduleOnline = async (schedule) => {
  try {
    const newStatus = !schedule.isOnline;
    await api.post('/driver/schedule/online', {
      scheduleId: schedule._id,
      isOnline: newStatus
    });
    schedule.isOnline = newStatus;
    toast.success(newStatus ? '🟢 Bật trực tuyến cho lịch này' : '⚫ Tắt trực tuyến');
  } catch (e) {
    toast.error('Không thể cập nhật trạng thái lịch');
  }
};

const startTrip = async () => {
  if (!currentTrip.value) return;
  try {
    await api.put(`/driver/trips/${currentTrip.value._id}/start`);
    toast.success("✅ Bắt đầu chuyến đi thành công!");
    await fetchDriverData();
  } catch (error) {
    toast.error("❌ Không thể bắt đầu chuyến đi");
  }
};

const contactCustomer = () => {
  toast.info("📞 Chức năng gọi khách hàng sẽ sớm có!");
};

const viewTripDetails = (tripId) => {
  router.push(`/driver/trips/${tripId}`);
};

const markNotificationRead = async (notificationId) => {
  try {
    await api.put(`/driver/notifications/${notificationId}/read`);
    const notification = notifications.value.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    showNotifications.value = false;
    toast.success('Đã đánh dấu là đã đọc');
  } catch (error) {
    toast.error('Không thể đánh dấu thông báo');
  }
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

// Refresh data every 30s when online
watch(isOnline, (newVal) => {
  if (newVal) {
    const interval = setInterval(fetchDriverData, 30000);
  }
});

onMounted(async () => {
  if (!authStore.user || !['driver', 'collaborator', 'admin'].includes(authStore.user.role)) {
    router.push("/");
    return;
  }

  await fetchDriverData();

  // Auto refresh every 5 minutes
  const refreshInterval = setInterval(fetchDriverData, 300000);
});
</script>

<style scoped>
.btn {
  @apply px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4;
}
.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-300;
}
.btn-outline {
  @apply border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.notification-bell {
  animation: bellRing 2s infinite;
}
@keyframes bellRing {
  0%,
  100% {
    transform: rotate(0);
  }
  10%,
  30% {
    transform: rotate(15deg);
  }
  20%,
  40% {
    transform: rotate(-10deg);
  }
}
</style>
