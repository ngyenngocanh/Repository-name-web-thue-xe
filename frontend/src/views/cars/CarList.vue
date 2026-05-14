<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-[#0f172a] text-white relative overflow-hidden -mt-24 pt-24 pb-24 md:-mt-28 md:pt-28 md:pb-28">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] bg-primary-600/20 blur-[120px] rounded-full"></div>
        <div class="absolute top-[20%] -right-[5%] w-[30%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-full"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
          Tìm chiếc xe <span class="text-gradient-primary">Hoàn hảo</span><br>cho chuyến đi
        </h1>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
          Khám phá bộ sưu tập xe sang trọng và tiện nghi bậc nhất, mang đến trải nghiệm di chuyển đẳng cấp.
        </p>
      </div>
    </div>

    <!-- Search Section (Bắt mắt & Rõ ràng) - OVERLAPPING -->
    <div class="relative z-30 max-w-5xl mx-auto px-4 -mt-24 mb-16">
      <div class="bg-slate-200 p-2 rounded-[3.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-2 relative animate-fade-in">
        <div class="flex-1 grid grid-cols-1 md:grid-cols-4 w-full gap-2 px-2 py-2">
              
              <!-- Địa điểm -->
              <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors relative">
                <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Địa điểm</label>
                <div class="relative w-full location-dropdown-container">
                  <div @click="showLocationMenu = !showLocationMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !filters.city}" class="truncate text-[15px] text-black">{{ filters.city || 'Thành phố...' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="showLocationMenu" class="absolute z-50 mt-6 w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 -left-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                       <div class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50 flex items-center justify-between">
                         Chọn Tỉnh/Thành 
                         <span class="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-[9px]">{{ popularCities.length }} Tỉnh</span>
                       </div>
                       <div class="p-2 grid grid-cols-1 gap-1">
                         <div v-for="city in popularCities" :key="city" @click="filters.city = city; showLocationMenu = false; handleSearch()" class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group" :class="{'bg-primary-50 text-primary-600': filters.city === city}">
                           <svg v-if="filters.city === city" class="w-4 h-4 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
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
                  <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Ngày nhận</label>
                  <div class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !filters.startDate}" class="truncate text-[15px] text-black">{{ filters.startDate ? dayjs(filters.startDate).format('DD/MM/YYYY') : 'Chọn ngày' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>

                <div @click="openCalendar('end')" class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300 relative h-full">
                  <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Ngày trả</label>
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

              <!-- Price Filter -->
              <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300">
                <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">Khoảng giá</label>
                <div class="relative w-full price-dropdown-container">
                  <div @click="showPriceMenu = !showPriceMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !filters.priceRange}" class="truncate text-[15px] text-black">{{ filters.priceRange ? priceRanges.find(p => p.value === filters.priceRange)?.label : 'Tất cả giá' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="showPriceMenu" class="absolute z-50 mt-6 w-full min-w-[220px] bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 right-0 md:left-0 max-h-[350px] overflow-y-auto custom-scrollbar">
                       <div class="p-2 grid grid-cols-1 gap-1">
                         <div v-for="price in priceRanges" :key="price.value" @click="filters.priceRange = price.value; showPriceMenu = false; handleSearch()" class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group" :class="{'bg-primary-50 text-primary-600': filters.priceRange === price.value}">
                           <svg v-if="filters.priceRange === price.value" class="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                           <span v-else class="w-4 h-4 mr-3 text-slate-300 group-hover:text-primary-300 transition-colors flex-shrink-0 inline-block rounded-full border border-current"></span>
                           {{ price.label }}
                         </div>
                       </div>
                    </div>
                  </transition>
                </div>
              </div>
           </div>
           
           <button @click="fetchCars()" class="w-full md:w-auto px-10 py-6 m-1 bg-gray-900 hover:bg-black text-white font-black rounded-3xl shadow-xl shadow-gray-900/20 transition-all uppercase tracking-widest text-[11px] active-scale flex-shrink-0 whitespace-nowrap group relative overflow-hidden">
             <span class="relative z-10 flex items-center">Tìm xe ngay <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
           </button>
        </div>
      </div>

    <!-- Main Content below Banner -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <div class="lg:w-72">
          <div class="bg-white rounded-[2.5rem] shadow-ux border border-gray-100 p-8 sticky top-24 space-y-10">
            <div>
              <h3 class="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 flex items-center gap-2">
                <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
                Bộ lọc tìm kiếm
              </h3>
              
              <!-- Car Type -->
              <div class="space-y-4">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hộp số</h4>
                <div class="space-y-3">
                  <label v-for="t in [['manual', 'Số sàn'], ['automatic', 'Số tự động']]" :key="t[0]" class="flex items-center group cursor-pointer">
                    <div class="relative flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="filters.transmission"
                        :value="t[0]"
                        class="peer sr-only"
                        @change="handleSearch"
                      >
                      <div class="w-5 h-5 border-2 border-gray-200 rounded-lg group-hover:border-primary-400 peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-300"></div>
                      <svg class="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span class="ml-3 text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{{ t[1] }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Seats -->
            <div class="space-y-4">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số chỗ ngồi</h4>
              <div class="grid grid-cols-3 gap-2">
                <label v-for="s in ['4', '5', '7']" :key="s" class="cursor-pointer group">
                  <input 
                    type="checkbox" 
                    v-model="filters.seats"
                    :value="s"
                    class="peer sr-only"
                    @change="handleSearch"
                  >
                  <div class="py-2 text-center rounded-xl border-2 border-gray-100 text-xs font-black text-gray-400 peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:border-gray-200 transition-all">
                    {{ s }}
                  </div>
                </label>
              </div>
            </div>

            <!-- Fuel Type -->
            <div class="space-y-4">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhiên liệu</h4>
              <div class="flex flex-wrap gap-2">
                <label v-for="f in [['gasoline', 'Xăng'], ['diesel', 'Dầu'], ['electric', 'Điện']]" :key="f[0]" class="cursor-pointer group">
                  <input 
                    type="checkbox" 
                    v-model="filters.fuel"
                    :value="f[0]"
                    class="peer sr-only"
                    @change="handleSearch"
                  >
                  <div class="px-4 py-2 rounded-full border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 hover:bg-gray-50 transition-all">
                    {{ f[1] }}
                  </div>
                </label>
              </div>
            </div>

            <!-- Sort -->
            <div class="space-y-4">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sắp xếp theo</h4>
              <div class="relative">
                <select 
                  v-model="sortBy"
                  class="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black text-gray-900 focus:ring-2 ring-primary-500/20 appearance-none"
                  @change="handleSearch"
                >
                  <option value="-createdAt">Mới nhất</option>
                  <option value="pricePerDay">Giá tăng dần</option>
                  <option value="-pricePerDay">Giá giảm dần</option>
                  <option value="-rating.average">Đánh giá cao</option>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <button 
              @click="resetFilters"
              class="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-2xl transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <!-- Car Grid -->
        <div class="flex-1">
          <!-- Results Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                Danh sách xe
              </h1>
              <p class="text-gray-600">
                {{ pagination.total }} xe được tìm thấy
              </p>
            </div>
            
            <!-- View Toggle -->
            <div class="flex gap-2">
              <button 
                @click="viewMode = 'grid'"
                class="p-2 rounded border transition-colors"
                :class="viewMode === 'grid' 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-300'"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
                </svg>
              </button>
              <button 
                @click="viewMode = 'list'"
                class="p-2 rounded border transition-colors"
                :class="viewMode === 'list' 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-300'"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 9" :key="i" class="card">
              <div class="skeleton skeleton-image"></div>
              <div class="card-body">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="cars.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy xe nào
            </h3>
            <p class="text-gray-600 mb-4">
              Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
            <button @click="resetFilters" class="btn btn-primary">
              Xóa bộ lọc
            </button>
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CarCard 
              v-for="car in cars" 
              :key="car._id"
              :car="car"
            />
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <CarListItem 
              v-for="car in cars" 
              :key="car._id"
              :car="car"
            />
          </div>

          <!-- Pagination -->
          <div v-if="cars.length > 0" class="mt-8">
            <Pagination 
              :current-page="pagination.page"
              :total-pages="pagination.pages"
              :total="pagination.total"
              @page-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import CarCard from '@/components/cars/CarCard.vue'
import CarListItem from '@/components/cars/CarListItem.vue'
import Pagination from '@/components/common/Pagination.vue'
import dayjs from "dayjs"

const route = useRoute()
const router = useRouter()

const headerContent = computed(() => {
  if (route.query.serviceType === 'with_driver') {
    return {
      title: 'Thuê xe <span class="text-primary-400">Kèm tài xế</span>',
      description: 'Hành trình trọn vẹn với những mẫu xe đời mới và đội ngũ tài xế chuyên nghiệp, chu đáo.'
    }
  }
  return {
    title: 'Thuê xe <span class="text-primary-400">Thông minh</span>',
    description: 'Tự do khám phá trên những chiếc xe sang trọng, đầy đủ tiện nghi với thủ tục thuê xe nhanh gọn.'
  }
})

const loading = ref(false)
const cars = ref([])
const viewMode = ref('grid')
const sortBy = ref('-createdAt')

const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
})

const filters = ref({
  city: '',
  startDate: '',
  endDate: '',
  brands: [],
  transmission: [],
  seats: [],
  fuel: [],
  priceRange: ''
})

const showLocationMenu = ref(false);
const showPriceMenu = ref(false);

const popularCities = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "Bà Rịa - Vũng Tàu", "Bình Dương", "Bình Thuận", "Đắk Lắk", "Đồng Nai",
  "Khánh Hòa", "Kiên Giang", "Lâm Đồng", "Quảng Ninh"
];

const priceRanges = [
  { value: "", label: "Tất cả giá" },
  { value: "0-500000", label: "Dưới 500k / ngày" },
  { value: "500000-1000000", label: "500k - 1Tr / ngày" },
  { value: "1000000-2000000", label: "1 - 2Tr / ngày" },
  { value: "2000000", label: "Trên 2Tr / ngày" }
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
  if (!e.target.closest('.price-dropdown-container')) showPriceMenu.value = false;
  if (!e.target.closest('.date-dropdown-container')) showCalendarTarget.value = null;
};

const popularBrands = ['Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'VinFast']

const today = new Date().toISOString().split('T')[0]

const parsePriceRange = (range) => {
  if (!range) return {}
  const [min, max] = range.split('-').map(Number)
  return { min, max }
}

const buildQueryParams = () => {
  const params = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    sort: sortBy.value
  }

  if (filters.value.city) params.city = filters.value.city
  if (filters.value.location) params.city = filters.value.location
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  if (filters.value.brands.length > 0) params.brand = filters.value.brands.join(',')
  if (filters.value.transmission.length > 0) params.transmission = filters.value.transmission.join(',')
  if (filters.value.seats.length > 0) params.seats = filters.value.seats.join(',')
  if (filters.value.fuel.length > 0) params.fuel = filters.value.fuel.join(',')
  
  const priceRange = parsePriceRange(filters.value.priceRange)
  if (priceRange.min !== undefined) params.minPrice = priceRange.min
  if (priceRange.max !== undefined) params.maxPrice = priceRange.max

  return params
}

const fetchCars = async () => {
  try {
    loading.value = true
    const params = buildQueryParams()
    const response = await api.get('/cars', { params })
    
    cars.value = response.data.cars
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('Error fetching cars:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  updateURL()
  fetchCars()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  updateURL()
  fetchCars()
}

const toggleBrand = (brand) => {
  const index = filters.value.brands.indexOf(brand)
  if (index > -1) {
    filters.value.brands.splice(index, 1)
  } else {
    filters.value.brands.push(brand)
  }
  handleSearch()
}

const resetFilters = () => {
  filters.value = {
    city: '',
    startDate: '',
    endDate: '',
    brands: [],
    transmission: [],
    seats: [],
    fuel: [],
    priceRange: ''
  }
  sortBy.value = '-createdAt'
  pagination.value.page = 1
  updateURL()
  fetchCars()
}

const updateURL = () => {
  const params = buildQueryParams()
  router.push({ path: route.path, query: params })
}

const initFromURL = () => {
  const query = route.query
  
  if (query.location) filters.value.city = query.location
  if (query.city) filters.value.city = query.city
  if (query.startDate) filters.value.startDate = query.startDate
  if (query.endDate) filters.value.endDate = query.endDate
  if (query.brand) filters.value.brands = query.brand.split(',')
  if (query.transmission) filters.value.transmission = query.transmission.split(',')
  if (query.seats) filters.value.seats = query.seats.split(',')
  if (query.fuel) filters.value.fuel = query.fuel.split(',')
  if (query.minPrice && query.maxPrice) {
    filters.value.priceRange = `${query.minPrice}-${query.maxPrice}`
  }
  if (query.page) pagination.value.page = parseInt(query.page)
  if (query.sort) sortBy.value = query.sort
}

onMounted(() => {
  initFromURL()
  fetchCars()
  document.addEventListener('click', closeDropdowns);
})

watch(() => route.query, () => {
  initFromURL()
  fetchCars()
}, { deep: true })

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
</style>
