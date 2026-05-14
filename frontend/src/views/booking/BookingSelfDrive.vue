<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button & Breadcrumb -->
      <div class="flex items-center space-x-4 mb-6">
        <button 
          @click="router.back()" 
          class="flex items-center text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors group"
        >
          <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </div>
          Quay lại
        </button>
        <div class="h-4 w-px bg-gray-200"></div>
        <span class="text-xs font-black uppercase tracking-widest text-gray-400">Đặt dịch vụ tự lái</span>
      </div>

      <!-- Car Info Summary -->
      <div v-if="car" class="bg-white rounded-[2.5rem] p-8 mb-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div class="relative group">
          <img 
            :src="car.images?.[0]?.url || '/logo.png'" 
            class="w-40 h-40 rounded-[2rem] object-cover border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
          >
          <div v-if="car.owner?.isVerified" class="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Dịch vụ đang chọn</p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">
            {{ car.brand }} {{ car.model }}
          </h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div class="flex items-center text-sm font-bold text-gray-500">
               <svg class="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
               {{ car.location?.city }}
            </div>
            <div class="px-3 py-1 bg-green-50 rounded-full text-[10px] font-black text-green-600 uppercase tracking-widest border border-green-100">
              Thuê tự lái
            </div>
          </div>
        </div>

        <div class="text-right">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá cơ bản</p>
          <div class="flex flex-col items-end">
             <span class="text-2xl font-black text-gray-900">
               {{ formatPrice(bookingForm.mode === 'hourly' ? car.pricePerHour : car.pricePerDay) }}
             </span>
             <span class="text-[10px] font-bold text-gray-400 uppercase">/ {{ bookingForm.mode === 'daily' ? 'Ngày' : 'Giờ' }}</span>
          </div>
        </div>
      </div>

      <!-- Professional Stepped Progress Bar -->
      <div class="mb-12">
        <div class="flex items-center justify-between max-w-2xl mx-auto px-4">
          <div v-for="step in 4" :key="step" class="flex items-center flex-1 last:flex-none">
            <div 
              class="w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-lg"
              :class="currentStep === step 
                ? 'bg-gray-900 text-white scale-110 -translate-y-1' 
                : currentStep > step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-400 border border-gray-100'"
            >
              <svg v-if="currentStep > step" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              <span v-else>{{ step }}</span>
            </div>
            <div 
              v-if="step < 4" 
              class="flex-1 h-1 mx-4 rounded-full transition-all duration-1000 overflow-hidden bg-gray-100"
            >
              <div 
                class="h-full bg-green-500 transition-all duration-1000 select-none"
                :style="{ width: currentStep > step ? '100%' : '0%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="flex justify-between max-w-2xl mx-auto mt-4 px-2">
          <span v-for="(label, idx) in ['Hành trình', 'Tiện ích', 'Xác minh', 'Hoàn tất']" :key="idx" 
            class="text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
            :class="currentStep === idx + 1 ? 'text-gray-900' : 'text-gray-300'"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] p-4 md:p-10 shadow-ux border border-gray-100 min-h-[500px] flex flex-col">
        <!-- Step 1: Destination & Time -->
        <div v-if="currentStep === 1" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900">Chi tiết hành trình</h2>
              <p class="text-sm text-gray-500 font-medium">Chọn thời gian và địa điểm bạn muốn nhận xe</p>
            </div>
          </div>

          <!-- Mode Selection -->
          <div v-if="!isModePreselected">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Phương thức thuê</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="bookingForm.mode = 'daily'"
                :class="bookingForm.mode === 'daily' ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'"
                class="p-5 border-2 rounded-3xl font-black transition-all uppercase tracking-widest text-xs"
              >
                Giao xe theo ngày
              </button>
              <button
                type="button"
                @click="bookingForm.mode = 'hourly'"
                :class="bookingForm.mode === 'hourly' ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'"
                class="p-5 border-2 rounded-3xl font-black transition-all uppercase tracking-widest text-xs"
              >
                Giao xe theo giờ
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="group">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-primary-600 transition-colors">Ngày nhận xe</label>
                <input v-model="bookingForm.startDate" type="date" class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-primary-500/20 text-gray-900 shadow-inner">
              </div>
              <div class="group">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-primary-600 transition-colors">{{ bookingForm.mode === 'daily' ? 'Ngày trả xe' : 'Số giờ thuê' }}</label>
                <input v-if="bookingForm.mode === 'daily'" v-model="bookingForm.endDate" type="date" class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-primary-500/20 text-gray-900 shadow-inner">
                <input v-else v-model="bookingForm.hours" type="number" min="1" max="24" class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-primary-500/20 text-gray-900 shadow-inner">
              </div>
            </div>

            <div class="space-y-6">
              <div class="group">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-primary-600 transition-colors">Giờ nhận xe</label>
                <input v-model="bookingForm.pickupTime" type="time" class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-primary-500/20 text-gray-900 shadow-inner">
              </div>
              <div v-if="bookingForm.mode === 'daily'" class="group">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-primary-600 transition-colors">Giờ trả xe</label>
                <input v-model="bookingForm.returnTime" type="time" class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-primary-500/20 text-gray-900 shadow-inner">
              </div>
            </div>
          </div>

          <!-- Address Selectors -->
          <div class="pt-8 border-t border-dashed border-gray-100">
             <div class="flex items-center gap-2 mb-6">
                <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <h3 class="text-sm font-black uppercase tracking-widest text-gray-900">Địa điểm dự kiến</h3>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="space-y-4">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa điểm nhận xe</label>
                  <input v-model="bookingForm.pickupLocation.street" placeholder="Tên đường, số nhà..." class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm shadow-inner group">
                  <div class="grid grid-cols-2 gap-2">
                    <select v-model="bookingForm.pickupLocation.city" class="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 ring-primary-500/20">
                      <option value="">Chọn Tỉnh/TP</option>
                      <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                    </select>
                    <select v-model="bookingForm.pickupLocation.district" class="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 ring-primary-500/20">
                      <option value="">Chọn Quận/Huyện</option>
                      <option v-for="ward in pickupFilteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                    </select>
                  </div>
               </div>
               <div class="space-y-4">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa điểm trả xe</label>
                  <input v-model="bookingForm.returnLocation.street" placeholder="Tên đường, số nhà..." class="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm shadow-inner group">
                  <div class="grid grid-cols-2 gap-2">
                    <select v-model="bookingForm.returnLocation.city" class="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 ring-primary-500/20">
                      <option value="">Chọn Tỉnh/TP</option>
                      <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                    </select>
                    <select v-model="bookingForm.returnLocation.district" class="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 ring-primary-500/20">
                      <option value="">Chọn Quận/Huyện</option>
                      <option v-for="ward in returnFilteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                    </select>
                  </div>
               </div>
             </div>
          </div>
        </div>

        <!-- Step 2: Experience Enhancements -->
        <div v-else-if="currentStep === 2" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900">Tiện ích bổ sung</h2>
              <p class="text-sm text-gray-500 font-medium">Nâng cấp trải nghiệm cho chuyến đi của bạn</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div 
               @click="bookingForm.fullInsurance = !bookingForm.fullInsurance"
               class="p-6 border-2 rounded-[2rem] transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
               :class="bookingForm.fullInsurance ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'"
             >
                <div class="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-transform" :class="bookingForm.fullInsurance ? 'bg-primary-600 text-white scale-110' : 'bg-white shadow-sm'">🛡️</div>
                <div>
                  <h4 class="font-black text-gray-900 mb-1">Bảo hiểm toàn diện</h4>
                  <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">+500.000đ / chuyến</p>
                </div>
                <p class="text-[9px] text-gray-400 font-medium leading-relaxed">Bảo vệ tối đa 100% chi phí khắc phục các sự cố trầy xước, va chạm.</p>
             </div>

             <div 
               @click="bookingForm.gpsRequired = !bookingForm.gpsRequired"
               class="p-6 border-2 rounded-[2rem] transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
               :class="bookingForm.gpsRequired ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'"
             >
                <div class="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-transform" :class="bookingForm.gpsRequired ? 'bg-primary-600 text-white scale-110' : 'bg-white shadow-sm'">📍</div>
                <div>
                  <h4 class="font-black text-gray-900 mb-1">Thiết bị định vị GPS</h4>
                  <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">+100.000đ / ngày</p>
                </div>
                <p class="text-[9px] text-gray-400 font-medium leading-relaxed">Hỗ trợ dẫn đường chuyên nghiệp và đảm bảo an toàn suốt lộ trình.</p>
             </div>

             <div 
               @click="bookingForm.babyCarSeat = !bookingForm.babyCarSeat"
               class="p-6 border-2 rounded-[2rem] transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
               :class="bookingForm.babyCarSeat ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'"
             >
                <div class="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-transform" :class="bookingForm.babyCarSeat ? 'bg-primary-600 text-white scale-110' : 'bg-white shadow-sm'">👶</div>
                <div>
                  <h4 class="font-black text-gray-900 mb-1">Ghế ngồi trẻ em</h4>
                  <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">+100.000đ / chuyến</p>
                </div>
                <p class="text-[9px] text-gray-400 font-medium leading-relaxed">Đảm bảo an toàn và thoải mái nhất cho bé yêu dưới 5 tuổi.</p>
             </div>
          </div>

          <div class="pt-8 border-t border-dashed border-gray-100">
             <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Hình thức xác nhận</label>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  @click="bookingForm.bookingType = 'immediate'"
                  :class="bookingForm.bookingType === 'immediate' ? 'bg-gray-900 text-white ring-4 ring-gray-100' : 'bg-white text-gray-700 border border-gray-100'"
                  class="p-6 rounded-[2rem] font-bold transition-all text-left flex items-start gap-4"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="bookingForm.bookingType === 'immediate' ? 'bg-white/20' : 'bg-green-50'">⚡</div>
                  <div>
                    <h5 class="font-black text-xs uppercase tracking-widest mb-1">Đặt ngay</h5>
                    <p class="text-[10px] opacity-70">Xác nhận đơn ngay, cọc 30%</p>
                  </div>
                </button>
                <button
                  type="button"
                  @click="bookingForm.bookingType = 'prebook'"
                  :class="bookingForm.bookingType === 'prebook' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white text-gray-700 border border-gray-100'"
                  class="p-6 rounded-[2rem] font-bold transition-all text-left flex items-start gap-4"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="bookingForm.bookingType === 'prebook' ? 'bg-white/20' : 'bg-blue-50'">🕒</div>
                  <div>
                    <h5 class="font-black text-xs uppercase tracking-widest mb-1">Giữ chỗ</h5>
                    <p class="text-[10px] opacity-70">Giữ xe 24h, cọc ưu đãi 10%</p>
                  </div>
                </button>
             </div>
          </div>
        </div>

        <!-- Step 3: Verification & Identity -->
        <div v-else-if="currentStep === 3" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900">Xác minh lái xe</h2>
              <p class="text-sm text-gray-500 font-medium">Chúng tôi cần kiểm tra thông tin bằng lái của bạn</p>
            </div>
          </div>

          <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div class="group">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Họ tên người lái</label>
              <p class="text-lg font-black text-gray-900">{{ bookingForm.driverName || 'N/A' }}</p>
            </div>
            <div class="group">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Số điện thoại</label>
              <p class="text-lg font-black text-gray-900">{{ bookingForm.driverPhone || 'N/A' }}</p>
            </div>
            <div class="group">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Bằng lái xe</label>
              <div class="flex items-center gap-2">
                <span class="text-lg font-black text-gray-900">{{ bookingForm.drivingLicense || 'N/A' }}</span>
                <span v-if="bookingForm.drivingLicense" class="badge badge-success text-[10px] font-black uppercase">Đã kiểm tra</span>
              </div>
            </div>
            <div class="group">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Số định danh (CCCD)</label>
              <p class="text-lg font-black text-gray-900">{{ bookingForm.driverIdCard || 'N/A' }}</p>
            </div>
          </div>

          <div v-if="!isProfileComplete" class="p-8 bg-black rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div class="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 animate-pulse">⚠️</div>
              <div class="text-center md:text-left flex-1">
                 <h4 class="text-xl font-black uppercase tracking-tight mb-2">Hồ sơ chưa đủ điều kiện</h4>
                 <p class="text-xs text-gray-400 font-medium leading-relaxed">Bạn cần cập nhật đầy đủ ảnh CCCD và Bằng lái xe vào hồ sơ cá nhân để hệ thống phê duyệt quyền lái xe tự lái.</p>
              </div>
              <button @click="goToProfile" class="w-full md:w-auto px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-50 active-scale shadow-xl shadow-white/5">Cập nhật profile</button>
          </div>
          <div v-else class="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
             <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
             </div>
             <div>
                <p class="text-sm font-black text-green-900 uppercase">Hồ sơ hợp lệ</p>
                <p class="text-[10px] text-green-600 font-bold uppercase">Bạn có thể tiếp tục đặt xe ngay</p>
             </div>
          </div>
        </div>

        <!-- Step 4: Final Summary -->
        <div v-else-if="currentStep === 4" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900">Kiểm tra & Hoàn tất</h2>
              <p class="text-sm text-gray-500 font-medium">Vui lòng rà soát lại các thông tin lần cuối</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Summary Details -->
            <div class="md:col-span-2 space-y-6">
               <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div>
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span class="w-1 h-3 bg-primary-500 rounded-full"></span>
                       Chi tiết đơn xe
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                       <div class="bg-white p-4 rounded-2xl shadow-sm">
                          <p class="text-[9px] font-bold text-gray-400 uppercase uppercase mb-1">Thời gian thuê</p>
                          <p class="text-sm font-black text-gray-900">{{ bookingForm.mode === 'daily' ? rentalDays + ' ngày' : bookingForm.hours + ' giờ' }}</p>
                       </div>
                       <div class="bg-white p-4 rounded-2xl shadow-sm">
                          <p class="text-[9px] font-bold text-gray-400 uppercase uppercase mb-1">Loại xe</p>
                          <p class="text-sm font-black text-gray-900">{{ car?.brand }} {{ car?.model }}</p>
                       </div>
                    </div>
                  </div>

                  <div>
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span class="w-1 h-3 bg-primary-500 rounded-full"></span>
                       Địa điểm nhận & trả
                    </h4>
                    <div class="space-y-3">
                       <div class="flex items-start gap-3">
                          <div class="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs shadow-sm ring-1 ring-gray-100">🏁</div>
                          <p class="text-xs font-bold text-gray-700 leading-relaxed">{{ bookingForm.pickupLocation.street }}, {{ bookingForm.pickupLocation.district }}, {{ bookingForm.pickupLocation.city }}</p>
                       </div>
                       <div class="flex items-start gap-3">
                          <div class="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs shadow-sm ring-1 ring-gray-100">🔁</div>
                          <p class="text-xs font-bold text-gray-700 leading-relaxed">{{ bookingForm.returnLocation.street }}, {{ bookingForm.returnLocation.district }}, {{ bookingForm.returnLocation.city }}</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div class="group">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Ghi chú yêu cầu đặc biệt</label>
                  <textarea v-model="bookingForm.notes" class="w-full bg-gray-50 border-none rounded-2xl p-6 font-bold text-sm shadow-inner group-focus-within:ring-2 ring-primary-500/10 transition-all" rows="3" placeholder="Ví dụ: Xe cần sạch sẽ, tôi sẽ nhận xe sớm 15p..."></textarea>
               </div>
            </div>

            <!-- Price Breakdown -->
            <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col h-fit sticky top-4">
               <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Báo giá chi tiết</h4>
               <div class="space-y-4 mb-8">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500">Giá thuê xe</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(rentalFee) }}</span>
                  </div>
                  <div v-if="pickupDeliveryFee > 0" class="flex justify-between items-center">
                    <span class="text-xs font-bold text-primary-600">Phí giao nhận xe</span>
                    <span class="text-sm font-black text-primary-600">{{ formatPrice(pickupDeliveryFee) }}</span>
                  </div>
                  <div v-if="optionsFee > 0" class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500">Tiện ích bổ sung</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(optionsFee) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500">Phí dịch vụ 5%</span>
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(serviceFee) }}</span>
                  </div>
                  <div class="pt-4 border-t border-dashed border-gray-200">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-black text-gray-900 uppercase">Tổng cộng</span>
                      <span class="text-2xl font-black text-gray-900">{{ formatPrice(totalAmount) }}</span>
                    </div>
                    <p class="text-[9px] text-primary-500 font-bold uppercase tracking-tight">{{ bookingForm.bookingType === 'prebook' ? 'Tiền giữ chỗ (10%)' : 'Tiền cọc cần thanh toán (30%)' }}: {{ formatPrice(deposit) }}</p>
                  </div>
               </div>
               
               <p class="text-[9px] text-gray-400 font-medium italic text-center leading-relaxed">Sau khi nhấn nút bên dưới, đơn hàng sẽ được tạo và chuyển đến trang thanh toán cọc.</p>
            </div>
          </div>
        </div>

        <!-- Wizard Navigation -->
        <div class="mt-auto pt-10 border-t border-gray-100 flex justify-between gap-4">
           <button 
             v-if="currentStep > 1"
             @click="currentStep--"
             class="px-8 py-4 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50 transition-all border-2 border-gray-100 active-scale"
           >
             Quay lại
           </button>
           <div v-else></div> <!-- Spacer -->

           <button 
             v-if="currentStep < 4"
             @click="currentStep++"
             class="px-10 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all shadow-xl active-scale"
           >
             Tiếp tục
           </button>
           <button 
             v-else
             @click="submitBooking"
             :disabled="!isProfileComplete || loading"
             class="px-10 py-4 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 active-scale disabled:opacity-50"
           >
             {{ loading ? 'Đang xử lý...' : 'Xác nhận đặt ngay' }}
           </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

