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
        <span class="text-gray-900">{{ car.brand }} {{ car.model }} - Theo chuyến</span>
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
                <div class="bg-purple-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Theo chuyến</span>
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
                :class="activeImage === getCarImageUrl(car, index) ? 'border-purple-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'"
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
              <span class="w-2 h-8 bg-purple-600 rounded-full mr-3"></span>
              Mô tả chi tiết
            </h2>
            <p class="text-gray-600 leading-relaxed mb-10">{{ car.description || 'Chưa có mô tả chi tiết cho xe này.' }}</p>

            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <span class="w-2 h-8 bg-purple-600 rounded-full mr-3"></span>
              Tiện nghi trên xe
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              <div v-for="feature in car.features" :key="feature" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div class="bg-purple-100 text-purple-600 p-2 rounded-xl">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
                <span class="font-bold text-sm text-gray-700">{{ getFeatureLabel(feature) }}</span>
              </div>
            </div>

            <!-- Trip Pricing Info -->
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center text-purple-600">
              <span class="w-2 h-8 bg-purple-600 rounded-full mr-3"></span>
              Bảng giá dịch vụ theo chuyến
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div class="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 text-center">
                <p class="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Giá cước cơ bản</p>
                <div class="text-xl font-black text-purple-600">{{ formatPrice(displayPricePerKm) }}</div>
                <p class="text-[9px] font-bold text-gray-400">/ KM di chuyển</p>
              </div>
              <div class="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Phụ phí tài xế</p>
                <div class="text-xl font-black text-blue-600">{{ formatPrice(displayDriverFee) }}</div>
                <p class="text-[9px] font-bold text-gray-400">/ Ngày phục vụ</p>
              </div>
              <div class="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 text-center">
                <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Phụ phí ngoài giờ</p>
                <div class="text-xl font-black text-orange-600">{{ formatPrice(displayOverTimeFee) }}</div>
                <p class="text-[9px] font-bold text-gray-400">/ Giờ hoặc KM vượt</p>
              </div>
            </div>
            <div class="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mb-10">
              * Lưu ý: Giá cước theo chuyến đã bao gồm chi phí nhiên liệu và lương tài xế. Phí cầu đường (BOT) và phí bến bãi sẽ được thanh toán theo thực tế phát sinh trong chuyến đi.
            </div>
          </div>

          <!-- Driver Info Section -->
          <div class="bg-purple-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
            </div>

            <div v-if="car.owner?.driverInfo" class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div class="relative">
                <div class="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-purple-400 to-white/20">
                  <img :src="getUserAvatarUrl(car.owner._id, car.owner.avatar) || '/placeholder-avatar.svg'" class="w-full h-full rounded-full object-cover border-4 border-purple-900" @error="$event.target.src = '/placeholder-avatar.svg'">
                </div>
                <div class="absolute -bottom-1 -right-1 bg-purple-500 p-2 rounded-full border-4 border-purple-900 shadow-lg">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                </div>
              </div>

              <div class="flex-1 text-center md:text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1">Tài xế phục vụ bạn</p>
                <h3 class="text-3xl font-black mb-6 tracking-tight">{{ car.owner.fullName }}</h3>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-purple-300 uppercase font-black tracking-tighter mb-1">Kinh nghiệm</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.experience || '5+' }} Năm</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-purple-300 uppercase font-black tracking-tighter mb-1">Hạng bằng</p>
                    <p class="font-bold text-lg leading-none">{{ car.owner.driverInfo.licenseType || 'B2' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-purple-300 uppercase font-black tracking-tighter mb-1">Thành phố</p>
                    <p class="font-bold text-sm leading-none truncate">{{ car.owner.driverInfo.operatingCity || 'TP. HCM' }}</p>
                  </div>
                  <div class="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                    <p class="text-[10px] text-purple-300 uppercase font-black tracking-tighter mb-1">Đánh giá</p>
                    <div class="flex items-center space-x-1">
                      <span class="text-yellow-400 font-bold">⭐ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 relative z-10">
              <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
              </div>
              <h3 class="text-xl font-black text-white mb-2">Đội ngũ tài xế chuyên nghiệp</h3>
              <p class="text-purple-200 text-sm max-w-md mx-auto">Chúng tôi sẽ điều phối tài xế có kinh nghiệm trên 5 năm và am hiểu lộ trình để phục vụ bạn tốt nhất.</p>
            </div>
          </div>

          <!-- Trip Benefits -->
          <div class="bg-purple-50 rounded-[2.5rem] p-10 border border-purple-100">
            <h3 class="text-2xl font-black text-purple-900 mb-8 flex items-center">
              <span class="w-3 h-8 bg-purple-600 rounded-full mr-3"></span>
              Lợi ích thuê xe theo chuyến
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-start space-x-4">
                <div class="bg-purple-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-purple-900">Lộ trình linh hoạt</h4>
                  <p class="text-purple-700 text-sm">Bạn có thể chọn lộ trình tùy ý, từ các tuyến phổ biến đến lộ trình riêng của mình.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-purple-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-purple-900">Tài xế địa phương</h4>
                  <p class="text-purple-700 text-sm">Tài xế am hiểu địa phương, đưa đón đúng giờ và hỗ trợ tối đa trong chuyến đi.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-purple-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-purple-900">Giá cả minh bạch</h4>
                  <p class="text-purple-700 text-sm">Giá được tính theo km thực tế, không phát sinh thêm chi phí ẩn.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="bg-purple-500 text-white p-3 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg mb-2 text-purple-900">Hỗ trợ 24/7</h4>
                  <p class="text-purple-700 text-sm">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc.</p>
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
            <!-- Booking Card (Lux Glass Design) -->
            <div class="glass-dark rounded-[3.5rem] p-10 border border-white/10 shadow-ux-2xl animate-fade-in relative overflow-hidden group/card shadow-purple-900/40">
              <!-- Decorative background detail -->
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
              
              <div class="relative z-10">
                <h2 class="text-3xl font-black text-white mb-1 tracking-tighter">{{ car.brand }}</h2>
                <h3 class="text-lg font-bold text-purple-400 mb-8 tracking-tight">{{ car.model }}</h3>

                <div class="space-y-4 mb-10">
                  <div v-if="trip.routeType === 'business'" class="p-6 bg-white/5 rounded-3xl border border-white/5 grid grid-cols-2 gap-4 group hover:border-purple-500/50 transition-all">
                    <div>
                      <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Ngày đi</label>
                      <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-xs font-black text-white focus:ring-0 w-full [color-scheme:dark]">
                    </div>
                    <div class="border-l border-white/10 pl-4">
                      <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Ngày về</label>
                      <input type="date" v-model="endDate" :min="startDate" class="bg-transparent border-none p-0 text-xs font-black text-purple-400 focus:ring-0 w-full [color-scheme:dark]">
                    </div>
                  </div>

                  <div v-else class="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-purple-500/50 transition-all">
                    <div>
                      <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Ngày khởi hành</label>
                      <input type="date" v-model="startDate" :min="today" class="bg-transparent border-none p-0 text-xs font-black text-white focus:ring-0 w-32 [color-scheme:dark]">
                    </div>
                    <div class="h-10 w-px bg-white/10"></div>
                    <div class="text-right">
                      <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Giờ đón</label>
                      <input type="time" v-model="pickupTime" class="bg-transparent border-none p-0 text-xs font-black text-white focus:ring-0 text-right w-24 [color-scheme:dark]">
                    </div>
                  </div>

                  <!-- Route Planning Section -->
                  <div class="p-6 bg-purple-500/5 rounded-3xl border border-purple-500/20 group hover:border-purple-500/50 transition-all">
                    <h3 class="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] mb-5 flex items-center">
                      <span class="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></span> Lập lộ trình di chuyển
                    </h3>

                    <!-- Route types selection -->
                    <div class="mb-6">
                      <label class="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Phân loại lộ trình</label>
                      <div class="flex items-center space-x-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <button 
                          v-show="trip.routeType === 'short' || !isTypeLocked"
                          type="button" 
                          @click="trip.routeType = 'short'; isTypeLocked = true" 
                          class="flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all" 
                          :class="trip.routeType === 'short' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-white'"
                        >NGẮN</button>
                        <button 
                          v-show="trip.routeType === 'long' || !isTypeLocked"
                          type="button" 
                          @click="trip.routeType = 'long'; isTypeLocked = true" 
                          class="flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all" 
                          :class="trip.routeType === 'long' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-white'"
                        >DÀI</button>
                        <button 
                          v-show="trip.routeType === 'business' || !isTypeLocked"
                          type="button" 
                          @click="trip.routeType = 'business'; isTypeLocked = true" 
                          class="flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all" 
                          :class="trip.routeType === 'business' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-white'"
                        >CÔNG TÁC</button>
                        <button v-if="isTypeLocked" @click="isTypeLocked = false" type="button" class="px-3 py-2.5 text-[7px] font-black text-purple-400 uppercase hover:text-purple-300 transition-colors">Đổi</button>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                         <label class="block text-[7px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Điểm đi (A)</label>
                         <input v-model="trip.startLocation" type="text" class="w-full bg-transparent border-0 p-0 text-[10px] font-black text-white focus:ring-0 placeholder:text-gray-700" :placeholder="tripDirection === 'one_way_return' ? 'Vũng Tàu' : 'TP. HCM'">
                      </div>
                      <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                         <label class="block text-[7px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Điểm đến (B)</label>
                         <input v-model="trip.endLocation" type="text" class="w-full bg-transparent border-0 p-0 text-[10px] font-black text-white focus:ring-0 placeholder:text-gray-700" :placeholder="tripDirection === 'one_way_return' ? 'TP. HCM' : 'Vũng Tàu'">
                      </div>
                    </div>

                    <button 
                      type="button" 
                      @click="calculateDistance"
                      :disabled="isCalculating"
                      class="w-full py-3.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center space-x-3 border border-purple-500/20 active-scale disabled:opacity-50"
                    >
                      <svg v-if="isCalculating" class="animate-spin h-3 w-3 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>{{ isCalculating ? 'Đang phân tích...' : 'Tính toán lộ trình' }}</span>
                    </button>

                    <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                       <span class="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Khoảng cách tối ưu</span>
                       <div class="relative w-28">
                          <input v-model.number="trip.distance" type="number" class="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-black text-purple-400 focus:ring-1 focus:ring-purple-500/50 text-center">
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-black text-gray-600">KM</span>
                       </div>
                    </div>
                  </div>

                  <div class="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-purple-500/50 transition-all">
                    <label class="block text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Điểm đón khách</label>
                    <div class="font-black text-[10px] text-white flex items-start">
                      <svg class="w-4 h-4 mr-2 text-purple-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                      <span v-if="car.addressId">{{ car.addressId.fullAddress }}</span>
                      <span v-else>{{ car.location?.city }}, {{ car.location?.district }}</span>
                    </div>
                  </div>
                </div>

                <!-- Cost Logic (Receipt Style) -->
                <div class="space-y-6">
                  <div class="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative group/receipt shadow-inner">
                    <div class="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <p class="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 text-center">Biểu phí dự kiến</p>
                    
                    <div class="space-y-4">
                      <div class="flex justify-between items-center group/item">
                        <div class="flex items-center space-x-4">
                           <div class="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-purple-400 border border-white/5 group-hover/item:border-purple-500/50 transition-colors">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                           </div>
                           <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá / KM</span>
                        </div>
                        <span class="text-xs font-black text-white group-hover/item:text-purple-400 transition-colors">{{ formatPrice(displayPricePerKm) }}</span>
                      </div>

                      <div class="flex justify-between items-center group/item">
                        <div class="flex items-center space-x-4">
                           <div class="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/5 group-hover/item:border-blue-500/50 transition-colors">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                           </div>
                           <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phí Tài Xế</span>
                        </div>
                        <span class="text-xs font-black text-white group-hover/item:text-blue-400 transition-colors">{{ formatPrice(displayDriverFee) }}</span>
                      </div>

                      <div class="flex justify-between items-center group/item">
                        <div class="flex items-center space-x-4">
                           <div class="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-orange-400 border border-white/5 group-hover/item:border-orange-500/50 transition-colors">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                           </div>
                           <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phí / Giờ Trễ</span>
                        </div>
                        <span class="text-xs font-black text-white group-hover/item:text-orange-400 transition-colors">{{ formatPrice(displayOverTimeFee) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group/total">
                      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover/total:opacity-100 transition-opacity duration-700"></div>
                      <div class="flex justify-between items-center mb-2 relative z-10">
                          <span class="text-[9px] uppercase font-black text-gray-500 tracking-[0.3em]">Cước phí dự tính</span>
                          <span class="text-[9px] uppercase font-black text-purple-400 tracking-[0.3em]">Tạm tính</span>
                      </div>
                      <div class="flex justify-between items-end relative z-10">
                          <span class="text-[8px] text-gray-500 font-medium italic">* Chưa bao gồm phí BOT</span>
                          <span class="text-4xl font-black text-white tracking-tighter drop-shadow-2xl">{{ formatPrice(totalCost) }}</span>
                      </div>
                  </div>
                </div>

                <button @click="handleBooking" class="w-full mt-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-3xl shadow-2xl shadow-purple-900/40 transition-all active-scale uppercase tracking-[0.3em] text-[11px] border border-purple-400/20">
                  XÁC NHẬN ĐẶT CHUYẾN
                </button>
              </div>
            </div>

            <!-- Insurance Card (Dark Premium) -->
            <div class="p-8 bg-gray-900/80 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-xl overflow-hidden relative group/ins">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover/ins:opacity-100 transition-opacity duration-700"></div>
              <div class="flex items-start space-x-5 relative z-10">
                <div class="bg-purple-600 rounded-2xl p-3 shadow-lg shadow-purple-900/50">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <h4 class="font-black text-white text-sm uppercase tracking-widest mb-1.5 leading-none">Bảo hiểm hành trình</h4>
                  <p class="text-[10px] text-gray-500 font-medium leading-relaxed">Quý khách hoàn toàn an tâm với gói bảo hiểm 100% tài sản & con người trong suốt quá trình di chuyển.</p>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { getUserAvatarUrl } from '@/utils/avatar'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const car = ref(null)
const activeImage = ref('')
const isCalculating = ref(false)
const isTypeLocked = ref(true)

const trip = ref({
  startLocation: '',
  endLocation: '',
  distance: 0,
  routeType: 'short'
})

const geocode = async (name) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: `${name}, Việt Nam`, format: 'json', limit: 1 }
    })
    if (res.data?.[0]) {
      return { lat: res.data[0].lat, lon: res.data[0].lon }
    }
    return null
  } catch (err) {
    return null
  }
}

