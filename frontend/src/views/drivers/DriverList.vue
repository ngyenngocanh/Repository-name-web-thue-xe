<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Search Header -->
    <!-- Premium Header -->
    <div class="relative -mt-24 pt-28 pb-48 bg-[#0f172a] overflow-hidden md:-mt-28 md:pt-32">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-2rem]">
        <div class="inline-block px-4 py-1.5 bg-primary-500/10 backdrop-blur-md border border-primary-500/20 rounded-full mb-6">
          <span class="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Premium Driver Service</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
          Hành trình của bạn, <br />
          <span class="text-gradient-primary">Sự tận tâm của chúng tôi</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
          Đội ngũ tài xế chuyên nghiệp, lịch thiệp và am hiểu đường phố, sẵn sàng phục vụ mọi nhu cầu di chuyển của quý khách.
        </p>
      </div>
    </div>

    <!-- Search Section (Bắt mắt & Rõ ràng) -->
    <div class="relative z-30 max-w-5xl mx-auto px-4 -mt-24 mb-16">
      <div class="bg-slate-200 p-2 rounded-[3.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-2 relative animate-fade-in">
        <div class="flex-1 grid grid-cols-1 md:grid-cols-4 w-full gap-2 px-2 py-2">
          
          <!-- Địa điểm -->
          <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors relative">
            <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Địa điểm đón</label>
            <div class="relative w-full location-dropdown-container">
              <div @click="showLocationMenu = !showLocationMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                <span :class="{'text-slate-600': !filters.location}" class="truncate text-[15px] text-black">{{ filters.location || 'Thành phố...' }}</span>
                <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              
              <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="showLocationMenu" class="absolute z-50 mt-6 w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 -left-6 max-h-[350px] overflow-y-auto custom-scrollbar text-left">
                   <div class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50 flex items-center justify-between">
                     Chọn Tỉnh/Thành 
                     <span class="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-[9px]">{{ popularCities.length }} Tỉnh</span>
                   </div>
                   <div class="p-2 grid grid-cols-1 gap-1">
                     <div v-for="city in popularCities" :key="city" @click="filters.location = city; showLocationMenu = false; handleSearch()" class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group" :class="{'bg-primary-50 text-primary-600': filters.location === city}">
                       <svg v-if="filters.location === city" class="w-4 h-4 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                       <svg v-else class="w-4 h-4 mr-3 text-slate-300 group-hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       {{ city }}
                     </div>
                   </div>
                </div>
              </transition>
            </div>
          </div>
          
          <!-- Dates Group -->
          <div class="col-span-1 md:col-span-2 grid grid-cols-2 relative date-dropdown-container">
            <div @click="openCalendar('start')" class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300 relative h-full">
              <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Từ ngày</label>
              <div class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                <span :class="{'text-slate-600': !filters.startDate}" class="truncate text-[15px] text-black">{{ filters.startDate ? dayjs(filters.startDate).format('DD/MM/YYYY') : 'Chọn ngày' }}</span>
                <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>

            <div @click="openCalendar('end')" class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300 relative h-full">
              <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Đến ngày</label>
              <div class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                <span :class="{'text-slate-600': !filters.endDate}" class="truncate text-[15px] text-black">{{ filters.endDate ? dayjs(filters.endDate).format('DD/MM/YYYY') : 'Chọn ngày' }}</span>
                <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>

            <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <div v-if="showCalendarTarget" class="absolute z-50 mt-[75px] top-0 left-0 md:left-1/2 md:-translate-x-1/2 w-[320px] bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 p-5 text-gray-900">
                 <div class="flex justify-between items-center mb-5 border-b border-slate-100/50 pb-3">
                    <button @click.stop="prevMonth" class="p-1 hover:bg-slate-100 rounded-full transition-colors" :class="{'opacity-30 cursor-not-allowed': calendarDate.isBefore(dayjs(), 'month') || calendarDate.isSame(dayjs(), 'month')}">
                      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span class="font-black text-slate-800 text-[13px] uppercase tracking-widest">THÁNG {{ calendarDate.format('M - YYYY') }}</span>
                    <button @click.stop="nextMonth" class="p-1 hover:bg-slate-100 rounded-full transition-colors">
                      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </div>
                 <div class="grid grid-cols-7 gap-1 text-center mb-2">
                    <div v-for="day in weekDays" :key="day" class="text-[9px] font-black text-slate-400 uppercase">{{ day }}</div>
                 </div>
                 <div class="grid grid-cols-7 gap-1 text-center relative">
                    <div v-for="day in calendarDays" :key="day.date" class="relative group">
                       <div v-if="isDateInRange(day.date)" class="absolute inset-y-0 -inset-x-1 bg-primary-50/70 z-0"></div>
                       <div v-if="filters.startDate === day.date && filters.endDate" class="absolute inset-y-0 left-1/2 right-[-0.25rem] bg-primary-50/70 z-0"></div>
                       <div v-if="filters.endDate === day.date && filters.startDate" class="absolute inset-y-0 left-[-0.25rem] right-1/2 bg-primary-50/70 z-0"></div>
                       <button 
                          @click.stop="selectDate(day.date)" 
                          :disabled="day.isPast"
                          class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all relative z-10"
                          :class="[
                             day.isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-primary-100 hover:text-primary-700 cursor-pointer text-slate-700',
                             !day.isCurrentMonth ? 'opacity-40' : '',
                             filters.startDate === day.date || filters.endDate === day.date ? '!bg-primary-600 !text-white shadow-md scale-105' : '',
                             day.isToday && filters.startDate !== day.date && filters.endDate !== day.date ? 'border-2 border-primary-100 text-primary-600' : ''
                          ]"
                       >
                          {{ dayjs(day.date).date() }}
                       </button>
                    </div>
                 </div>
              </div>
            </transition>
          </div>

          <!-- License Class -->
          <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300">
            <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Hạng bằng</label>
            <div class="relative w-full license-dropdown-container">
              <div @click="showLicenseMenu = !showLicenseMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                <span :class="{'text-slate-600': !filters.licenseClass}" class="truncate text-[15px] text-black">{{ filters.licenseClass ? licenses.find(l => l.value === filters.licenseClass)?.label : 'Tất cả hạng' }}</span>
                <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="showLicenseMenu" class="absolute z-50 mt-6 w-full min-w-[200px] bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 right-0 max-h-[350px] overflow-y-auto custom-scrollbar">
                   <div class="p-2 grid grid-cols-1 gap-1 text-left">
                     <div v-for="lic in licenses" :key="lic.value" @click="filters.licenseClass = lic.value; showLicenseMenu = false; handleSearch()" class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group" :class="{'bg-primary-50 text-primary-600': filters.licenseClass === lic.value}">
                       <svg v-if="filters.licenseClass === lic.value" class="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                       <span v-else class="w-4 h-4 mr-3 text-slate-300 group-hover:text-primary-300 transition-colors flex-shrink-0 inline-block rounded-full border border-current"></span>
                       {{ lic.label }}
                     </div>
                   </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <button @click="fetchDrivers" class="w-full md:w-auto px-10 py-6 m-1 bg-gray-900 hover:bg-black text-white font-black rounded-3xl shadow-xl shadow-gray-900/20 transition-all uppercase tracking-widest text-[11px] active-scale flex-shrink-0 whitespace-nowrap group relative overflow-hidden">
          <span class="relative z-10 flex items-center">TÌM TÀI XẾ <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800 font-medium">⚠️ {{ error }}</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="spinner"></div>
      </div>

      <div v-else-if="drivers.length > 0">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-2xl font-black text-gray-900">Tìm thấy {{ drivers.length }} tài xế</h2>
          <div class="text-sm font-medium text-gray-500">Hiển thị kết quả mới nhất</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            v-for="driver in drivers" 
            :key="driver._id"
            class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-ux hover-lift transition-all duration-500 cursor-pointer relative overflow-hidden"
            @click="$router.push(`/drivers/${driver._id}`)"
          >
            <!-- Premium Accent -->
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative mb-8 text-center pt-2">
              <div class="w-28 h-28 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-primary-600 to-primary-100 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <img 
                  :src="getUserAvatarUrl(driver._id, driver.avatar) || '/placeholder-avatar.svg'" 
                  :alt="driver.fullName"
                  class="w-full h-full rounded-full object-cover border-4 border-white"
                  @error="$event.target.src = '/placeholder-avatar.svg'"
                >
              </div>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 glass px-4 py-1.5 rounded-full shadow-lg border-white/20 flex items-center space-x-1 whitespace-nowrap">
                <span class="text-yellow-500 text-xs">⭐</span>
                <span class="text-xs font-black text-gray-900">{{ driver.rating?.average?.toFixed(1) || '5.0' }}</span>
              </div>
            </div>

            <div class="text-center">
              <h3 class="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight mb-2">{{ driver.fullName }}</h3>
              
              <div class="flex items-center justify-center text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6">
                <svg class="w-3.5 h-3.5 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ driver.driverInfo?.operatingCity || 'TP. Hồ Chí Minh' }}
              </div>
              
              <div class="pt-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-2xl p-4 mt-auto">
                <div class="text-left">
                  <p class="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-1">Kinh nghiệm</p>
                  <p class="font-black text-gray-900 text-sm">{{ driver.driverInfo?.experience || '5' }}+ Năm</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-1">Giá từ</p>
                  <p class="font-black text-primary-600 text-sm">{{ formatPrice(driver.driverRatePerDay || 500000) }}</p>
                </div>
              </div>

              <button class="w-full mt-6 py-4 bg-gray-900 group-hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active-scale">
                XEM HỒ SƠ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tài xế nào</h3>
        <p class="text-gray-500">Thử thay đổi bộ lọc hoặc xem danh sách tất cả tài xế.</p>
        <button @click="resetFilters" class="mt-8 px-8 py-3 bg-primary-600 text-white font-black rounded-2xl shadow-lg">XEM TẤT CẢ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { getUserAvatarUrl } from '@/utils/avatar'