const car = ref(null)
const locations = ref([])
const loading = ref(false)

const bookingForm = ref({
  mode: route.query.mode || 'daily',
  startDate: route.query.startDate || '',
  endDate: route.query.endDate || '',
  pickupTime: route.query.pickupTime || '',
  returnTime: route.query.returnTime || '',
  hours: route.query.hours || '',
  pickupLocation: { province: '', district: '', street: '' },
  returnLocation: { province: '', district: '', street: '' },
  renterType: 'self',
  driverName: '',
  driverPhone: '',
  driverEmail: '',
  driverIdCard: '',
  drivingLicense: '',
  licenseClass: '',
  fullInsurance: false,
  gpsRequired: false,
  babyCarSeat: false,
  fuelFull: false,
  notes: '',
  paymentMethod: 'cash',
  bookingType: 'immediate' // 'immediate' or 'prebook'
})

const currentStep = ref(1)

const isProfileComplete = computed(() => {
  const u = authStore.user
  if (!u) return false
  
  // Basic info check
  if (!u.fullName || !u.phone) return false
  
  // ID Card check (accept string or object with number)
  const hasIdCard = !!(u.idCard?.number || (typeof u.idCard === 'string' && u.idCard.length > 5))
  
  // Driving license check
  const hasDrivingLicense = !!(u.drivingLicense?.number || u.driverLicense || (typeof u.drivingLicense === 'string' && u.drivingLicense.length > 5))
  
  return hasIdCard && hasDrivingLicense
})

