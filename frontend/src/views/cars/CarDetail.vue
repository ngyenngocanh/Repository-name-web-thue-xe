<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="car" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <!-- Breadcrumbs -->
      <nav class="flex mb-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        <router-link to="/" class="hover:text-primary-600 transition-colors">TRANG CHỦ</router-link>
        <span class="mx-3 opacity-30 text-gray-900">/</span>
        <router-link to="/cars" class="hover:text-primary-600 transition-colors">DANH SÁCH XE</router-link>
        <span class="mx-3 opacity-30 text-gray-900">/</span>
        <span class="text-gray-900 tracking-normal">{{ car.brand }} {{ car.model }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content (Left Col) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Image Gallery Card -->
          <div class="bg-white rounded-[3rem] shadow-ux-lg overflow-hidden border border-gray-100 group/gallery">
            <div class="relative overflow-hidden h-[500px]">
              <img 
                :src="activeImage || getCarImageUrl(car, 0)" 
                :alt="`${car.brand} ${car.model}`"
                class="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/gallery:scale-110"
                @error="handleImageError"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-700"></div>
              
              <div class="absolute top-8 left-8 flex flex-col gap-4">
                <div class="glass px-5 py-2.5 rounded-2xl shadow-xl flex items-center space-x-3 border-white/20">
                  <span class="text-yellow-400 font-black flex items-center gap-1.5"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> {{ car.rating?.average?.toFixed(1) || '5.0' }}</span>
                  <span class="w-[1px] h-3 bg-white/20"></span>
                  <span class="text-[10px] font-black text-white/80 uppercase tracking-widest">{{ car.totalTrips || 0 }} chuyến</span>
                </div>
                <div v-if="car.owner?.isVerified" class="bg-blue-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-white/10">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Đã xác minh</span>
                </div>
              </div>
            </div>    </div>
            
            <div class="p-4 bg-gray-50 flex gap-4 overflow-x-auto no-scrollbar">
              <img 
                v-for="(image, index) in car.images" 
                :key="index"
                :src="getCarImageUrl(car, index)"
                @mouseenter="activeImage = getCarImageUrl(car, index)"
                @error="handleImageError"
                class="w-24 h-24 rounded-2xl object-cover cursor-pointer border-2 transition-all"
                :class="activeImage === getCarImageUrl(car, index) ? 'border-primary-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'"
              >
            </div>
          </div>

          <!-- Car Specifications -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Số chỗ</p>
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
                <span class="font-black text-gray-900">{{ car.seats }} Ghế</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Truyền động</p>
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.43 3.5h1.38c.41 0 .75.34.75.75s-.34.75-.75.75H8.11l-.4 1.63c-.38 1.56-2.6 1.56-2.98 0l-.4-1.63H3.05c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33zM3 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5.12-3.17c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.38l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.56c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08.33zM14 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/></svg>
                <span class="font-black text-gray-900">{{ car.transmission === 'automatic' ? 'Tự động' : 'Số sàn' }}</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Nhiên liệu</p>
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H10zm1 2a1 1 0 000 2h6a1 1 0 100-2H11zm0 4a1 1 0 000 2h6a1 1 0 100-2H11zm0 4a1 1 0 000 2h2a1 1 0 100-2H11zm4 0a1 1 0 100 2h2a1 1 0 100-2h-2z" clip-rule="evenodd"/></svg>
                <span class="font-black text-gray-900 capitalize">{{ car.fuel }}</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Năm SX</p>
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
                <span class="font-black text-gray-900">{{ car.year }}</span>
              </div>
            </div>
          </div>

          <!-- Description and Features -->
          <div class="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-primary-600 rounded-full mr-3"></span>
              Mô tả chi tiết
            </h2>
            <p class="text-gray-600 leading-relaxed mb-10">{{ car.description || 'Chưa có mô tả chi tiết cho xe này.' }}</p>

            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-primary-600 rounded-full mr-3"></span>
              Tiện nghi trên xe
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              <div v-for="feature in car.features" :key="feature" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div class="bg-green-100 text-green-600 p-2 rounded-xl">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
                <span class="font-bold text-sm text-gray-700">{{ getFeatureLabel(feature) }}</span>
              </div>
            </div>

            <!-- Pricing Details -->
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-primary-600 rounded-full mr-3"></span>
              Bảng giá chi tiết dịch vụ
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Self Drive -->
              <div v-if="car.isSelfDrive" class="bg-primary-50/50 p-6 rounded-[2rem] border border-primary-100">
                <h3 class="text-sm font-black text-primary-600 uppercase mb-4 flex items-center">
                   <span class="w-2 h-2 bg-primary-500 rounded-full mr-2"></span> Tự lái (Self-drive)
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá theo ngày</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerDay) }} / Ngày</span>
                  </div>
                  <div v-if="car.pricePerHour" class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá theo giờ (4h+)</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerHour) }} / Giờ</span>
                  </div>
                </div>
              </div>

              <!-- With Driver -->
              <div v-if="car.isWithDriver" class="bg-secondary-50 p-6 rounded-[2rem] border border-gray-100 italic">
                <h3 class="text-sm font-black text-gray-600 uppercase mb-4 flex items-center">
                   <span class="w-2 h-2 bg-gray-400 rounded-full mr-2"></span> Thuê kèm tài xế
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá theo ngày</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerDayWithDriver || car.pricePerDay + 500000) }} / Ngày</span>
                  </div>
                  <div v-if="car.pricePerHourWithDriver || car.pricePerHour" class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá theo giờ</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerHourWithDriver || car.pricePerHour + 100000) }} / Giờ</span>
                  </div>
                </div>
              </div>

              <!-- Special Pricing Tiles -->
              <div v-if="car.priceWeekend" class="col-span-full bg-red-50 p-6 rounded-[2rem] border border-red-100">
                 <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-black text-red-600 uppercase mb-1">Giá linh hoạt cuối tuần (T7-CN)</h3>
                        <p class="text-[10px] text-red-400 font-bold italic">Giá tự động áp dụng khi chuyến đi rơi vào Thứ 7 hoặc Chủ Nhật</p>
                    </div>
                    <div class="text-xl font-black text-red-600">{{ formatPrice(car.priceWeekend) }} / Ngày</div>
                 </div>
              </div>

               <div v-if="car.pricePerMonth" class="col-span-full bg-green-50 p-6 rounded-[2rem] border border-green-100">
                 <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-black text-green-600 uppercase mb-1">Gói thuê trọn tháng (Ưu đãi)</h3>
                        <p class="text-[10px] text-green-400 font-bold italic">Ưu tiên phục vụ khách hàng thuê lâu dài</p>
                    </div>
                    <div class="text-xl font-black text-green-600">{{ formatPrice(car.pricePerMonth) }} / Tháng</div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Driver Info Section (Only in With Driver Mode) -->
          <div v-if="rentalMode === 'with_driver'" class="bg-primary-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
            </div>

            <div v-if="car.owner?.driverInfo" class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div class="relative">
                <div class="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary-400 to-white/20">
                  <img :src="car.owner.avatar || '/placeholder-avatar.svg'" class="w-full h-full rounded-full object-cover border-4 border-primary-900">
                </div>
                <div class="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-full border-4 border-primary-900 shadow-lg">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
              </div>
              
              <div class="flex-1 text-center md:text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-primary-300 mb-1">Tài xế phục vụ bạn</p>
                <h3 class="text-3xl font-black mb-6 tracking-tight">{{ car.owner.fullName }}</h3>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-primary-300 uppercase font-black tracking-tighter mb-1">Kinh nghiệm</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.experience || '5+' }} Năm</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-primary-300 uppercase font-black tracking-tighter mb-1">Hạng bằng</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.licenseType || 'B2' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-primary-300 uppercase font-black tracking-tighter mb-1">Thành phố</p>
                    <p class="font-bold text-sm leading-none truncate">{{ car.owner.driverInfo.operatingCity || 'TP. HCM' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-primary-300 uppercase font-black tracking-tighter mb-1">Đánh giá</p>
                    <div class="flex items-center space-x-1">
                      <span class="text-yellow-400 font-bold">⭐ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 relative z-10">
              <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
              </div>
              <h3 class="text-xl font-black text-white mb-2">Đội ngũ tài xế chuyên nghiệp</h3>
              <p class="text-primary-200 text-sm max-w-md mx-auto">Chúng tôi sẽ điều phối tài xế có kinh nghiệm trên 5 năm và am hiểu lộ trình để phục vụ bạn tốt nhất.</p>
            </div>
          </div>

          <!-- Owner Profile Info -->
          <div class="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center space-x-6">
              <img :src="car.owner?.avatar || '/placeholder-avatar.svg'" class="w-20 h-20 rounded-full object-cover border-4 border-primary-50">
              <div>
                <h3 class="text-xl font-black text-gray-900 mb-1">{{ car.owner?.fullName }}</h3>
                <div class="flex items-center space-x-4 mb-2">
                  <div class="flex items-center text-yellow-500 font-bold text-sm">⭐ {{ car.owner?.rating?.average?.toFixed(1) || '5.0' }}</div>
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ car.owner?.totalTrips || 0 }} chuyến</div>
                </div>
                <p class="text-xs text-gray-500 font-medium italic">"Chủ xe nhiệt tình, xe luôn sạch sẽ và sẵn sàng."</p>
              </div>
            </div>
            <button class="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all uppercase text-xs tracking-widest">
              Nhắn tin chủ xe
            </button>
          </div>
        </div>

        <!-- Sidebar (Right Col) -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- Booking Card -->
            <div class="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-ux-lg">
              <h2 class="text-3xl font-black text-gray-900 mb-2 leading-tight">{{ car.brand }}</h2>
              <h3 class="text-lg font-bold text-primary-600 mb-8">{{ car.model }}</h3>
              
              <!-- Service Mode Toggle -->
              <div v-if="car.isSelfDrive && car.isWithDriver" class="flex bg-gray-100 p-1.5 rounded-2xl mb-4">
                <button 
                  @click="rentalMode = 'self_drive'"
                  class="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="rentalMode === 'self_drive' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Tự lái</button>
                <button 
                  @click="rentalMode = 'with_driver'"
                  class="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="rentalMode === 'with_driver' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Kèm tài</button>
              </div>

              <!-- Time Mode Toggle -->
              <div class="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                <button 
                  @click="timeMode = 'daily'"
                  class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="timeMode === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo ngày</button>
                <button 
                  @click="timeMode = 'hourly'"
                  class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="timeMode === 'hourly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo giờ</button>
                <button 
                  @click="timeMode = 'trip'; rentalMode = 'with_driver'"
                  class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="timeMode === 'trip' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo chuyến</button>
              </div>

              <div class="space-y-4 mb-8">
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label class="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{{ timeMode === 'daily' ? 'Thời gian thuê' : (timeMode === 'trip' ? 'Ngày khởi hành' : 'Ngày thuê') }}</label>
                  <div v-if="timeMode === 'daily'" class="flex flex-col space-y-2">
                    <div class="flex items-center justify-between">
                      <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-sm font-bold focus:ring-0">
                      <span class="text-gray-300 mx-2">→</span>
                      <input type="date" v-model="endDate" :min="startDate || today" class="bg-transparent border-none p-0 text-sm font-bold focus:ring-0">
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                       <input type="time" v-model="pickupTime" class="bg-transparent border-none p-0 text-xs font-bold text-gray-500 focus:ring-0">
                       <input type="time" v-model="returnTime" class="bg-transparent border-none p-0 text-xs font-bold text-gray-500 focus:ring-0 text-right">
                    </div>
                  </div>
                  <div v-else class="flex flex-col space-y-2">
                    <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full text-center">
                    <div class="pt-2 border-t border-gray-100 flex justify-center">
                       <input type="time" v-model="pickupTime" class="bg-transparent border-none p-0 text-xs font-bold text-gray-500 focus:ring-0 text-center">
                    </div>
                  </div>
                </div>

                <div v-if="timeMode === 'trip'" class="space-y-3">
                   <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 italic space-y-4">
                      <!-- Quick Fixed Routes -->
                      <div v-if="fixedTrips.length > 0" class="mb-4">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Lộ trình phổ biến</label>
                        <div class="flex flex-wrap gap-2">
                          <button 
                            v-for="ft in fixedTrips" 
                            :key="ft._id"
                            @click="selectFixedTrip(ft)"
                            class="text-left px-3 py-2 rounded-xl border transition-all"
                            :class="trip.startLocation === ft.source && trip.endLocation === ft.destination ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-primary-300'"
                          >
                            <div class="text-[10px] font-black uppercase tracking-widest truncate" :class="trip.startLocation === ft.source && trip.endLocation === ft.destination ? 'text-white' : 'text-gray-700'">{{ ft.source }} → {{ ft.destination }}</div>
                            <div class="text-xs font-bold mt-0.5" :class="trip.startLocation === ft.source && trip.endLocation === ft.destination ? 'text-primary-100' : 'text-primary-600'">{{ formatPrice(ft.fixedPrice) }}</div>
                          </button>
                        </div>
                      </div>

                      <div class="flex bg-indigo-100/50 p-1.5 rounded-2xl mb-4 border border-indigo-50">
                        <button type="button" @click="setTripDirection('one_way_out')" class="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all" :class="tripDirection === 'one_way_out' ? 'bg-white text-indigo-700 shadow-sm border border-indigo-50' : 'text-indigo-400 hover:text-indigo-600'">Một chiều đi</button>
                        <button type="button" @click="setTripDirection('one_way_return')" class="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all" :class="tripDirection === 'one_way_return' ? 'bg-white text-indigo-700 shadow-sm border border-indigo-50' : 'text-indigo-400 hover:text-indigo-600'">Một chiều về</button>
                        <button type="button" @click="setTripDirection('round_trip')" class="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all" :class="tripDirection === 'round_trip' ? 'bg-white text-indigo-700 shadow-sm border border-indigo-50' : 'text-indigo-400 hover:text-indigo-600'">Khứ hồi</button>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="block text-[9px] font-black text-indigo-400 uppercase mb-1">Điểm đi (A)</label>
                           <input v-model="trip.startLocation" type="text" class="w-full bg-white border-0 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500" :placeholder="tripDirection === 'one_way_return' ? 'Vũng Tàu' : 'TP. HCM'">
                        </div>
                        <div>
                           <label class="block text-[9px] font-black text-indigo-400 uppercase mb-1">Điểm đến (B)</label>
                           <input v-model="trip.endLocation" type="text" class="w-full bg-white border-0 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500" :placeholder="tripDirection === 'one_way_return' ? 'TP. HCM' : 'Vũng Tàu'">
                        </div>
                      </div>
                      <div class="flex items-center justify-between border-t border-indigo-100 pt-3">
                         <span class="text-[9px] font-black text-indigo-600 uppercase">Khoảng cách dự kiến</span>
                         <div class="relative w-24">
                            <input v-model.number="trip.distance" type="number" class="w-full bg-white border-0 rounded-xl px-3 py-2 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 text-center">
                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-indigo-300">KM</span>
                         </div>
                      </div>
                      
                      <!-- Stop Points -->
                      <div v-if="selectedFixedTrip?.stopPoints?.length" class="border-t border-indigo-100 pt-3">
                         <span class="block text-[9px] font-black text-indigo-600 uppercase mb-2">Các điểm dừng dự kiến</span>
                         <div class="flex flex-wrap gap-1">
                            <span v-for="(stop, index) in selectedFixedTrip.stopPoints" :key="index" class="text-[10px] bg-white text-indigo-700 px-2 py-1 rounded-md font-bold shadow-sm border border-indigo-50">
                               {{ stop }}
                            </span>
                         </div>
                      </div>

                      <!-- Schedules Lists -->
                      <div v-if="selectedFixedTrip?.schedules?.length" class="border-t border-indigo-100 pt-3 space-y-4">
                         
                         <!-- Lượt đi -->
                         <div v-if="tripDirection === 'one_way_out' || tripDirection === 'round_trip'" class="space-y-2">
                           <span class="block text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 w-max px-2 py-1 rounded">CỤM GIỜ ĐI: {{ selectedFixedTrip.source }} ➔ {{ selectedFixedTrip.destination }}</span>
                           <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              <label v-for="(sch, idx) in selectedFixedTrip.schedules" :key="'out'+idx" class="flex flex-col items-center p-2 rounded-xl border cursor-pointer transition-all" :class="pickupTime === sch.departA ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white border-indigo-50 hover:bg-gray-50'">
                                 <input type="radio" v-model="pickupTime" :value="sch.departA" class="hidden">
                                 <div class="text-[11px] font-black text-indigo-700">{{ sch.departA }}</div>
                                 <div class="text-[8px] text-gray-400 font-bold">Đến: {{ sch.arriveB || '...' }}</div>
                              </label>
                           </div>
                         </div>

                         <!-- Lượt về -->
                         <div v-if="tripDirection === 'one_way_return' || tripDirection === 'round_trip'" class="space-y-2">
                           <span class="block text-[9px] font-black text-orange-600 uppercase bg-orange-50 w-max px-2 py-1 rounded">CỤM GIỜ VỀ: {{ selectedFixedTrip.destination }} ➔ {{ selectedFixedTrip.source }}</span>
                           <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              <label v-for="(sch, idx) in selectedFixedTrip.schedules.filter(s => s.departB)" :key="'ret'+idx" class="flex flex-col items-center p-2 rounded-xl border cursor-pointer transition-all" :class="returnTime === sch.departB ? 'bg-orange-50 border-orange-400 shadow-sm' : 'bg-white border-orange-50 hover:bg-gray-50'">
                                 <input type="radio" v-model="returnTime" :value="sch.departB" class="hidden">
                                 <div class="text-[11px] font-black text-orange-700">{{ sch.departB }}</div>
                                 <div class="text-[8px] text-gray-400 font-bold">Đến: {{ sch.arriveA || '...' }}</div>
                              </label>
                           </div>
                         </div>
                         
                      </div>
                   </div>
                </div>

                <div v-if="timeMode === 'hourly'" class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                   <label class="block text-[10px] text-gray-400 font-black uppercase tracking-widest">Số giờ thuê</label>
                   <div class="flex items-center space-x-4">
                      <button @click="hoursCount > 1 && hoursCount--" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold">-</button>
                      <span class="text-lg font-black">{{ hoursCount }}h</span>
                      <button @click="hoursCount++" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold">+</button>
                   </div>
                </div>
                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <label class="block text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Địa điểm nhận xe</label>
                  <div class="font-bold text-sm text-blue-900 flex items-center">
                    <svg class="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                    <span v-if="car.addressId">{{ car.addressId.fullAddress }}</span>
                    <span v-else>{{ car.location?.city }}, {{ car.location?.district }}</span>
                  </div>
                </div>
              </div>

              <!-- Cost Summary -->
              <div class="pt-6 border-t border-gray-50 space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">
                    {{ timeMode === 'trip' ? 'Giá thuê xe (Theo KM)' : `Giá thuê xe (x${timeMode === 'daily' ? rentalDays + ' ngày' : hoursCount + ' giờ'})` }}
                  </span>
                  <span class="font-bold text-gray-900">
                    {{ formatPrice(timeMode === 'daily' 
                        ? (rentalMode === 'with_driver' ? car.pricePerDayWithDriver : car.pricePerDay) * rentalDays 
                        : (timeMode === 'trip' ? (car.owner?.driverInfo?.pricePerKm || 1000) * (trip.distance || 0) : (rentalMode === 'with_driver' ? car.pricePerHourWithDriver : car.pricePerHour) * hoursCount)
                    ) }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-medium">Bảo hiểm & Phí sàn</span>
                  <span class="font-bold text-gray-900">{{ formatPrice(timeMode === 'daily' ? (50000 * rentalDays) : 20000) }}</span>
                </div>
                <div class="flex justify-between items-center text-lg mt-4 pt-4 border-t border-gray-100">
                  <span class="font-black text-gray-900">Tổng cộng</span>
                  <span class="font-black text-primary-600 text-2xl">{{ formatPrice(totalCost) }}</span>
                </div>
              </div>

              <button @click="handleBooking" class="w-full mt-8 py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-1 uppercase tracking-widest text-xs">
                ĐẶT XE NGAY
              </button>
            </div>
            
            <div class="p-6 bg-green-50 rounded-[2.5rem] border border-green-100">
              <div class="flex items-start space-x-3">
                <div class="bg-green-500 text-white p-2 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-green-900 leading-tight">Bảo hiểm chuyến đi</h4>
                  <p class="text-[11px] text-green-700 mt-1 leading-relaxed">Bạn được bảo hiểm 100% tài sản và con người trong suốt hành trình thuê xe.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rental Options Section -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-black text-gray-900 mb-4">Chọn hình thức thuê xe phù hợp</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Chúng tôi cung cấp 3 hình thức thuê xe khác nhau để đáp ứng mọi nhu cầu của bạn</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Self Drive Option -->
          <div v-if="car.isSelfDrive" class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 group">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-2">Thuê xe tự lái</h3>
              <p class="text-gray-600 text-sm mb-4">Tự do khám phá, linh hoạt thởi gian</p>
              <div class="text-2xl font-black text-green-600 mb-4">{{ formatPrice(car.pricePerDay) }}<span class="text-sm font-bold text-gray-500">/ngày</span></div>
            </div>
            <router-link :to="`/cars/${$route.params.id}/self-drive`" class="w-full block text-center py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-colors uppercase text-sm tracking-widest">
              Thuê xe tự lái
            </router-link>
          </div>

          <!-- With Driver Option -->
          <div v-if="car.isWithDriver" class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 group">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-2">Thuê xe kèm tài xế</h3>
              <p class="text-gray-600 text-sm mb-4">Tài xế chuyên nghiệp, an tâm tận hưởng</p>
              <div class="text-2xl font-black text-blue-600 mb-4">{{ formatPrice(car.pricePerDayWithDriver || car.pricePerDay + 500000) }}<span class="text-sm font-bold text-gray-500">/ngày</span></div>
            </div>
            <router-link :to="`/cars/${$route.params.id}/with-driver`" class="w-full block text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-colors uppercase text-sm tracking-widest">
              Thuê xe kèm tài xế
            </router-link>
          </div>

          <!-- Trip Option -->
          <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 group">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-2">Thuê xe theo chuyến</h3>
              <p class="text-gray-600 text-sm mb-4">Đi du lịch, công tác với lộ trình cố định</p>
              <div class="text-2xl font-black text-purple-600 mb-4">15,000<span class="text-sm font-bold text-gray-500">/km</span></div>
            </div>
            <router-link :to="`/cars/${$route.params.id}/trip`" class="w-full block text-center py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-colors uppercase text-sm tracking-widest">
              Thuê xe theo chuyến
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const car = ref(null)
const activeImage = ref('')
const rentalMode = ref('self_drive')
const timeMode = ref('daily')
const hoursCount = ref(4)
const fixedTrips = ref([])
const selectedFixedTrip = ref(null)
const tripDirection = ref('one_way_out')

const trip = ref({
  startLocation: '',
  endLocation: '',
  distance: 0
})

const updateTripLocations = () => {
  if (!selectedFixedTrip.value) return
  if (tripDirection.value === 'one_way_return') {
    trip.value.startLocation = selectedFixedTrip.value.destination
    trip.value.endLocation = selectedFixedTrip.value.source
  } else {
    trip.value.startLocation = selectedFixedTrip.value.source
    trip.value.endLocation = selectedFixedTrip.value.destination
  }
}

const setTripDirection = (dir) => {
  tripDirection.value = dir
  updateTripLocations()
}

const selectFixedTrip = (ft) => {
  selectedFixedTrip.value = ft
  updateTripLocations()
  trip.value.distance = 0 // Will rely on fixed price in backend
  
  if (ft.schedules?.length) {
    if (ft.schedules[0].departA) pickupTime.value = ft.schedules[0].departA
    const retSch = ft.schedules.find(s => s.departB)
    if (retSch) returnTime.value = retSch.departB
  }
}

const resolveImageUrl = (url) => {
  if (!url) return '/logo.png'
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
}

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

const today = new Date().toISOString().split('T')[0]
const startDate = ref(today)
const endDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])
const pickupTime = ref('09:00')
const returnTime = ref('09:00')

