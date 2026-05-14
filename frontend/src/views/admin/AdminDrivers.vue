<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản lý tài xế</h2>
          <p class="text-gray-600 mt-1">Quản lý tất cả tài xế trong hệ thống</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="openExportPreview"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Xuất Excel
          </button>
          <button type="button" @click="showAddDriverModal = true" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-lg border border-blue-100">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Thêm tài xế
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Tổng tài xế</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalDrivers || 0 }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Đang hoạt động</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.activeDrivers || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Đang bận</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.busyDrivers || 0 }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Offline</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.offlineDrivers || 0 }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Tên, email, SĐT..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" @change="fetchDrivers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="busy">Đang bận</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm</label>
          <select v-model="filters.experience" @change="fetchDrivers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="1">Dưới 1 năm</option>
            <option value="2">1-3 năm</option>
            <option value="3">3-5 năm</option>
            <option value="5">Trên 5 năm</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
          <select v-model="filters.rating" @change="fetchDrivers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4+ sao</option>
            <option value="3">3+ sao</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Drivers Table -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Danh sách tài xế</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Hiển thị {{ drivers.length }}/{{ pagination.total ?? pagination.totalDrivers ?? 0 }} kết quả</span>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xác minh</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="driver in drivers" :key="driver._id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img 
                      :src="getUserAvatarUrl(driver._id, driver.avatar) || '/placeholder-avatar.jpg'" 
                      @error="$event.target.src = '/placeholder-avatar.jpg'"
                      class="h-10 w-10 rounded-full object-cover"
                      :alt="driver.fullName"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ driver.fullName }}</div>
                    <div class="text-sm text-gray-500">{{ driver.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">{{ driver.phone || 'Chưa có SĐT' }}</div>
                <div class="text-[11px] text-gray-500 font-medium truncate max-w-[200px]" :title="driver.driverInfo?.homeAddress">{{ driver.driverInfo?.homeAddress || 'Chưa cập nhật địa chỉ' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="driver.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ driver.isVerified ? 'Đã xác minh' : 'Chưa xác minh' }}
                </span>
                <div class="text-[10px] text-gray-400 mt-1 uppercase font-bold">{{ driver.driverInfo?.licenseClass || 'Hạng B2' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusBadgeClass(driver.status)">
                  {{ getStatusLabel(driver.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="viewDriver(driver)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    v-if="!driver.isVerified"
                    @click="approveDriver(driver)" 
                    class="p-1 text-green-600 hover:bg-green-50 rounded transition-colors" 
                    title="Phê duyệt"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click="toggleDriverStatus(driver)" class="text-yellow-600 hover:text-yellow-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l3 3a1 1 0 000-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button @click="deleteDriver(driver._id)" class="text-red-600 hover:text-red-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Hiển thị <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> đến 
            <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, pagination.totalDrivers) }}</span> của 
            <span class="font-medium">{{ pagination.totalDrivers }}</span> kết quả
          </div>
          <div class="flex items-center space-x-2">
            <button @click="prevPage" :disabled="!pagination.hasPrev" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>
            <span class="px-3 py-1 text-sm font-medium text-gray-700">
              {{ currentPage }} / {{ pagination.totalPages }}
            </span>
            <button @click="nextPage" :disabled="!pagination.hasNext" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Driver Modal -->
    <div v-if="showViewDriverModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showViewDriverModal = false"></div>
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div v-if="selectedDriver" class="p-8">
            <div class="flex items-center space-x-6 mb-8">
              <div class="relative group cursor-pointer" @click="triggerFile('avatar')">
                <img :src="previews.avatar || getUserAvatarUrl(selectedDriver._id, selectedDriver.avatar) || '/placeholder-avatar.jpg'" @error="$event.target.src = '/placeholder-avatar.jpg'" class="w-24 h-24 rounded-full object-cover shadow-lg transition-opacity group-hover:opacity-80">
                <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-full transition-opacity">
                    <svg class="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span class="text-[10px] font-bold text-white uppercase text-center leading-tight">Đổi ảnh</span>
                </div>
              </div>
              <div>
                <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tight">{{ selectedDriver.fullName }}</h3>
                <div class="flex items-center mt-2">
                  <span class="px-3 py-1 text-xs font-bold rounded-full mr-2" :class="getStatusBadgeClass(selectedDriver.driverInfo?.driverStatus)">
                    {{ getStatusLabel(selectedDriver.driverInfo?.driverStatus) }}
                  </span>
                  <span class="text-sm text-gray-500 font-medium">{{ selectedDriver.email }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
              <div class="space-y-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Số điện thoại</label>
                  <p class="font-bold text-gray-900">{{ selectedDriver.phone || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">CCCD/CMND</label>
                  <p class="font-bold text-gray-900">{{ selectedDriver.idCard?.number || 'Chưa cập nhật' }}</p>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Hạng bằng lái</label>
                  <p class="font-bold text-gray-900">{{ selectedDriver.drivingLicense?.type || selectedDriver.driverInfo?.licenseClass || 'B2' }}</p>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Thành phố hoạt động</label>
                  <input v-model="editForm.driverInfo.operatingCity" type="text" class="w-full mt-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Địa chỉ liên hệ</label>
                  <p class="font-bold text-gray-900 leading-tight text-xs">{{ selectedDriver.driverInfo?.homeAddress || 'Chưa cập nhật' }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Kinh nghiệm (năm)</label>
                  <input v-model.number="editForm.driverInfo.experience" type="number" class="w-full mt-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Giá theo ngày (VNĐ)</label>
                  <input v-model.number="editForm.driverInfo.driverRatePerDay" type="number" step="10000" class="w-full mt-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Giá theo giờ (VNĐ)</label>
                  <input v-model.number="editForm.driverInfo.driverRatePerHour" type="number" step="5000" class="w-full mt-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Giá mỗi KM (Chuyến)</label>
                  <input v-model.number="editForm.driverInfo.pricePerKm" type="number" step="500" class="w-full mt-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày tham gia</label>
                  <p class="font-bold text-gray-900">{{ new Date(selectedDriver.createdAt).toLocaleDateString('vi-VN') }}</p>
                </div>
              </div>
            </div>

            <!-- E-Contract Details -->
            <div v-if="selectedDriver.contract?.isAgreed" class="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Hợp đồng điện tử</p>
                <p class="text-indigo-900 font-bold">Chữ ký: <span class="font-black">{{ selectedDriver.contract.signatureName }}</span></p>
                <p class="text-indigo-700 text-xs mt-1">Ký lúc: {{ new Date(selectedDriver.contract.agreedAt).toLocaleString('vi-VN') }}</p>
              </div>
              <button @click="downloadContractPDF(selectedDriver)" type="button" class="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors shadow-sm font-bold flex items-center text-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Tải PDF Hợp đồng
              </button>
            </div>

            <!-- Documents Images -->
            <div class="mt-8 space-y-6">
              <h4 class="text-sm font-black uppercase tracking-widest text-gray-400">Giấy tờ tùy thân</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-xs text-gray-500 font-bold uppercase tracking-tight">Mặt trước CCCD</p>
                  <img :src="getDocumentUrl(selectedDriver._id, 'idCardFrontImage')" class="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                </div>
                <div class="space-y-2">
                  <p class="text-xs text-gray-500 font-bold uppercase tracking-tight">Mặt sau CCCD</p>
                  <img :src="getDocumentUrl(selectedDriver._id, 'idCardBackImage')" class="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                </div>
              </div>
              <h4 class="text-sm font-black uppercase tracking-widest text-gray-400 pt-4">Bằng lái xe</h4>
              <div class="grid grid-cols-1 gap-4">
                <div class="space-y-2">
                  <img :src="getDocumentUrl(selectedDriver._id, 'licenseImage')" class="w-full h-64 object-cover rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                </div>
              </div>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-100 flex justify-end space-x-3">
              <button @click="showViewDriverModal = false" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">ĐÓNG</button>
              <button @click="updateDriverInfo" :disabled="saving" class="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all">
                {{ saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Driver Modal -->
    <div v-if="showAddDriverModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showAddDriverModal = false"></div>
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full p-8">
          <h3 class="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Thêm tài xế mới</h3>
          <form @submit.prevent="addDriver" class="space-y-6">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Họ và tên *</label>
                <div class="flex items-center gap-3">
                    <div class="relative group cursor-pointer w-12 h-12 shrink-0 bg-gray-100 rounded-full mt-1 border border-gray-200" @click="triggerFile('avatar')">
                        <img v-if="previews.avatar" :src="previews.avatar" class="w-full h-full rounded-full object-cover">
                        <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                           <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </div>
                    </div>
                   <input v-model="newDriver.fullName" type="text" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email *</label>
                <input v-model="newDriver.email" type="email" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Mật khẩu *</label>
                <input v-model="newDriver.password" type="password" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Số điện thoại *</label>
                <input v-model="newDriver.phone" type="tel" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày sinh</label>
                <input v-model="newDriver.dateOfBirth" type="date" class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Giới tính</label>
                <select v-model="newDriver.gender" class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Địa chỉ liên hệ</h4>
              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Số nhà, tên đường *</label>
                  <input v-model="newDriver.driverInfo.address.street" type="text" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500" placeholder="Số nhà, tên đường...">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tỉnh/Thành phố *</label>
                  <select v-model="newDriver.driverInfo.address.city" @change="newDriver.driverInfo.address.district = ''" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500 appearance-none">
                    <option value="">Chọn Tỉnh/Thành</option>
                    <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Quận/Huyện *</label>
                  <select v-model="newDriver.driverInfo.address.district" :disabled="!filteredWards.length" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500 appearance-none">
                    <option value="">Chọn Quận/Huyện</option>
                    <option v-for="ward in filteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Thông tin Nghề nghiệp</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Số CCCD/CMND *</label>
                  <input v-model="newDriver.driverInfo.idCard" type="text" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500" placeholder="12 chữ số">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Số bằng lái xe *</label>
                  <input v-model="newDriver.driverInfo.driverLicense" type="text" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Hạng bằng lái *</label>
                  <input v-model="newDriver.driverInfo.licenseClass" type="text" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500" placeholder="Ví dụ: B2">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày hết hạn bằng *</label>
                  <input v-model="newDriver.driverInfo.licenseExpiry" type="date" required class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Năm kinh nghiệm *</label>
                  <select v-model="newDriver.driverInfo.experience" class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                    <option value="1">Dưới 1 năm</option>
                    <option value="3">1-3 năm</option>
                    <option value="5">3-5 năm</option>
                    <option value="10">Trên 5 năm</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Loại xe sở trường *</label>
                  <select v-model="newDriver.driverInfo.vehicleType" class="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary-500">
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="suv">SUV</option>
                    <option value="crossover">Crossover</option>
                    <option value="mpv">MPV</option>
                    <option value="pickup">Bán tải (Pickup)</option>
                    <option value="all">Tất cả</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Hình ảnh Giấy tờ</h4>
              
              <div class="grid grid-cols-3 gap-4">
                <!-- ID Front -->
                <div class="space-y-2">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase">CCCD Mặt trước</label>
                  <div 
                    class="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all"
                    @click="triggerFile('idCardFront')"
                  >
                    <img v-if="previews.idCardFront" :src="previews.idCardFront" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center text-gray-400">
                      <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                  </div>
                </div>

                <!-- ID Back -->
                <div class="space-y-2">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase">CCCD Mặt sau</label>
                  <div 
                    class="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all"
                    @click="triggerFile('idCardBack')"
                  >
                    <img v-if="previews.idCardBack" :src="previews.idCardBack" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center text-gray-400">
                      <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                  </div>
                </div>

                <!-- License -->
                <div class="space-y-2">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase">Bằng lái xe</label>
                  <div 
                    class="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all"
                    @click="triggerFile('license')"
                  >
                    <img v-if="previews.license" :src="previews.license" class="absolute inset-0 w-full h-full object-cover">
                    <div v-else class="text-center text-gray-400">
                      <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                  </div>
                </div>
            </div>
            </div>

            <div class="mt-8 flex space-x-3">
              <button type="button" @click="showAddDriverModal = false" class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">HỦY</button>
              <button type="submit" class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-600/30 transition-all">HOÀN TẤT THÊM</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Xuất Excel: xem trước rồi mới tải -->
    <div v-if="showExportPreviewModal" class="fixed inset-0 z-[60] overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div class="fixed inset-0 bg-gray-900/60 transition-opacity" aria-hidden="true" @click="closeExportPreview"></div>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-preview-title"
          class="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200"
        >
          <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
            <div>
              <h3 id="export-preview-title" class="text-lg font-bold text-gray-900">Xem trước trước khi xuất</h3>
              <p class="text-sm text-gray-500 mt-1">
                <span v-if="exportPreviewLoading">Đang tải dữ liệu…</span>
                <span v-else>{{ exportPreviewList.length }} tài xế (theo bộ lọc hiện tại)</span>
              </p>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
              @click="closeExportPreview"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="overflow-auto flex-1 min-h-0 px-4 py-3">
            <div v-if="exportPreviewLoading" class="flex flex-col items-center justify-center py-20 text-gray-500">
              <svg class="animate-spin h-10 w-10 text-emerald-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium">Đang tải danh sách…</span>
            </div>
            <div v-else-if="!exportPreviewList.length" class="py-16 text-center text-gray-500 text-sm">
              Không có tài xế nào để xuất với bộ lọc hiện tại.
            </div>
            <div v-else class="rounded-xl border border-gray-200 overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Họ tên</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">SĐT</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide max-w-[200px]">Địa chỉ</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Xác minh</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">GPLX</th>
                    <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="d in exportPreviewList" :key="d._id" class="hover:bg-gray-50/80">
                    <td class="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{{ d.fullName }}</td>
                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ d.email }}</td>
                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ d.phone || '—' }}</td>
                    <td class="px-3 py-2 text-gray-600 max-w-[220px] truncate" :title="getDriverExportAddress(d)">{{ getDriverExportAddress(d) || '—' }}</td>
                    <td class="px-3 py-2 whitespace-nowrap">{{ d.isVerified ? 'Đã xác minh' : 'Chưa xác minh' }}</td>
                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ d.driverInfo?.licenseClass || '—' }}</td>
                    <td class="px-3 py-2 whitespace-nowrap">{{ getStatusLabel(d.status) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-3 shrink-0 bg-gray-50/80 rounded-b-2xl">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              @click="closeExportPreview"
            >
              Hủy
            </button>
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="exportPreviewLoading || !exportPreviewList.length"
              @click="confirmExportDownload"
            >
              Tải file CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Global Inputs -->
    <input type="file" ref="idCardFrontInput" class="sr-only" @change="e => handleFileUpload(e, 'idCardFront')" accept="image/*">
    <input type="file" ref="idCardBackInput" class="sr-only" @change="e => handleFileUpload(e, 'idCardBack')" accept="image/*">
    <input type="file" ref="licenseInput" class="sr-only" @change="e => handleFileUpload(e, 'license')" accept="image/*">
    <input type="file" ref="avatarInput" class="sr-only" @change="e => handleFileUpload(e, 'avatar')" accept="image/*">
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { generateContractPDF } from '@/utils/contractGenerator'
import { getUserAvatarUrl } from '@/utils/avatar'

const toast = useToast()
const authStore = useAuthStore()

const drivers = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showAddDriverModal = ref(false)
const showExportPreviewModal = ref(false)
const exportPreviewLoading = ref(false)
const exportPreviewList = ref([])
const showViewDriverModal = ref(false)
const selectedDriver = ref(null)
const editForm = ref({
  driverInfo: {
    driverRatePerDay: 500000,
    driverRatePerHour: 80000,
    pricePerKm: 15000,
    experience: 3,
    operatingCity: ''
  }
})
const saving = ref(false)

const filters = ref({
  status: '',
  experience: '',
  rating: ''
})
const locations = ref([])
const filteredWards = computed(() => {
  if (!newDriver.value.driverInfo.address.city || !locations.value.length) return []
  const province = locations.value.find(p => p.name === newDriver.value.driverInfo.address.city)
  return province ? province.wards : []
})
const getDocumentUrl = (driverId, field) => {
  if (!driverId || !field) return '/placeholder-doc.jpg';
  // Check if it's already a base64 string (newly added driver in memory)
  const driver = drivers.value.find(d => d._id === driverId);
  if (driver && driver.driverInfo?.[field] && typeof driver.driverInfo[field] === 'string' && driver.driverInfo[field].startsWith('data:')) {
    return driver.driverInfo[field];
  }
  return `/api/admin/drivers/${driverId}/document/${field}?token=${authStore.token}`;
}

const stats = ref({
  totalDrivers: 0,
  activeDrivers: 0,
  busyDrivers: 0,
  offlineDrivers: 0
})

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalDrivers: 0,
  hasNext: false,
  hasPrev: false
})

const newDriver = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  driverInfo: {
    idCard: '',
    driverLicense: '',
    licenseExpiry: '',
    experience: '3',
    vehicleType: 'sedan',
    licenseClass: 'B2',
    operatingCity: 'TP. Hồ Chí Minh',
    address: {
      street: '',
      city: '',
      district: ''
    },
    driverRatePerDay: 500000,
    idCardFrontImage: null,
    idCardBackImage: null,
    licenseImage: null
  }
})

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchDrivers()
  }, 500)
}

// Fetch drivers with pagination and filtering
const fetchDrivers = async () => {
  try {
    const response = await api.get('/admin/drivers', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        ...filters.value
      }
    })
    drivers.value = response.data.drivers || []
    pagination.value = response.data.pagination || pagination.value
    
    // Calculate stats
    updateStats()
  } catch (error) {
    toast.error('Không thể tải danh sách tài xế')
  }
}