import dayjs from "dayjs"

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const drivers = ref([])
const error = ref(null)
const filters = ref({
  location: '',
  startDate: '',
  endDate: '',
  licenseClass: ''
})

const showLocationMenu = ref(false);
const showLicenseMenu = ref(false);

const popularCities = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "Bà Rịa - Vũng Tàu", "Bình Dương", "Bình Thuận", "Đắk Lắk", "Đồng Nai",
  "Khánh Hòa", "Kiên Giang", "Lâm Đồng", "Quảng Ninh"
];

const licenses = [
  { value: "", label: "Tất cả hạng" },
  { value: "B1", label: "Hạng B1" },
  { value: "B2", label: "Hạng B2" },
  { value: "C", label: "Hạng C" },
  { value: "D", label: "Hạng D" },
  { value: "E", label: "Hạng E" }
];

// Custom Calendar Logic
const showCalendarTarget = ref(null);
const calendarDate = ref(dayjs().startOf('month'));
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const openCalendar = (target) => {
  showCalendarTarget.value = target;
  if (target === 'start' && filters.value.startDate) {
     calendarDate.value = dayjs(filters.value.startDate).startOf('month');
  } else if (target === 'end' && filters.value.endDate) {
     calendarDate.value = dayjs(filters.value.endDate).startOf('month');
  } else {
     calendarDate.value = dayjs().startOf('month');
  }
};

