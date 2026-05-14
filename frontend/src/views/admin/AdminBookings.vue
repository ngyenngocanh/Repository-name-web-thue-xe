<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản lý đặt xe</h2>
          <p class="text-gray-600 mt-1">Quản lý tất cả các chuyến đặt xe trong hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm đặt xe..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
          <button @click="exportBookings" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Xuất Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-wrap gap-4">
        <select v-model="filters.status" class="border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="active">Đang diễn ra</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select v-model="filters.rentalType" class="border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="">Tất cả loại hình</option>
          <option value="self_drive">Tự lái</option>
          <option value="with_driver">Kèm tài xế</option>
          <option value="driver_only">Thuê chuyến (Tài xế)</option>
        </select>
        <input
          v-model="filters.startDate"
          type="date"
          class="border border-gray-300 rounded px-3 py-2 text-sm"
        >
        <input
          v-model="filters.endDate"
          type="date"
          class="border border-gray-300 rounded px-3 py-2 text-sm"
        >
        <button @click="resetFilters" class="text-gray-600 hover:text-gray-800 text-sm">
          Đặt lại bộ lọc
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ bookingStats.pending }}</div>
            <div class="text-gray-600">Chờ xác nhận</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ bookingStats.confirmed }}</div>
            <div class="text-gray-600">Đã xác nhận</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ bookingStats.active }}</div>
            <div class="text-gray-600">Đang diễn ra</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ formatPrice(bookingStats.revenue) }}</div>
            <div class="text-gray-600">Doanh thu</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đặt xe
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mẫu dịch vụ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="booking in paginatedBookings" :key="booking._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">#{{ booking._id.slice(-8) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="getUserAvatarUrl(booking.renter?._id, booking.renter?.avatar) || '/placeholder-avatar.svg'" 
                    class="w-8 h-8 rounded-full mr-3"
                    :alt="booking.renter?.fullName"
                    @error="$event.target.src = '/placeholder-avatar.svg'"
                  >
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ booking.renter?.fullName }}</div>
                    <div class="text-sm text-gray-500">{{ booking.renter?.phone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  <div v-if="booking.rentalType === 'driver_only'" class="font-bold text-indigo-600 flex items-center">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2">
                      <span class="text-xs">👤</span>
                    </div>
                    Tài xế: {{ booking.driver?.fullName }}
                  </div>
                  <div v-else>
                    <div class="font-medium">{{ booking.car?.brand || 'N/A' }} {{ booking.car?.model || '' }}</div>
                    <div class="text-xs text-gray-500 italic">{{ booking.rentalType === 'self_drive' ? 'Thuê tự lái' : 'Thuê kèm tài' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="font-medium text-gray-700">{{ booking.mode === 'hourly' ? 'Thuê theo giờ' : 'Thuê theo ngày' }}</div>
                <div class="text-xs">{{ formatDate(booking.startDate) }}</div>
                <div class="text-xs">{{ booking.mode === 'hourly' ? `${booking.hours} giờ` : calculateDays(booking.startDate, booking.endDate) + ' ngày' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-black text-primary-600">
                  {{ formatPrice(booking.pricing?.totalAmount || 0) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusBadgeClass(booking.status)"
                >
                  {{ getStatusLabel(booking.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewBookingDetails(booking)" class="text-indigo-600 hover:text-indigo-900" title="Chi tiết">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    v-if="booking.rentalType === 'with_driver'"
                    @click="openAssignDriver(booking)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="Phân công tài xế"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    v-if="['pending', 'holding'].includes(booking.status)"
                    @click="booking.bookingType === 'prebook' ? confirmPreBooking(booking) : confirmBooking(booking)" 
                    class="text-green-600 hover:text-green-900"
                    title="Xác nhận đơn"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    v-if="['pending', 'confirmed', 'holding'].includes(booking.status)"
                    @click="cancelBooking(booking)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, filteredBookings.length) }} 
        của {{ filteredBookings.length }} kết quả
      </div>
      <div class="flex space-x-2">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
        >
          Trước
        </button>
        <span class="px-3 py-1 text-sm">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Chi tiết đặt xe</h3>
              <p class="text-sm text-gray-500">Mã đơn: <span class="font-mono font-medium text-primary-600">#{{ selectedBooking?._id?.slice(-8).toUpperCase() }}</span></p>
            </div>
          </div>
          <button @click="showDetailsModal = false" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <div v-if="selectedBooking" class="p-6 space-y-6">
          <!-- Status Timeline -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div v-for="(step, idx) in bookingSteps" :key="step.status" class="flex items-center flex-1" :class="{ 'flex-initial': idx === bookingSteps.length - 1 }">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    :class="getStepClass(step.status)">
                    <span v-if="isStepComplete(step.status)">✓</span>
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <span class="text-xs mt-2 font-medium" :class="isStepComplete(step.status) ? 'text-primary-600' : 'text-gray-400'">{{ step.label }}</span>
                </div>
                <div v-if="idx < bookingSteps.length - 1" class="flex-1 h-1 mx-2 rounded-full" :class="isStepComplete(bookingSteps[idx + 1].status) ? 'bg-primary-500' : 'bg-gray-300'"></div>
              </div>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Customer Info Card -->
            <div class="lg:col-span-1 space-y-4">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-900">Khách hàng</h4>
                </div>
                <div class="flex items-center gap-3 mb-4">
                  <img 
                    :src="getUserAvatarUrl(selectedBooking.renter?._id, selectedBooking.renter?.avatar) || '/placeholder-avatar.svg'" 
                    class="w-14 h-14 rounded-full border-2 border-white shadow-md"
                    :alt="selectedBooking.renter?.fullName"
                    @error="$event.target.src = '/placeholder-avatar.svg'"
                  >
                  <div>
                    <p class="font-bold text-gray-900">{{ selectedBooking.renter?.fullName }}</p>
                    <p class="text-[10px] text-gray-500">{{ selectedBooking.renter?.email }}</p>
                  </div>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                    <span>{{ selectedBooking.renter?.phone || 'Chưa cập nhật' }}</span>
                  </div>
                </div>
              </div>

              <!-- Vehicle/Driver Card -->
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="selectedBooking.rentalType === 'driver_only' ? 'bg-indigo-500' : 'bg-amber-500'">
                    <svg v-if="selectedBooking.rentalType === 'driver_only'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <svg v-else class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-900">{{ selectedBooking.rentalType === 'driver_only' ? 'Tài xế' : 'Phương tiện' }}</h4>
                </div>
                <div v-if="selectedBooking.rentalType === 'driver_only'" class="space-y-3">
                  <div class="flex items-center gap-3">
                    <img :src="selectedBooking.driver?.avatar || '/placeholder-avatar.jpg'" class="w-12 h-12 rounded-full border-2 border-white shadow">
                    <div>
                      <p class="font-bold text-gray-900">{{ selectedBooking.driver?.fullName }}</p>
                      <p class="text-sm text-indigo-600 font-medium">⭐ {{ selectedBooking.driver?.rating?.average?.toFixed(1) || '5.0' }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="space-y-2">
                  <div class="flex items-center gap-3 mb-3">
                    <img :src="selectedBooking.car?.firstImage || '/placeholder-car.jpg'" class="w-16 h-12 rounded-lg object-cover border border-gray-200">
                    <div>
                      <p class="font-bold text-gray-900">{{ selectedBooking.car?.brand }} {{ selectedBooking.car?.model }}</p>
                      <p class="text-sm text-gray-500">{{ selectedBooking.car?.licensePlate }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-600 border">{{ selectedBooking.car?.year }}</span>
                    <span class="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-600 border">{{ selectedBooking.car?.transmission }}</span>
                    <span class="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-600 border">{{ selectedBooking.car?.fuel }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-amber-200">
                  <p class="text-xs text-gray-500 uppercase font-bold">Loại hình thuê</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ selectedBooking.rentalType === 'self_drive' ? '🚗 Tự lái' : selectedBooking.rentalType === 'with_driver' ? '🧑‍✈️ Có tài xế' : '👤 Chỉ tài xế' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Trip Details -->
            <div class="lg:col-span-2 space-y-4">
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-900">Thông tin chuyến đi</h4>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 uppercase font-bold mb-1">Phương thức</p>
                    <p class="font-medium text-gray-900">
                      {{ selectedBooking.mode === 'hourly' ? '⏰ Theo giờ' : selectedBooking.mode === 'trip' ? '🛣️ Theo chuyến' : '📅 Theo ngày' }}
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 uppercase font-bold mb-1">Thời lượng</p>
                    <p class="font-medium text-gray-900">
                      {{ selectedBooking.mode === 'hourly' ? `${selectedBooking.hours} giờ` : calculateDays(selectedBooking.startDate, selectedBooking.endDate) + ' ngày' }}
                    </p>
                  </div>
                </div>

                <!-- Trip Route -->
                <div v-if="selectedBooking.mode === 'trip' && selectedBooking.trip" class="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
                  <div class="flex items-start gap-3">
                    <div class="flex flex-col items-center gap-1">
                      <div class="w-3 h-3 rounded-full bg-green-500"></div>
                      <div class="w-0.5 h-8 bg-gray-300"></div>
                      <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                    <div class="flex-1 space-y-2">
                      <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Điểm đón</p>
                        <p class="font-medium text-gray-900">{{ selectedBooking.trip.startLocation }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Điểm đến</p>
                        <p class="font-medium text-gray-900">{{ selectedBooking.trip.endLocation }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-gray-500 uppercase font-bold">Khoảng cách</p>
                      <p class="text-lg font-black text-indigo-600">{{ selectedBooking.trip.distance }} <span class="text-sm font-normal">km</span></p>
                    </div>
                  </div>
                </div>

                <!-- Time Schedule -->
                <div class="space-y-3">
                  <div class="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-green-600 uppercase font-bold">Bắt đầu</p>
                      <p class="font-bold text-gray-900">{{ formatDate(selectedBooking.startDate) }}</p>
                    </div>
                  </div>

                  <div v-if="selectedBooking.mode === 'daily'" class="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-red-600 uppercase font-bold">Kết thúc</p>
                      <p class="font-bold text-gray-900">{{ formatDate(selectedBooking.endDate) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Long-term Agreements -->
                <div v-if="calculateDays(selectedBooking.startDate, selectedBooking.endDate) >= 15" class="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p class="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    Cam kết dài hạn (15+ ngày)
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex items-center gap-2 text-sm" :class="selectedBooking.longTermAgreements?.carPreservation ? 'text-green-600' : 'text-red-500'">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" :class="selectedBooking.longTermAgreements?.carPreservation ? 'bg-green-100' : 'bg-red-100'">{{ selectedBooking.longTermAgreements?.carPreservation ? '✓' : '✗' }}</span>
                      <span>Giữ gìn xe</span>
                    </div>
                    <div v-if="selectedBooking.rentalType !== 'self_drive'" class="flex items-center gap-2 text-sm" :class="selectedBooking.longTermAgreements?.driverGuarantees ? 'text-green-600' : 'text-red-500'">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" :class="selectedBooking.longTermAgreements?.driverGuarantees ? 'bg-green-100' : 'bg-red-100'">{{ selectedBooking.longTermAgreements?.driverGuarantees ? '✓' : '✗' }}</span>
                      <span>Sinh hoạt tài xế</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pricing Breakdown -->
              <div class="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100 p-5">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 100 4 2 2 0 000-4zm0 4a2 2 0 110 4 2 2 0 010-4zm6 4a2 2 0 100 4 2 2 0 000-4zm0-8a2 2 0 110 4 2 2 0 010-4zm4 8a2 2 0 100 4 2 2 0 000-4zm0-8a2 2 0 110 4 2 2 0 010-4z"/>
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-900">Chi phí chi tiết</h4>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span class="text-gray-600">Phí thuê chính</span>
                    <span class="font-bold">{{ formatPrice(selectedBooking.pricing?.totalRentalFee || 0) }}</span>
                  </div>
                  <div v-if="selectedBooking.pricing?.deliveryFee > 0" class="flex justify-between items-center py-2 border-b border-gray-200/50 bg-blue-50/50 rounded px-2 -mx-2">
                    <div class="flex flex-col">
                      <span class="text-blue-700">Phí giao/đón xe</span>
                      <span class="text-xs text-blue-500">{{ selectedBooking.pricing?.deliveryDistance || 0 }} km × 5,000đ/km</span>
                    </div>
                    <span class="font-bold text-blue-700">{{ formatPrice(selectedBooking.pricing?.deliveryFee || 0) }}</span>
                  </div>
                  <div v-if="selectedBooking.pricing?.driverFeeTotal" class="flex justify-between items-center py-2 border-b border-gray-200/50 text-blue-600">
                    <span>Phí tài xế</span>
                    <span class="font-bold">{{ formatPrice(selectedBooking.pricing.driverFeeTotal) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span class="text-gray-600">Phí dịch vụ sàn (5%)</span>
                    <span>{{ formatPrice(selectedBooking.pricing?.serviceFee || 0) }}</span>
                  </div>
                  <div v-if="selectedBooking.pricing?.deposit" class="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span class="text-gray-600">
                      {{ selectedBooking.bookingType === 'prebook' ? 'Cọc giữ chỗ (10%)' : 'Tiền đặt cọc (30%)' }}
                    </span>
                    <span :class="selectedBooking.bookingType === 'prebook' ? 'text-blue-600' : 'text-amber-600'">
                      {{ formatPrice(selectedBooking.pricing.deposit) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center pt-3">
                    <span class="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                    <span class="text-2xl font-black text-primary-600">{{ formatPrice(selectedBooking.pricing?.totalAmount || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <!-- Pre-booking Info -->
            <div v-if="selectedBooking.bookingType === 'prebook'" class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-bold text-blue-800">Đặt trước giữ chỗ</span>
              </div>
              <div class="text-sm text-blue-700 space-y-1">
                <p>Trạng thái: <span class="font-bold">{{ selectedBooking.prebook?.status === 'holding' ? 'Đang giữ chỗ' : selectedBooking.prebook?.status === 'converted' ? 'Đã chuyển đổi' : selectedBooking.prebook?.status === 'expired' ? 'Đã hết hạn' : selectedBooking.prebook?.status || 'Không xác định' }}</span></p>
                <p v-if="selectedBooking.prebook?.deadline">Hạn chót: <span class="font-bold">{{ formatDateTime(selectedBooking.prebook.deadline) }}</span></p>
                <p v-if="selectedBooking.prebook?.holdDeposit">Cọc giữ chỗ: <span class="font-bold">{{ formatPrice(selectedBooking.prebook.holdDeposit) }}</span></p>
              </div>
            </div>
          <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            <button 
              v-if="['pending', 'holding'].includes(selectedBooking.status)"
              @click="() => { selectedBooking.bookingType === 'prebook' ? confirmPreBooking(selectedBooking) : confirmBooking(selectedBooking); showDetailsModal = false; }" 
              class="flex-1 min-w-[140px] py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              Xác nhận đơn
            </button>
            <button 
              v-if="selectedBooking.rentalType === 'with_driver' && ['pending', 'confirmed', 'holding'].includes(selectedBooking.status)"
              @click="openAssignDriver(selectedBooking); showDetailsModal = false" 
              class="flex-1 min-w-[140px] py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              Phân công tài xế
            </button>
            <button 
              v-if="['pending', 'confirmed', 'holding'].includes(selectedBooking.status)"
              @click="cancelBooking(selectedBooking); showDetailsModal = false" 
              class="flex-1 min-w-[140px] py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              Hủy đơn
            </button>
            <button 
              @click="showDetailsModal = false" 
              class="flex-1 min-w-[140px] py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Driver Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Phân công tài xế #{{ selectedBooking?._id?.slice(-8) }}</h3>
          <button @click="showAssignModal = false" class="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Chọn tài xế chuyên nghiệp cho hành trình này:</p>
          
          <div class="max-h-64 overflow-y-auto space-y-2 pr-2">
            <div 
              v-for="driver in drivers" 
              :key="driver._id"
              @click="assignForm.driverId = driver._id"
              class="flex items-center p-3 border rounded-xl cursor-pointer transition-all"
              :class="assignForm.driverId === driver._id ? 'border-primary-600 bg-primary-50 shadow-sm' : 'border-gray-100 hover:border-primary-200'"
            >
              <img :src="driver.avatar || '/placeholder-avatar.jpg'" class="w-10 h-10 rounded-full mr-3 border shadow-sm">
              <div class="flex-1">
                <div class="text-sm font-bold">{{ driver.fullName }}</div>
                <div class="flex items-center text-[10px] text-gray-500 font-bold uppercase">
                  ⭐ {{ driver.rating?.average?.toFixed(1) || '5.0' }} | {{ driver.driverInfo?.experience || '3' }} Năm kinh nghiệm
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-black text-primary-600 uppercase">{{ formatPrice(driver.driverInfo?.driverRatePerDay || 500000) }}</div>
                <div class="text-[8px] text-gray-400 font-bold uppercase">Phí theo ngày</div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4 space-x-3">
             <button @click="showAssignModal = false" class="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500">Hủy</button>
             <button 
              @click="assignDriver" 
              class="px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-200"
              :disabled="!assignForm.driverId || assigning"
             >
                Xác nhận phân công
             </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { getUserAvatarUrl } from '@/utils/avatar'

const toast = useToast()

const bookings = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showDetailsModal = ref(false)
const showAssignModal = ref(false)
const selectedBooking = ref(null)
const drivers = ref([])
const assigning = ref(false)
const assignForm = ref({
  driverId: ''
})

const filters = ref({
  status: '',
  rentalType: '',
  startDate: '',
  endDate: ''
})

const bookingStats = ref({
  pending: 0,
  confirmed: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
  revenue: 0
})

const filteredBookings = computed(() => {
  let result = bookings.value

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(booking => 
      booking._id.toLowerCase().includes(query) ||
      (booking.renter?.fullName || '').toLowerCase().includes(query) ||
      (booking.car?.brand || '').toLowerCase().includes(query) ||
      (booking.car?.model || '').toLowerCase().includes(query)
    )
  }

  // Apply filters
  if (filters.value.status) {
    result = result.filter(booking => booking.status === filters.value.status)
  }

  if (filters.value.rentalType) {
    result = result.filter(booking => booking.rentalType === filters.value.rentalType)
  }

  if (filters.value.startDate) {
    result = result.filter(booking => new Date(booking.startDate) >= new Date(filters.value.startDate))
  }

  if (filters.value.endDate) {
    result = result.filter(booking => new Date(booking.endDate) <= new Date(filters.value.endDate))
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage.value)
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

const bookingSteps = [
  { status: 'pending', label: 'Chờ xác nhận' },
  { status: 'confirmed', label: 'Đã xác nhận' },
  { status: 'active', label: 'Đang diễn ra' },
  { status: 'completed', label: 'Hoàn thành' }
]

const getStepClass = (stepStatus) => {
  const statusOrder = ['pending', 'confirmed', 'active', 'completed']
  const currentIndex = statusOrder.indexOf(selectedBooking.value?.status)
  const stepIndex = statusOrder.indexOf(stepStatus)
  
  if (stepIndex < currentIndex) {
    return 'bg-primary-500 text-white'
  } else if (stepIndex === currentIndex) {
    return 'bg-primary-600 text-white ring-4 ring-primary-200'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const isStepComplete = (stepStatus) => {
  const statusOrder = ['pending', 'confirmed', 'active', 'completed']
  const currentIndex = statusOrder.indexOf(selectedBooking.value?.status)
  const stepIndex = statusOrder.indexOf(stepStatus)
  return stepIndex <= currentIndex
}

const getStatusLabel = (status, bookingType, prebookStatus) => {
  if (bookingType === 'prebook') {
    const prebookLabels = {
      holding: 'Đặt trước - Giữ chỗ',
      converted: 'Đặt trước - Đã chuyển',
      expired: 'Đặt trước - Hết hạn',
      cancelled: 'Đặt trước - Đã hủy'
    }
    return prebookLabels[prebookStatus] || 'Đặt trước'
  }
  
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    active: 'Đang diễn ra',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status, bookingType, prebookStatus) => {
  // Pre-booking badges
  if (bookingType === 'prebook') {
    const prebookClasses = {
      holding: 'bg-blue-100 text-blue-800 border border-blue-200',
      converted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-800'
    }
    return prebookClasses[prebookStatus] || 'bg-blue-100 text-blue-800'
  }
  
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const fetchBookings = async () => {
  try {
    const response = await api.get('/admin/bookings')
    bookings.value = response.data.bookings || response.data
    
    // Calculate stats
    bookingStats.value = {
      pending: bookings.value.filter(b => b.status === 'pending').length,
      confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
      active: bookings.value.filter(b => b.status === 'active').length,
      completed: bookings.value.filter(b => b.status === 'completed').length,
      cancelled: bookings.value.filter(b => b.status === 'cancelled').length,
      revenue: bookings.value
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
    }
  } catch (error) {
    toast.error('Không thể tải danh sách đặt xe')
  }
}

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking
  showDetailsModal.value = true
}

const confirmBooking = async (booking) => {
  try {
    await api.put(`/admin/bookings/${booking._id}/confirm`)
    toast.success('Xác nhận đặt xe thành công')
    fetchBookings()
  } catch (error) {
    toast.error('Xác nhận đặt xe thất bại')
  }
}

const confirmPreBooking = async (booking) => {
  try {
    await api.post(`/bookings/${booking._id}/confirm`)
    toast.success('Xác nhận đặt trước thành công - Đơn đã chuyển thành booking chính thức')
    fetchBookings()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Xác nhận đặt trước thất bại')
  }
}

const cancelBooking = async (booking) => {
  if (!confirm('Bạn có chắc chắn muốn hủy đặt xe này?')) return
  
  try {
    await api.put(`/admin/bookings/${booking._id}/cancel`)
    toast.success('Hủy đặt xe thành công')
    fetchBookings()
  } catch (error) {
    toast.error('Hủy đặt xe thất bại')
  }
}

const openAssignDriver = async (booking) => {
  selectedBooking.value = booking
  assignForm.value.driverId = booking.driver?._id || ''
  showAssignModal.value = true
  
  try {
    const response = await api.get('/admin/drivers')
    drivers.value = response.data.drivers
  } catch (error) {
    console.error('Lỗi khi tải danh sách tài xế:', error)
  }
}

const assignDriver = async () => {
  if (!assignForm.value.driverId) return
  
  assigning.value = true
  try {
    await api.put(`/admin/bookings/${selectedBooking.value._id}/assign-driver`, {
      driverId: assignForm.value.driverId
    })
    toast.success('Phân công tài xế thành công')
    showAssignModal.value = false
    fetchBookings()
  } catch (error) {
    toast.error('Phân công tài xế thất bại')
  } finally {
    assigning.value = false
  }
}

const exportBookings = () => {
  toast.info('Chức năng xuất Excel đang phát triển')
}

const resetFilters = () => {
  filters.value = {
    status: '',
    startDate: '',
    endDate: ''
  }
  searchQuery.value = ''
  currentPage.value = 1
}

onMounted(() => {
  fetchBookings()
})
</script>