const updateStats = () => {
  stats.value = {
    totalDrivers: drivers.value.length,
    activeDrivers: drivers.value.filter(d => d.status === 'active').length,
    busyDrivers: drivers.value.filter(d => d.status === 'busy').length,
    offlineDrivers: drivers.value.filter(d => d.status === 'offline').length
  }
}

const previews = ref({
  idCardFront: null,
  idCardBack: null,
  license: null,
  avatar: null
})

const idCardFrontInput = ref(null)
const idCardBackInput = ref(null)
const licenseInput = ref(null)
const avatarInput = ref(null)

const triggerFile = (type) => {
  if (type === 'idCardFront') idCardFrontInput.value.click()
  else if (type === 'idCardBack') idCardBackInput.value.click()
  else if (type === 'license') licenseInput.value.click()
  else if (type === 'avatar') avatarInput.value.click()
}

const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { 
    toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB')
    return 
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previews.value[type] = e.target.result
    // Save to matching flat driverInfo structure
    if (type === 'idCardFront') newDriver.value.driverInfo.idCardFrontImage = e.target.result
    else if (type === 'idCardBack') newDriver.value.driverInfo.idCardBackImage = e.target.result
    else if (type === 'license') newDriver.value.driverInfo.licenseImage = e.target.result
    else if (type === 'avatar') {
        newDriver.value.avatar = e.target.result
        if (editForm.value) editForm.value.avatar = e.target.result
    }
  }
  reader.readAsDataURL(file)
}