const nextMonth = () => { calendarDate.value = calendarDate.value.add(1, 'month'); };
const prevMonth = () => {
  if (!calendarDate.value.isSame(dayjs(), 'month') && !calendarDate.value.isBefore(dayjs(), 'month')) {
    calendarDate.value = calendarDate.value.subtract(1, 'month');
  }
};

const isDateInRange = (dateStr) => {
   if(filters.value.startDate && filters.value.endDate) {
      const d = dayjs(dateStr);
      return d.isAfter(filters.value.startDate, 'day') && d.isBefore(filters.value.endDate, 'day');
   }
   return false;
};

const calendarDays = computed(() => {
  const days = [];
  const start = calendarDate.value;
  let startDow = start.day();
  let daysBefore = startDow === 0 ? 6 : startDow - 1;
  const prevMonth = start.subtract(1, 'month');
  const prevDaysInMonth = prevMonth.daysInMonth();
  for(let i = daysBefore - 1; i >= 0; i--) {
     days.push({ date: prevMonth.date(prevDaysInMonth - i).format('YYYY-MM-DD'), isCurrentMonth: false, isPast: true });
  }
  const today = dayjs().startOf('day');
  for(let i=1; i<=start.daysInMonth(); i++) {
     const d = start.date(i);
     days.push({ date: d.format('YYYY-MM-DD'), isCurrentMonth: true, isPast: d.isBefore(today) });
  }
  let nextDate = 1;
  while(days.length < 42) {
     days.push({ date: start.add(1, 'month').date(nextDate).format('YYYY-MM-DD'), isCurrentMonth: false, isPast: false });
     nextDate++;
  }
  return days;
});

