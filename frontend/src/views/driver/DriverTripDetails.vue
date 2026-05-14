<template>
  <div v-if="loading" class="flex justify-center items-center py-20">
    <div class="spinner mr-4"></div>
    <span class="text-gray-500 font-medium">Đang tải thông tin...</span>
  </div>

  <div v-else-if="!trip" class="bg-white rounded-2xl shadow-sm p-12 text-center">
    <div class="text-3xl mb-4">😿</div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">Không tìm thấy chuyến đi</h3>
    <button @click="router.back()" class="btn btn-outline">Quay lại</button>
  </div>

  <div v-else class="space-y-6 animate-fade-in pb-12">
    <!-- Header with Breadcrumbs & Actions -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      
      <div class="relative z-10">
        <div class="flex items-center text-xs font-black text-indigo-100/60 uppercase tracking-widest mb-4 space-x-2">
          <router-link to="/driver/trips" class="hover:text-white transition-colors">Hành trình</router-link>
          <span>/</span>
          <span class="text-white">Chi tiết #{{ trip._id.slice(-6).toUpperCase() }}</span>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl font-black mb-2 tracking-tight">Chi tiết hành trình</h1>
            <div class="flex items-center gap-3">
              <span 
                class="px-3 py-1 text-[10px] font-black rounded-lg shadow-sm uppercase tracking-widest border border-white/20 bg-white/10"
              >
                {{ getStatusLabel(trip.status) }}
              </span>
              <span class="text-indigo-100 font-bold text-sm opacity-80">Mã đơn: {{ trip._id }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button 
              v-if="trip.status === 'confirmed'" 
              @click="notifyArrival" 
              class="px-8 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-black hover:bg-blue-100 shadow-sm transition-all hover:-translate-y-0.5 text-xs uppercase tracking-widest"
            >
              📍 Đã đến điểm hẹn
            </button>
            <button 
              v-if="trip.status === 'confirmed'" 
              @click="startTrip" 
              class="px-8 py-3 bg-white text-indigo-600 rounded-xl font-black hover:bg-indigo-50 shadow-xl transition-all hover:-translate-y-0.5 text-xs uppercase tracking-widest"
            >
              🚀 Bắt đầu chuyến
            </button>
            <button 
              v-if="trip.status === 'active'" 
              @click="showCompleteModal = true" 
              class="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 text-xs uppercase tracking-widest"
            >
              ✅ Hoàn thành
            </button>
            <button 
              v-if="['pending', 'confirmed'].includes(trip.status)" 
              @click="cancelTrip" 
              class="px-6 py-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 rounded-xl font-black hover:bg-red-500/40 transition-all text-xs uppercase tracking-widest"
            >
              ❌ Hủy chuyến
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Details -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Customer & Car Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-6">Thông tin khách hàng</h3>
            <div class="flex items-center gap-5">
              <img :src="getUserAvatarUrl(trip.renter?._id, trip.renter?.avatar) || '/placeholder-avatar.svg'" class="w-16 h-16 rounded-full border-4 border-gray-50 object-cover shadow-sm font-bold" @error="$event.target.src = '/placeholder-avatar.svg'">
              <div>
                <p class="text-xl font-bold text-gray-900 mb-1">{{ trip.renter?.fullName }}</p>
                <div class="flex items-center text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  📞 {{ trip.renter?.phone }}
                </div>
              </div>
            </div>
            <div class="mt-8 space-y-4 pt-6 border-t border-gray-50">
                <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                    <span class="text-sm font-bold text-gray-500">Giấy phép lái xe</span>
                    <span class="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">Đã xác thực ✓</span>
                </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-6">Thông tin xe</h3>
            <div v-if="trip.car" class="flex items-center gap-5">
              <img :src="trip.car ? getCarImageUrl(trip.car, 0) : '/logo.png'" class="w-20 h-20 rounded-xl object-cover shadow-sm font-bold" @error="handleImageError">
              <div class="flex-1">
                <p class="text-xl font-bold text-gray-900 mb-1">{{ trip.car.brand }} {{ trip.car.model }}</p>
                <div class="flex items-center justify-between">
                   <p class="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg inline-block">{{ trip.car.licensePlate }}</p>
                </div>
              </div>
              <button 
                v-if="['confirmed', 'active'].includes(trip.status)"
                @click="openInspection"
                class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Ảnh kiểm tra
              </button>
            </div>
            <div v-else class="flex items-center gap-5">
              <div class="w-20 h-20 rounded-xl bg-indigo-50 flex items-center justify-center text-3xl">👨‍✈️</div>
              <div>
                <p class="text-xl font-bold text-gray-900 mb-1">Dịch vụ Tài xế</p>
                <p class="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg inline-block">Chỉ thuê nhân sự</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inspections -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Hình ảnh kiểm tra xe</h3>
            <button 
              v-if="['confirmed', 'active'].includes(trip.status)" 
              @click="showInspectionModal = true"
              class="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Thêm ảnh kiểm tra
            </button>
          </div>
          
          <div v-if="trip.documents?.inspection?.pickup?.photos?.length || trip.documents?.inspection?.return?.photos?.length" class="space-y-6">
            <!-- Pickup Inspection -->
            <div v-if="trip.documents.inspection.pickup?.photos?.length" class="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
              <div class="flex justify-between items-center mb-6">
                <div>
                  <span class="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    ● BÀN GIAO XE (PICKUP)
                  </span>
                  <p class="text-[10px] font-black text-gray-400 mt-2 flex items-center gap-1">
                     KÝ XÁC NHẬN: {{ formatDateTime(trip.documents.inspection.pickup.signedAt) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số KM bàn giao</p>
                  <p class="text-sm font-black text-gray-900">{{ trip.documents.inspection.pickup.mileage?.toLocaleString() }} KM</p>
                </div>
              </div>
              
              <div class="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                 <div v-for="(img, idx) in trip.documents.inspection.pickup.photos" :key="idx" class="aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white hover:scale-110 transition-transform duration-500 cursor-zoom-in group/img">
                    <img :src="img" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                       <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                    </div>
                 </div>
              </div>

              <div v-if="trip.documents.inspection.pickup.notes" class="p-4 bg-white/50 rounded-xl border border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ghi chú tình trạng</p>
                <p class="text-sm font-bold text-gray-700 italic">"{{ trip.documents.inspection.pickup.notes }}"</p>
              </div>
            </div>

            <!-- Return Inspection -->
            <div v-if="trip.documents.inspection.return?.photos?.length" class="p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100 relative group overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
              <div class="flex justify-between items-center mb-6">
                <div>
                  <span class="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    ● NGHIỆM THU TRẢ XE (RETURN)
                  </span>
                  <p class="text-[10px] font-black text-gray-400 mt-2 flex items-center gap-1">
                     KÝ XÁC NHẬN: {{ formatDateTime(trip.documents.inspection.return.signedAt) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số KM hoàn trả</p>
                  <p class="text-sm font-black text-gray-900">{{ trip.documents.inspection.return.mileage?.toLocaleString() }} KM</p>
                </div>
              </div>
              
              <div class="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                 <div v-for="(img, idx) in trip.documents.inspection.return.photos" :key="idx" class="aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white hover:scale-110 transition-transform duration-500 cursor-zoom-in group/img">
                    <img :src="img" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                       <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                    </div>
                 </div>
              </div>

              <div v-if="trip.documents.inspection.return.notes" class="p-4 bg-white/50 rounded-xl border border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ghi chú tình trạng</p>
                <p class="text-sm font-bold text-gray-700 italic">"{{ trip.documents.inspection.return.notes }}"</p>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
             <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-4">📸</div>
             <p class="text-sm font-black text-gray-400 uppercase tracking-widest">Chưa có hình ảnh kiểm tra</p>
             <p class="text-[10px] text-gray-400 mt-1 font-bold">Vui lòng tải ảnh lên khi giao/nhận xe để làm bằng chứng</p>
          </div>
        </div>

        <!-- Timeline & Route -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-8">Lịch trình chi tiết</h3>
          <div class="relative space-y-12 before:content-[''] before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            <div class="relative pl-12">
              <div class="absolute left-0 top-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm z-10 border-4 border-white">🚩</div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Điểm nhận xe</p>
                <p class="text-lg font-bold text-gray-900 mb-1">{{ trip.pickupLocation }}</p>
                <p class="text-sm font-medium text-gray-500">{{ formatDateTime(trip.startDate) }}</p>
              </div>
            </div>

            <div class="relative pl-12">
              <div class="absolute left-0 top-0 w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold shadow-sm z-10 border-4 border-white">🏁</div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Điểm trả xe</p>
                <p class="text-lg font-bold text-gray-900 mb-1">{{ trip.returnLocation }}</p>
                <p class="text-sm font-medium text-gray-500">{{ formatDateTime(trip.endDate) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Pricing & Info -->
      <div class="space-y-6">
        <!-- Renter Payment Summary -->
        <div class="bg-gray-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
            <h3 class="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-8">TỔNG KHÁCH THANH TOÁN</h3>
            <div class="flex items-baseline gap-2 mb-8">
                <span class="text-4xl font-black">{{ formatPriceSimple(trip.pricing.totalAmount) }}</span>
                <span class="text-white/40 font-medium italic">VND</span>
            </div>
            <div class="space-y-4 pt-8 border-t border-white/10">
                <div class="flex justify-between text-sm">
                    <span class="text-white/60 font-medium">Giá thuê ({{ trip.duration?.days || 0 }} ngày)</span>
                    <span class="font-bold">{{ formatPrice(trip.pricing.totalRentalFee) }}</span>
                </div>
                <div v-if="trip.pricing.driverFee > 0 || trip.pricing.driverTripFee > 0" class="flex justify-between text-sm">
                    <span class="text-white/60 font-medium">Phí tài xế (Khách trả)</span>
                    <span class="font-bold">{{ formatPrice(trip.pricing.driverFee || trip.pricing.driverTripFee) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60 font-medium">Thuế/Phí dịch vụ</span>
                    <span class="font-bold">{{ formatPrice(trip.pricing.totalAmount - (trip.pricing.totalRentalFee || 0) - (trip.pricing.driverFee || 0) - (trip.pricing.driverTripFee || 0)) }}</span>
                </div>
            </div>
        </div>

        <!-- Driver Real Income (The "Data Update" User asked for) -->
        <div v-if="trip.status === 'completed' || trip.pricing.netAmount > 0" class="bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-500/20 p-8 text-white relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
            <div class="flex items-center justify-between mb-8">
               <h3 class="text-[10px] uppercase font-black text-emerald-100 tracking-[0.2em]">THU NHẬP THỰC NHẬN</h3>
               <span class="px-2 py-0.5 bg-white/20 rounded text-[8px] font-black uppercase">Đã chốt ✓</span>
            </div>
            <div class="flex items-baseline gap-2 mb-8">
                <span class="text-4xl font-black">{{ formatPriceSimple(trip.pricing.netAmount) }}</span>
                <span class="text-emerald-100 font-medium italic">VND</span>
            </div>
            <div class="space-y-4 pt-8 border-t border-white/20">
                <div v-if="trip.pricing.driverTripFee > 0 || trip.pricing.driverFee > 0" class="flex justify-between text-sm">
                    <span class="text-emerald-50/70 font-medium">Tiền công tài xế</span>
                    <span class="font-bold">{{ formatPrice(trip.pricing.driverTripFee || trip.pricing.driverFee) }}</span>
                </div>
                <div v-if="trip.car" class="flex justify-between text-sm">
                    <span class="text-emerald-50/70 font-medium">Lợi nhuận cho thuê xe (-{{ trip.pricing.commissionPercent }}% phí)</span>
                    <span class="font-bold">{{ formatPrice(trip.pricing.netAmount - (trip.pricing.driverTripFee || 0)) }}</span>
                </div>
            </div>
            <p class="mt-6 text-[10px] font-bold text-emerald-100/60 leading-relaxed uppercase tracking-tighter">
               * Số tiền này sẽ được cộng vào ví tài khoản của bạn sau khi đối soát thành công.
            </p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-6">Trạng thái thanh toán</h3>
          <div class="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
            <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
            <div>
              <p class="text-sm font-bold text-green-800">{{ trip.status === 'completed' ? 'Đã thanh toán xong' : 'Đã thanh toán cọc' }}</p>
              <p class="text-xs font-bold text-green-600/70">{{ formatPrice(trip.status === 'completed' ? trip.pricing.totalAmount : trip.pricing.deposit) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Complete Modal -->
    <div v-if="showCompleteModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-modal-in">
        <h3 class="text-2xl font-black text-gray-900 mb-2">Hoàn thành chuyến đi</h3>
        <p class="text-gray-500 mb-8 font-medium">Xác nhận các thông tin cuối cùng trước khi bàn giao xe.</p>
        
        <form @submit.prevent="completeTrip" class="space-y-6">
          <div v-if="trip.car">
            <label class="block text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Số Kilomet hiện tại</label>
            <input 
              v-model="completeForm.returnMileage" 
              type="number" 
              required 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              placeholder="Nhập số KM..."
            >
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Địa điểm trả xe</label>
            <input 
              v-model="completeForm.returnLocation" 
              type="text" 
              required 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              placeholder="Vị trí hiện tại..."
            >
          </div>

          <!-- Return Photos directly in completion -->
          <div v-if="trip.car">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Ảnh kiểm tra trả xe (Ít nhất 4 ảnh)</label>
            <div class="grid grid-cols-4 gap-3">
              <div 
                v-for="(img, idx) in completeForm.photos" 
                :key="idx"
                class="relative aspect-square rounded-xl overflow-hidden border border-gray-100"
              >
                <img :src="img" class="w-full h-full object-cover">
                <button type="button" @click="completeForm.photos.splice(idx, 1)" class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <label class="aspect-square rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <input type="file" @change="handleCompleteFileUpload" multiple accept="image/*" class="hidden">
              </label>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Ghi chú (Tùy chọn)</label>
            <textarea 
              v-model="completeForm.notes" 
              rows="2" 
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              placeholder="Mô tả tình trạng xe khi trả..."
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button 
              type="button" 
              @click="showCompleteModal = false" 
              class="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              :disabled="submitting" 
              class="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Đang gửi...' : 'Xác nhận' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Inspection Modal -->
  <div v-if="showInspectionModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl scale-in">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Kiểm tra xe ({{ trip.status === 'confirmed' ? 'Giao xe' : 'Nhận xe' }})</h2>
          <p class="text-xs font-bold text-gray-400 mt-0.5">Vui lòng chụp ít nhất 4 góc xe và các vết xước (nếu có)</p>
        </div>
        <button @click="showInspectionModal = false" class="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        <!-- Image Upload -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh chi tiết</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="(img, idx) in inspectionForm.photos" 
              :key="idx"
              class="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary-100 group shadow-md"
            >
              <img :src="img" class="w-full h-full object-cover">
              <button @click="inspectionForm.photos.splice(idx, 1)" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <label class="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-all group scale-active">
              <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all text-gray-300 group-hover:text-primary-500 mb-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <span class="text-[10px] font-black text-gray-400 tracking-wider">THÊM ẢNH</span>
              <input type="file" @change="handleFileUpload" multiple accept="image/*" class="hidden">
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Số Kilomet hiện tại</label>
            <input v-model="inspectionForm.mileage" type="number" placeholder="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all">
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Mức nhiên liệu (%)</label>
            <input v-model="inspectionForm.fuelLevel" type="number" min="0" max="100" placeholder="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all">
          </div>
        </div>

        <div>
           <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Ghi chú tình trạng</label>
           <textarea v-model="inspectionForm.notes" rows="3" placeholder="Ghi chú về các vết xước, hỏng hóc..." class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"></textarea>
        </div>
      </div>

      <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-4">
        <button @click="showInspectionModal = false" class="flex-1 py-4 text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all">Đóng</button>
        <button 
          @click="saveInspection" 
          :disabled="isSavingInspection || inspectionForm.photos.length < 1"
          class="flex-[2] py-4 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
        >
          <svg v-if="isSavingInspection" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {{ isSavingInspection ? 'Đang lưu...' : 'Lưu thông tin kiểm tra' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { getUserAvatarUrl } from '@/utils/avatar'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const trip = ref(null)
const loading = ref(true)
const submitting = ref(false)
const showCompleteModal = ref(false)
const showInspectionModal = ref(false)
const isSavingInspection = ref(false)

const completeForm = ref({
  returnMileage: '',
  returnLocation: '',
  notes: '',
  photos: []
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatPriceSimple = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price)
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

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    active: 'Đang diễn ra',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-600 text-white',
    active: 'bg-green-600 text-white',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-600 text-white'
  }
  return classes[status] || 'bg-blue-100 text-blue-800'
}

const fetchTrip = async () => {
  try {
    loading.value = true
    const response = await api.get(`/driver/trips/${route.params.id}`)
    trip.value = response.data
    completeForm.value.returnLocation = trip.value.returnLocation
  } catch (error) {
    toast.error('Không thể tải thông tin chuyến đi')
  } finally {
    loading.value = false
  }
}

const startTrip = async () => {
  if (!confirm('Bạn có chắc chắn muốn bắt đầu chuyến đi này?')) return
  try {
    await api.put(`/driver/trips/${trip.value._id}/start`)
    toast.success('Chuyến đi đã bắt đầu!')
    fetchTrip()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể bắt đầu chuyến đi')
  }
}

const notifyArrival = async () => {
  if (!confirm('Bạn xác nhận đã đem xe đến điểm hẹn cho khách hàng?')) return;
  try {
    await api.post(`/driver/trips/${trip.value._id}/notify-arrival`);
    toast.success('Đã gửi thông báo đến khách hàng thành công!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể gửi thông báo');
  }
}

const completeTrip = async () => {
  if (trip.value.car && completeForm.value.photos.length < 4) {
    toast.warning('Vui lòng tải lên ít nhất 4 ảnh hiện trạng khi trả xe')
    return
  }
  
  try {
    submitting.value = true
    
    // First save the return inspection auto-populated from here
    if (trip.value.car) {
      await api.post(`/driver/trips/${route.params.id}/inspection`, {
        type: 'return',
        images: completeForm.value.photos,
        notes: completeForm.value.notes,
        mileage: completeForm.value.returnMileage,
        fuelLevel: 100 // placeholder or can add field
      })
    }

    await api.put(`/driver/trips/${trip.value._id}/complete`, {
      returnMileage: completeForm.value.returnMileage,
      returnLocation: completeForm.value.returnLocation,
      notes: completeForm.value.notes
    })
    
    toast.success('Chuyến đi đã hoàn thành thành công!')
    showCompleteModal.value = false
    fetchTrip()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể hoàn thành chuyến đi')
  } finally {
    submitting.value = false
  }
}

const handleCompleteFileUpload = (event) => {
  const files = event.target.files
  if (!files) return
  for (let file of files) {
    const reader = new FileReader()
    reader.onload = (e) => { completeForm.value.photos.push(e.target.result) }
    reader.readAsDataURL(file)
  }
}

const inspectionForm = ref({
  type: 'pickup',
  photos: [],
  notes: '',
  mileage: 0,
  fuelLevel: 100
})

const openInspection = () => {
  inspectionForm.value = {
    type: trip.value.status === 'confirmed' ? 'pickup' : 'return',
    photos: [],
    notes: '',
    mileage: trip.value.status === 'confirmed' ? (trip.value.car?.mileage || 0) : 0,
    fuelLevel: 100
  }
  showInspectionModal.value = true
}

const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files) return
  
  for (let file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      inspectionForm.value.photos.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

const saveInspection = async () => {
  try {
    isSavingInspection.value = true
    await api.post(`/driver/trips/${route.params.id}/inspection`, {
      type: inspectionForm.value.type,
      images: inspectionForm.value.photos,
      notes: inspectionForm.value.notes,
      mileage: inspectionForm.value.mileage,
      fuelLevel: inspectionForm.value.fuelLevel
    })
    toast.success('Lưu thông tin kiểm tra thành công!')
    showInspectionModal.value = false
    await fetchTrip()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể lưu thông tin kiểm tra')
  } finally {
    isSavingInspection.value = false
  }
}

const cancelTrip = async () => {
  const reason = prompt('Vui lòng nhập lý do hủy chuyến:')
  if (!reason) return
  
  try {
    await api.put(`/driver/trips/${trip.value._id}/cancel`, { reason })
    toast.success('Chuyến đi đã bị hủy')
    fetchTrip()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể hủy chuyến đi')
  }
}

onMounted(() => {
  fetchTrip()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
.animate-modal-in {
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