// Add new driver
const addDriver = async () => {
  try {
    // Prep address with codes
    const province = locations.value.find(p => p.name === newDriver.value.driverInfo.address.city)
    const ward = province ? province.wards.find(w => w.name === newDriver.value.driverInfo.address.district) : null
    
    const driverData = {
      ...newDriver.value,
      driverInfo: {
        ...newDriver.value.driverInfo,
        address: {
          ...newDriver.value.driverInfo.address,
          cityCode: province?.province_code || '',
          districtCode: ward?.ward_code || ''
        }
      }
    }

    await api.post('/admin/drivers', driverData)
    toast.success('Thêm tài xế thành công')
    showAddDriverModal.value = false
    
    // Reset to exact Register.vue defaults
    newDriver.value = {
      fullName: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'male', avatar: null,
      driverInfo: {
        idCard: '', driverLicense: '', licenseExpiry: '', experience: '3',
        vehicleType: 'sedan', licenseClass: 'B2', operatingCity: 'TP. Hồ Chí Minh',
        address: { street: '', city: '', district: '' },
        driverRatePerDay: 500000, pricePerKm: 15000, idCardFrontImage: null, idCardBackImage: null, licenseImage: null
      }
    }
    previews.value = { idCardFront: null, idCardBack: null, license: null, avatar: null }
    
    fetchDrivers()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Thêm tài xế thất bại')
  }
}

