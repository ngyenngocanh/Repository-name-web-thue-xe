<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold mb-2">Quản lý xe</h1>
          <p class="text-green-100 text-lg">Quản lý tất cả xe trong hệ thống</p>
        </div>
        <button @click="showAddCarModal = true" class="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all font-medium shadow-lg flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Thêm xe mới
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-lg">
            <TruckIcon class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalCars.toLocaleString() }}</p>
          <p class="text-sm text-gray-500 mt-1">Tổng số xe</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-100 rounded-lg">
            <CheckCircleIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.approvedCars.toLocaleString() }}</p>
          <p class="text-sm text-gray-500 mt-1">Đã duyệt</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.pendingCars.toLocaleString() }}</p>
          <p class="text-sm text-gray-500 mt-1">Chờ duyệt</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-red-100 rounded-lg">
            <XCircleIcon class="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.rejectedCars.toLocaleString() }}</p>
          <p class="text-sm text-gray-500 mt-1">Bị từ chối</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Tên xe, biển số..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hãng xe</label>
          <select v-model="filters.brand" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="available">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Bị từ chối</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="">Tất cả</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Loại xe</label>
          <select v-model="filters.type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Giá/ngày</label>
          <div class="flex space-x-2">
            <input
              v-model="filters.minPrice"
              type="number"
              placeholder="Tối thiểu"
              class="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <input
              v-model="filters.maxPrice"
              type="number"
              placeholder="Tối đa"
              class="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-between items-center">
        <div class="flex space-x-3">
          <button @click="resetFilters" class="text-gray-600 hover:text-gray-800 text-sm font-medium">
            <svg class="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            Đặt lại bộ lọc
          </button>
          <button 
            @click="resetAllCars" 
            class="text-orange-600 hover:text-orange-800 text-sm font-medium"
            :disabled="resetting"
          >
            <svg v-if="!resetting" class="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-4 h-4 mr-1 inline animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            {{ resetting ? 'Đang reset...' : 'Reset toàn bộ xe' }}
          </button>
        </div>
        <div class="text-sm text-gray-500">
          Hiển thị {{ cars.length }}/{{ pagination.totalCars }} xe
        </div>
      </div>
    </div>

    <!-- Cars Table -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ xe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá/ngày</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="car in cars" :key="car._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-16 w-16">
                    <img 
                      :src="car.images?.[0]?.url || '/logo.png'" 
                      class="h-16 w-16 rounded-lg object-cover"
                      :alt="`${car.brand} ${car.model}`"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ car.brand }} {{ car.model }}</div>
                    <div class="text-sm text-gray-500">{{ car.year }} • {{ car.licensePlate }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ car.type || 'Sedan' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="getUserAvatarUrl(car.owner?._id, car.owner?.avatar) || '/placeholder-avatar.svg'" 
                      class="h-10 w-10 rounded-full object-cover"
                      :alt="car.owner?.fullName"
                      @error="$event.target.src = '/placeholder-avatar.svg'"
                    >
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ car.owner?.fullName }}</div>
                    <div class="text-sm text-gray-500">{{ car.owner?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <div v-if="car.isSelfDrive" class="flex items-center gap-2">
                    <span class="text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded italic">TL</span>
                    <span class="text-xs font-bold text-gray-900">{{ formatPrice(car.pricePerDay || 0) }}/ngày</span>
                    <span class="text-[10px] text-gray-400">({{ formatPrice(car.pricePerHour || 0) }}/giờ)</span>
                  </div>
                  <div v-if="car.isWithDriver" class="flex items-center gap-2">
                    <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded italic">KT</span>
                    <span class="text-xs font-bold text-gray-900">{{ formatPrice(car.pricePerDayWithDriver || 0) }}/ngày</span>
                    <span class="text-[10px] text-gray-400">({{ formatPrice(car.pricePerHourWithDriver || 0) }}/giờ)</span>
                  </div>
                  <div class="flex gap-2 mt-1">
                    <span v-if="car.priceWeekend" class="text-[9px] font-bold text-red-500 border border-red-200 px-1 rounded">T7-CN: {{ formatPrice(car.priceWeekend) }}</span>
                    <span v-if="car.pricePerMonth" class="text-[9px] font-bold text-gray-500 border border-gray-200 px-1 rounded">Tháng: {{ formatPrice(car.pricePerMonth) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <!-- Trạng thái phê duyệt -->
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit"
                    :class="getStatusBadgeClass(car.approvalStatus || car.status)"
                  >
                    {{ getStatusLabel(car.approvalStatus || car.status) }}
                  </span>
                  <!-- Trạng thái hoạt động (chỉ hiện khi đã duyệt) -->
                  <span 
                    v-if="(car.approvalStatus === 'approved' || car.status === 'available') && car.operationalStatus"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit"
                    :class="getOperationalStatusBadgeClass(car.operationalStatus)"
                  >
                    {{ getOperationalStatusLabel(car.operationalStatus) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(car.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewCar(car)" class="text-green-600 hover:text-green-900" title="Xem chi tiết">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button @click="editCar(car)" class="text-blue-600 hover:text-blue-900" title="Sửa">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button 
                    v-if="car.status === 'pending'"
                    @click="approveCar(car)" 
                    class="text-green-600 hover:text-green-900" 
                    title="Duyệt"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  <button 
                    v-if="car.status === 'pending'"
                    @click="rejectCar(car)" 
                    class="text-red-600 hover:text-red-900" 
                    title="Từ chối"
                  >
                    <XCircleIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteCar(car)" class="text-red-600 hover:text-red-900" title="Xóa">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="prevPage" 
            :disabled="!pagination.hasPrev"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button 
            @click="nextPage" 
            :disabled="!pagination.hasNext"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Hiển thị <span class="font-medium">{{ (pagination.currentPage - 1) * pagination.perPage + 1 }}</span> đến 
              <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.perPage, pagination.totalCars) }}</span> của 
              <span class="font-medium">{{ pagination.totalCars }}</span> kết quả
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="prevPage" 
                :disabled="!pagination.hasPrev"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                :class="page === pagination.currentPage 
                  ? 'z-10 bg-green-50 border-green-500 text-green-600' 
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
              <button 
                @click="nextPage" 
                :disabled="!pagination.hasNext"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Car Modal -->
    <div v-if="showAddCarModal || showEditCarModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-[2rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-100">
          <form @submit.prevent="showEditCarModal ? updateCar() : addCar()">
            <!-- Modal Header -->
            <div class="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 class="text-2xl font-black text-gray-900">
                  {{ showEditCarModal ? 'Cập nhật thông tin xe' : 'Thêm xe mới' }}
                </h3>
                <p class="text-sm text-gray-500 font-medium">Nhập đầy đủ thông tin để hoàn tất đăng ký xe</p>
              </div>
              <button @click="closeModal" type="button" class="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <XMarkIcon class="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div class="bg-white px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div class="space-y-12">
                <!-- Phân đoạn 1: Thông tin cơ bản -->
                <section>
                  <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Thông tin cơ bản
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hãng xe *</label>
                      <select v-model="carForm.brand" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                        <option value="">Chọn hãng</option>
                        <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dòng xe *</label>
                      <input v-model="carForm.model" type="text" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Biển số *</label>
                      <input v-model="carForm.licensePlate" type="text" required placeholder="VD: 30A-12345" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all uppercase">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Năm SX *</label>
                      <input v-model="carForm.year" type="number" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Màu sắc</label>
                      <input v-model="carForm.color" type="text" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số chỗ</label>
                      <select v-model="carForm.seats" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                        <option :value="2">2 chỗ</option>
                        <option :value="4">4 chỗ</option>
                        <option :value="5">5 chỗ</option>
                        <option :value="7">7 chỗ</option>
                        <option :value="9">9 chỗ</option>
                      </select>
                    </div>
                  </div>
                </section>

                <!-- Phân đoạn 2: Đặc điểm kỹ thuật -->
                <section>
                  <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Đặc điểm kỹ thuật
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Loại xe</label>
                      <select v-model="carForm.type" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="pickup">Bán tải</option>
                        <option value="luxury">Hạng sang</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hộp số</label>
                      <select v-model="carForm.transmission" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                        <option value="automatic">Tự động</option>
                        <option value="manual">Số sàn</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nhiên liệu</label>
                      <select v-model="carForm.fuelType" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                        <option value="gasoline">Xăng</option>
                        <option value="diesel">Dầu Diesel</option>
                        <option value="electric">Điện</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </section>

                <!-- Phân đoạn 3: Thiết lập giá thuê -->
                <section>
                  <div class="flex items-center justify-between mb-6">
                    <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center">
                      <span class="w-8 h-px bg-primary-200 mr-3"></span> Thiết lập giá thuê
                    </h4>
                    <div class="flex gap-4">
                      <label class="flex items-center cursor-pointer group">
                        <input type="checkbox" v-model="carForm.isSelfDrive" class="hidden">
                        <div :class="carForm.isSelfDrive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm">Tự lái</div>
                      </label>
                      <label class="flex items-center cursor-pointer group">
                        <input type="checkbox" v-model="carForm.isWithDriver" class="hidden">
                        <div :class="carForm.isWithDriver ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm">Có tài xế</div>
                      </label>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-[2rem]">
                    <div v-if="carForm.isSelfDrive">
                      <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Giá tự lái / Ngày</label>
                      <div class="relative">
                        <input v-model.number="carForm.pricePerDay" type="number" class="w-full bg-white border-0 rounded-xl pl-4 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-gray-400">VND</span>
                      </div>
                    </div>
                    <div v-if="carForm.isSelfDrive">
                      <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Giá tự lái / Giờ</label>
                      <div class="relative">
                        <input v-model.number="carForm.pricePerHour" type="number" class="w-full bg-white border-0 rounded-xl pl-4 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-gray-400">VND</span>
                      </div>
                    </div>
                    <div v-if="carForm.isWithDriver">
                      <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Giá kèm tài / Ngày</label>
                      <div class="relative">
                        <input v-model.number="carForm.pricePerDayWithDriver" type="number" class="w-full bg-white border-0 rounded-xl pl-4 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-gray-400">VND</span>
                      </div>
                    </div>
                    <div v-if="carForm.isWithDriver">
                      <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Giá kèm tài / Giờ</label>
                      <div class="relative">
                        <input v-model.number="carForm.pricePerHourWithDriver" type="number" class="w-full bg-white border-0 rounded-xl pl-4 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-gray-400">VND</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- New categories -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 border-t border-gray-100 italic bg-gray-50/50 rounded-2xl">
                    <div>
                      <label class="block text-[10px] font-black text-red-500 uppercase mb-2">Giá cho cuối tuần (T7-CN) - Nếu có</label>
                      <div class="relative">
                        <input v-model.number="carForm.priceWeekend" type="number" class="w-full bg-white border border-red-100 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-red-600 focus:ring-2 focus:ring-red-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-red-400">VND</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-gray-500 uppercase mb-2">Giá thuê trọn gói tháng (Ưu đãi)</label>
                      <div class="relative">
                        <input v-model.number="carForm.pricePerMonth" type="number" class="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-gray-500">
                        <span class="absolute right-4 top-3 text-[10px] font-bold text-gray-400">VND</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số tiền đặt cọc giữ chỗ (VNĐ)</label>
                      <input v-model.number="carForm.deposit" type="number" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-lg font-black text-primary-600 focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số KM đã đi (Odometer)</label>
                      <input v-model.number="carForm.mileage" type="number" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-lg font-black text-gray-900 focus:ring-2 focus:ring-primary-500">
                    </div>
                  </div>
                </section>

                <!-- Phân đoạn 4: Tính năng xe -->
                <section>
                  <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Tiện nghi & Tính năng
                  </h4>
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <label 
                      v-for="opt in featuresOptions" :key="opt.id"
                      class="flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-primary-200 group relative"
                      :class="carForm.features.includes(opt.id) ? 'border-primary-600 bg-primary-50 shadow-md' : 'border-gray-100 bg-gray-50 opacity-60'"
                    >
                      <input type="checkbox" :value="opt.id" v-model="carForm.features" class="sr-only">
                      <span class="text-lg mb-1">{{ opt.id === 'abs' ? '🛡️' : opt.id === 'gps' ? '🗺️' : '✨' }}</span>
                      <span class="text-[9px] font-black uppercase text-center leading-tight">{{ opt.label }}</span>
                      <div v-if="carForm.features.includes(opt.id)" class="absolute -top-2 -right-2 bg-primary-600 text-white p-1 rounded-full shadow-lg">
                        <CheckCircleIcon class="h-4 w-4" />
                      </div>
                    </label>
                  </div>
                </section>

                <!-- Phân đoạn 5: Vị trí -->
                <section>
                   <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Vị trí đặt xe
                  </h4>
                  <div class="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                    <AddressSelector ref="addressSelectorRef" v-model="carForm.address" />
                  </div>
                </section>

                <!-- Phân đoạn 6: Hình ảnh & Chứng từ -->
                <section>
                  <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Hình ảnh & Hồ sơ pháp lý
                  </h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Images -->
                    <div class="space-y-4">
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest">Hình ảnh xe (Tối đa 5 ảnh)</label>
                      <div class="grid grid-cols-3 gap-2">
                        <div v-for="i in 5" :key="i" class="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden group border-2 border-dashed border-gray-200">
                           <input @change="(e) => handleImageUpload(e, i-1)" type="file" accept="image/*" class="absolute inset-0 opacity-0 z-10 cursor-pointer">
                           <img v-if="carFiles[i-1]?.preview || getCarImageUrl(i-1)" :src="carFiles[i-1]?.preview || getCarImageUrl(i-1)" class="w-full h-full object-cover">
                           <div v-else class="text-gray-300 text-2xl font-black">+</div>
                           <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <p class="text-[8px] font-black text-white uppercase">Thay đổi</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <!-- Documents -->
                    <div class="space-y-6 bg-primary-50 p-6 rounded-[2.5rem] border border-primary-100">
                       <div>
                          <label class="block text-xs font-black text-primary-900 uppercase tracking-widest mb-2">Đăng ký xe (Cà vẹt) *</label>
                          <div class="relative h-24 bg-white rounded-2xl border-2 border-dashed border-primary-200 flex items-center justify-center group overflow-hidden">
                             <input @change="handleDocUpload($event, 'registration')" type="file" accept="image/*,application/pdf" class="absolute inset-0 opacity-0 z-10 cursor-pointer">
                             <div class="text-center group-hover:scale-110 transition-transform">
                                <span class="text-xl">📄</span>
                                <p class="text-[9px] font-black text-primary-600 uppercase mt-1">{{ registrationFile?.name || 'Chọn tệp tải lên' }}</p>
                             </div>
                             <img v-if="registrationFile?.preview || (selectedCar?.documents?.registration?.url && (selectedCar?.documents?.registration?.url.startsWith('http') || selectedCar?.documents?.registration?.url.startsWith('data:') ? selectedCar?.documents?.registration?.url : 'http://localhost:3000' + selectedCar?.documents?.registration?.url))" :src="registrationFile?.preview || (selectedCar?.documents?.registration?.url && (selectedCar?.documents?.registration?.url.startsWith('http') || selectedCar?.documents?.registration?.url.startsWith('data:') ? selectedCar?.documents?.registration?.url : 'http://localhost:3000' + selectedCar?.documents?.registration?.url))" class="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none">
                          </div>
                       </div>
                       <div>
                          <label class="block text-xs font-black text-primary-900 uppercase tracking-widest mb-2">Bảo hiểm dân sự *</label>
                          <div class="relative h-24 bg-white rounded-2xl border-2 border-dashed border-primary-200 flex items-center justify-center group overflow-hidden">
                             <input @change="handleDocUpload($event, 'insurance')" type="file" accept="image/*,application/pdf" class="absolute inset-0 opacity-0 z-10 cursor-pointer">
                             <div class="text-center group-hover:scale-110 transition-transform">
                                <span class="text-xl">🛡️</span>
                                <p class="text-[9px] font-black text-primary-600 uppercase mt-1">{{ insuranceFile?.name || 'Chọn tệp tải lên' }}</p>
                             </div>
                             <img v-if="insuranceFile?.preview || (selectedCar?.documents?.insurance?.url && (selectedCar?.documents?.insurance?.url.startsWith('http') || selectedCar?.documents?.insurance?.url.startsWith('data:') ? selectedCar?.documents?.insurance?.url : 'http://localhost:3000' + selectedCar?.documents?.insurance?.url))" :src="insuranceFile?.preview || (selectedCar?.documents?.insurance?.url && (selectedCar?.documents?.insurance?.url.startsWith('http') || selectedCar?.documents?.insurance?.url.startsWith('data:') ? selectedCar?.documents?.insurance?.url : 'http://localhost:3000' + selectedCar?.documents?.insurance?.url))" class="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none">
                          </div>
                       </div>
                    </div>
                  </div>
                </section>

                <!-- Phân đoạn 7: Mô tả chi tiết -->
                <section>
                   <h4 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-6 flex items-center">
                    <span class="w-8 h-px bg-primary-200 mr-3"></span> Mô tả & Điều khoản
                  </h4>
                  <textarea v-model="carForm.description" rows="5" placeholder="Nhập mô tả xe, tình trạng và các điều khoản khi thuê..." class="w-full bg-gray-50 border-0 rounded-3xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"></textarea>
                </section>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="bg-gray-50 px-8 py-6 border-t border-gray-100 sm:flex sm:flex-row-reverse sm:gap-3">
              <button 
                type="submit" 
                class="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
              >
                {{ showEditCarModal ? 'Cập nhật xe' : 'Thêm xe này' }}
              </button>
              <button 
                type="button" 
                @click="closeModal" 
                class="mt-3 sm:mt-0 w-full sm:w-auto px-8 py-4 bg-white text-gray-400 font-black rounded-2xl border border-gray-100 hover:text-gray-600 transition-all uppercase text-xs tracking-widest"
              >
                Đóng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Car Modal -->
    <div v-if="showViewCarModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-medium text-gray-900">Chi tiết xe</h3>
              <button @click="showViewCarModal = false" class="text-gray-400 hover:text-gray-500">
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div v-if="selectedCar" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  :src="selectedCar.images?.[0]?.url || '/logo.png'" 
                  class="w-full h-64 object-cover rounded-lg"
                  :alt="`${selectedCar.brand} ${selectedCar.model}`"
                >
                <div class="mt-4 grid grid-cols-3 gap-2">
                  <img 
                    v-for="(image, index) in selectedCar.images?.slice(1, 4)" 
                    :key="index"
                    :src="image.url" 
                    class="w-full h-20 object-cover rounded"
                    :alt="`${selectedCar.brand} ${selectedCar.model} ${index + 1}`"
                  >
                </div>
              </div>
              
              <div>
                <h4 class="text-xl font-bold text-gray-900 mb-2">{{ selectedCar.brand }} {{ selectedCar.model }}</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Năm sản xuất:</span>
                    <span class="font-medium">{{ selectedCar.year }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Biển số:</span>
                    <span class="font-medium">{{ selectedCar.licensePlate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Loại xe:</span>
                    <span class="font-medium">{{ selectedCar.type || 'Sedan' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Số chỗ:</span>
                    <span class="font-medium">{{ selectedCar.seats || '5' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Hộp số:</span>
                    <span class="font-medium">{{ selectedCar.transmission || 'Số tự động' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Nhiên liệu:</span>
                    <span class="font-medium">{{ selectedCar.fuelType || 'Xăng' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Giá/ngày:</span>
                    <span class="font-bold text-green-600">{{ formatPrice(selectedCar.pricing?.dailyRate || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Giá/tháng:</span>
                    <span class="font-bold text-green-600">{{ formatPrice(selectedCar.pricing?.monthlyRate || 0) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Trạng thái phê duyệt:</span>
                    <span 
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getStatusBadgeClass(selectedCar.approvalStatus || selectedCar.status)"
                    >
                      {{ getStatusLabel(selectedCar.approvalStatus || selectedCar.status) }}
                    </span>
                  </div>
                  <!-- Trạng thái hoạt động (chỉ hiện khi đã duyệt) -->
                  <div 
                    v-if="(selectedCar.approvalStatus === 'approved' || selectedCar.status === 'available') && selectedCar.operationalStatus"
                    class="flex justify-between items-center"
                  >
                    <span class="text-gray-500">Trạng thái hoạt động:</span>
                    <span 
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getOperationalStatusBadgeClass(selectedCar.operationalStatus)"
                    >
                      {{ getOperationalStatusLabel(selectedCar.operationalStatus) }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <img 
                      :src="getUserAvatarUrl(selectedCar.owner?._id, selectedCar.owner?.avatar) || '/placeholder-avatar.svg'" 
                      class="w-10 h-10 rounded-full mr-3"
                      :alt="selectedCar.owner?.fullName"
                      @error="$event.target.src = '/placeholder-avatar.svg'"
                    >
                    <div>
                      <div class="font-medium">{{ selectedCar.owner?.fullName }}</div>
                      <div class="text-sm text-gray-500">{{ selectedCar.owner?.email }}</div>
                    </div>
                  </div>
                </div>
                
                <div v-if="selectedCar.description" class="mt-4">
                  <h5 class="font-medium text-gray-900 mb-2">Mô tả</h5>
                  <p class="text-gray-600">{{ selectedCar.description }}</p>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import AddressSelector from '@/components/AddressSelector.vue'
import { getUserAvatarUrl } from '@/utils/avatar'
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const toast = useToast()

// Data
const cars = ref([])
const stats = ref({
  totalCars: 0,
  approvedCars: 0,
  pendingCars: 0,
  rejectedCars: 0
})
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCars: 0,
  perPage: 10,
  hasNext: false,
  hasPrev: false
})

// Filters
const searchQuery = ref('')
const filters = ref({
  brand: '',
  status: '', // Default to all cars (empty = no filter)
  type: '',
  minPrice: '',
  maxPrice: ''
})

// Brands list
const brands = ref(['Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Skoda', 'Peugeot', 'Renault', 'Fiat', 'Jeep', 'Land Rover', 'Jaguar', 'Porsche', 'Lexus', 'Infiniti', 'Acura', 'Genesis', 'Cadillac', 'Buick', 'GMC', 'Chevrolet', 'Chrysler', 'Dodge', 'Ram', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren', 'Pagani', 'Koenigsegg', 'Rimac', 'Tesla', 'Rivian', 'Lucid Motors', 'Faraday Future', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'Great Wall Motors', 'BYD', 'Chery', 'JAC Motors', 'BAIC Group', 'Brilliance Auto', 'Dongfeng Motor', 'FAW Group', 'GAC Group', 'Guangqi Honda', 'Guangzhou Automobile', 'Haima Automobile', 'Hawtai Motor', 'Jiangling Motors', 'JMC Heavy Duty Vehicle', 'King Long', 'Lifan Group', 'Qoros Auto', 'Roewe', 'SAIC Motor', 'Soueast Motors', 'Venucia', 'Wuling Motors', 'Yema Auto', 'Zhonghua Auto', 'Zotye Auto'])

// Refs
const addressSelectorRef = ref(null)
const selectedCar = ref(null)
const showAddCarModal = ref(false)
const showEditCarModal = ref(false)
const showViewCarModal = ref(false)
const carFiles = ref([])
const registrationFile = ref(null)
const insuranceFile = ref(null)
const resetting = ref(false)

const carForm = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  color: 'Trắng',
  seats: 5,
  type: 'sedan',
  transmission: 'automatic',
  fuelType: 'gasoline',
  pricePerDay: 0,
  pricePerHour: 0,
  isSelfDrive: true,
  isWithDriver: false,
  pricePerDayWithDriver: 0,
  pricePerHourWithDriver: 0,
  driverFeePerDay: 0,
  pricePerMonth: 0,
  priceWeekend: 0,
  deposit: 0,
  mileage: 0,
  description: '',
  features: [],
  address: ''
})

const featuresOptions = [
  { id: 'air_conditioning', label: 'Điều hòa' },
  { id: 'gps', label: 'Bản đồ / GPS' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'usb_charger', label: 'Sạc USB' },
  { id: 'child_seat', label: 'Ghế trẻ em' },
  { id: 'cruise_control', label: 'Cruise Control' },
  { id: 'parking_sensors', label: 'Cảm biến lùi' },
  { id: 'camera', label: 'Camera lùi' },
  { id: 'abs', label: 'Phanh ABS' },
  { id: 'airbags', label: 'Túi khí' }
]

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  const delta = 2
  
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  rangeWithDots.push(1)
  
  if (current - delta > 2) {
    rangeWithDots.push('...')
  }
  
  rangeWithDots.push(...range)
  
  if (current + delta < total - 1) {
    rangeWithDots.push('...')
  }
  
  if (total > 1) {
    rangeWithDots.push(total)
  }
  
  return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index)
})

// Methods
const fetchCars = async () => {
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.perPage,
      search: searchQuery.value,
      status: filters.value.status || undefined, // Only filter if status is selected
      ...filters.value
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await api.get('/admin/cars', { params })
    cars.value = response.data.cars
    pagination.value = { ...pagination.value, ...response.data.pagination }
    
    // Update stats
    updateStats()
  } catch (error) {
    toast.error('Không thể tải danh sách xe')
  }
}

const fetchStats = async () => {
  try {
    const response = await api.get('/admin/stats')
    stats.value = {
      totalCars: response.data.totalCars,
      approvedCars: 0, // Will be updated by updateStats
      pendingCars: 0,
      rejectedCars: 0
    }
    updateStats()
  } catch (error) {
    toast.error('Không thể tải thống kê')
  }
}

const updateStats = () => {
  // Calculate stats from current cars data
  stats.value.approvedCars = cars.value.filter(car => car.status === 'approved' || car.status === 'available').length
  stats.value.pendingCars = cars.value.filter(car => car.status === 'pending').length
  stats.value.rejectedCars = cars.value.filter(car => car.status === 'rejected').length
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const handleImageUpload = async (e, index) => {
  const file = e.target.files[0]
  if (file) {
    try {
      const base64 = await fileToBase64(file)
      carFiles.value[index] = { file, preview: base64 }
    } catch (error) {
      console.error('Error converting file to base64:', error)
    }
  }
}

const handleDocUpload = async (e, type) => {
  const file = e.target.files[0]
  if (file) {
    try {
      const base64 = await fileToBase64(file)
      if (type === 'registration') {
        registrationFile.value = { file, preview: base64, name: file.name }
      } else {
        insuranceFile.value = { file, preview: base64, name: file.name }
      }
    } catch (error) {
       console.error('Error converting doc to base64:', error)
    }
  }
}

const getCarImageUrl = (index) => {
  const url = selectedCar.value?.images?.[index]?.url
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
}

const addCar = async () => {
  try {
    const addressId = await saveAddress()
    if (!addressId) return

    const submissionData = {
      ...carForm.value,
      addressId,
      status: 'approved',
      images: carFiles.value
        .filter(f => f && f.preview)
        .map((f, i) => ({ url: f.preview, isMain: i === 0 })),
      documents: {
        registration: { url: registrationFile.value?.preview || '' },
        insurance: { url: insuranceFile.value?.preview || '' }
      }
    }
    
    // Feature normalization
    submissionData.features = carForm.value.features

    await api.post('/cars', submissionData)
    
    toast.success('Thêm xe thành công')
    closeModal()
    fetchCars()
  } catch (error) {
    toast.error('Thêm xe thất bại: ' + (error.response?.data?.message || error.message))
  }
}

const updateCar = async () => {
  try {
    const addressId = await saveAddress()
    if (!addressId) return

    const submissionData = {
      ...carForm.value,
      addressId,
      images: carFiles.value
        .filter(f => f && f.preview)
        .map((f, i) => ({ url: f.preview, isMain: i === 0 })),
      documents: {
        registration: { url: registrationFile.value?.preview || selectedCar.value?.documents?.registration?.url },
        insurance: { url: insuranceFile.value?.preview || selectedCar.value?.documents?.insurance?.url }
      }
    }
    
    // Handle existing images merger if not all were replaced
    // This part is simplified: user replaces ALL or keeps existing ones in this setup
    // But if carFiles is empty, we keep existing
    if (submissionData.images.length === 0) {
      submissionData.images = selectedCar.value.images
    }

    await api.put(`/cars/${selectedCar.value._id}`, submissionData)
    
    toast.success('Cập nhật xe thành công')
    closeModal()
    fetchCars()
  } catch (error) {
    toast.error('Cập nhật xe thất bại')
  }
}

const saveAddress = async () => {
  if (addressSelectorRef.value && addressSelectorRef.value.isAddressComplete()) {
    const existingAddressId = selectedCar.value?.addressId?._id || selectedCar.value?.addressId
    if (existingAddressId && showEditCarModal.value) {
      return await addressSelectorRef.value.updateAddressInDB(existingAddressId)
    } else {
      return await addressSelectorRef.value.saveAddressToDB()
    }
  }
  return null
}

const editCar = async (car) => {
  try {
    const response = await api.get(`/cars/${car._id}`)
    const freshCarData = response.data.car || response.data
    selectedCar.value = freshCarData

    carForm.value = {
      brand: freshCarData.brand || '',
      model: freshCarData.model || '',
      year: freshCarData.year || new Date().getFullYear(),
      licensePlate: freshCarData.licensePlate || '',
      color: freshCarData.color || 'Trắng',
      seats: freshCarData.seats || 5,
      type: freshCarData.type || 'sedan',
      transmission: freshCarData.transmission || 'automatic',
      fuelType: freshCarData.fuelType || freshCarData.fuel || 'gasoline',
      pricePerDay: freshCarData.pricePerDay || 0,
      pricePerHour: freshCarData.pricePerHour || 0,
      isSelfDrive: freshCarData.isSelfDrive !== false,
      isWithDriver: freshCarData.isWithDriver === true,
      pricePerDayWithDriver: freshCarData.pricePerDayWithDriver || 0,
      pricePerHourWithDriver: freshCarData.pricePerHourWithDriver || 0,
      pricePerMonth: freshCarData.pricePerMonth || 0,
      priceWeekend: freshCarData.priceWeekend || 0,
      driverFeePerDay: freshCarData.driverFeePerDay || 0,
      deposit: freshCarData.deposit || 0,
      mileage: freshCarData.mileage || 0,
      description: freshCarData.description || '',
      features: freshCarData.features || [],
      address: freshCarData.addressId || ''
    }

    // Reset file inputs
    carFiles.value = []
    registrationFile.value = null
    insuranceFile.value = null

    showEditCarModal.value = true
    await nextTick()
    setTimeout(() => {
      if (addressSelectorRef.value && carForm.value.address) {
        addressSelectorRef.value.loadAddressFromObject?.(carForm.value.address)
      }
    }, 200)
  } catch (error) {
    toast.error('Không thể tải thông tin xe')
  }
}

const deleteCar = async (car) => {
  if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return
  
  try {
    await api.delete(`/admin/cars/${car._id}`)
    toast.success('Xóa xe thành công')
    fetchCars()
  } catch (error) {
    toast.error('Xóa xe thất bại')
  }
}

const approveCar = async (car) => {
  try {
    await api.put(`/admin/cars/${car._id}/approve`)
    toast.success('Duyệt xe thành công')
    fetchCars()
  } catch (error) {
    toast.error('Duyệt xe thất bại')
  }
}

const rejectCar = async (car) => {
  const reason = prompt('Lý do từ chối:')
  if (!reason) return
  
  try {
    await api.put(`/admin/cars/${car._id}/reject`, { reason })
    toast.success('Từ chối xe thành công')
    fetchCars()
  } catch (error) {
    toast.error('Từ chối xe thất bại')
  }
}

const resetAllCars = async () => {
  if (!confirm('Bạn có chắc chắn muốn reset toàn bộ xe về trạng thái sẵn sàng?\n\nThao tác này sẽ:\n- Đặt tất cả xe về trạng thái "available"\n- Xóa toàn bộ lịch bận (unavailableDates)\n- HỦY các đơn đặt trước đang giữ chỗ\n- HỦY các đơn chờ xác nhận (chưa bắt đầu)\n\nLưu ý: Các chuyến đang chạy (active) và đã hoàn thành sẽ KHÔNG bị ảnh hưởng.')) {
    return
  }
  
  resetting.value = true
  try {
    const response = await api.post('/admin/cars/reset-all', { includeUnavailableDates: true })
    const { modifiedCount, cancelledBookings } = response.data
    toast.success(`Đã reset ${modifiedCount} xe và hủy ${cancelledBookings} đơn đặt liên quan`)
    fetchCars()
    fetchStats()
  } catch (error) {
    toast.error('Reset toàn bộ xe thất bại: ' + (error.response?.data?.message || error.message))
  } finally {
    resetting.value = false
  }
}

const viewCar = (car) => {
  selectedCar.value = car
  showViewCarModal.value = true
}

const closeModal = () => {
  showAddCarModal.value = false
  showEditCarModal.value = false
  showViewCarModal.value = false
  selectedCar.value = null
  carFiles.value = []
  registrationFile.value = null
  insuranceFile.value = null
  carForm.value = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: 'Trắng',
    seats: 5,
    type: 'sedan',
    transmission: 'automatic',
    fuelType: 'gasoline',
    pricePerDay: 0,
    pricePerHour: 0,
    isSelfDrive: true,
    isWithDriver: false,
    pricePerDayWithDriver: 0,
    pricePerHourWithDriver: 0,
    pricePerMonth: 0,
    priceWeekend: 0,
    driverFeePerDay: 0,
    deposit: 0,
    mileage: 0,
    description: '',
    features: [],
    address: ''
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filters.value = {
    brand: '',
    status: 'available', // Keep available as default
    type: '',
    minPrice: '',
    maxPrice: ''
  }
  pagination.value.currentPage = 1
  fetchCars()
}

// Pagination
const prevPage = () => {
  if (pagination.value.hasPrev) {
    pagination.value.currentPage--
    fetchCars()
  }
}

const nextPage = () => {
  if (pagination.value.hasNext) {
    pagination.value.currentPage++
    fetchCars()
  }
}

const goToPage = (page) => {
  pagination.value.currentPage = page
  fetchCars()
}

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    fetchCars()
  }, 500)
}

// Watch filters
watch(filters, () => {
  pagination.value.currentPage = 1
  fetchCars()
}, { deep: true })

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800'
    case 'repair':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'approved':
    case 'available':
      return 'Đã duyệt'
    case 'pending':
      return 'Chờ duyệt'
    case 'rejected':
      return 'Bị từ chối'
    case 'active':
      return 'Hoạt động'
    case 'inactive':
      return 'Không hoạt động'
    case 'maintenance':
      return 'Bảo dưỡng'
    case 'repair':
      return 'Sửa chữa'
    default:
      return status || 'Không xác định'
  }
}

// Trạng thái hoạt động
const getOperationalStatusBadgeClass = (status) => {
  switch (status) {
    case 'available':
      return 'bg-blue-100 text-blue-800'
    case 'rented':
      return 'bg-purple-100 text-purple-800'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800'
    case 'repair':
      return 'bg-red-100 text-red-600'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getOperationalStatusLabel = (status) => {
  switch (status) {
    case 'available':
      return 'Sẵn sàng'
    case 'rented':
      return 'Đang cho thuê'
    case 'maintenance':
      return 'Bảo dưỡng'
    case 'repair':
      return 'Sửa chữa'
    case 'inactive':
      return 'Ngưng hoạt động'
    default:
      return status || 'Không xác định'
  }
}

onMounted(() => {
  fetchCars()
  fetchStats()
})
</script>
