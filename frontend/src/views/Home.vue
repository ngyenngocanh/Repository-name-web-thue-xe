<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center bg-[#0f172a] overflow-hidden -mt-24 pt-24 md:-mt-28 md:pt-28">
      <!-- Premium Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] bg-primary-600/20 blur-[150px] rounded-full"></div>
        <div class="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-[#0f172a] to-transparent"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div class="max-w-4xl mx-auto mb-20">
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
            <span class="whitespace-nowrap">Khám phá hành trình</span> <br /><span class="text-gradient-primary text-6xl md:text-7xl lg:text-8xl">Thượng lưu</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-400 mb-12 font-medium max-w-2xl mx-auto">
            Giải pháp thuê xe và dịch vụ tài xế chuyên nghiệp hàng đầu, mang đến trải nghiệm di chuyển đẳng cấp vượt trội.
          </p>
        </div>

        <!-- Search Form -->
        <div class="max-w-6xl mx-auto bg-slate-200 p-3 rounded-[3.5rem] shadow-2xl animate-fade-in-up border border-white/40">
          <!-- Service Tabs -->
          <div class="flex bg-slate-300/60 p-2 rounded-[3rem] mb-2">
            <button
              v-for="service in services"
              :key="service.id"
              @click="activeService = service.id"
              class="flex-1 py-4 px-8 rounded-full font-black text-[10px] transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em]"
              :class="
                activeService === service.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-black hover:bg-slate-300'
              "
            >
              <span v-html="service.icon" class="w-4 h-4"></span>
              <span>{{ service.name }}</span>
            </button>
          </div>

            <div class="grid grid-cols-1 md:grid-cols-5 gap-2 px-2 py-4">
              <!-- Địa điểm -->
              <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors">
                  <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">
                  {{ activeService === 'hire_driver' ? 'Địa điểm đón' : 'Địa điểm' }}
                </label>
                <div class="relative w-full location-dropdown-container">
                  <div @click="showLocationMenu = !showLocationMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !searchForm.location}" class="truncate text-[15px] text-black">{{ searchForm.location || 'Thành phố...' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <div v-if="showLocationMenu" class="absolute z-50 mt-6 w-72 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 -left-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                       <div class="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50 flex items-center justify-between">
                         Chọn Tỉnh/Thành 
                         <span class="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-[9px]">{{ popularCities.length }} Tỉnh</span>
                       </div>
                       <div class="p-2 grid grid-cols-1 gap-1">
                         <div 
                           v-for="city in popularCities" 
                           :key="city" 
                           @click="searchForm.location = city; showLocationMenu = false"
                           class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group"
                           :class="{'bg-primary-50 text-primary-600': searchForm.location === city}"
                         >
                           <svg v-if="searchForm.location === city" class="w-4 h-4 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
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
                <!-- Ngày bắt đầu -->
                <div @click="openCalendar('start')" class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300 relative h-full">
                    <label class="block text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">
                    {{ activeService === 'hire_driver' ? 'Từ ngày' : 'Ngày nhận' }}
                  </label>
                  <div class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !searchForm.startDate}" class="truncate text-[15px] text-black">{{ searchForm.startDate ? dayjs(searchForm.startDate).format('DD/MM/YYYY') : 'Chọn ngày' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>

                <!-- Ngày kết thúc -->
                <div @click="openCalendar('end')" class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300 relative h-full">
                  <label class="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">
                    {{ activeService === 'hire_driver' ? 'Đến ngày' : 'Ngày trả' }}
                  </label>
                  <div class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !searchForm.endDate}" class="truncate text-[15px] text-black">{{ searchForm.endDate ? dayjs(searchForm.endDate).format('DD/MM/YYYY') : 'Chọn ngày' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>

                <!-- Custom Calendar Dropdown -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <div v-if="showCalendarTarget" class="absolute z-50 mt-[75px] top-0 left-0 md:left-1/2 md:-translate-x-1/2 w-[320px] bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 p-5">
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
                           <div v-if="searchForm.startDate === day.date && searchForm.endDate" class="absolute inset-y-0 left-1/2 right-[-0.25rem] bg-primary-50/70 z-0"></div>
                           <div v-if="searchForm.endDate === day.date && searchForm.startDate" class="absolute inset-y-0 left-[-0.25rem] right-1/2 bg-primary-50/70 z-0"></div>

                           <button 
                              @click.stop="selectDate(day.date)" 
                              :disabled="day.isPast"
                              class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all relative z-10"
                              :class="[
                                 day.isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-primary-100 hover:text-primary-700 cursor-pointer text-slate-700',
                                 !day.isCurrentMonth ? 'opacity-40' : '',
                                 searchForm.startDate === day.date || searchForm.endDate === day.date ? '!bg-primary-600 !text-white shadow-md scale-105' : '',
                                 day.isToday && searchForm.startDate !== day.date && searchForm.endDate !== day.date ? 'border-2 border-primary-100 text-primary-600' : ''
                              ]"
                           >
                              {{ dayjs(day.date).date() }}
                           </button>
                        </div>
                     </div>
                     <div class="mt-4 pt-3 border-t border-slate-100/50 text-center">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           {{ showCalendarTarget === 'start' ? 'Vui lòng chọn ngày nhận xe' : (showCalendarTarget === 'end' ? 'Chọn ngày trả để hoàn tất' : '') }}
                        </p>
                     </div>
                  </div>
                </transition>
              </div>

              <!-- Extra Filter -->
              <div class="text-left group cursor-pointer p-4 rounded-3xl hover:bg-white/40 transition-colors border-l border-slate-300">
                <label class="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-primary-600 transition-colors">
                  {{ activeService === 'hire_driver' ? 'Hạng bằng' : 'Khoảng giá' }}
                </label>
                
                <!-- Custom Dropdown for License -->
                <div v-if="activeService === 'hire_driver'" class="relative w-full license-dropdown-container">
                  <div @click="showLicenseMenu = !showLicenseMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !searchForm.license}" class="truncate text-[15px] text-black">{{ searchForm.license ? licenses.find(l => l.value === searchForm.license)?.label : 'Tất cả hạng' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="showLicenseMenu" class="absolute z-50 mt-6 w-full min-w-[200px] bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 left-0 max-h-[350px] overflow-y-auto custom-scrollbar">
                       <div class="p-2 grid grid-cols-1 gap-1">
                         <div 
                           v-for="lic in licenses" 
                           :key="lic.value" 
                           @click="searchForm.license = lic.value; showLicenseMenu = false"
                           class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group"
                           :class="{'bg-primary-50 text-primary-600': searchForm.license === lic.value}"
                         >
                           <svg v-if="searchForm.license === lic.value" class="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                           <span v-else class="w-4 h-4 mr-3 text-slate-300 group-hover:text-primary-300 transition-colors flex-shrink-0 inline-block rounded-full border border-current"></span>
                           {{ lic.label }}
                         </div>
                       </div>
                    </div>
                  </transition>
                </div>

                <!-- Custom Dropdown for Price -->
                <div v-else class="relative w-full price-dropdown-container">
                  <div @click="showPriceMenu = !showPriceMenu" class="w-full flex justify-between items-center bg-transparent border-none p-0 font-extrabold text-black focus:ring-0 text-sm cursor-pointer whitespace-nowrap">
                    <span :class="{'text-slate-600': !searchForm.priceRange}" class="truncate text-[15px] text-black">{{ searchForm.priceRange ? priceRanges.find(p => p.value === searchForm.priceRange)?.label : 'Tất cả giá' }}</span>
                    <svg class="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="showPriceMenu" class="absolute z-50 mt-6 w-full min-w-[220px] bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100/50 right-0 md:left-0 max-h-[350px] overflow-y-auto custom-scrollbar">
                       <div class="p-2 grid grid-cols-1 gap-1">
                         <div 
                           v-for="price in priceRanges" 
                           :key="price.value" 
                           @click="searchForm.priceRange = price.value; showPriceMenu = false"
                           class="px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-2xl cursor-pointer transition-all flex items-center group"
                           :class="{'bg-primary-50 text-primary-600': searchForm.priceRange === price.value}"
                         >
                           <svg v-if="searchForm.priceRange === price.value" class="w-4 h-4 mr-3 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                           <span v-else class="w-4 h-4 mr-3 text-slate-300 group-hover:text-primary-300 transition-colors flex-shrink-0 inline-block rounded-full border border-current"></span>
                           {{ price.label }}
                         </div>
                       </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Button -->
              <div class="flex items-center pl-2 pt-2 md:pt-0">
                <button @click="handleSearch" class="w-full h-full min-h-[60px] bg-primary-600 hover:bg-primary-500 text-white font-black py-2 px-4 rounded-[2rem] shadow-xl shadow-primary-900/20 transition-all uppercase tracking-[0.2em] text-[11px] active-scale flex items-center justify-center" :disabled="loading">
                   {{ loading ? 'Đang tìm...' : (activeService === 'hire_driver' ? 'TÌM TÀI XẾ' : 'TÌM XE') }}
                </button>
              </div>
            </div>

            <div
              class="mt-4 pt-4 border-t border-slate-300 flex items-center justify-center space-x-3"
            >
              <span class="bg-primary-600 text-white p-1 rounded-full shadow-sm"
                ><svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  /></svg
              ></span>
              <p
                class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >
                {{ services.find((s) => s.id === activeService).description }}
              </p>
            </div>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div class="flex flex-col items-center text-center group">
            <div
              class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-all duration-500 transform group-hover:rotate-12 shadow-sm"
            >
              <svg
                class="w-10 h-10 text-primary-600 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight"
            >
              An toàn tuyệt đối
            </h3>
            <p class="text-gray-500 leading-relaxed font-medium">
              Bảo hiểm đầy đủ cho mọi chuyến hành trình, đối tác được xác thực
              100%.
            </p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div
              class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-all duration-500 transform group-hover:-rotate-12 shadow-sm"
            >
              <svg
                class="w-10 h-10 text-primary-600 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight"
            >
              Giá cả minh bạch
            </h3>
            <p class="text-gray-500 leading-relaxed font-medium">
              Không phí ẩn, dễ dàng so sánh giá từ hàng ngàn chủ xe và tài xế uy
              tín.
            </p>
          </div>

          <div class="flex flex-col items-center text-center group">
            <div
              class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-all duration-500 transform group-hover:rotate-12 shadow-sm"
            >
              <svg
                class="w-10 h-10 text-primary-600 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight"
            >
              Thủ tục nhanh gọn
            </h3>
            <p class="text-gray-500 leading-relaxed font-medium">
              Đăng ký và nhận xe chỉ trong 5 phút. Hỗ trợ sự cố trên đường 24/7
              toàn quốc.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Cars Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12">
          <div class="max-w-2xl">
            <h2
              class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
            >
              Xe <span class="text-primary-600">Phổ biến & Yêu thích</span>
            </h2>
            <p class="text-lg text-gray-500">
              Khám phá danh sách những chiếc xe hàng đầu được khách hàng lựa
              chọn nhiều nhất thông qua hệ thống đánh giá minh bạch.
            </p>
          </div>
          <div class="mt-6 md:mt-0">
            <router-link
              to="/cars"
              class="group flex items-center font-bold text-primary-600 hover:text-primary-700 transition-all"
            >
              Tất cả các dòng xe
              <svg
                class="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>
        </div>

        <div
          v-if="loadingCars"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-white rounded-3xl h-96"
          ></div>
        </div>

        <div
          v-else-if="popularCars.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <CarCard
            v-for="car in popularCars"
            :key="car._id"
            :car="car"
          />
        </div>

        <div
          v-else
          class="text-center py-32 glass rounded-[3rem] border border-white/10"
        >
          <p class="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
            Hiện chưa có xe nào được đăng tải
          </p>
        </div>
      </div>
    </section>

    <!-- Top Drivers Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12">
          <div class="max-w-2xl">
            <h2
              class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
            >
              Tài xế <span class="text-primary-600">Uy tín & Kinh nghiệm</span>
            </h2>
            <p class="text-lg text-gray-500">
              Đội ngũ tài xế được xác minh nghiêm ngặt, đảm bảo mỗi chuyến hành
              trình của bạn luôn an toàn và thoải mái nhất.
            </p>
          </div>
          <div class="mt-6 md:mt-0">
            <router-link
              to="/drivers"
              class="group flex items-center font-bold text-primary-600 hover:text-primary-700 transition-all"
            >
              Xem tất cả tài xế
              <svg
                class="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>
        </div>

        <div
          v-if="loadingDrivers"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-gray-50 rounded-3xl h-80"
          ></div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div
            v-for="driver in topDrivers"
            :key="driver._id"
            class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-ux hover:shadow-ux-lg transition-all duration-500 cursor-pointer text-center relative overflow-hidden"
            @click="$router.push(`/drivers/${driver._id}`)"
          >
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative mb-8 pt-4">
              <div class="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-primary-600 to-indigo-100 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <img
                  :src="getUserAvatarUrl(driver._id, driver.avatar) || '/placeholder-avatar.svg'"
                  :alt="driver.fullName"
                  class="w-full h-full rounded-full object-cover border-4 border-white"
                  @error="$event.target.src = '/placeholder-avatar.svg'"
                />
              </div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full shadow-lg border-white/20">
                <span class="text-[10px] font-black text-primary-600">⭐ {{ driver.rating?.average?.toFixed(1) || "5.0" }}</span>
              </div>
            </div>

            <h3 class="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight mb-1 uppercase">
              {{ driver.fullName }}
            </h3>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-1">
              <svg class="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              {{ driver.driverInfo?.operatingCity || "TP. Hồ Chí Minh" }}
            </p>

            <div class="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
               <div class="text-left">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Kinh nghiệm</p>
                  <p class="text-sm font-black text-gray-900">{{ driver.driverInfo?.experience || 5 }}+ Năm</p>
               </div>
               <div class="text-right">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Giá từ</p>
                  <p class="text-sm font-black text-primary-600">{{ formatPrice(driver.driverRatePerDay || 500000) }}</p>
               </div>
            </div>

            <button class="w-full mt-8 py-4 bg-gray-900 group-hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active-scale shadow-lg shadow-gray-900/10 group-hover:shadow-primary-900/20">
              Xem hồ sơ
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-[#0f172a]"></div>
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 right-0 w-[50%] h-full bg-primary-600/20 blur-[120px] rounded-full translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[50%] h-full bg-indigo-600/20 blur-[120px] rounded-full -translate-x-1/2"></div>
      </div>
      
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 class="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
          Sẵn sàng để trở thành <br />
          <span class="text-gradient-primary">Đối tác thượng lưu?</span>
        </h2>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
          Gia nhập cộng đồng cho thuê xe chuyên nghiệp và tối ưu hóa thu nhập từ phương tiện của bạn ngay hôm nay.
        </p>
        <div class="flex flex-wrap justify-center gap-6">
          <router-link
            v-if="authStore.isAuthenticated && authStore.user && (String(authStore.user.role) === 'collaborator' || String(authStore.user.role) === 'driver')"
            to="/add-car"
            class="px-12 py-5 bg-primary-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-900/40 active-scale"
          >
            ĐĂNG XE NGAY
          </router-link>
          <router-link
            v-else-if="authStore.isAuthenticated && authStore.user && String(authStore.user.role) === 'user'"
            to="/become-collaborator"
            class="px-12 py-5 bg-primary-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-900/40 active-scale"
          >
            TRỞ THÀNH CỘNG TÁC VIÊN
          </router-link>
          <router-link
            v-else
            to="/login"
            class="px-12 py-5 bg-white text-gray-900 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-100 transition-all shadow-xl active-scale"
          >
            ĐĂNG NHẬP THAM GIA
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import { getUserAvatarUrl } from "@/utils/avatar";
import CarCard from "@/components/cars/CarCard.vue";
import dayjs from "dayjs";

const authStore = useAuthStore();

// Debug: log user role on every mount
onMounted(() => {
  if (authStore.user) {
    // eslint-disable-next-line no-console
    console.log("User role for CTA:", authStore.user.role);
  }
});

// Always fetch the latest user info on mount if authenticated
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchUser();
    } catch (e) {
      // Ignore error, fallback to local user
    }
  }
});

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const loadingCars = ref(false);
const loadingDrivers = ref(false);
const popularCars = ref([]);
const topDrivers = ref([]);