// Update driver status/verification
const approveDriver = async (driver) => {
  if (!confirm(`Phê duyệt tài xế ${driver.fullName}?`)) return
  try {
    await api.put(`/admin/drivers/${driver._id}`, { isVerified: true })
    toast.success('Phê duyệt tài xế thành công')
    fetchDrivers()
  } catch (error) {
    toast.error('Phê duyệt thất bại')
  }
}

const toggleDriverStatus = async (driver) => {
  try {
    const newStatus = driver.driverInfo?.driverStatus === 'available' ? 'busy' : 'available'
    await api.put(`/admin/drivers/${driver._id}`, { driverStatus: newStatus })
    toast.success(`Cập nhật trạng thái thành công`)
    fetchDrivers()
  } catch (error) {
    toast.error('Cập nhật trạng thái thất bại')
  }
}

// Delete driver
const deleteDriver = async (driverId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa tài xế này?')) return
  
  try {
    await api.delete(`/admin/drivers/${driverId}`)
    toast.success('Xóa tài xế thành công')
    fetchDrivers()
  } catch (error) {
    toast.error('Xóa tài xế thất bại')
  }
}

// View driver details
const viewDriver = (driver) => {
  previews.value.avatar = null
  selectedDriver.value = driver
  editForm.value = {
    avatar: null,
    driverInfo: {
      driverRatePerDay: driver.driverInfo?.driverRatePerDay || 500000,
      driverRatePerHour: driver.driverInfo?.driverRatePerHour || 80000,
      pricePerKm: driver.driverInfo?.pricePerKm || 15000,
      experience: driver.driverInfo?.experience || 3,
      operatingCity: driver.driverInfo?.operatingCity || ''
    }
  }
  showViewDriverModal.value = true
}