const goToProfile = () => {
  localStorage.setItem('redirectAfterProfileUpdate', route.fullPath)
  router.push('/profile')
}

const normalizeProvince = (str) => {
  if (!str) return ''
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\b(tinh|thanh pho|tp\.|tp|quan|huyen|phuong|xa|thi tran)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

const getProvinceCode = (provinceName) => {
  if (!provinceName || !locations.value.length) return null
  const normSearch = normalizeProvince(provinceName)
  const found = locations.value.find(loc => normalizeProvince(loc.name) === normSearch || normalizeProvince(loc.short_name) === normSearch)
  return found ? found.province_code : null
}

const isModePreselected = computed(() => !!route.query.mode)

const rentalDays = computed(() => {
  if (!bookingForm.value.startDate || !bookingForm.value.endDate) return 1
  const start = new Date(bookingForm.value.startDate)
  const end = new Date(bookingForm.value.endDate)
  const diffTime = Math.abs(end - start)
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days === 0 ? 1 : days
})

const rentalFee = computed(() => {
  if (!car.value) return 0
  if (bookingForm.value.mode === 'daily') {
    return car.value.pricePerDay * rentalDays.value
  } else {
    return (car.value.pricePerHour || Math.round(car.value.pricePerDay / 8)) * (bookingForm.value.hours || 1)
  }
})

const extraFee = computed(() => {
  if (!car.value || !locations.value.length) return 0
  const carCity = car.value.location?.city || car.value.addressId?.city || car.value.addressId?.province?.name || ''
  const carDist = car.value.location?.district || car.value.addressId?.district || car.value.addressId?.ward?.name || ''
  const carCode = getProvinceCode(carCity)
  const carDistN = normalizeProvince(carDist)
  const oFee = Number(car.value.outOfProvinceFee || 200000)
  const iFee = Number(car.value.inProvinceFee || 100000)
  const pCode = getProvinceCode(bookingForm.value.pickupLocation.city)
  const rCode = getProvinceCode(bookingForm.value.returnLocation.city)
  const pDistN = normalizeProvince(bookingForm.value.pickupLocation.district)
  const rDistN = normalizeProvince(bookingForm.value.returnLocation.district)

  let totalExtra = 0
  if (carCode) {
    if (pCode && pCode !== carCode) totalExtra += oFee
    if (rCode && rCode !== carCode) totalExtra += rCode !== pCode ? oFee : 0
    if (pCode && pCode === carCode) {
       if (pDistN && carDistN && pDistN !== carDistN) totalExtra += iFee
    }
    if (rCode && rCode === carCode && rCode !== pCode) {
       if (rDistN && carDistN && rDistN !== carDistN) totalExtra += iFee
    }
  }
  return totalExtra
})

const RATE_PER_KM = 1000 // 1,000 VND per km

// Delivery calculation state
const deliveryData = ref({
  pickupDistance: 0,
  loading: false
})

// Geocode address to coordinates using Nominatim
const geocode = async (address) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: `${address}, Việt Nam`, format: 'json', limit: 1 }
    })
    if (res.data && res.data[0]) {
      return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) }
    }
    return null
  } catch (err) {
    console.error('[GEOCODE] Error:', err)
    return null
  }
}