const activeService = ref("self_drive");
const services = [
  {
    id: "self_drive",
    name: "Xe tự lái",
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    description:
      "Bạn tự vận hành phương tiện, tối ưu tính riêng tư và linh hoạt.",
  },
  {
    id: "with_driver",
    name: "Xe kèm tài",
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    description:
      "Chủ xe sẽ cung cấp cả phương tiện và tài xế chuyên nghiệp cho bạn.",
  },
  {
    id: "hire_driver",
    name: "Thuê tài xế",
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
    description:
      "Tìm kiếm tài xế riêng để hỗ trợ lái xe trên chính phương tiện của bạn.",
  },
];

const searchForm = ref({
  location: "",
  startDate: "",
  endDate: "",
  license: "",
  priceRange: "",
});

const showLocationMenu = ref(false);
const showLicenseMenu = ref(false);
const showPriceMenu = ref(false);

const licenses = [
  { value: "", label: "Tất cả hạng" },
  { value: "B1", label: "Hạng B1" },
  { value: "B2", label: "Hạng B2" },
  { value: "C", label: "Hạng C" }
];

const priceRanges = [
  { value: "", label: "Tất cả giá" },
  { value: "0-500000", label: "Dưới 500k / ngày" },
  { value: "500000-1000000", label: "500k - 1Tr / ngày" },
  { value: "1000000-2000000", label: "1 - 2Tr / ngày" },
  { value: "2000000", label: "Trên 2Tr / ngày" }
];