const selectDate = (dateStr) => {
  if (showCalendarTarget.value === 'start') {
     filters.value.startDate = dateStr;
     if (filters.value.endDate && dayjs(filters.value.endDate).isBefore(dateStr)) {
        filters.value.endDate = '';
     }
     showCalendarTarget.value = 'end'; // Auto forward to end date
     calendarDate.value = dayjs(dateStr).startOf('month');
  } else if (showCalendarTarget.value === 'end') {
     if (filters.value.startDate && dayjs(dateStr).isBefore(filters.value.startDate)) {
        filters.value.endDate = filters.value.startDate;
        filters.value.startDate = dateStr;
        showCalendarTarget.value = null;
        handleSearch();
        return;
     }
     filters.value.endDate = dateStr;
     showCalendarTarget.value = null;
     handleSearch();
  }
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.location-dropdown-container')) showLocationMenu.value = false;
  if (!e.target.closest('.license-dropdown-container')) showLicenseMenu.value = false;
  if (!e.target.closest('.date-dropdown-container')) showCalendarTarget.value = null;
};

const today = new Date().toISOString().split('T')[0]

const handleSearch = () => {
  updateURL()
  fetchDrivers()
}

const updateURL = () => {
  const params = {}
  if (filters.value.location) params.location = filters.value.location
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  if (filters.value.licenseClass) params.licenseClass = filters.value.licenseClass
  router.push({ path: route.path, query: params })
}

const initFromURL = () => {
  const query = route.query
  if (query.location) filters.value.location = query.location
  if (query.startDate) filters.value.startDate = query.startDate
  if (query.endDate) filters.value.endDate = query.endDate
  if (query.licenseClass) filters.value.licenseClass = query.licenseClass
}

watch(() => route.query, () => {
  initFromURL()
  fetchDrivers()
}, { deep: true })

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const fetchDrivers = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await api.get('/users/top-drivers', {
      params: {
        ...filters.value,
        limit: 20 // Fetch more for list page
      }
    })
    console.log('API Response:', response.data)
    drivers.value = response.data.drivers || []
  } catch (err) {
    console.error('Error fetching drivers:', err)
    error.value = err.message || 'Lỗi khi tải danh sách tài xế'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    location: '',
    licenseClass: '',
    sort: '-rating.average'
  }
  fetchDrivers()
}

onMounted(() => {
  initFromURL()
  fetchDrivers()
  document.addEventListener('click', closeDropdowns);
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