const rentalDays = computed(() => {
  if (!startDate.value || !endDate.value) return 1
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diffTime = Math.abs(end - start)
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days === 0 ? 1 : days
})

const totalCost = computed(() => {
  if (!car.value) return 0
  
  let rentalFee = 0
  let serviceFee = 0

  if (timeMode.value === 'daily') {
    // Check for weekend pricing
    const isWeekendSelection = () => {
      if (!startDate.value || !endDate.value) return false
      const start = new Date(startDate.value)
      const end = new Date(endDate.value)
      const current = new Date(start)
      while (current <= end) {
        if (current.getDay() === 0 || current.getDay() === 6) return true
        current.setDate(current.getDate() + 1)
      }
      return false
    }

    let dailyRate = rentalMode.value === 'with_driver' 
      ? (car.value.pricePerDayWithDriver || car.value.pricePerDay + (car.value.driverFeePerDay || 500000))
      : car.value.pricePerDay
    
    // Apply weekend price if applicable
    if (isWeekendSelection() && car.value.priceWeekend) {
      dailyRate = car.value.priceWeekend
    }

    rentalFee = dailyRate * rentalDays.value
    serviceFee = 50000 * rentalDays.value
  } else if (timeMode.value === 'hourly') {
    const hourlyRate = rentalMode.value === 'with_driver'
      ? (car.value.pricePerHourWithDriver || (car.value.pricePerHour || Math.round(car.value.pricePerDay / 10)) + 100000)
      : (car.value.pricePerHour || Math.round(car.value.pricePerDay / 10))
    rentalFee = hourlyRate * hoursCount.value
    serviceFee = 20000
  } else if (timeMode.value === 'trip') {
    if (selectedFixedTrip.value) {
      if (tripDirection.value === 'round_trip') {
        rentalFee = selectedFixedTrip.value.roundTripPrice || (selectedFixedTrip.value.fixedPrice * 2)
      } else {
        rentalFee = selectedFixedTrip.value.fixedPrice
      }
    } else {
      const perKm = car.value.owner?.driverInfo?.pricePerKm || 1000
      rentalFee = perKm * (trip.value.distance || 0)
    }
    serviceFee = 30000
  }

  return rentalFee + serviceFee
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const getFeatureLabel = (feature) => {
  const labels = {
    air_conditioning: 'Điều hòa',
    gps: 'Định vị GPS',
    bluetooth: 'Bluetooth',
    usb_charger: 'Sạc USB',
    child_seat: 'Ghế trẻ em',
    cruise_control: 'Cruise Control',
    parking_sensors: 'Cảm biến đỗ',
    camera: 'Camera lùi',
    abs: 'Phanh ABS',
    airbags: 'Túi khí'
  }
  return labels[feature] || feature
}

const fetchCar = async () => {
  try {
    loading.value = true
    const response = await api.get(`/cars/${route.params.id}`)
    car.value = response.data.car || response.data
    activeImage.value = car.value.images?.[0]?.url ? resolveImageUrl(car.value.images[0].url) : ''
    
    // Adjust rental mode if restricted
    if (!car.value.isSelfDrive && car.value.isWithDriver) {
      rentalMode.value = 'with_driver'
    } else if (car.value.isSelfDrive && !car.value.isWithDriver) {
      rentalMode.value = 'self_drive'
    }
    // Fetch applicable fixed prices
    const tripsRes = await api.get('/trips/lookup/car', { params: { carId: route.params.id } })
    fixedTrips.value = tripsRes.data || []
    
    // Auto-select the first fixed trip to show its schedules immediately
    if (fixedTrips.value.length > 0) {
      selectFixedTrip(fixedTrips.value[0])
    }
  } catch (error) {
    toast.error('Không tìm thấy thông tin xe')
    router.push('/cars')
  } finally {
    loading.value = false
  }
}

const handleBooking = () => {
  router.push({
    path: `/booking/${car.value._id}`,
    query: { 
      type: rentalMode.value,
      mode: timeMode.value,
      startDate: startDate.value,
      endDate: endDate.value,
      pickupTime: pickupTime.value,
      returnTime: returnTime.value,
      hours: hoursCount.value,
      startLocation: trip.value.startLocation,
      endLocation: trip.value.endLocation,
      distance: trip.value.distance
    }
  })
}

onMounted(() => {
  fetchCar()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
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