const updateDriverInfo = async () => {
  try {
    saving.value = true
    const payload = {
      driverInfo: editForm.value.driverInfo
    }
    if (editForm.value.avatar) {
      payload.avatar = editForm.value.avatar
    }
    
    await api.put(`/admin/drivers/${selectedDriver.value._id}`, payload)
    toast.success('Cập nhật thông tin tài xế thành công')
    showViewDriverModal.value = false
    fetchDrivers()
  } catch (error) {
    toast.error('Cập nhật thất bại')
  } finally {
    saving.value = false
  }
}

const downloadContractPDF = (driver) => {
  generateContractPDF(driver)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

// Edit driver
const editDriver = (driver) => {
  toast.info('Tính năng chỉnh sửa đang phát triển')
}

const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const formatDriverDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return ''
  }
}

const getDriverExportAddress = (driver) => {
  const di = driver?.driverInfo || {}
  if (di.homeAddress) return di.homeAddress
  return [di.address?.street, di.address?.district, di.address?.city].filter(Boolean).join(', ')
}

const EXPORT_CSV_HEADERS = [
  'Họ và tên',
  'Email',
  'Số điện thoại',
  'Địa chỉ',
  'Xác minh',
  'Hạng GPLX',
  'Số GPLX',
  'Kinh nghiệm (năm)',
  'Loại xe',
  'Trạng thái',
  'Đánh giá TB',
  'Ngày đăng ký'
]

