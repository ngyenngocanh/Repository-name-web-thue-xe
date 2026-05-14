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
        <span class="text-xs font-black uppercase tracking-widest text-gray-400">Tiến hành đặt dịch vụ</span>
      </div>

      <!-- Progress Steps -->
      <div class="mb-8 overflow-x-auto pb-4">
        <div class="flex items-center min-w-[600px] justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
            v-show="step.show !== false"
          >
            <div 
              class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors flex-shrink-0"
              :class="getCurrentStepIndex === index 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : (getCurrentStepIndex > index ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-500')"
            >
              <svg v-if="getCurrentStepIndex > index" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span 
              class="ml-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
              :class="getCurrentStepIndex >= index ? 'text-primary-600' : 'text-gray-400'"
            >
              {{ step.title }}
            </span>
            <div 
              v-if="index < steps.length - 1"
              class="flex-1 min-w-[20px] h-0.5 mx-4 transition-colors"
              :class="getCurrentStepIndex > index ? 'bg-primary-600' : 'bg-gray-300'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Car/Driver Info Summary Card -->
      <div v-if="car || targetDriver" class="bg-white rounded-[2.5rem] p-8 mb-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        <div class="relative group">
          <img
            :src="car ? getCarImageUrl(car, 0) : (targetDriver?.avatar || '/placeholder-avatar.svg')"
            class="w-40 h-40 rounded-[2rem] object-cover border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
            @error="handleImageError"
          >
          <div v-if="car?.owner?.isVerified || targetDriver?.isVerified" class="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-primary-600 mb-1">Dịch vụ đang chọn</p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">
            {{ car ? `${car.brand} ${car.model}` : `Tài xế ${targetDriver?.fullName}` }}
          </h2>
          <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div v-if="car" class="flex items-center text-sm font-bold text-gray-500">
               <svg class="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
               {{ car.location?.city || car.addressId?.province?.name || '' }}
            </div>
            <div v-else class="flex items-center text-sm font-bold text-gray-500">
               <svg class="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v2a4 4 0 004 4h2a4 4 0 004-4V6a4 4 0 00-4-4h-2z"/></svg>
               {{ targetDriver?.driverInfo?.experience || 5 }} Năm kinh nghiệm
            </div>
            <div class="px-3 py-1 bg-primary-50 rounded-full text-[10px] font-black text-primary-600 uppercase tracking-widest border border-primary-100">
              {{ rentalMode === 'self_drive' ? 'Thuê tự lái' : rentalMode === 'with_driver' ? 'Thuê kèm tài' : 'Thuê tài xế riêng' }}
            </div>
          </div>
        </div>

        <div class="text-right">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá cơ bản</p>
          <div class="flex flex-col items-end">
             <span class="text-2xl font-black text-gray-900">
               {{ formatPrice(car 
                  ? (rentalMode === 'with_driver' 
                      ? (bookingForm.mode === 'hourly' ? car.pricePerHourWithDriver : car.pricePerDayWithDriver)
                      : (bookingForm.mode === 'hourly' ? car.pricePerHour : car.pricePerDay))
                  : (bookingForm.mode === 'hourly' ? targetDriver?.driverInfo?.driverRatePerHour : targetDriver?.driverInfo?.driverRatePerDay)) 
               }}
             </span>
             <span class="text-[10px] font-bold text-gray-400 uppercase">/ {{ bookingForm.mode === 'daily' ? 'Ngày' : 'Giờ' }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Schedule -->
      <div v-if="isScheduleStep" class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        <div class="bg-primary-900 p-8">
           <h3 class="text-2xl font-black text-white">Chọn lịch trình của bạn</h3>
           <p class="text-primary-100 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Tùy chọn thời gian nhận và trả</p>
        </div>
        <div class="p-10">
          <form @submit.prevent="nextStep" class="space-y-8">
            <!-- Mode Switch (Daily vs Hourly vs Trip) -->
            <div class="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                <button 
                  type="button"
                  @click="bookingForm.mode = 'daily'"
                  class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="bookingForm.mode === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo ngày</button>
                <button 
                  type="button"
                  @click="bookingForm.mode = 'hourly'"
                  class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="bookingForm.mode === 'hourly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo giờ</button>
                <button 
                  v-if="rentalMode === 'driver_only'"
                  type="button"
                  @click="bookingForm.mode = 'trip'"
                  class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="bookingForm.mode === 'trip' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >Theo chuyến (KM)</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ngày bắt đầu</label>
                  <input v-model="bookingForm.startDate" type="date" :min="today" class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 focus:ring-0 transition-all font-bold" required>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Giờ nhận</label>
                  <input v-model="bookingForm.pickupTime" type="time" class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold" required>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{{ bookingForm.mode === 'hourly' ? 'Chưa khả dụng' : 'Ngày kết thúc' }}</label>
                  <input 
                    v-model="bookingForm.endDate" 
                    type="date" 
                    :min="bookingForm.startDate || today" 
                    class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold" 
                    :disabled="bookingForm.mode === 'hourly'"
                    :required="!(bookingForm.mode === 'hourly')"
                  >
                </div>
                <div v-if="bookingForm.mode === 'daily'">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Giờ trả</label>
                  <input v-model="bookingForm.returnTime" type="time" class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold" required>
                </div>
              </div>
            </div>

            <div v-if="bookingForm.mode === 'hourly'" class="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
               <div>
                  <p class="text-xs font-black text-blue-900 uppercase tracking-widest">Thời lượng thuê</p>
                  <p class="text-blue-700 font-bold">Thuê theo giờ trong ngày</p>
               </div>
               <div class="flex items-center space-x-4">
                  <button type="button" @click="bookingForm.hours > 1 && bookingForm.hours--" class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black">-</button>
                  <span class="text-xl font-black text-gray-900 w-12 text-center">{{ bookingForm.hours || 4 }}h</span>
                  <button type="button" @click="bookingForm.hours++" class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black">+</button>
               </div>
            </div>

            <div v-if="bookingForm.mode === 'trip'" class="mt-8 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 italic space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label class="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Điểm đi (A)</label>
                    <input v-model="bookingForm.trip.startLocation" type="text" class="w-full px-5 py-4 bg-white rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 transition-all font-bold" placeholder="Nhập điểm đi..." required>
                 </div>
                 <div>
                    <label class="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Điểm đến (B)</label>
                    <input v-model="bookingForm.trip.endLocation" type="text" class="w-full px-5 py-4 bg-white rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 transition-all font-bold" placeholder="Nhập điểm đến..." required>
                 </div>
               </div>
               <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-indigo-100 pt-6">
                 <div>
                    <p class="text-xs font-black text-indigo-900 uppercase tracking-widest">Quãng đường dự kiến</p>
                    <p class="text-indigo-600 text-[10px] font-bold uppercase mt-1">Tính phí dựa trên số KM thực tế</p>
                 </div>
                 <div class="relative w-full md:w-48">
                    <input v-model.number="bookingForm.trip.distance" type="number" min="1" class="w-full bg-white border-2 border-indigo-100 rounded-2xl px-6 py-4 text-2xl font-black text-center text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm" placeholder="KM">
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300 uppercase">KM</span>
                 </div>
               </div>
            </div>

            <div class="flex justify-end pt-4">
              <button type="submit" class="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:scale-105 transition-all uppercase text-xs tracking-widest">
                Tiếp tục: Địa điểm
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Step 2: Location (Standard across types) -->
      <div v-if="isLocationStep" class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
         <div class="bg-primary-900 p-8">
           <h3 class="text-2xl font-black text-white">Địa điểm đón & trả</h3>
           <p class="text-primary-100 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Cung cấp thông tin chi tiết</p>
        </div>
        <div class="p-10">
          <form @submit.prevent="nextStep" class="space-y-8">
              <!-- Pickup Location -->
              <div class="space-y-4">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Địa điểm đón</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="relative">
                      <select v-model="bookingForm.pickupAddress.city" class="w-full pl-5 pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold appearance-none" required>
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                      </select>
                   </div>
                   <div class="relative">
                      <select v-model="bookingForm.pickupAddress.district" class="w-full pl-5 pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold appearance-none" required :disabled="!pickupWards.length">
                        <option value="">Chọn Phường/Xã/Quận/Huyện</option>
                        <option v-for="ward in pickupWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                      </select>
                   </div>
                </div>
                <div class="relative">
                   <textarea v-model="bookingForm.pickupAddress.street" rows="2" class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold placeholder:font-medium" placeholder="Số nhà, tên đường..." required></textarea>
                </div>
              </div>
              <div v-if="rentalMode !== 'driver_only' || bookingForm.mode === 'daily'" class="space-y-4 pt-4 border-t border-gray-50">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Địa điểm trả</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="relative">
                      <select v-model="bookingForm.returnAddress.city" class="w-full pl-5 pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold appearance-none">
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                      </select>
                   </div>
                   <div class="relative">
                      <select v-model="bookingForm.returnAddress.district" class="w-full pl-5 pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold appearance-none" :disabled="!returnWards.length">
                        <option value="">Chọn Phường/Xã/Quận/Huyện</option>
                        <option v-for="ward in returnWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                      </select>
                   </div>
                </div>
                <div class="relative">
                   <textarea v-model="bookingForm.returnAddress.street" rows="2" class="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-primary-500 transition-all font-bold placeholder:font-medium" placeholder="Số nhà, tên đường (Để trống nếu giống điểm đón)..."></textarea>
                </div>
              </div>

              <!-- Long-term Agreements (Conditional) -->
              <div v-if="duration.days >= 15" class="space-y-6 pt-6 border-t border-gray-50 bg-primary-100/30 p-8 rounded-[2rem]">
                <h4 class="text-sm font-black text-primary-900 uppercase tracking-widest flex items-center">
                  <svg class="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                  Hợp đồng thuê dài hạn
                </h4>
                
                <div class="space-y-4">
                  <label class="flex items-start cursor-pointer group">
                    <div class="relative flex items-center pt-1">
                      <input type="checkbox" v-model="bookingForm.carPreservation" class="w-6 h-6 text-primary-600 border-2 border-gray-300 rounded-lg focus:ring-primary-500 transition-all cursor-pointer" required>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-black text-gray-900">Cam kết giữ gìn và bảo quản xe</p>
                      <p class="text-[10px] text-gray-500 font-medium">Bên thuê cam kết sử dụng xe đúng mục đích, giữ gìn xe sạch sẽ và tuân thủ các điều khoản bảo quản trong hợp đồng rõ ràng.</p>
                    </div>
                  </label>

                  <label v-if="rentalMode !== 'self_drive'" class="flex items-start cursor-pointer group">
                    <div class="relative flex items-center pt-1">
                      <input type="checkbox" v-model="bookingForm.driverGuarantees" class="w-6 h-6 text-primary-600 border-2 border-gray-300 rounded-lg focus:ring-primary-500 transition-all cursor-pointer" required>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-black text-gray-900">Đảm bảo điều kiện sinh hoạt cho tài xế</p>
                      <p class="text-[10px] text-gray-500 font-medium">Bên thuê đảm bảo cung cấp hoặc chi trả chi phí ăn uống, chỗ nghỉ ngơi sạch sẽ và thời gian nghỉ ngơi hợp lý cho tài xế trong suốt quá trình phục vụ.</p>
                    </div>
                  </label>
                </div>
              </div>
            <div class="flex justify-between items-center pt-4">
              <button type="button" @click="prevStep" class="text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600">Quay lại</button>
              <button 
                type="submit" 
                class="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
              >
                 Tiếp tục: {{ rentalMode === 'with_driver' ? 'Gửi yêu cầu & Chờ xác nhận' : 'Thanh toán' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Step 3: Wait for Driver Assignment (Official) - Replaces Selection -->
      <div v-if="isWaitStep" class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
         <div class="bg-primary-900 p-8">
           <h3 class="text-2xl font-black text-white">Xác nhận lịch trình</h3>
           <p class="text-primary-100 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Đang đợi hệ thống phê duyệt & phân công tài xế</p>
        </div>
        <div class="p-10 text-center">
          <div v-if="!assignedBooking?.driver" class="py-12">
            <div class="relative w-24 h-24 mx-auto mb-8">
               <div class="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
               <div class="absolute inset-4 rounded-full bg-primary-50 flex items-center justify-center">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
               </div>
            </div>
            <h4 class="text-xl font-black text-gray-900 mb-2">Yêu cầu đã được gửi!</h4>
            <p class="text-gray-500 font-medium max-w-sm mx-auto italic">Vui lòng không đóng trang này. Ngay sau khi Admin hoàn tất việc phân công tài xế, bạn sẽ được chuyển đến bước xác nhận thanh toán.</p>
          </div>

          <div v-else class="py-12 animate-in fade-in zoom-in duration-500">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100/50">
               <svg class="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <h4 class="text-2xl font-black text-gray-900 mb-4">Phân công thành công!</h4>
            
            <!-- Assigned Driver Card -->
            <div class="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-center mb-8 max-w-sm mx-auto shadow-sm">
                <img :src="assignedBooking.driver.avatar || '/placeholder-avatar.jpg'" class="w-14 h-14 rounded-full object-cover border-4 border-white shadow-sm mr-4">
                <div class="text-left">
                  <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-0.5">Tài xế của bạn</p>
                  <h5 class="font-black text-gray-900">{{ assignedBooking.driver.fullName }}</h5>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{{ assignedBooking.driver.phone }} | {{ assignedBooking.driver.driverInfo?.licenseClass || 'B2' }}</p>
                </div>
            </div>

            <button @click="nextStep" class="px-12 py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:scale-105 transition-all uppercase text-xs tracking-widest">
                Tiếp tục: Thanh toán đơn hàng
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Payment (Supported previously, now with driver fees) -->
      <div v-if="isPaymentStep" class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        <div class="card-header bg-primary-900 border-none p-8 rounded-t-[2rem]">
          <h3 class="text-2xl font-black text-white">Xác nhận & Thanh toán</h3>
          <p class="text-primary-100 text-sm mt-1">Kiểm tra lại lộ trình và chi tiết phí dịch vụ của bạn.</p>
        </div>
        <div class="card-body p-8">
          <form @submit.prevent="submitBooking" class="space-y-8">
            <!-- Pricing Summary -->
            <div class="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
              <h4 class="text-lg font-black text-gray-900 mb-2">Chi tiết giá</h4>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 font-medium">
                  {{ car ? `Phí thuê ${car.brand} ${car.model}` : `Phí dịch vụ tài xế ${targetDriver?.fullName}` }} 
                  ({{ bookingForm.mode === 'hourly' ? `${bookingForm.hours} giờ` : `${duration?.days} ngày` }})
                </span>
                <span class="font-bold text-gray-900">{{ formatPrice(pricing.totalRentalFee) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 font-medium">Bảo hiểm & Phí sàn</span>
                <span class="font-bold text-gray-900">{{ formatPrice(pricing.serviceFee) }}</span>
              </div>
              <div v-if="pricing.deposit > 0" class="flex justify-between items-center">
                <span class="text-gray-500 font-medium">Tiền đặt cọc xe (Hoàn trả sau khi trả xe)</span>
                <span class="font-bold text-gray-900">{{ formatPrice(pricing.deposit) }}</span>
              </div>
              <div v-if="pricing.outOfProvinceFee > 0" class="flex justify-between items-center text-orange-600 font-bold bg-orange-50 p-3 rounded-xl border border-orange-100">
                <span class="text-sm">Phụ phí giao xe ngoại tỉnh</span>
                <span>{{ formatPrice(pricing.outOfProvinceFee) }}</span>
              </div>
              <div class="border-t border-gray-200 pt-6 mt-4">
                 <div class="flex justify-between items-center italic mb-4">
                   <span class="text-gray-500 font-bold">Tổng cộng giá trị chuyến đi</span>
                   <span class="font-bold text-gray-900">{{ formatPrice(pricing.totalAmount) }}</span>
                 </div>
                 <div class="flex justify-between items-center bg-primary-50 p-6 rounded-[2rem] border border-primary-100 shadow-sm relative overflow-hidden group">
                   <div class="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
                   <div class="relative z-10">
                      <p class="text-xs font-black text-primary-900 uppercase tracking-widest">Tiền cọc cần thanh toán ngay</p>
                      <p class="text-[10px] text-primary-600 font-bold uppercase tracking-tight mt-1 opacity-70">(30% giá trị thuê xe để giữ chỗ)</p>
                   </div>
                   <span class="text-3xl font-black text-primary-600 tracking-tighter relative z-10">{{ formatPrice(pricing.deposit) }}</span>
                 </div>
               </div>

              <!-- Note -->
              <div class="pt-4 flex items-start space-x-3 text-[10px] text-gray-500 italic">
                <svg class="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                <p>
                  * Lưu ý: Phí dịch vụ được tính theo block 24 giờ. Đặc biệt, chúng tôi hỗ trợ **miễn phí trễ hạn tối đa 2 giờ**. Nếu thời gian sử dụng vượt quá 26 giờ (1 ngày + 2 giờ), hệ thống mới bắt đầu tính sang ngày thứ 2. Tiền đặt cọc xe (30%) sẽ được chủ xe hoàn trả 100% ngay sau khi bạn hoàn tất thủ tục trả xe và không phát sinh hư hại.
                </p>
              </div>
            </div>

            <!-- Payment Method -->
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Phương thức thanh toán</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  v-for="method in [
                    { id: 'vnpay', label: 'VNPAY', icon: '💳', sub: 'Thanh toán qua cổng VNPAY' },
                    { id: 'bank_transfer', label: 'Chuyển khoản', icon: '🏦', sub: 'Chuyển khoản ngân hàng 24/7' },
                    { id: 'cash', label: 'Tiền mặt', icon: '💵', sub: 'Thanh toán trực tiếp' },
                    { id: 'zalopay', label: 'ZaloPay', icon: '📱', sub: 'Thanh toán qua ví ZaloPay' }
                  ]" 
                  :key="method.id"
                  class="flex items-center p-5 border-2 rounded-[1.5rem] cursor-pointer transition-all"
                  :class="bookingForm.payment.method === method.id ? 'border-primary-600 bg-primary-50/30 shadow-md' : 'border-gray-100 hover:border-primary-100'"
                >
                  <input v-model="bookingForm.payment.method" type="radio" :value="method.id" class="sr-only">
                  <div class="w-10 h-10 bg-white rounded-xl shadow-sm mr-4 flex items-center justify-center">
                    <span class="text-xl">{{ method.icon }}</span>
                  </div>
                  <div>
                    <div class="font-black text-gray-900 text-sm uppercase">{{ method.label }}</div>
                    <div class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{{ method.sub }}</div>
                  </div>
                </label>
              </div>

            <div class="flex justify-between items-center pt-8">
              <button type="button" @click="prevStep" class="px-8 py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-all">Quay lại</button>
              <button 
                type="submit" 
                class="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner mr-2 border-white/30 border-l-white"></span>
                Xác nhận đặt xe ngay
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success -->
      <div v-if="isSuccessStep" class="card">
        <div class="card-body text-center py-12">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">
            Đặt xe thành công!
          </h3>
          <p class="text-gray-600 mb-6">
            Yêu cầu đặt xe của bạn đã được gửi đến chủ xe. Chúng tôi sẽ thông báo kết quả sớm nhất.
          </p>
          <div class="flex justify-center space-x-4">
            <router-link to="/my-bookings" class="btn btn-primary">
              Xem đơn đặt xe
            </router-link>
            <router-link to="/cars" class="btn btn-outline">
              Tiếp tục tìm xe
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const currentStep = ref(0)
const car = ref(null)
const targetDriver = ref(null)
const rentalMode = ref(route.query.type || 'self_drive')
const submitting = ref(false)
const locations = ref([])

const steps = computed(() => [
  { title: 'Lịch trình' },
  { title: 'Địa điểm' },
  { title: 'Chờ xác nhận', show: rentalMode.value === 'with_driver' },
  { title: 'Thanh toán' },
  { title: 'Kết quả' }
])

const getCurrentStepIndex = computed(() => {
  if (rentalMode.value !== 'with_driver') {
    if (currentStep.value >= 2) return currentStep.value + 1 // Skip 1 step
  }
  return currentStep.value
})

const isScheduleStep = computed(() => currentStep.value === 0)
const isLocationStep = computed(() => currentStep.value === 1)
const isWaitStep = computed(() => currentStep.value === 2 && rentalMode.value === 'with_driver')
const isPaymentStep = computed(() => (rentalMode.value === 'with_driver' ? currentStep.value === 3 : currentStep.value === 2))
const isSuccessStep = computed(() => (rentalMode.value === 'with_driver' ? currentStep.value === 4 : currentStep.value === 3))

const today = new Date().toISOString().split('T')[0]

const drivers = ref([])
const assignedBooking = ref(null)
let pollingTimer = null
const fixedTripPrice = ref(null)

const getImageUrl = (carId, imageIndex) => {
  return `/api/cars/${carId}/images/${imageIndex}`
}

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

const lookupTripPrice = async () => {
  if (bookingForm.value.mode !== 'trip' || !bookingForm.value.trip.startLocation || !bookingForm.value.trip.endLocation) {
    fixedTripPrice.value = null
    return
  }
  try {
    const res = await api.get('/trips/lookup', {
      params: { 
        from: bookingForm.value.trip.startLocation, 
        to: bookingForm.value.trip.endLocation,
        carId: route.params.carId
      }
    })
    fixedTripPrice.value = res.data.fixedPrice
  } catch (error) {
    fixedTripPrice.value = null
  }
}

watch([() => bookingForm.value.trip.startLocation, () => bookingForm.value.trip.endLocation], lookupTripPrice)

const bookingForm = ref({
  carId: route.params.carId,
  driverId: route.params.carId, // In driver mode, the ID is here
  startDate: route.query.startDate || today,
  endDate: route.query.endDate || '',
  pickupTime: route.query.pickupTime || '09:00',
  returnTime: route.query.returnTime || '09:00',
  pickupAddress: {
    city: '',
    district: '',
    street: ''
  },
  returnAddress: {
    city: '',
    district: '',
    street: ''
  },
  driverGuarantees: false,
  carPreservation: false,
  rentalType: rentalMode.value,
  mode: route.query.mode || 'daily',
  hours: parseInt(route.query.hours) || 4,
  trip: {
    startLocation: route.query.startLocation || '',
    endLocation: route.query.endLocation || '',
    distance: parseInt(route.query.distance) || 0
  },
  payment: {
    method: 'vnpay'
  },
  notes: ''
})

const pickupWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.pickupAddress.city)
  return prov ? prov.wards : []
})

const returnWards = computed(() => {
  const prov = locations.value.find(p => p.name === bookingForm.value.returnAddress.city)
  return prov ? prov.wards : []
})

// Watchers for cascading selects
watch(() => bookingForm.value.pickupAddress.city, () => {
  bookingForm.value.pickupAddress.district = ''
})

watch(() => bookingForm.value.returnAddress.city, () => {
  bookingForm.value.returnAddress.district = ''
})

const duration = computed(() => {
  if (bookingForm.value.mode === 'hourly') {
    return { days: 0, hours: bookingForm.value.hours }
  }
  if (!bookingForm.value.startDate || !bookingForm.value.endDate) return { days: 1, hours: 0 }
  
  const startFull = new Date(`${bookingForm.value.startDate}T${bookingForm.value.pickupTime || '09:00'}`)
  const endFull = new Date(`${bookingForm.value.endDate}T${bookingForm.value.returnTime || '09:00'}`)
  
  const diffMs = endFull - startFull
  if (diffMs <= 0) return { days: 1, hours: 0 }
  
  const totalHours = diffMs / (1000 * 60 * 60)
  
  // Calculate days with 2-hour grace period (for daily mode)
  const fullDays = Math.floor(totalHours / 24)
  const remainingHours = totalHours % 24
  const finalDays = remainingHours > 2 ? fullDays + 1 : Math.max(1, fullDays)
  
  return { days: finalDays, hours: Math.round(totalHours) }
})

const pricing = computed(() => {
  const isHourly = bookingForm.value.mode === 'hourly'
  const isTrip = bookingForm.value.mode === 'trip'
  const days = duration.value.days
  const hours = duration.value.hours
  const kms = bookingForm.value.trip.distance || 0
  
  // Calculate Out-of-Province Fee
  let outOfProvinceFee = 0
  if (car.value && bookingForm.value.pickupAddress.city && car.value.location?.city) {
    if (bookingForm.value.pickupAddress.city !== car.value.location.city) {
      outOfProvinceFee = car.value.outOfProvinceFee || 300000
    }
  }

  if (rentalMode.value === 'driver_only') {
    if (!targetDriver.value) return { totalRentalFee: 0, deposit: 0, serviceFee: 0, totalAmount: 0 }
    
    let base = 0
    let rateLabel = ''
    
    if (isTrip) {
      const perKm = targetDriver.value.driverInfo?.pricePerKm || 1000
      base = perKm * kms
      rateLabel = `${formatPrice(perKm)}/KM`
    } else if (isHourly) {
      const perHour = targetDriver.value.driverInfo?.driverRatePerHour || 100000
      base = perHour * hours
      rateLabel = `${formatPrice(perHour)}/Giờ`
    } else {
      const perDay = targetDriver.value.driverInfo?.driverRatePerDay || 800000
      base = perDay * days
      rateLabel = `${formatPrice(perDay)}/Ngày`
    }

    const serviceFee = isTrip ? 30000 : (isHourly ? 15000 : 25000 * days)
    const totalAmount = base + serviceFee
    const deposit = Math.round(base * 0.3)

    return {
      dailyRate: rateLabel,
      totalRentalFee: base,
      deposit: deposit,
      serviceFee,
      outOfProvinceFee: 0,
      totalAmount: totalAmount
    }
  }

  if (!car.value || !duration.value) return {
    totalRentalFee: 0,
    driverFeeTotal: 0,
    deposit: 0,
    serviceFee: 0,
    outOfProvinceFee: 0,
    totalAmount: 0
  }

  let totalRentalFee = 0
  if (isHourly) {
    const hourlyRate = rentalMode.value === 'with_driver'
      ? (car.value.pricePerHourWithDriver || (car.value.pricePerHour || Math.round(car.value.pricePerDay / 10)) + 100000)
      : (car.value.pricePerHour || Math.round(car.value.pricePerDay / 10))
    totalRentalFee = hourlyRate * hours
  } else if (isTrip) {
    if (fixedTripPrice.value) {
      totalRentalFee = fixedTripPrice.value
    } else {
      const perKm = car.value.owner?.driverInfo?.pricePerKm || 1000
      totalRentalFee = perKm * kms
    }
  } else {
    // Long-term pricing check
    let dailyRate = 0
    if (days >= 30 && car.value.pricePerMonth) {
      totalRentalFee = car.value.pricePerMonth
    } else if (days >= 15 && car.value.pricePerHalfMonth) {
      totalRentalFee = car.value.pricePerHalfMonth
    } else {
      dailyRate = rentalMode.value === 'with_driver'
        ? (car.value.pricePerDayWithDriver || car.value.pricePerDay + (car.value.driverFeePerDay || 500000))
        : car.value.pricePerDay
      totalRentalFee = dailyRate * days
    }
  }
  
  const deposit = Math.round(totalRentalFee * 0.3)
  const serviceFee = isHourly ? 20000 : (isTrip ? 30000 : 50000 * (days > 15 ? 5 : days)) // Cap service fee for long term
  const totalAmount = totalRentalFee + serviceFee + outOfProvinceFee

  return {
    dailyRate: isHourly ? 0 : (car.value.pricePerDay),
    totalRentalFee,
    driverFeeTotal: 0,
    deposit,
    serviceFee,
    outOfProvinceFee,
    totalAmount
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const getFuelLabel = (fuel) => {
  const labels = {
    gasoline: 'Xăng',
    diesel: 'Diesel',
    electric: 'Điện',
    hybrid: 'Hybrid'
  }
  return labels[fuel] || fuel
}

const fetchData = async () => {
  try {
    // Fetch locations data first
    const locRes = await fetch('/data.json')
    locations.value = await locRes.json()

    if (rentalMode.value === 'driver_only') {
      const response = await api.get(`/users/${route.params.carId}`)
      targetDriver.value = response.data.user
    } else {
      const response = await api.get(`/cars/${route.params.carId}`)
      car.value = response.data.car
      
      // Fetch available drivers for selection
      if (rentalMode.value === 'with_driver') {
        const dRes = await api.get('/users/top-drivers') // Fixed path
        drivers.value = dRes.data.drivers
      }
    }
  } catch (error) {
    toast.error('Không tìm thấy thông tin')
    router.push('/')
  }
}

const nextStep = async () => {
  // If moving from Location to Assignment phase
  if (currentStep.value === 1 && rentalMode.value === 'with_driver' && !assignedBooking.value) {
    const success = await submitInitialRequest()
    if (success) {
      currentStep.value++
      startPolling()
    }
    return
  }

  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const submitInitialRequest = async () => {
  try {
    submitting.value = true
    
    // Check car availability and blocked schedules before submitting
    if (rentalMode.value !== 'driver_only') {
      try {
        const availabilityCheck = await api.post('/bookings/check-car-availability', {
          carId: bookingForm.value.carId,
          startDate: bookingForm.value.startDate,
          endDate: bookingForm.value.mode === 'hourly' ? bookingForm.value.startDate : (bookingForm.value.endDate || bookingForm.value.startDate),
          pickupTime: bookingForm.value.pickupTime,
          returnTime: bookingForm.value.returnTime || bookingForm.value.pickupTime,
          mode: bookingForm.value.mode
        })
        
        if (!availabilityCheck.data.available) {
          toast.error(availabilityCheck.data.message || 'Xe không khả dụng trong thời gian này. Vui lòng chọn thời gian khác.')
          submitting.value = false
          return false
        }
      } catch (checkError) {
        // Check if error response contains availability info
        if (checkError.response?.data?.available === false) {
          toast.error(checkError.response.data.message || 'Xe không khả dụng trong thời gian này. Vui lòng chọn thời gian khác.')
          submitting.value = false
          return false
        }
        console.log('Car availability check failed:', checkError)
        // Continue with booking if API doesn't exist
      }
    }
    
    const pickupLocation = `${bookingForm.value.pickupAddress.street}, ${bookingForm.value.pickupAddress.district}, ${bookingForm.value.pickupAddress.city}`
    const returnLocation = bookingForm.value.returnAddress.city 
      ? `${bookingForm.value.returnAddress.street}, ${bookingForm.value.returnAddress.district}, ${bookingForm.value.returnAddress.city}`
      : pickupLocation

    const bookingData = {
      ...bookingForm.value,
      endDate: bookingForm.value.mode === 'hourly' ? bookingForm.value.startDate : (bookingForm.value.endDate || bookingForm.value.startDate),
      pickupLocation,
      returnLocation,
      car: bookingForm.value.carId,
      pricing: {
        ...pricing.value,
        totalAmount: pricing.value.totalAmount, // Finalizing cost
      },
      rentalType: rentalMode.value,
      trip: bookingForm.value.mode === 'trip' ? bookingForm.value.trip : undefined,
      driverGuarantees: bookingForm.value.driverGuarantees,
      carPreservation: bookingForm.value.carPreservation,
      status: 'pending'
    }

    const response = await api.post('/bookings', bookingData)
    assignedBooking.value = response.data.booking || response.data
    return true
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gửi yêu cầu thất bại')
    return false
  } finally {
    submitting.value = false
  }
}

const startPolling = () => {
  if (pollingTimer) clearInterval(pollingTimer)
  
  pollingTimer = setInterval(async () => {
    try {
      if (!assignedBooking.value?._id) return
      
      const response = await api.get(`/bookings/${assignedBooking.value._id}`)
      const booking = response.data.booking || response.data
      
      if (booking.driver) {
        assignedBooking.value = booking
        clearInterval(pollingTimer)
        toast.success('Hệ thống đã phân công tài xế!')
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 3000)
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitBooking = async () => {
  try {
    submitting.value = true
    
    // If we've already created the booking, just finalize it
    if (assignedBooking.value?._id) {
      const response = await api.put(`/bookings/${assignedBooking.value._id}/finalize`, {
        payment: bookingForm.value.payment
      })
      currentStep.value = steps.value.length - 1 // Go to Success (last step)
      toast.success('Xác nhận đặt đơn thành công!')
      return
    }

    const pickupLocation = `${bookingForm.value.pickupAddress.street}, ${bookingForm.value.pickupAddress.district}, ${bookingForm.value.pickupAddress.city}`
    const returnLocation = bookingForm.value.returnAddress.city 
      ? `${bookingForm.value.returnAddress.street}, ${bookingForm.value.returnAddress.district}, ${bookingForm.value.returnAddress.city}`
      : pickupLocation

    const bookingData = {
      ...bookingForm.value,
      endDate: bookingForm.value.mode === 'hourly' ? bookingForm.value.startDate : (bookingForm.value.endDate || bookingForm.value.startDate),
      pickupLocation,
      returnLocation,
      car: rentalMode.value !== 'driver_only' ? bookingForm.value.carId : undefined,
      driver: rentalMode.value === 'driver_only' ? bookingForm.value.driverId : undefined,
      rentalType: rentalMode.value,
      trip: bookingForm.value.mode === 'trip' ? bookingForm.value.trip : undefined,
      driverGuarantees: bookingForm.value.driverGuarantees,
      carPreservation: bookingForm.value.carPreservation
    }

    await api.post('/bookings', bookingData)
    
    currentStep.value = steps.value.length - 1
    toast.success('Đặt thành công!')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Đặt thất bại')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=${route.fullPath}`)
    return
  }
  
  fetchData()
})

// Watch for route params change
watch(() => route.params.carId, () => {
  if (route.params.carId) {
    fetchData()
  }
})
import { onUnmounted } from 'vue'

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer)
})
</script>