// Calculate actual driving distance using OSRM
const calculateDeliveryDistance = async () => {
  if (!car.value || !bookingForm.value.pickupLocation.city) {
    console.log('[DELIVERY] Skip - missing car or pickup location')
    deliveryData.value.pickupDistance = 0
    return
  }
  
  // Extra safety: check if car actually has location strings to prevent geocoding center of VN
  const carLoc = car.value.location?.city || car.value.addressId?.province?.name || ''
  const carDst = car.value.location?.district || car.value.addressId?.ward?.name || ''
  if (!carLoc.trim()) {
    console.log('[DELIVERY] Car has no defined location, defaulting to 0km')
    deliveryData.value.pickupDistance = 0
    return
  }
  
  deliveryData.value.loading = true
  
  try {
    // Build full address strings
    const carLocation = car.value.location?.city || car.value.addressId?.province?.name || ''
    const carDistrict = car.value.location?.district || car.value.addressId?.ward?.name || ''
    const carAddress = `${carDistrict}, ${carLocation}`
    
    const pickupAddress = `${bookingForm.value.pickupLocation.district}, ${bookingForm.value.pickupLocation.city}`
    
    console.log('[DELIVERY] Calculating from:', carAddress, 'to:', pickupAddress)
    
    // Geocode both locations
    const [carCoords, pickupCoords] = await Promise.all([
      geocode(carAddress),
      geocode(pickupAddress)
    ])
    
    if (!carCoords || !pickupCoords) {
      console.log('[DELIVERY] Geocoding failed, using estimate')
      // Fallback to estimate
      deliveryData.value.pickupDistance = estimateDistance()
      deliveryData.value.loading = false
      return
    }
    
    console.log('[DELIVERY] Car coords:', carCoords, 'Pickup coords:', pickupCoords)
    
    // Call OSRM for actual driving distance
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${carCoords.lon},${carCoords.lat};${pickupCoords.lon},${pickupCoords.lat}?overview=false`
    const res = await axios.get(osrmUrl)
    
    if (res.data?.routes?.[0]) {
      const distanceKm = Math.round(res.data.routes[0].distance / 1000)
      deliveryData.value.pickupDistance = distanceKm
      console.log('[DELIVERY] Actual distance:', distanceKm, 'km')
    } else {
      console.log('[DELIVERY] No route found, using estimate')
      deliveryData.value.pickupDistance = estimateDistance()
    }
  } catch (err) {
    console.error('[DELIVERY] OSRM error:', err.message)
    deliveryData.value.pickupDistance = estimateDistance()
  } finally {
    deliveryData.value.loading = false
  }
}

// Estimate distance based on province/district when geocoding fails
const estimateDistance = () => {
  if (!car.value || !locations.value.length) return 0
  
  const carCity = car.value.location?.city || car.value.addressId?.city || car.value.addressId?.province?.name || ''
  const carDist = car.value.location?.district || car.value.addressId?.district || car.value.addressId?.ward?.name || ''
  const carCode = getProvinceCode(carCity)
  const carDistN = normalizeProvince(carDist)
  
  const pCode = getProvinceCode(bookingForm.value.pickupLocation.city)
  const pDistN = normalizeProvince(bookingForm.value.pickupLocation.district)
  
  if (!carCode || !pCode) return 0
  
  if (pCode !== carCode) return 100
  if (pDistN && carDistN && pDistN !== carDistN) return 25
  return 5
}

const deliveryDistance = computed(() => ({
  pickup: deliveryData.value.pickupDistance || 0,
  total: deliveryData.value.pickupDistance || 0
}))

const deliveryFee = computed(() => {
  return Math.round((deliveryData.value.pickupDistance || 0) * RATE_PER_KM)
})

const pickupDeliveryFee = computed(() => deliveryFee.value)

const deliveryDebugInfo = computed(() => {
  const carCity = car.value?.location?.city || car.value?.addressId?.city || car.value?.addressId?.province?.name || ''
  const carDist = car.value?.location?.district || car.value?.addressId?.district || car.value?.addressId?.ward?.name || ''
  return {
    carCity,
    carDist,
    carCode: getProvinceCode(carCity),
    pickupCity: bookingForm.value.pickupLocation.city,
    pickupDist: bookingForm.value.pickupLocation.district,
    pickupCode: getProvinceCode(bookingForm.value.pickupLocation.city),
    returnCity: bookingForm.value.returnLocation.city,
    returnDist: bookingForm.value.returnLocation.district,
    returnCode: getProvinceCode(bookingForm.value.returnLocation.city),
    distance: deliveryDistance.value,
    fee: deliveryFee.value
  }
})

const optionsFee = computed(() => {
  let fee = 0
  if (bookingForm.value.fullInsurance) fee += 500000
  if (bookingForm.value.gpsRequired) fee += 100000 * (bookingForm.value.mode === 'daily' ? rentalDays.value : 1)
  if (bookingForm.value.babyCarSeat) fee += 100000
  return fee
})

const serviceFee = computed(() => Math.round(rentalFee.value * 0.05))
const deposit = computed(() => {
  // Pre-booking: 10% or minimum 100,000đ
  if (bookingForm.value.bookingType === 'prebook') {
    return Math.max(Math.round(totalAmount.value * 0.1), 100000)
  }
  // Immediate booking: 30%
  return Math.round(totalAmount.value * 0.3)
})
const holdDeposit = computed(() => {
  // For pre-booking display
  if (bookingForm.value.bookingType === 'prebook') {
    return Math.max(Math.round(totalAmount.value * 0.1), 100000)
  }
  return 0
})
const totalAmount = computed(() => rentalFee.value + optionsFee.value + serviceFee.value + deliveryFee.value)

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const fillUserInfo = () => {
  if (authStore.user) {
    const u = authStore.user
    if (!bookingForm.value.driverName) bookingForm.value.driverName = u.fullName || u.name || ''
    if (!bookingForm.value.driverPhone) bookingForm.value.driverPhone = u.phone || ''
    if (!bookingForm.value.driverEmail) bookingForm.value.driverEmail = u.email || ''
    if (!bookingForm.value.driverIdCard) bookingForm.value.driverIdCard = u.idCard?.number || ''
    if (!bookingForm.value.drivingLicense) bookingForm.value.drivingLicense = u.drivingLicense?.number || u.driverInfo?.licenseNumber || ''
    if (!bookingForm.value.licenseClass) bookingForm.value.licenseClass = u.drivingLicense?.type || u.driverInfo?.licenseClass || ''
    
    // Auto-fill address if empty
    const addr = u.addressId || u.address
    if (addr && !bookingForm.value.pickupLocation.street) {
      bookingForm.value.pickupLocation.street = addr.street || ''
      bookingForm.value.pickupLocation.city = addr.province?.name || addr.city || ''
      setTimeout(() => {
        bookingForm.value.pickupLocation.district = addr.ward?.name || addr.district || ''
      }, 500)
    }
  }
}

watch(() => authStore.user, (u) => {
  if (u) fillUserInfo()
}, { immediate: true })

const pickupFilteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.pickupLocation.city)
  return prov ? prov.wards : []
})

const returnFilteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.returnLocation.city)
  return prov ? prov.wards : []
})

watch(() => bookingForm.value.pickupLocation.city, () => {
  bookingForm.value.pickupLocation.district = ''
})

watch(() => bookingForm.value.pickupLocation.district, (newDistrict) => {
  if (newDistrict) {
    console.log('[WATCH] District selected, calculating distance...')
    calculateDeliveryDistance()
  }
})

watch(() => bookingForm.value.returnLocation.city, () => {
  bookingForm.value.returnLocation.district = ''
})

watch(() => bookingForm.value.mode, (newMode) => {
  if (newMode === 'hourly') {
    bookingForm.value.endDate = ''
    bookingForm.value.pickupTime = ''
    bookingForm.value.returnTime = ''
  } else {
    bookingForm.value.hours = ''
  }
})

const fetchCar = async () => {
  try {
    const response = await api.get(`/cars/${route.params.id}`)
    car.value = response.data.car
    return true
  } catch (error) {
    toast.error('Không tìm thấy xe')
    router.back()
    return false
  }
}

const submitBooking = async () => {
  try {
    loading.value = true
    
    // Validate required fields before calling API
    if (!bookingForm.value.startDate) {
      toast.error('Vui lòng chọn ngày nhận xe')
      loading.value = false
      return
    }
    if (bookingForm.value.mode === 'daily' && !bookingForm.value.endDate) {
      toast.error('Vui lòng chọn ngày trả xe')
      loading.value = false
      return
    }
    if (!bookingForm.value.pickupTime) {
      toast.error('Vui lòng chọn giờ nhận xe')
      loading.value = false
      return
    }
    if (!bookingForm.value.returnTime) {
      toast.error('Vui lòng chọn giờ trả xe')
      loading.value = false
      return
    }
    
    // Check car availability and blocked schedules before submitting
    try {
      const requestData = {
        carId: route.params.id,
        startDate: bookingForm.value.startDate,
        endDate: bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate,
        pickupTime: bookingForm.value.pickupTime,
        returnTime: bookingForm.value.returnTime,
        mode: bookingForm.value.mode
      }
      console.log('Checking car availability with data:', requestData)
      
      const availabilityCheck = await api.post('/bookings/check-car-availability', requestData)
      
      if (!availabilityCheck.data.available) {
        toast.error(availabilityCheck.data.message || 'Xe không khả dụng trong thời gian này. Vui lòng chọn thời gian khác.')
        loading.value = false
        return
      }
    } catch (checkError) {
      // Check if error response contains availability info
      if (checkError.response?.data?.available === false) {
        toast.error(checkError.response.data.message || 'Xe không khả dụng trong thời gian này. Vui lòng chọn thời gian khác.')
        loading.value = false
        return
      }
      console.log('Car availability check failed:', checkError)
      // Continue with booking if API doesn't exist
    }
    
    const formData = new FormData()
    formData.append('car', route.params.id)
    formData.append('rentalType', 'self_drive')
    formData.append('mode', bookingForm.value.mode)
    formData.append('startDate', bookingForm.value.startDate)
    formData.append('endDate', bookingForm.value.mode === 'daily' ? bookingForm.value.endDate : bookingForm.value.startDate)
    formData.append('pickupTime', bookingForm.value.pickupTime)
    formData.append('returnTime', bookingForm.value.returnTime)
    formData.append('hours', bookingForm.value.hours)
    formData.append('pickupLocation', JSON.stringify(bookingForm.value.pickupLocation))
    formData.append('returnLocation', JSON.stringify(bookingForm.value.returnLocation))
    formData.append('renterType', 'self')
    formData.append('passengerName', bookingForm.value.driverName) 
    formData.append('passengerPhone', bookingForm.value.driverPhone)
    formData.append('passengerEmail', bookingForm.value.driverEmail)
    formData.append('passengerIdCard', bookingForm.value.driverIdCard)
    formData.append('drivingLicense', bookingForm.value.drivingLicense)
    formData.append('licenseClass', bookingForm.value.licenseClass)
    formData.append('fullInsurance', bookingForm.value.fullInsurance)
    formData.append('gpsRequired', bookingForm.value.gpsRequired)
    formData.append('babyCarSeat', bookingForm.value.babyCarSeat)
    formData.append('payment', JSON.stringify({ method: bookingForm.value.paymentMethod }))
    formData.append('notes', bookingForm.value.notes)
    formData.append('bookingType', bookingForm.value.bookingType)
    formData.append('pricing', JSON.stringify({
      totalAmount: totalAmount.value,
      deposit: deposit.value,
      serviceFee: serviceFee.value,
      rentalFee: rentalFee.value,
      extraFee: 0,
      optionsFee: optionsFee.value,
      deliveryDistance: Number(deliveryData.value.pickupDistance) || 0,
      deliveryFee: Number(deliveryFee.value) || 0,
      deliveryRatePerKm: RATE_PER_KM,
      bookingType: bookingForm.value.bookingType
    }))

    const response = await api.post('/bookings', formData)
    if (response.data.success) {
      const bookingId = response.data.booking._id;
      toast.success('Gửi yêu cầu đặt xe thành công!')
      // Chuyển sang trang thanh toán chuyên nghiệp
      router.push(`/payment/checkout/${bookingId}`)
    }
  } catch (error) {
    console.error('Booking error:', error)
    const msg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : 'Lỗi khi tạo đơn đặt hàng')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Start parallelized fetching
  authStore.fetchUser().then(() => fillUserInfo())
  
  fetchCar()
  
  fetch('/data.json')
    .then(res => res.json())
    .then(data => {
      locations.value = data
    })
    .catch(err => console.error('Error loading locations:', err))
})
</script>