const calculateDistance = async () => {
  if (!trip.value.startLocation || !trip.value.endLocation) {
    toast.error('Vui lòng nhập điểm đi và đến')
    return
  }
  isCalculating.value = true
  try {
    const start = await geocode(trip.value.startLocation)
    const end = await geocode(trip.value.endLocation)
    if (!start || !end) {
      toast.error('Không tìm thấy địa điểm trên bản đồ')
      return
    }
    const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`)
    if (res.data?.routes?.[0]) {
      trip.value.distance = Math.round(res.data.routes[0].distance / 1000)
      toast.success(`Khoảng cách dự kiến: ${trip.value.distance}km`)
    }
  } catch (err) {
    toast.error('Lỗi tính quãng đường')
  } finally {
    isCalculating.value = false
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
const endDate = ref(today)
const pickupTime = ref('09:00')
const returnTime = ref('18:00')

watch(() => trip.value.distance, (newDist) => {
  if (newDist > 100) {
    if (trip.value.routeType !== 'business') {
      trip.value.routeType = 'business'
      toast.info('Khoảng cách > 100km, hệ thống tự động chuyển sang lộ trình Công tác')
    }
    const hours = newDist / 60
    const daysToAdd = Math.ceil(hours / 10)
    const date = new Date(startDate.value)
    date.setDate(date.getDate() + daysToAdd)
    endDate.value = date.toISOString().split('T')[0]
  } else if (newDist > 10) {
    if (trip.value.routeType === 'short') {
      trip.value.routeType = 'long'
      toast.info('Khoảng cách > 10km, hệ thống tự động chuyển sang lộ trình Đường dài')
    }
  } else {
    if (trip.value.routeType !== 'short') {
      trip.value.routeType = 'short'
      toast.info('Khoảng cách < 10km, hệ thống tự động chuyển sang lộ trình Quãng ngắn')
    }
  }
})

const numDays = computed(() => {
  if (trip.value.routeType !== 'business') return 1
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
  return diffDays
})

const currentTier = computed(() => {
  if (!tripSettings.value) return { pricePerKm: 15000, driverFeePerDay: 500000, overTimeFee: 100000 }
  return tripSettings.value.tiers[trip.value.routeType] || tripSettings.value.tiers.short
})

const displayPricePerKm = computed(() => {
  return currentTier.value.pricePerKm
})

const displayDriverFee = computed(() => {
  return currentTier.value.driverFeePerDay
})

const displayOverTimeFee = computed(() => {
  return currentTier.value.overTimeFee
})

const totalCost = computed(() => {
  if (!car.value) return 0
  const kmsFee = displayPricePerKm.value * (trip.value.distance || 0)
  const driverTotalFee = trip.value.routeType === 'business' ? displayDriverFee.value * numDays.value : 0
  const serviceFee = 30000
  return Math.round(kmsFee + driverTotalFee + serviceFee)
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

    if (!car.value.isWithDriver) {
      toast.error('Xe này không hỗ trợ thuê theo chuyến')
      router.push('/cars')
      return
    }

    activeImage.value = car.value.images?.[0]?.url ? resolveImageUrl(car.value.images[0].url) : ''
    await fetchTripSettings()
  } catch (error) {
    toast.error('Không tìm thấy thông tin xe')
    router.push('/cars')
  } finally {
    loading.value = false
  }
}

const tripSettings = ref(null)
const fetchTripSettings = async () => {
  try {
    const res = await api.get('/trip-settings')
    tripSettings.value = res.data
  } catch (error) {
    console.error('Error fetching trip settings:', error)
  }
}

const handleBooking = () => {
  if (!trip.value.startLocation || !trip.value.endLocation || !trip.value.distance) {
    toast.error('Vui lòng tính quãng đường trước khi đặt chuyến')
    return
  }

  router.push({
    path: `/cars/${car.value._id}/trip/booking`,
    query: {
      startDate: startDate.value,
      pickupTime: pickupTime.value,
      returnTime: returnTime.value,
      startLocation: trip.value.startLocation,
      endLocation: trip.value.endLocation,
      distance: trip.value.distance,
      routeType: trip.value.routeType,
      pricePerKm: displayPricePerKm.value,
      driverFee: displayDriverFee.value,
      overTimeFee: displayOverTimeFee.value,
      totalCost: totalCost.value,
      endDate: endDate.value
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