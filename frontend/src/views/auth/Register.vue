<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-8">
        <div class="w-48 h-48 bg-white rounded-full overflow-hidden shadow-2xl border-6 border-white transition-all duration-500 hover:scale-105">
          <img src="/logo.png" alt="CarRental Logo" class="w-full h-full object-cover" />
        </div>
      </div>
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Tạo tài khoản mới
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Bắt đầu hành trình của bạn với Web Thuê Xe
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
      <!-- Progress Bar -->
      <div class="mb-8 px-4 sm:px-0">
        <div class="flex items-center justify-between relative">
          <div class="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div 
            class="absolute left-0 top-1/2 h-1 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-300"
            :style="{ width: ((currentStep - 1) / 2) * 100 + '%' }"
          ></div>
          
          <div v-for="step in 3" :key="step" class="relative z-10 flex flex-col items-center">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300"
              :class="[
                currentStep >= step 
                  ? 'bg-primary-600 border-primary-100 text-white' 
                  : 'bg-white border-gray-200 text-gray-400'
              ]"
            >
              <span v-if="currentStep > step">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span v-else>{{ step }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Step 1: Account Type Selection -->
        <div v-if="currentStep === 1">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Bạn muốn đăng ký với vai trò gì?</h2>
            <p class="mt-2 text-gray-600">Chọn loại tài khoản phù hợp với nhu cầu của bạn</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="type in accountTypes" 
              :key="type.value"
              class="relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-md"
              :class="[
                form.role === type.value 
                  ? 'border-primary-600 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              ]"
              @click="selectAccountType(type.value)"
            >
              <div class="flex flex-col items-center text-center">
                <div 
                  class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
                  :class="form.role === type.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'"
                >
                  <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold" :class="form.role === type.value ? 'text-primary-900' : 'text-gray-900'">
                  {{ type.title }}
                </h3>
                <p class="text-sm text-gray-500 mt-2">{{ type.description }}</p>
              </div>
              <div 
                v-if="form.role === type.value"
                class="absolute top-2 right-2 text-primary-600"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center">
            <button 
              @click="nextStep" 
              :disabled="!form.role"
              class="btn btn-primary w-full md:w-64 py-3"
            >
              Tiếp tục
            </button>
          </div>
        </div>

        <!-- Step 2: Basic Information -->
        <div v-if="currentStep === 2">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
            <p class="mt-2 text-gray-600">Vui lòng điền thông tin cá nhân của bạn</p>
          </div>

          <form @submit.prevent="nextStep" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Họ và tên *</label>
                <input v-model="form.fullName" type="text" required class="input mt-1" :class="{ 'input-error': errors.fullName }" placeholder="Nhập đầy đủ họ tên">
                <p v-if="errors.fullName" class="mt-1 text-xs text-error-600">{{ errors.fullName }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email *</label>
                <input v-model="form.email" type="email" required class="input mt-1" :class="{ 'input-error': errors.email }" placeholder="email@example.com">
                <p v-if="errors.email" class="mt-1 text-xs text-error-600">{{ errors.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                <input v-model="form.phone" type="tel" required class="input mt-1" :class="{ 'input-error': errors.phone }" placeholder="Nhập số điện thoại">
                <p v-if="errors.phone" class="mt-1 text-xs text-error-600">{{ errors.phone }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Ngày sinh *</label>
                <input v-model="form.dateOfBirth" type="date" required class="input mt-1" :class="{ 'input-error': errors.dateOfBirth }" :max="maxDate">
                <p v-if="errors.dateOfBirth" class="mt-1 text-xs text-error-600">{{ errors.dateOfBirth }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Giới tính</label>
                <select v-model="form.gender" class="input mt-1">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Mật khẩu *</label>
                <input v-model="form.password" type="password" required class="input mt-1" :class="{ 'input-error': errors.password }" placeholder="Ít nhất 6 ký tự">
                <p v-if="errors.password" class="mt-1 text-xs text-error-600">{{ errors.password }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Xác nhận mật khẩu *</label>
                <input v-model="form.confirmPassword" type="password" required class="input mt-1" :class="{ 'input-error': errors.confirmPassword }" placeholder="Nhập lại mật khẩu">
                <p v-if="errors.confirmPassword" class="mt-1 text-xs text-error-600">{{ errors.confirmPassword }}</p>
              </div>
            </div>

            <div class="flex space-x-4 pt-4">
              <button type="button" @click="previousStep" class="btn btn-secondary flex-1 py-3">Quay lại</button>
              <button type="submit" class="btn btn-primary flex-1 py-3">Tiếp tục</button>
            </div>
          </form>
        </div>

        <!-- Step 3: Detailed Information & Documents -->
        <div v-if="currentStep === 3" class="animate-fadeIn">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Thông tin chi tiết</h2>
            <p class="mt-2 text-gray-600">
              Cung cấp các giấy tờ cần thiết để xác thực tài khoản
            </p>
          </div>

          <!-- Form Fields Container -->
          <div class="space-y-8">
            <!-- Role-Specific Fields (Drivers) -->
            <div v-if="form.role === 'driver'" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Số bằng lái xe *</label>
                <input v-model="form.driverLicense" type="text" class="input" placeholder="Nhập số bằng lái">
                <p v-if="errors.driverLicense" class="mt-1 text-xs text-error-600">{{ errors.driverLicense }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Ngày hết hạn bằng lái *</label>
                <input v-model="form.licenseExpiry" type="date" class="input">
                <p v-if="errors.licenseExpiry" class="mt-1 text-xs text-error-600">{{ errors.licenseExpiry }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Năm kinh nghiệm *</label>
                <select v-model="form.experience" class="input">
                  <option value="1">Dưới 1 năm</option>
                  <option value="3">1-3 năm</option>
                  <option value="5">3-5 năm</option>
                  <option value="10">Trên 5 năm</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Loại xe sở trường *</label>
                <select v-model="form.vehicleType" class="input">
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="suv">SUV</option>
                  <option value="crossover">Crossover</option>
                  <option value="mpv">MPV</option>
                  <option value="pickup">Bán tải (Pickup)</option>
                  <option value="all">Tất cả</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Hạng bằng lái (B2, C, D, ...) *</label>
                <input v-model="form.licenseClass" type="text" class="input" placeholder="Ví dụ: B2">
                <p v-if="errors.licenseClass" class="mt-1 text-xs text-error-600">{{ errors.licenseClass }}</p>
              </div>
            </div>

            <!-- Role-Specific Fields (Owners) -->
            <div v-if="form.role === 'owner'" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Tên ngân hàng *</label>
                <input v-model="form.bankName" type="text" class="input" placeholder="Ví dụ: Vietcombank">
                <p v-if="errors.bankName" class="mt-1 text-xs text-error-600">{{ errors.bankName }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Số tài khoản ngân hàng *</label>
                <input v-model="form.bankAccount" type="text" class="input" placeholder="Nhập số tài khoản">
                <p v-if="errors.bankAccount" class="mt-1 text-xs text-error-600">{{ errors.bankAccount }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Tên công ty (nếu có)</label>
                <input v-model="form.companyName" type="text" class="input" placeholder="Nhập tên doanh nghiệp của bạn">
              </div>
            </div>

            <!-- Common Identification & License Uploads -->
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Số CCCD/CMND {{ form.role === 'user' ? '(Tùy chọn)' : '*' }}
                </label>
                <input v-model="form.idCard" type="text" class="input" placeholder="Nhập số CCCD (12 chữ số)">
                <p v-if="errors.idCard" class="mt-1 text-xs text-error-600">{{ errors.idCard }}</p>
              </div>

              <!-- Image Upload Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- ID Front -->
                <div class="space-y-2 text-center">
                  <label class="block text-sm font-semibold text-gray-700">CCCD mặt trước {{ form.role === 'user' ? '(Tùy chọn)' : '*' }}</label>
                  <div 
                    class="h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/30"
                    :class="[previews.idCardFront ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 bg-white']"
                    @click="triggerFile('idCardFront')"
                  >
                    <img v-if="previews.idCardFront" :src="previews.idCardFront" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center p-4">
                      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <p class="text-xs text-gray-500 font-medium">Bấm để tải lên</p>
                    </div>
                    <div v-if="previews.idCardFront" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span class="text-white text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi</span>
                    </div>
                  </div>
                  <p v-if="errors.idCardFrontImage" class="text-xs text-error-600">{{ errors.idCardFrontImage }}</p>
                </div>

                <!-- ID Back -->
                <div class="space-y-2 text-center">
                  <label class="block text-sm font-semibold text-gray-700">CCCD mặt sau {{ form.role === 'user' ? '(Tùy chọn)' : '*' }}</label>
                  <div 
                    class="h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/30"
                    :class="[previews.idCardBack ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 bg-white']"
                    @click="triggerFile('idCardBack')"
                  >
                    <img v-if="previews.idCardBack" :src="previews.idCardBack" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center p-4">
                      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <p class="text-xs text-gray-500 font-medium">Bấm để tải lên</p>
                    </div>
                    <div v-if="previews.idCardBack" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span class="text-white text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi</span>
                    </div>
                  </div>
                  <p v-if="errors.idCardBackImage" class="text-xs text-error-600">{{ errors.idCardBackImage }}</p>
                </div>

                <!-- License -->
                <div class="space-y-2 text-center">
                  <label class="block text-sm font-semibold text-gray-700">Bằng lái xe {{ form.role === 'driver' ? '*' : '(Tùy chọn)' }}</label>
                  <div 
                    class="h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/30"
                    :class="[previews.license ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 bg-white']"
                    @click="triggerFile('license')"
                  >
                    <img v-if="previews.license" :src="previews.license" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center p-4">
                      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <p class="text-xs text-gray-500 font-medium">Bấm để tải lên</p>
                    </div>
                    <div v-if="previews.license" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span class="text-white text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">Thay đổi</span>
                    </div>
                  </div>
                  <p v-if="errors.licenseImage" class="text-xs text-error-600">{{ errors.licenseImage }}</p>
                </div>
              </div>
            </div>

            <!-- Optional License Text Fields for non-drivers -->
            <div v-if="(form.role === 'user' || form.role === 'owner') && previews.license" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-100 animate-fadeIn">
              <div>
                <label class="block text-sm font-semibold text-blue-800 mb-1">Số bằng lái xe (Tùy chọn)</label>
                <input v-model="form.driverLicense" type="text" class="input border-blue-200" placeholder="Nhập số bằng lái">
              </div>
              <div>
                <label class="block text-sm font-semibold text-blue-800 mb-1">Ngày hết hạn bằng lái (Tùy chọn)</label>
                <input v-model="form.licenseExpiry" type="date" class="input border-blue-200">
              </div>
            </div>
          </div>

          <!-- E-Contract Signature (For Drivers and Collaborators) -->
          <div v-if="form.role === 'driver' || form.role === 'collaborator'" class="mt-8 animate-fadeIn">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Hợp đồng điện tử</h3>
            <div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4 h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed shadow-inner">
               <h4 class="font-bold text-center mb-4 uppercase">HỢP ĐỒNG NGUYÊN TẮC HỢP TÁC</h4>
               <p class="mb-2"><strong>Bên A (Nền tảng):</strong> Web Thuê Xe</p>
               <p class="mb-2"><strong>Bên B (Đối tác):</strong> {{ form.fullName || '....................' }}</p>
               <p class="mb-2">Hai bên thỏa thuận ký kết hợp đồng hợp tác với các điều khoản như sau:</p>
               <ol class="list-decimal pl-5 mb-4 space-y-2">
                 <li><strong>Phạm vi hợp tác:</strong> Bên B đồng ý tham gia cung cấp dịch vụ (lái xe hoặc cho thuê xe) trên hệ thống của Bên A.</li>
                 <li><strong>Quyền và Nghĩa vụ của Bên A:</strong> Cung cấp nền tảng công nghệ, hỗ trợ kết nối khách hàng và đối soát thanh toán doanh thu định kỳ cho Bên B.</li>
                 <li><strong>Quyền và Nghĩa vụ của Bên B:</strong>
                    <ul class="list-disc pl-5 mt-1 space-y-1">
                       <li>Cung cấp thông tin cá nhân và giấy tờ pháp lý chính xác.</li>
                       <li>Đảm bảo chất lượng dịch vụ, thái độ phục vụ khách hàng lịch sự, chuyên nghiệp.</li>
                       <li>Chịu hoàn toàn trách nhiệm trước pháp luật về tính hợp pháp của phương tiện và hành vi cá nhân trong quá trình tham gia nền tảng.</li>
                    </ul>
                 </li>
                 <li><strong>Phân chia doanh thu:</strong> Theo cấu trúc hoa hồng hiện hành được niêm yết trên ứng dụng tại thời điểm phát sinh giao dịch.</li>
                 <li><strong>Chấm dứt hợp đồng:</strong> Một trong hai bên có quyền chấm dứt hợp đồng bất kỳ lúc nào nếu bên kia vi phạm nghiêm trọng các quy tắc an toàn hoặc quy định của pháp luật.</li>
                 <li><strong>Hiệu lực:</strong> Hợp đồng này có hiệu lực kể từ thời điểm Bên B ký chữ ký điện tử xác nhận dưới đây và được hệ thống ghi nhận.</li>
               </ol>
               <p class="italic text-xs text-gray-500">* Đây là biểu mẫu hợp đồng điện tử cơ bản. Bản lưu kỹ thuật số có gắn dấu thời gian sẽ được tự động đính kèm vào phần quản lý Hồ sơ của bạn.</p>
            </div>
            
            <div class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
              <label class="block text-xs font-black text-indigo-900 uppercase tracking-widest mb-2">Chữ ký điện tử (Gõ đầy đủ Họ và tên)</label>
              <input 
                v-model="form.contract.signatureName" 
                type="text" 
                class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase"
                placeholder="VD: NGUYEN VAN A"
              >
              <p v-if="errors.signatureName" class="mt-1 text-xs text-red-600 font-medium">{{ errors.signatureName }}</p>
              
              <div class="flex items-start mt-4">
                <input id="agreeContract" v-model="form.contract.isAgreed" type="checkbox" class="mt-1.5 h-5 w-5 text-indigo-600 border-indigo-300 rounded cursor-pointer">
                <label for="agreeContract" class="ml-3 block text-sm text-indigo-900 cursor-pointer font-medium">
                  Tôi đã đọc, hiểu và đồng ý ký xác nhận Hợp đồng hợp tác này.
                </label>
              </div>
              <p v-if="errors.contractAgreed" class="mt-1 text-xs text-red-600 font-medium">{{ errors.contractAgreed }}</p>
            </div>
          </div>

          <!-- Terms -->
          <div class="mt-8 border-t border-gray-100 pt-6">
            <div class="flex items-start">
              <input id="agreeTerms" v-model="form.agreeTerms" type="checkbox" class="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded cursor-pointer">
              <label for="agreeTerms" class="ml-2 block text-sm text-gray-600 cursor-pointer">
                Tôi đồng ý với <a href="#" class="text-primary-600 font-semibold hover:underline">Điều khoản</a> và <a href="#" class="text-primary-600 font-semibold hover:underline">Chính sách bảo mật</a>.
              </label>
            </div>
            <p v-if="errors.agreeTerms" class="mt-1 text-xs text-error-600 font-medium">{{ errors.agreeTerms }}</p>
          </div>

          <!-- Final Buttons -->
          <div class="mt-8 flex space-x-4">
            <button type="button" @click="previousStep" class="btn btn-secondary flex-1 py-3">Quay lại</button>
            <button type="button" @click="handleRegister" :disabled="loading" class="btn btn-primary flex-1 py-3 shadow-lg shadow-primary-200">
              <span v-if="loading" class="spinner mr-2"></span>
              {{ loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký' }}
            </button>
          </div>
        </div>

        <!-- Hidden Global Inputs -->
        <input type="file" ref="idCardFrontInput" class="sr-only" @change="e => handleFileUpload(e, 'idCardFront')" accept="image/*">
        <input type="file" ref="idCardBackInput" class="sr-only" @change="e => handleFileUpload(e, 'idCardBack')" accept="image/*">
        <input type="file" ref="licenseInput" class="sr-only" @change="e => handleFileUpload(e, 'license')" accept="image/*">
      </div>

      <!-- Social Login & Link -->
      <div v-if="currentStep === 1" class="mt-6 px-4 sm:px-10">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500 whitespace-nowrap">Hoặc đăng ký nhanh</span>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button type="button" class="social-btn" @click="handleSocialLogin('google')"><span class="ml-2">Google</span></button>
          <button type="button" class="social-btn" @click="handleSocialLogin('facebook')"><span class="ml-2">Facebook</span></button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Đã có tài khoản? <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 underline">Đăng nhập ngay</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const errors = ref({})
const currentStep = ref(1)

const idCardFrontInput = ref(null)
const idCardBackInput = ref(null)
const licenseInput = ref(null)

const previews = ref({
  idCardFront: null,
  idCardBack: null,
  license: null
})

const accountTypes = [
  { value: 'user', title: 'Người dùng', description: 'Tìm và thuê xe', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { value: 'driver', title: 'Tài xế', description: 'Cung cấp dịch vụ lái xe', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'collaborator', title: 'CTV', description: 'CTV đăng xe cho thuê, nhận hoa hồng', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' }
]

const form = ref({
  role: '',
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
  gender: 'male',
  driverLicense: '',
  licenseExpiry: '',
  experience: '3',
  vehicleType: 'sedan',
  licenseClass: 'B2',
  companyName: '',
  bankAccount: '',
  bankName: '',
  idCard: '',
  idCardFrontImage: null,
  licenseImage: null,
  contract: {
    signatureName: '',
    isAgreed: false
  }
})

const maxDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})

const selectAccountType = (type) => { form.value.role = type }
const previousStep = () => { currentStep.value-- }

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!form.value.role) {
      toast.error('Vui lòng chọn vai trò tài khoản')
      return
    }
  }
  if (currentStep.value === 2) {
    if (!validateStep2()) {
      toast.error('Vui lòng hoàn thành chính xác các thông tin cơ bản')
      return
    }
  }
  currentStep.value++
}

const validateStep2 = () => {
  errors.value = {}
  if (!form.value.fullName) errors.value.fullName = 'Vui lòng nhập họ tên'
  
  if (!form.value.email) {
    errors.value.email = 'Vui lòng nhập email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email không hợp lệ'
  }

  if (!form.value.phone) {
    errors.value.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^[0-9]{10,11}$/.test(form.value.phone)) {
    errors.value.phone = 'Số điện thoại phải từ 10-11 chữ số'
  }

  if (!form.value.dateOfBirth) errors.value.dateOfBirth = 'Vui lòng nhập ngày sinh'
  if (!form.value.password) errors.value.password = 'Vui lòng nhập mật khẩu'
  if (form.value.password !== form.value.confirmPassword) errors.value.confirmPassword = 'Mật khẩu không khớp'
  return Object.keys(errors.value).length === 0
}

const validateDetailedInfo = () => {
  errors.value = {}
  if (form.value.role === 'driver') {
    if (!form.value.driverLicense) errors.value.driverLicense = 'Số bằng lái xe là bắt buộc'
    if (!form.value.licenseExpiry) errors.value.licenseExpiry = 'Ngày hết hạn bằng lái là bắt buộc'
    if (!form.value.experience) errors.value.experience = 'Vui lòng chọn số năm kinh nghiệm'
    if (!form.value.vehicleType) errors.value.vehicleType = 'Vui lòng chọn loại xe'
    if (!form.value.licenseClass) errors.value.licenseClass = 'Vui lòng nhập hạng bằng lái'
    if (!form.value.idCard) errors.value.idCard = 'Số CCCD/CMND là bắt buộc'
    
    if (!form.value.idCardFrontImage) errors.value.idCardFrontImage = 'Vui lòng tải lên ảnh CCCD mặt trước'
    if (!form.value.idCardBackImage) errors.value.idCardBackImage = 'Vui lòng tải lên ảnh CCCD mặt sau'
    if (!form.value.licenseImage) errors.value.licenseImage = 'Vui lòng tải lên ảnh bằng lái xe'
  } else if (form.value.role === 'owner') {
    if (!form.value.bankAccount) errors.value.bankAccount = 'Thiếu số tài khoản'
    if (!form.value.bankName) errors.value.bankName = 'Thiếu tên ngân hàng'
    if (!form.value.idCard) errors.value.idCard = 'Thiếu số CCCD'
    if (!form.value.idCardFrontImage) errors.value.idCardFrontImage = 'Thiếu ảnh mặt trước'
    if (!form.value.idCardBackImage) errors.value.idCardBackImage = 'Thiếu ảnh mặt sau'
  }
  if (!form.value.agreeTerms) errors.value.agreeTerms = 'Bạn phải đồng ý với điều khoản'
  
  if (form.value.role === 'driver' || form.value.role === 'collaborator') {
    if (!form.value.contract.signatureName) errors.value.signatureName = 'Vui lòng gõ họ tên làm chữ ký điện tử'
    if (!form.value.contract.isAgreed) errors.value.contractAgreed = 'Bạn chưa đồng ý ký Hợp đồng'
  }
  
  return Object.keys(errors.value).length === 0
}

const triggerFile = (type) => {
  if (type === 'idCardFront') idCardFrontInput.value?.click()
  else if (type === 'idCardBack') idCardBackInput.value?.click()
  else if (type === 'license') licenseInput.value?.click()
}

const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { toast.error('Tối đa 10MB'); return }

  if (type === 'idCardFront') form.value.idCardFrontImage = file
  else if (type === 'idCardBack') form.value.idCardBackImage = file
  else if (type === 'license') form.value.licenseImage = file

  const reader = new FileReader()
  reader.onload = (e) => previews.value[type] = e.target.result
  reader.readAsDataURL(file)
  
  // Clear specific error
  if (type === 'idCardFront') delete errors.value.idCardFrontImage
  if (type === 'idCardBack') delete errors.value.idCardBackImage
  if (type === 'license') delete errors.value.licenseImage
}

const handleRegister = async () => {
  if (!validateDetailedInfo()) {
    // Show the first specific error message instead of 
    const firstError = Object.values(errors.value)[0]
    toast.error(firstError || 'Vui lòng hoàn thiện các thông tin còn thiếu')
    console.log('Step 3 Validation Failed:', errors.value)
    return
  }

  try {
    loading.value = true
    const regData = {
      fullName: form.value.fullName,
      email: form.value.email,
      phone: form.value.phone,
      dateOfBirth: form.value.dateOfBirth,
      password: form.value.password,
      role: form.value.role
    }

    if (form.value.role === 'driver' || form.value.driverLicense) {
      regData.driverInfo = {
        driverLicense: form.value.driverLicense,
        licenseExpiry: form.value.licenseExpiry,
        experience: form.value.experience,
        vehicleType: form.value.vehicleType,
        licenseClass: form.value.licenseClass,
        idCard: form.value.idCard
      }
      regData.idCard = {
        number: form.value.idCard
      }
    }

    if (form.value.role === 'owner') {
      regData.ownerInfo = {
        companyName: form.value.companyName,
        bankAccount: form.value.bankAccount,
        bankName: form.value.bankName,
        idCard: form.value.idCard
      }
      regData.idCard = {
        number: form.value.idCard
      }
    }

    const formData = new FormData()
    
    // Core fields
    formData.append('fullName', form.value.fullName)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    formData.append('password', form.value.password)
    formData.append('dateOfBirth', form.value.dateOfBirth)
    formData.append('role', form.value.role)
    formData.append('gender', form.value.gender)

    if (form.value.role === 'driver' || form.value.role === 'collaborator') {
      formData.append('contract', JSON.stringify(form.value.contract))
    }

    // Role specific info (must be stringified for Multer to read as text fields)
    if (form.value.role === 'driver' || form.value.driverLicense) {
      const driverData = {
        driverLicense: form.value.driverLicense,
        licenseExpiry: form.value.licenseExpiry,
        experience: form.value.experience,
        vehicleType: form.value.vehicleType,
        licenseClass: form.value.licenseClass,
        idCard: form.value.idCard
      }
      formData.append('driverInfo', JSON.stringify(driverData))
    }
    if (form.value.role === 'owner') {
      const ownerData = {
        companyName: form.value.companyName,
        bankAccount: form.value.bankAccount,
        bankName: form.value.bankName,
        idCard: form.value.idCard
      }
      formData.append('ownerInfo', JSON.stringify(ownerData))
    }

    if (form.value.idCard) {
      formData.append('idCard', JSON.stringify({ number: form.value.idCard }))
    }

    // Binary Files (must NOT be stringified)
    if (form.value.idCardFrontImage) {
      formData.append('idCardFrontImage', form.value.idCardFrontImage)
    }
    if (form.value.idCardBackImage) {
      formData.append('idCardBackImage', form.value.idCardBackImage)
    }
    if (form.value.licenseImage) {
      formData.append('licenseImage', form.value.licenseImage)
    }

    await authStore.register(formData)
    toast.success('Đăng ký thành công!')
    router.push('/')
  } catch (err) {
    // Better error message extraction
    const serverMessage = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message
    toast.error(serverMessage || 'Lỗi đăng ký')
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider) => {
  window.location.href = `/api/auth/${provider}`
}

onMounted(() => { if (authStore.isAuthenticated) router.push('/') })
</script>

<style scoped>
.input {
  @apply block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors;
}
.input-error {
  @apply border-error-500 focus:ring-error-500 focus:border-error-500 bg-error-50;
}
.btn {
  @apply flex justify-center items-center font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}
.btn-secondary {
  @apply bg-white border border-gray-300 text-gray-700 hover:bg-gray-50;
}
.social-btn {
  @apply w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50;
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
