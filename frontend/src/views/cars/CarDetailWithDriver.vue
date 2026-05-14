<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="spinner"></div>
    </div>

    <div v-else-if="car" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <!-- Breadcrumbs -->
      <nav class="flex mb-8 text-sm font-medium text-gray-400">
        <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link>
        <span class="mx-2">/</span>
        <router-link to="/cars" class="hover:text-primary-600">Danh sách xe</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ car.brand }} {{ car.model }} - Kèm tài xế</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content (Left Col) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Image Gallery Card -->
          <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div class="relative group">
              <img
                :src="activeImage || getCarImageUrl(car, 0)"
                :alt="`${car.brand} ${car.model}`"
                class="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                @error="handleImageError"
              >
              <div class="absolute top-6 left-6 flex flex-col gap-3">
                <div class="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Kèm tài xế</span>
                </div>
                <div class="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2">
                  <span class="text-yellow-500 font-black">⭐ {{ car.rating?.average?.toFixed(1) || '5.0' }}</span>
                  <span class="text-gray-300">|</span>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ car.totalTrips || 0 }} chuyến</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 flex gap-4 overflow-x-auto no-scrollbar">
              <img
                v-for="(image, index) in car.images"
                :key="index"
                :src="getCarImageUrl(car, index)"
                @mouseenter="activeImage = getCarImageUrl(car, index)"
                @error="handleImageError"
                class="w-24 h-24 rounded-2xl object-cover cursor-pointer border-2 transition-all"
                :class="activeImage === getCarImageUrl(car, index) ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'"
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
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.43 3.5h1.38c.41 0 .75.34.75.75s-.34.75-.75.75H8.11l-.4 1.63c-.38 1.56-2.6-1.56-2.98 0l-.4-1.63H3.05c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.38l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.56c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08.33zM3 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5.12-3.17c.38-1.56 2.6-1.56 2.98 0l.08.33h1.38l.08-.33c.38-1.56 2.6-1.56 2.98 0l.08.33h1.56c.41 0 .75.34.75.75s-.34.75-.75.75h-1.56l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.38l-.08.33c-.38 1.56-2.6 1.56-2.98 0l-.08-.33h-1.56c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.56l.08.33zM14 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/></svg>
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
              <span class="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              Mô tả chi tiết
            </h2>
            <p class="text-gray-600 leading-relaxed mb-10">{{ car.description || 'Chưa có mô tả chi tiết cho xe này.' }}</p>

            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              Tiện nghi trên xe
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              <div v-for="feature in car.features" :key="feature" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div class="bg-blue-100 text-blue-600 p-2 rounded-xl">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
                <span class="font-bold text-sm text-gray-700">{{ getFeatureLabel(feature) }}</span>
              </div>
            </div>

            <!-- Pricing Details -->
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              Bảng giá thuê xe kèm tài xế
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Daily Pricing -->
              <div class="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                <h3 class="text-sm font-black text-blue-600 uppercase mb-4 flex items-center">
                   <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Giá theo ngày
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá cơ bản</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerDayWithDriver || car.pricePerDay + 500000) }} / Ngày</span>
                  </div>
                  <div v-if="car.priceWeekend" class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Cuối tuần (T7-CN)</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.priceWeekend + 500000) }} / Ngày</span>
                  </div>
                </div>
              </div>

              <!-- Hourly Pricing -->
              <div v-if="car.pricePerHourWithDriver || car.pricePerHour" class="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                <h3 class="text-sm font-black text-indigo-600 uppercase mb-4 flex items-center">
                   <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> Giá theo giờ (4h+)
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                    <span class="text-xs font-bold text-gray-500 uppercase">Giá cơ bản</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(car.pricePerHourWithDriver || car.pricePerHour + 100000) }} / Giờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Driver Info Section -->
          <div class="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
            </div>

            <div v-if="car.owner?.driverInfo" class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div class="relative">
                <div class="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-400 to-white/20">
                  <img :src="getUserAvatarUrl(car.owner._id, car.owner.avatar) || '/placeholder-avatar.svg'" class="w-full h-full rounded-full object-cover border-4 border-blue-900" @error="$event.target.src = '/placeholder-avatar.svg'">
                </div>
                <div class="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-full border-4 border-blue-900 shadow-lg">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
              </div>

              <div class="flex-1 text-center md:text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Tài xế phục vụ bạn</p>
                <h3 class="text-3xl font-black mb-6 tracking-tight">{{ car.owner.fullName }}</h3>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-blue-300 uppercase font-black tracking-tighter mb-1">Kinh nghiệm</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.experience || '5+' }} Năm</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-blue-300 uppercase font-black tracking-tighter mb-1">Hạng bằng</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.licenseType || 'B2' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-blue-300 uppercase font-black tracking-tighter mb-1">Thành phố</p>
                    <p class="font-bold text-sm leading-none truncate">{{ car.owner.driverInfo.operatingCity || 'TP. HCM' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-blue-300 uppercase font-black tracking-tighter mb-1">Đánh giá</p>
                    <div class="flex items-center space-x-1">
                      <span class="text-yellow-400 font-bold">⭐ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 relative z-10">
              <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
              </div>
              <h3 class="text-xl font-black text-white mb-2">Đội ngũ tài xế chuyên nghiệp</h3>
              <p class="text-blue-200 text-sm max-w-md mx-auto">Chúng tôi sẽ điều phối tài xế có kinh nghiệm trên 5 năm và am hiểu lộ trình để phục vụ bạn tốt nhất.</p>
            </div>
          </div>

          <!-- With Driver Benefits -->
          <div class="bg-blue-50 rounded-[2.5rem] p-10 border border-blue-100">
            <h3 class="text-2xl font-black text-blue-900 mb-8 flex items-center">
              <span class="w-3 h-8 bg-blue-600 rounded-full mr-3"></span>
              Lợi ích thuê xe kèm tài xế
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-start space-x-4">
                <div class="bg-blue-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-blue-900">Tài xế chuyên nghiệp</h4>
                  <p class="text-blue-700 text-sm">Tài xế được tuyển chọn kỹ, có kinh nghiệm lái xe an toàn và phục vụ tận tình.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-blue-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-blue-900">Không lo chi phí phát sinh</h4>
                  <p class="text-blue-700 text-sm">Giá đã bao gồm tất cả: xăng, phí cầu đường, bãi đỗ xe và tiền tài xế.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-blue-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0117.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-blue-900">An toàn tuyệt đối</h4>
                  <p class="text-blue-700 text-sm">Tài xế được đào tạo kỹ năng lái xe an toàn, luôn tuân thủ luật giao thông.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-blue-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-blue-900">Hỗ trợ 24/7</h4>
                  <p class="text-blue-700 text-sm">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Owner Profile Info -->
          <div class="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex items-center space-x-6">
              <img :src="getUserAvatarUrl(car.owner?._id, car.owner?.avatar) || '/placeholder-avatar.svg'" class="w-20 h-20 rounded-full object-cover border-4 border-primary-50" @error="$event.target.src = '/placeholder-avatar.svg'">
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
             <!-- Booking Card (Lux Glass Variant) -->
            <div class="glass-dark rounded-[3.5rem] p-10 border border-white/10 shadow-ux-2xl animate-fade-in relative overflow-hidden group/card shadow-indigo-900/40">
              <!-- Decorative gradient -->
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
              
              <div class="relative z-10">
                <h2 class="text-3xl font-black text-white mb-1 tracking-tighter">{{ car.brand }}</h2>
                <h3 class="text-lg font-bold text-indigo-400 mb-8 tracking-tight">{{ car.model }}</h3>

                <!-- Time Mode Toggle -->
                <div class="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
                  <button
                    @click="timeMode = 'daily'"
                    class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    :class="timeMode === 'daily' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-white'"
                  >Theo ngày</button>
                  <button
                    @click="timeMode = 'hourly'"
                    class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    :class="timeMode === 'hourly' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-white'"
                  >Theo giờ</button>
                </div>

                <div class="space-y-4 mb-10">
                  <div class="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                    <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">{{ timeMode === 'daily' ? 'Thời gian thuê' : 'Ngày thuê' }}</label>
                    <div v-if="timeMode === 'daily'" class="flex flex-col space-y-2">
                      <div class="flex items-center justify-between">
                        <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 w-full [color-scheme:dark]">
                        <span class="text-gray-600 mx-2 text-xs">→</span>
                        <input type="date" v-model="endDate" :min="startDate || today" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 w-full [color-scheme:dark]">
                      </div>
                      <div class="flex items-center justify-between pt-3 border-t border-white/5">
                         <input type="time" v-model="pickupTime" class="bg-transparent border-none p-0 text-[10px] font-black text-gray-400 focus:ring-0 [color-scheme:dark]">
                         <input type="time" v-model="returnTime" class="bg-transparent border-none p-0 text-[10px] font-black text-gray-400 focus:ring-0 text-right [color-scheme:dark]">
                      </div>
                    </div>
                    <div v-else class="flex flex-col space-y-2">
                      <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 w-full text-center [color-scheme:dark]">
                      <div class="pt-3 border-t border-white/5 flex justify-center">
                         <input type="time" v-model="pickupTime" class="bg-transparent border-none p-0 text-[10px] font-black text-gray-400 focus:ring-0 text-center [color-scheme:dark]">
                      </div>
                    </div>
                  </div>

                  <div v-if="timeMode === 'hourly'" class="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                     <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em]">Số giờ thuê</label>
                     <div class="flex items-center space-x-6">
                        <button @click="hoursCount > 1 && hoursCount--" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white hover:bg-white/10 transition-colors">-</button>
                        <span class="text-xl font-black text-white tracking-tighter">{{ hoursCount }}h</span>
                        <button @click="hoursCount++" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white hover:bg-white/10 transition-colors">+</button>
                     </div>
                  </div>

                  <div class="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 group hover:border-indigo-500/50 transition-all">
                    <label class="block text-[8px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-2">Địa điểm đón quý khách</label>
                    <div class="font-black text-xs text-white flex items-start">
                      <svg class="w-4 h-4 mr-2 text-indigo-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                      <span v-if="car.addressId">{{ car.addressId.fullAddress }}</span>
                      <span v-else>{{ car.location?.city }}, {{ car.location?.district }}</span>
                    </div>
                  </div>
                </div>

                <!-- Cost Summary -->
                <div class="pt-10 border-t border-white/10 space-y-4">
                  <div class="flex justify-between items-center text-[10px] group/item">
                    <span class="text-gray-500 font-black uppercase tracking-[0.2em] group-hover/item:text-gray-300 transition-colors">
                      Giá thuê xe (x{{ timeMode === 'daily' ? rentalDays + ' ngày' : hoursCount + ' giờ' }})
                    </span>
                    <span class="font-black text-white">
                      {{ formatPrice(timeMode === 'daily'
                          ? (car.pricePerDayWithDriver || car.pricePerDay + 500000) * rentalDays
                          : (car.pricePerHourWithDriver || car.pricePerHour + 100000) * hoursCount)
                      }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-[10px] group/item">
                    <span class="text-gray-500 font-black uppercase tracking-[0.2em] group-hover/item:text-gray-300 transition-colors">Bảo hiểm & Phí sàn</span>
                    <span class="font-black text-white">{{ formatPrice(serviceFee) }}</span>
                  </div>
                  
                  <div class="pt-8 mt-4 border-t border-white/10">
                    <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 leading-none">Tổng giá trị dự kiến</p>
                    <span class="text-4xl font-black text-indigo-400 tracking-tighter leading-none block drop-shadow-lg">{{ formatPrice(totalCost) }}</span>
                  </div>
                </div>

                <button @click="handleBooking" class="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl shadow-2xl shadow-indigo-900/40 uppercase tracking-[0.3em] transition-all active-scale text-[11px] border border-indigo-400/20">
                  XÁC NHẬN ĐẶT TÀI
                </button>
              </div>
            </div>

            <!-- Insurance Card -->
            <div class="p-8 bg-gray-900/80 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden relative group/ins">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/ins:opacity-100 transition-opacity duration-700"></div>
              
              <div class="flex items-start space-x-4 relative z-10">
                <div class="bg-indigo-600 rounded-2xl p-2.5 shadow-lg shadow-indigo-900/40">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-black text-white text-sm uppercase tracking-widest leading-none mb-2">An tâm hành trình</h4>
                  <p class="text-[10px] text-gray-400 font-medium leading-relaxed">Quý khách được bảo hiểm 100% tài sản và con người trong suốt hành trình thuê xe kèm tài xế.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { getUserAvatarUrl } from '@/utils/avatar'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const car = ref(null)
const activeImage = ref('')
const timeMode = ref('daily')
const hoursCount = ref(4)

const resolveImageUrl = (url) => {
  if (!url) return '/logo.png'
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

const serviceFee = computed(() => {
  if (!car.value) return 0
  const baseRate = timeMode.value === 'daily'
    ? (car.value.pricePerDayWithDriver || car.value.pricePerDay + 500000)
    : (car.value.pricePerHourWithDriver || car.value.pricePerHour + 100000)
  const rentalFee = baseRate * (timeMode.value === 'daily' ? rentalDays.value : hoursCount.value)
  return Math.round(rentalFee * 0.05)
})

const totalCost = computed(() => {
  if (!car.value) return 0
  const baseRate = timeMode.value === 'daily'
    ? (car.value.pricePerDayWithDriver || car.value.pricePerDay + 500000)
    : (car.value.pricePerHourWithDriver || car.value.pricePerHour + 100000)
  const rentalFee = baseRate * (timeMode.value === 'daily' ? rentalDays.value : hoursCount.value)
  return rentalFee + serviceFee.value
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

    // Check if car supports with driver
    if (!car.value.isWithDriver) {
      toast.error('Xe này không hỗ trợ thuê kèm tài xế')
      router.push('/cars')
      return
    }

    activeImage.value = car.value.images?.[0]?.url ? resolveImageUrl(car.value.images[0].url) : ''
  } catch (error) {
    toast.error('Không tìm thấy thông tin xe')
    router.push('/cars')
  } finally {
    loading.value = false
  }
}

const handleBooking = () => {
  router.push({
    path: `/cars/${car.value._id}/with-driver/booking`,
    query: {
      mode: timeMode.value,
      startDate: startDate.value,
      endDate: endDate.value,
      pickupTime: pickupTime.value,
      returnTime: returnTime.value,
      hours: hoursCount.value
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