const popularCities = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Cạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

// Custom Calendar Logic
const showCalendarTarget = ref(null);
const calendarDate = ref(dayjs().startOf('month'));
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const openCalendar = (target) => {
  showCalendarTarget.value = target;
  if (target === 'start' && searchForm.value.startDate) {
     calendarDate.value = dayjs(searchForm.value.startDate).startOf('month');
  } else if (target === 'end' && searchForm.value.endDate) {
     calendarDate.value = dayjs(searchForm.value.endDate).startOf('month');
  } else {
     calendarDate.value = dayjs().startOf('month');
  }
};

const nextMonth = () => {
    calendarDate.value = calendarDate.value.add(1, 'month');
};
const prevMonth = () => {
  if (calendarDate.value.isAfter(dayjs(), 'month') || calendarDate.value.isSame(dayjs(), 'month')) {
      // Actually we check if it is AFTER current month. So if it's the current month, cannot go back.
  }
  if (!calendarDate.value.isSame(dayjs(), 'month') && !calendarDate.value.isBefore(dayjs(), 'month')) {
    calendarDate.value = calendarDate.value.subtract(1, 'month');
  }
};

const isDateInRange = (dateStr) => {
   if(searchForm.value.startDate && searchForm.value.endDate) {
      const d = dayjs(dateStr);
      return d.isAfter(searchForm.value.startDate, 'day') && d.isBefore(searchForm.value.endDate, 'day');
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
     days.push({
       date: prevMonth.date(prevDaysInMonth - i).format('YYYY-MM-DD'),
       isCurrentMonth: false,
       isPast: true
     });
  }
  
  const today = dayjs().startOf('day');
  for(let i=1; i<=start.daysInMonth(); i++) {
     const d = start.date(i);
     days.push({
       date: d.format('YYYY-MM-DD'),
       isCurrentMonth: true,
       isPast: d.isBefore(today)
     });
  }
  
  let nextDate = 1;
  while(days.length < 42) {
     days.push({
       date: start.add(1, 'month').date(nextDate).format('YYYY-MM-DD'),
       isCurrentMonth: false,
       isPast: false
     });
     nextDate++;
  }
  return days;
});