const buildExportCsvRows = (list) =>
  list.map((driver) => {
    const di = driver.driverInfo || {}
    const addr = getDriverExportAddress(driver)
    return [
      driver.fullName,
      driver.email,
      driver.phone || '',
      addr,
      driver.isVerified ? 'Đã xác minh' : 'Chưa xác minh',
      di.licenseClass || '',
      di.driverLicense || '',
      di.experience != null && di.experience !== '' ? String(di.experience) : '',
      di.vehicleType || '',
      getStatusLabel(driver.status),
      driver.rating?.average != null ? Number(driver.rating.average).toFixed(1) : '',
      formatDriverDate(driver.createdAt)
    ]
  })

const downloadDriversCsv = (list) => {
  const rows = buildExportCsvRows(list)
  const csvBody = [EXPORT_CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const csvContent = `\uFEFF${csvBody}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const day = new Date().toISOString().split('T')[0]
  link.setAttribute('href', url)
  link.setAttribute('download', `danh_sach_tai_xe_${day}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const closeExportPreview = () => {
  showExportPreviewModal.value = false
  exportPreviewList.value = []
}

const openExportPreview = async () => {
  showExportPreviewModal.value = true
  exportPreviewLoading.value = true
  exportPreviewList.value = []
  try {
    const response = await api.get('/admin/drivers', {
      params: {
        page: 1,
        limit: 5000,
        search: searchQuery.value || undefined,
        status: filters.value.status || undefined,
        experience: filters.value.experience || undefined,
        rating: filters.value.rating || undefined
      }
    })
    exportPreviewList.value = response.data.drivers || []
  } catch (error) {
    console.error(error)
    toast.error('Không thể tải dữ liệu xem trước')
    closeExportPreview()
  } finally {
    exportPreviewLoading.value = false
  }
}

const confirmExportDownload = () => {
  const list = exportPreviewList.value
  if (!list.length) return
  try {
    downloadDriversCsv(list)
    toast.success(`Đã tải file (${list.length} tài xế)`)
    closeExportPreview()
  } catch (error) {
    console.error(error)
    toast.error('Không thể tạo file')
  }
}

// Pagination
const nextPage = () => {
  if (pagination.value.hasNext) {
    currentPage.value++
    fetchDrivers()
  }
}

const prevPage = () => {
  if (pagination.value.hasPrev) {
    currentPage.value--
    fetchDrivers()
  }
}

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang hoạt động',
    busy: 'Đang bận',
    offline: 'Offline'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  try {
    const res = await fetch('/data.json')
    locations.value = await res.json()
  } catch (err) {
    console.error('Error loading locations:', err)
  }
  fetchDrivers()
})
</script>
