<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl shadow-xl p-8 text-white"
    >
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold mb-2">Phê duyệt xe</h1>
          <p class="text-yellow-100 text-lg">
            Phê duyệt các xe đăng ký bởi chủ xe
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="text-2xl font-bold">{{ pendingCars.length }}</p>
            <p class="text-sm text-yellow-100">Chờ phê duyệt</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <ClockIcon class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          <p class="text-sm text-gray-500 mt-1">Chờ duyệt</p>
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-100 rounded-lg">
            <CheckCircleIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
          <p class="text-sm text-gray-500 mt-1">Đã duyệt</p>
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-red-100 rounded-lg">
            <XCircleIcon class="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
          <p class="text-sm text-gray-500 mt-1">Bị từ chối</p>
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-lg">
            <ChartBarIcon class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          <p class="text-sm text-gray-500 mt-1">Tổng số</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center space-x-2">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="
              selectedFilter === filter.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="ml-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm xe..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Cars List -->
    <div class="space-y-4">
      <div
        v-for="car in filteredCars"
        :key="car._id"
        class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <!-- Car Info -->
            <div class="flex space-x-6">
              <div class="flex-shrink-0">
                <img
                  :src="getCarImageUrl(car, 0)"
                  class="w-32 h-24 rounded-lg object-cover"
                  :alt="`${car.brand} ${car.model}`"
                  @error="handleImageError"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-900">
                    {{ car.brand }} {{ car.model }}
                  </h3>
                  <!-- Trạng thái phê duyệt -->
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getApprovalStatusBadgeClass(car.approvalStatus || car.status)"
                  >
                    {{ getApprovalStatusLabel(car.approvalStatus || car.status) }}
                  </span>
                  <!-- Trạng thái hoạt động (chỉ hiện khi đã duyệt) -->
                  <span
                    v-if="(car.approvalStatus === 'approved' || car.status === 'available') && car.operationalStatus"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getOperationalStatusBadgeClass(car.operationalStatus)"
                  >
                    {{ getOperationalStatusLabel(car.operationalStatus) }}
                  </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Biển số:</span>
                    <p class="font-medium">{{ car.licensePlate }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Năm sản xuất:</span>
                    <p class="font-medium">{{ car.year }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Loại xe:</span>
                    <p class="font-medium">{{ car.type || "Sedan" }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Giá/ngày:</span>
                    <p class="font-medium text-green-600">
                      {{ formatPrice(car.pricePerDay || 0) }}
                    </p>
                  </div>
                </div>

                <div class="mt-3">
                  <p class="text-sm text-gray-600">
                    {{ car.description || "Chưa có mô tả" }}
                  </p>
                </div>

                <!-- Owner Info -->
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <img
                      :src="getUserAvatarUrl(car.owner?._id, car.owner?.avatar) || '/placeholder-avatar.svg'"
                      class="w-10 h-10 rounded-full mr-3"
                      :alt="car.owner?.fullName"
                      @error="$event.target.src = '/placeholder-avatar.svg'"
                    />
                    <div>
                      <p class="font-medium">{{ car.owner?.fullName }}</p>
                      <p class="text-sm text-gray-500">
                        {{ car.owner?.email }} • {{ car.owner?.phone }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col space-y-2">
              <button
                @click="viewCarDetails(car)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EyeIcon class="w-4 h-4 inline mr-2" />
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white"
      >
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Từ chối xe</h3>
          <form @submit.prevent="rejectCar">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Lý do từ chối</label
                >
                <textarea
                  v-model="rejectionReason"
                  rows="4"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập lý do từ chối..."
                ></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="
                  showRejectModal = false;
                  rejectionReason = '';
                "
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Từ chối
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Car Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white"
      >
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Chi tiết xe</h3>
            <button
              @click="showDetailsModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div v-if="selectedCar" class="max-h-[80vh] overflow-y-auto">
            <!-- Car Images Section -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Hình ảnh xe</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="(image, index) in selectedCar.images" :key="index" class="relative group">
                  <img
                    :src="getCarImageUrl(selectedCar, index)"
                    class="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    :alt="`${selectedCar.brand} ${selectedCar.model} ${index + 1}`"
                    @click="viewFullImage(getCarImageUrl(selectedCar, index))"
                    @error="handleImageError"
                  />
                  <span v-if="image.isMain" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Ảnh chính</span>
                </div>
              </div>
            </div>

            <!-- Car Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div class="space-y-2">
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Hãng xe:</span>
                    <span class="font-medium">{{ selectedCar.brand }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Dòng xe:</span>
                    <span class="font-medium">{{ selectedCar.model }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Biển số:</span>
                    <span class="font-medium">{{ selectedCar.licensePlate }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Năm sản xuất:</span>
                    <span class="font-medium">{{ selectedCar.year }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Màu sắc:</span>
                    <span class="font-medium">{{ selectedCar.color }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Loại xe:</span>
                    <span class="font-medium">{{ selectedCar.type || "Sedan" }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Thông tin kỹ thuật</h4>
                <div class="space-y-2">
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Số chỗ ngồi:</span>
                    <span class="font-medium">{{ selectedCar.seats || 5 }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Hộp số:</span>
                    <span class="font-medium">{{ getTransmissionLabel(selectedCar.transmission) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Nhiên liệu:</span>
                    <span class="font-medium">{{ getFuelLabel(selectedCar.fuel) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Số km đã đi:</span>
                    <span class="font-medium">{{ formatMileage(selectedCar.mileage) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Giá đề xuất/ngày:</span>
                    <span class="font-bold text-green-600">{{ formatPrice(selectedCar.pricePerDay || 0) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Tiền đặt cọc:</span>
                    <span class="font-bold text-orange-600">{{ formatPrice(selectedCar.deposit || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div v-if="selectedCar.features && selectedCar.features.length" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Tiện nghi & Tính năng</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="feature in selectedCar.features" 
                  :key="feature"
                  class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {{ getFeatureLabel(feature) }}
                </span>
              </div>
            </div>

            <!-- Location -->
            <div v-if="selectedCar.location" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Vị trí xe</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="font-medium">{{ selectedCar.location.address }}</p>
                <p class="text-gray-600">{{ selectedCar.location.district }}, {{ selectedCar.location.city }}</p>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="selectedCar.documents" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Giấy tờ xe</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="selectedCar.documents.registration" class="border rounded-lg p-3">
                  <h5 class="font-medium mb-2">Giấy đăng ký xe</h5>
                  <img 
                    :src="getDocumentUrl(selectedCar._id, 'registration')" 
                    class="w-full h-40 object-cover rounded cursor-pointer hover:opacity-90"
                    @click="viewFullImage(getDocumentUrl(selectedCar._id, 'registration'))"
                    @error="handleImageError"
                    alt="Giấy đăng ký xe"
                  />
                </div>
                <div v-if="selectedCar.documents.insurance" class="border rounded-lg p-3">
                  <h5 class="font-medium mb-2">Bảo hiểm xe</h5>
                  <img 
                    :src="getDocumentUrl(selectedCar._id, 'insurance')" 
                    class="w-full h-40 object-cover rounded cursor-pointer hover:opacity-90"
                    @click="viewFullImage(getDocumentUrl(selectedCar._id, 'insurance'))"
                    @error="handleImageError"
                    alt="Bảo hiểm xe"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedCar.description" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Mô tả chi tiết</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-gray-700 whitespace-pre-wrap">{{ selectedCar.description }}</p>
              </div>
            </div>

            <!-- Owner Information -->
            <div v-if="selectedCar.owner" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Thông tin chủ xe</h4>
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center mb-3">
                  <img
                    :src="getUserAvatarUrl(selectedCar.owner?._id, selectedCar.owner?.avatar) || '/placeholder-avatar.svg'"
                    class="w-12 h-12 rounded-full mr-3"
                    :alt="selectedCar.owner?.fullName"
                    @error="$event.target.src = '/placeholder-avatar.svg'"
                  />
                  <div>
                    <p class="font-medium">{{ selectedCar.owner.fullName }}</p>
                    <p class="text-sm text-gray-600">{{ selectedCar.owner.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600">Số điện thoại:</span>
                    <span class="font-medium ml-2">{{ selectedCar.owner.phone || 'Chưa cung cấp' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Role:</span>
                    <span class="font-medium ml-2">{{ getRoleLabel(selectedCar.owner.role) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Xác thực:</span>
                    <span class="font-medium ml-2" :class="selectedCar.owner.isVerified ? 'text-green-600' : 'text-red-600'">
                      {{ selectedCar.owner.isVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-600">Đánh giá:</span>
                    <span class="font-medium ml-2">{{ selectedCar.owner.rating?.average || 'Chưa có' }} ({{ selectedCar.owner.rating?.count || 0 }} đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="border-t pt-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-wrap gap-2">
                  <!-- Trạng thái phê duyệt -->
                  <span class="text-gray-600">Trạng thái phê duyệt:</span>
                  <span
                    class="px-3 py-1 text-sm font-semibold rounded-full"
                    :class="getApprovalStatusBadgeClass(selectedCar.approvalStatus || selectedCar.status)"
                  >
                    {{ getApprovalStatusLabel(selectedCar.approvalStatus || selectedCar.status) }}
                  </span>
                  
                  <!-- Trạng thái hoạt động -->
                  <span v-if="(selectedCar.approvalStatus === 'approved' || selectedCar.status === 'available') && selectedCar.operationalStatus" class="text-gray-600 ml-2">| Hoạt động:</span>
                  <span
                    v-if="(selectedCar.approvalStatus === 'approved' || selectedCar.status === 'available') && selectedCar.operationalStatus"
                    class="px-3 py-1 text-sm font-semibold rounded-full"
                    :class="getOperationalStatusBadgeClass(selectedCar.operationalStatus)"
                  >
                    {{ getOperationalStatusLabel(selectedCar.operationalStatus) }}
                  </span>
                  
                  <!-- Thời gian duyệt/từ chối -->
                  <span v-if="selectedCar.approvedAt" class="ml-3 text-sm text-gray-500">
                    <ClockIcon class="w-4 h-4 inline mr-1" />
                    Đã duyệt: {{ formatDate(selectedCar.approvedAt) }}
                  </span>
                  <span v-if="selectedCar.rejectedAt" class="ml-3 text-sm text-red-500">
                    <XCircleIcon class="w-4 h-4 inline mr-1" />
                    Đã từ chối: {{ formatDate(selectedCar.rejectedAt) }}
                  </span>
                </div>
                <div class="flex space-x-3">
                  <button
                    v-if="selectedCar.status === 'pending'"
                    @click="openContractModal(selectedCar)"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                      <path d="M8 2v4h4M6 10h8M6 14h8"/>
                    </svg>
                    Hợp đồng
                  </button>
                  <button
                    v-if="selectedCar.status === 'pending'"
                    @click="approveCar(selectedCar)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon class="w-4 h-4 inline mr-2" />
                    Duyệt xe
                  </button>
                  <button
                    v-if="selectedCar.status === 'pending'"
                    @click="openRejectModal(selectedCar)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircleIcon class="w-4 h-4 inline mr-2" />
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <div
      v-if="showContractModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-5 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-lg bg-white"
      >
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Hợp Đồng Mượn Xe - Cộng Tác Viên</h3>
            <button
              @click="showContractModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div class="max-h-[75vh] overflow-y-auto p-8 bg-white" style="font-family: 'Times New Roman', serif; line-height: 1.6;">
            <!-- National Emblem and Motto -->
            <div class="text-center mb-6">
              <div class="mb-4">
                <div class="inline-block">
                  <div class="text-black font-bold text-xl mb-2">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div class="text-black font-bold text-xl">Độc lập - Tự do - Hạnh phúc</div>
                </div>
              </div>
              <p class="text-sm text-gray-600">-----</p>
            </div>

            <!-- Contract Header -->
            <div class="text-center mb-10">
              <h1 class="text-3xl font-bold mb-3 uppercase">Hợp Đồng Mượn Xe</h1>
              <h2 class="text-xl mb-4">Cộng Tác Viên Cho Thuê Xe</h2>
              <p class="text-base font-medium">Số: {{ contractNumber }}/HĐ-CTV-{{ new Date().getFullYear() }}</p>
            </div>

            <!-- Contract Parties -->
            <div class="mb-10">
              <h3 class="text-lg font-bold mb-4 text-center uppercase">Bên Cho Thuê (Bên A):</h3>
              <div class="max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg border">
                <p class="mb-2 text-center font-bold text-lg">Công ty TNHH Thuê Xe [Tên Công ty]</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Địa chỉ:</strong> [Địa chỉ công ty]</div>
                  <div><strong>Mã số thuế:</strong> [Mã số thuế]</div>
                  <div><strong>Điện thoại:</strong> [Số điện thoại]</div>
                  <div><strong>Email:</strong> [Email công ty]</div>
                  <div><strong>Người đại diện:</strong> [Tên người đại diện]</div>
                  <div><strong>Chức vụ:</strong> Giám đốc</div>
                </div>
              </div>
            </div>

            <div class="mb-10">
              <h3 class="text-lg font-bold mb-4 text-center uppercase">Bên Mượn Xe (Bên B):</h3>
              <div class="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border">
                <p class="mb-2 text-center font-bold text-lg">{{ selectedCar?.owner?.fullName || '[Tên Cộng tác viên]' }}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Số CMND/CCCD:</strong> [Số CMND/CCCD]</div>
                  <div><strong>Ngày cấp:</strong> [Ngày cấp]</div>
                  <div><strong>Nơi cấp:</strong> [Nơi cấp]</div>
                  <div><strong>Địa chỉ:</strong> [Địa chỉ thường trú]</div>
                  <div><strong>Điện thoại:</strong> {{ selectedCar?.owner?.phone || '[Số điện thoại]' }}</div>
                  <div><strong>Email:</strong> {{ selectedCar?.owner?.email || '[Email]' }}</div>
                  <div><strong>Tài khoản ngân hàng:</strong> [Số tài khoản]</div>
                  <div><strong>Ngân hàng:</strong> [Tên ngân hàng]</div>
                </div>
              </div>
            </div>

            <!-- Vehicle Information -->
            <div class="mb-10">
              <h3 class="text-lg font-bold mb-4 text-center uppercase">Thông Tin Xe Cho Thuê:</h3>
              <div class="max-w-3xl mx-auto bg-green-50 p-6 rounded-lg border">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Hãng sản xuất:</strong> {{ selectedCar?.brand || '...' }}</div>
                  <div><strong>Dòng xe:</strong> {{ selectedCar?.model || '...' }}</div>
                  <div><strong>Biển số xe:</strong> {{ selectedCar?.licensePlate || '...' }}</div>
                  <div><strong>Năm sản xuất:</strong> {{ selectedCar?.year || '...' }}</div>
                  <div><strong>Màu sắc:</strong> {{ selectedCar?.color || '...' }}</div>
                  <div><strong>Số chỗ ngồi:</strong> {{ selectedCar?.seats || '...' }}</div>
                  <div><strong>Loại xe:</strong> {{ selectedCar?.type || '...' }}</div>
                  <div><strong>Số km đã đi:</strong> {{ selectedCar?.mileage || '...' }} km</div>
                  <div class="col-span-2"><strong>Tình trạng xe:</strong> Tốt, hoạt động bình thường</div>
                </div>
              </div>
            </div>

            <!-- Contract Terms -->
            <div class="mb-8 max-w-4xl mx-auto">
              <h3 class="text-lg font-bold mb-6 text-center uppercase">Nội Dung Hợp Đồng</h3>
              
              <div class="space-y-6 text-justify">
                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 1: Thời Hạn Hợp Đồng</h4>
                  <p class="text-sm leading-relaxed pl-6">Hợp đồng này có hiệu lực từ ngày ký và có thời hạn 12 (mười hai) tháng. Sau thời hạn này, hai bên có thể gia hạn nếu có sự đồng thuận bằng văn bản.</p>
                </div>
                
                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 2: Quyền và Nghĩa Vụ Của Bên A</h4>
                  <p class="font-medium mb-2">Quyền lợi:</p>
                  <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
                    <li>Nhận hoa hồng theo tỷ lệ đã thỏa thuận tại Điều 4</li>
                    <li>Yêu cầu Bên B tuân thủ các quy định trong hợp đồng</li>
                    <li>Tạm dừng hợp đồng nếu Bên B vi phạm nghiêm trọng</li>
                    <li>Kiểm tra chất lượng xe định kỳ</li>
                  </ul>
                  <p class="font-medium mb-2">Nghĩa vụ:</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Cung cấp thông tin chính xác về xe</li>
                    <li>Hỗ trợ Bên B trong quá trình hoạt động</li>
                    <li>Thanh toán hoa hồng đúng hạn</li>
                    <li>Bảo vệ quyền lợi hợp pháp của Bên B</li>
                  </ul>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 3: Quyền và Nghĩa Vụ Của Bên B</h4>
                  <p class="font-medium mb-2">Quyền lợi:</p>
                  <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
                    <li>Nhận hoa hồng theo tỷ lệ % trên tổng doanh thu</li>
                    <li>Được hỗ trợ kỹ thuật khi cần</li>
                    <li>Được tham gia các chương trình đào tạo</li>
                    <li>Được cung cấp ứng dụng quản lý xe</li>
                  </ul>
                  <p class="font-medium mb-2">Nghĩa vụ:</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Bảo quản xe cẩn thận, đúng cách</li>
                    <li>Chỉ sử dụng xe cho mục đích cho thuê</li>
                    <li>Báo cáo tình hình xe định kỳ</li>
                    <li>Chịu chi phí bảo dưỡng, sửa chữa nhỏ</li>
                    <li>Tuân thủ quy định về giá thuê</li>
                  </ul>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 4: Hoa Hồng và Thanh Toán</h4>
                  <p class="font-medium mb-2">Tỷ lệ hoa hồng:</p>
                  <ul class="list-disc ml-6 mb-3 text-sm space-y-1">
                    <li>Doanh thu dưới 10 triệu/tháng: 15%</li>
                    <li>Doanh thu từ 10-30 triệu/tháng: 18%</li>
                    <li>Doanh thu trên 30 triệu/tháng: 20%</li>
                  </ul>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Thời gian thanh toán:</strong> Ngày 05 hàng tháng</div>
                    <div><strong>Phương thức:</strong> Chuyển khoản</div>
                  </div>
                  <p class="font-medium mb-2 mt-3">Chi phí khác:</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Bảo dưỡng định kỳ: Bên A chịu</li>
                    <li>Sửa chữa lớn (>2 triệu): Bên A chịu 70%, Bên B chịu 30%</li>
                    <li>Sửa chữa nhỏ (≤2 triệu): Bên B chịu</li>
                    <li>Thay thế lốp: Bên A chịu 50%, Bên B chịu 50%</li>
                  </ul>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 5: Bảo Hiểm</h4>
                  <p class="text-sm leading-relaxed pl-6">Bên A chịu trách nhiệm mua bảo hiểm vật chất xe theo quy định pháp luật. Bên B có trách nhiệm khai báo sự cố ngay lập tức, chịu phần khấu từ bảo hiểm và hợp tác với công ty bảo hiểm.</p>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 6: Chất Lượng Dịch Vụ</h4>
                  <p class="font-medium mb-2">Bên B cam kết:</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Giữ xe sạch sẽ, lịch sự</li>
                    <li>Đón trả khách đúng giờ</li>
                    <li>Thái độ phục vụ chuyên nghiệp</li>
                    <li>Đánh giá khách hàng ≥ 4.5/5 sao</li>
                  </ul>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 7: Chấm Dứt Hợp Đồng</h4>
                  <p class="text-sm leading-relaxed pl-6">Hợp đồng có thể chấm dứt khi: hết thời hạn hợp đồng, hai bên thỏa thuận, Bên B vi phạm nghiêm trọng quy định, Bên B không đạt chất lượng dịch vụ trong 2 tháng liên tiếp, hoặc phát sinh sự kiện bất khả kháng.</p>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 8: Giải Quyết Tranh Chấp</h4>
                  <p class="text-sm leading-relaxed pl-6">Mọi tranh chấp phát sinh sẽ được giải quyết theo nguyên tắc: ưu tiên thương lượng, hòa giải; nếu không hòa giải được, đưa ra Tòa án nhân dân có thẩm quyền và áp dụng pháp luật Việt Nam.</p>
                </div>

                <div class="bg-white p-4 rounded-lg border">
                  <h4 class="font-bold mb-3">Điều 9: Điều Khoản Chung</h4>
                  <p class="text-sm leading-relaxed pl-6">Hai bên cam kết thực hiện nghiêm túc các điều khoản trong hợp đồng. Mọi sửa đổi, bổ sung phải được lập thành văn bản và có chữ ký của cả hai bên.</p>
                </div>
              </div>
            </div>

            <!-- Signatures -->
            <div class="mt-16 grid grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div class="text-center">
                <p class="mb-8 font-bold uppercase">Bên Cho Thuê</p>
                <p class="mb-8 text-sm text-gray-600">(Ký, ghi rõ họ tên và đóng dấu)</p>
                <div class="border-t-2 border-gray-800 pt-4">
                  <p class="font-bold">[Tên người đại diện]</p>
                  <p class="text-sm">Giám đốc</p>
                </div>
              </div>
              <div class="text-center">
                <p class="mb-8 font-bold uppercase">Bên Mượn Xe</p>
                <p class="mb-8 text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                <div class="border-t-2 border-gray-800 pt-4">
                  <p class="font-bold">{{ selectedCar?.owner?.fullName || '[Tên Cộng tác viên]' }}</p>
                </div>
              </div>
            </div>

            <!-- Date -->
            <div class="text-center mt-16 mb-8">
              <p class="font-bold">Đã ký tại [Địa điểm], ngày {{ new Date().getDate() }} tháng {{ new Date().getMonth() + 1 }} năm {{ new Date().getFullYear() }}</p>
            </div>
          </div>

          <!-- Contract Actions -->
          <div class="flex justify-end space-x-3 mt-6 p-4 bg-gray-50 rounded-lg">
            <button
              @click="printContract"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"/>
              </svg>
              In hợp đồng
            </button>
            <button
              @click="downloadContract"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              Tải xuống
            </button>
            <button
              @click="showContractModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import { getUserAvatarUrl } from '@/utils/avatar';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";

const toast = useToast();

const cars = ref([]);
const searchQuery = ref("");
const selectedFilter = ref("pending");
const showRejectModal = ref(false);
const showDetailsModal = ref(false);
const showContractModal = ref(false);
const selectedCar = ref(null);
const rejectionReason = ref("");
const contractNumber = ref("");

const statusFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "available" },
  { label: "Bị từ chối", value: "rejected" },
];

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0,
});

const pendingCars = computed(() => {
  return cars.value.filter((car) => car.status === "pending");
});

const filteredCars = computed(() => {
  let result = cars.value;

  // Filter by status
  if (selectedFilter.value !== "all") {
    if (selectedFilter.value === "available") {
      result = result.filter((car) => car.status === "available" || car.status === "approved");
    } else {
      result = result.filter((car) => car.status === selectedFilter.value);
    }
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (car) =>
        (car.brand || '').toLowerCase().includes(query) ||
        (car.model || '').toLowerCase().includes(query) ||
        (car.licensePlate || '').toLowerCase().includes(query) ||
        (car.owner?.fullName || '').toLowerCase().includes(query),
    );
  }

  return result;
});

const fetchCars = async () => {
  try {
    const authStore = useAuthStore();
    console.log("Fetching admin cars with token:", authStore.token);
    console.log("User role:", authStore.user?.role);
    
    let response;
    try {
      // Fetch a larger list to populate the dashboard metrics properly
      response = await api.get("/admin/cars?limit=500");
    } catch (error) {
      console.log("Failed to fetch cars:", error);
      throw error;
    }
    
    console.log("API response:", response.data);
    cars.value = response.data.cars || [];

    // Update stats
    stats.value = {
      pending: cars.value.filter((car) => car.status === "pending").length,
      approved: cars.value.filter((car) => car.status === "available" || car.status === "approved").length,
      rejected: cars.value.filter((car) => car.status === "rejected").length,
      total: cars.value.length,
    };
    
    console.log("Final cars array:", cars.value);
    console.log("Stats:", stats.value);
  } catch (error) {
    console.error("fetchCars error:", error);
    console.error("Error response:", error.response?.data);
    const msg =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "Không thể tải danh sách xe";
    toast.error(msg);
  }
};

const approveCar = async (car) => {
  try {
    await api.put(`/admin/cars/${car._id}/approve`);
    toast.success("Xe đã được duyệt thành công");
    showDetailsModal.value = false;
    selectedCar.value = null;
    fetchCars();
  } catch (error) {
    toast.error("Không thể duyệt xe");
  }
};

const rejectCar = async () => {
  if (!selectedCar.value || !rejectionReason.value.trim()) return;

  try {
    await api.put(`/admin/cars/${selectedCar.value._id}/reject`, {
      reason: rejectionReason.value,
    });

    toast.success("Xe đã bị từ chối");
    showRejectModal.value = false;
    selectedCar.value = null;
    rejectionReason.value = "";
    fetchCars();
  } catch (error) {
    toast.error("Không thể từ chối xe");
  }
};

const viewCarDetails = async (car) => {
  try {
    // Fetch complete car details from API to ensure we have all information
    const response = await api.get(`/admin/cars/${car._id}`);
    selectedCar.value = response.data;
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Error fetching car details:', error);
    // Fallback to using the car data from the list
    selectedCar.value = car;
    showDetailsModal.value = true;
  }
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    available: "Có sẵn",
    rejected: "Bị từ chối",
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    available: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Trạng thái phê duyệt
const getApprovalStatusLabel = (status) => {
  const labels = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    available: "Đã duyệt", // fallback từ status cũ
  };
  return labels[status] || status;
};

const getApprovalStatusBadgeClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    available: "bg-green-100 text-green-800", // fallback
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Trạng thái hoạt động
const getOperationalStatusLabel = (status) => {
  const labels = {
    available: "Sẵn sàng",
    rented: "Đang cho thuê",
    maintenance: "Bảo dưỡng",
    repair: "Sửa chữa",
    inactive: "Ngưng hoạt động",
  };
  return labels[status] || status;
};

const getOperationalStatusBadgeClass = (status) => {
  const classes = {
    available: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    maintenance: "bg-orange-100 text-orange-800",
    repair: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatMileage = (mileage) => {
  return new Intl.NumberFormat("vi-VN").format(mileage || 0) + ' km';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTransmissionLabel = (transmission) => {
  const labels = {
    manual: "Số sàn",
    automatic: "Số tự động",
  };
  return labels[transmission] || transmission;
};

const getFuelLabel = (fuel) => {
  const labels = {
    gasoline: "Xăng",
    diesel: "Diesel",
    electric: "Điện",
    hybrid: "Hybrid",
  };
  return labels[fuel] || fuel;
};

const getFeatureLabel = (feature) => {
  const labels = {
    air_conditioning: "Điều hòa",
    gps: "GPS",
    bluetooth: "Bluetooth",
    usb_charger: "Cổng sạc USB",
    child_seat: "Ghế trẻ em",
    cruise_control: "Ga tự động",
    parking_sensors: "Cảm biến đỗ xe",
    camera: "Camera lùi",
    abs: "Phanh ABS",
    airbags: "Túi khí",
  };
  return labels[feature] || feature;
};

const getRoleLabel = (role) => {
  const labels = {
    owner: "Chủ xe",
    driver: "Tài xế",
    collaborator: "Cộng tác viên",
    admin: "Quản trị viên",
    renter: "Người thuê",
  };
  return labels[role] || role;
};

const viewFullImage = (imageUrl) => {
  window.open(imageUrl, '_blank');
};

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

const getDocumentUrl = (carId, docType) => {
  return `/api/cars/${carId}/documents/${docType}`;
};

const handleImageError = (event) => {
  // Set placeholder image on error
  event.target.src = '/logo.png';
};

const openRejectModal = (car) => {
  selectedCar.value = car;
  showRejectModal.value = true;
};

const openContractModal = (car) => {
  selectedCar.value = car;
  // Generate contract number
  const date = new Date();
  const randomNum = Math.floor(Math.random() * 1000);
  contractNumber.value = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${randomNum}`;
  showContractModal.value = true;
};

const printContract = () => {
  window.print();
};

const downloadContract = () => {
  // Create contract content as text
  const contractContent = document.querySelector('.max-h-[75vh]').innerText;
  const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HopDongMuonXe_${selectedCar.value?.owner?.fullName}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  toast.success('Đã tải xuống hợp đồng');
};

onMounted(() => {
  fetchCars();
});
</script>

<style scoped>
/* Print styles for contract */
@media print {
  .fixed {
    position: static !important;
  }
  
  .max-w-6xl {
    max-width: none !important;
    width: 100% !important;
  }
  
  .bg-gray-600 {
    background: none !important;
  }
  
  .bg-opacity-50 {
    opacity: 1 !important;
  }
  
  .overflow-y-auto {
    overflow: visible !important;
  }
  
  .max-h-\[75vh\] {
    max-height: none !important;
  }
  
  .flex.justify-end.space-x-3 {
    display: none !important;
  }
  
  .flex.justify-between.items-center.mb-4 button {
    display: none !important;
  }
  
  body {
    font-family: 'Times New Roman', serif !important;
    font-size: 12pt;
    line-height: 1.5;
  }
  
  .text-2xl {
    font-size: 18pt !important;
  }
  
  .text-lg {
    font-size: 14pt !important;
  }
  
  .text-xl {
    font-size: 16pt !important;
  }
  
  .grid.grid-cols-2 {
    page-break-inside: avoid;
  }
  
  .mb-8 {
    margin-bottom: 20pt !important;
  }
  
  .mt-12 {
    margin-top: 30pt !important;
  }
  
  .border-t-2 {
    border-top: 2pt solid black !important;
  }
}
</style>