const selectDate = (dateStr) => {
  if (showCalendarTarget.value === 'start') {
     searchForm.value.startDate = dateStr;
     if (searchForm.value.endDate && dayjs(searchForm.value.endDate).isBefore(dateStr)) {
        searchForm.value.endDate = '';
     }
     showCalendarTarget.value = 'end'; // Auto forward to end date
     calendarDate.value = dayjs(dateStr).startOf('month');
  } else if (showCalendarTarget.value === 'end') {
     if (searchForm.value.startDate && dayjs(dateStr).isBefore(searchForm.value.startDate)) {
        searchForm.value.endDate = searchForm.value.startDate;
        searchForm.value.startDate = dateStr;
        showCalendarTarget.value = null;
        return;
     }
     searchForm.value.endDate = dateStr;
     showCalendarTarget.value = null;
  }
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.location-dropdown-container')) {
    showLocationMenu.value = false;
  }
  if (!e.target.closest('.license-dropdown-container')) {
    showLicenseMenu.value = false;
  }
  if (!e.target.closest('.price-dropdown-container')) {
    showPriceMenu.value = false;
  }
  if (!e.target.closest('.date-dropdown-container')) {
    showCalendarTarget.value = null;
  }
};

// Kiểm tra xe bận
const isCarBusy = (car) => {
  const busyStatuses = ['on_trip', 'maintenance', 'repair', 'rented']
  return busyStatuses.includes(car.operationalStatus) || 
         (car.availability?.unavailableDates?.length > 0)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const resolveImageUrl = (url) => {
  if (!url) return '/logo.png'
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
};

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
};

const handleImageError = (event) => {
  event.target.src = '/logo.png'
};

const handleSearch = () => {
  if (!searchForm.value.startDate || !searchForm.value.endDate) {
    toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
    return;
  }

  const query = new URLSearchParams();
  if (searchForm.value.location) {
    query.append("location", searchForm.value.location);
  }
  query.append("startDate", searchForm.value.startDate);
  query.append("endDate", searchForm.value.endDate);
  query.append("serviceType", activeService.value);
  if (searchForm.value.license) query.append("license", searchForm.value.license);
  if (searchForm.value.priceRange) query.append("priceRange", searchForm.value.priceRange);

  // Redirect to appropriate list page
  if (activeService.value === "hire_driver") {
    router.push(`/drivers?${query.toString()}`);
  } else {
    router.push(`/cars?${query.toString()}`);
  }
};

const fetchPopularCars = async () => {
  try {
    loadingCars.value = true;
    const response = await api.get("/cars", {
      params: {
        limit: 8,
        sort: "-rating.average",
      },
    });
    popularCars.value = response.data.cars;
  } catch (error) {
    console.error("Error fetching popular cars:", error);
  } finally {
    loadingCars.value = false;
  }
};

const fetchTopDrivers = async () => {
  try {
    loadingDrivers.value = true;
    const response = await api.get("/users/top-drivers", {
      params: {
        limit: 8
      }
    });
    topDrivers.value = response.data.drivers;
  } catch (error) {
    console.error("Error fetching top drivers:", error);
  } finally {
    loadingDrivers.value = false;
  }
};

onMounted(() => {
  fetchPopularCars();
  fetchTopDrivers();
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
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
