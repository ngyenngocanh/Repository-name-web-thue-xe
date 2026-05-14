<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Đang tải thông tin xe...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Không thể tải thông tin xe</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="goBack" class="btn btn-primary">
          Quay lại
        </button>
      </div>

      <!-- Car Details -->
      <div v-else-if="car" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Chi tiết xe</h1>
          </div>
          <div class="flex items-center space-x-2">
            <span :class="getStatusBadgeClass(car.status)" class="badge">
              {{ getStatusLabel(car.status) }}
            </span>
            <button
              @click="openStatusModal"
              class="btn btn-outline btn-sm text-green-600 border-green-300 hover:bg-green-50"
            >
              Đổi trạng thái
            </button>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Car Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Car Images -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Hình ảnh xe</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(image, index) in car.images" :key="index" class="relative">
                  <img
                    :src="getCarImageUrl(car, index)"
                    :alt="`${car.brand} ${car.model} - ${index + 1}`"
                    @error="handleImageError"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                  <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {{ index + 1 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Car Information -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Thông tin xe</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Hãng sản xuất</p>
                  <p class="font-medium">{{ car.brand }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Dòng xe</p>
                  <p class="font-medium">{{ car.model }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Biển số xe</p>
                  <p class="font-medium">{{ car.licensePlate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Năm sản xuất</p>
                  <p class="font-medium">{{ car.year }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Màu sắc</p>
                  <p class="font-medium">{{ car.color }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Số chỗ ngồi</p>
                  <p class="font-medium">{{ car.seats }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Loại xe</p>
                  <p class="font-medium">{{ car.type }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Hộp số</p>
                  <p class="font-medium">{{ car.transmission }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Nhiên liệu</p>
                  <p class="font-medium">{{ car.fuel }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Số km đã đi</p>
                  <p class="font-medium">{{ car.mileage || 0 }} km</p>
                </div>
              </div>
              
              <div class="mt-4">
                <p class="text-sm text-gray-600">Mô tả</p>
                <p class="font-medium">{{ car.description || 'Chưa có mô tả' }}</p>
              </div>
            </div>

            <!-- Features -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Tiện ích</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="feature in car.features" :key="feature" class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm">{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Giấy tờ xe</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="car.documents?.registration" class="border rounded-lg p-4">
                  <h3 class="font-medium mb-2">Giấy đăng ký xe</h3>
                  <button @click="viewDocument('registration')" class="text-blue-600 hover:text-blue-800 text-sm">
                    Xem giấy tờ
                  </button>
                </div>
                <div v-if="car.documents?.insurance" class="border rounded-lg p-4">
                  <h3 class="font-medium mb-2">Bảo hiểm xe</h3>
                  <button @click="viewDocument('insurance')" class="text-blue-600 hover:text-blue-800 text-sm">
                    Xem giấy tờ
                  </button>
                </div>
              </div>
            </div>

            <!-- Contract Button -->
            <div v-if="car.status === 'approved' || car.status === 'available'" class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Hợp đồng</h2>
              <p class="text-gray-600 mb-4">Xem và tải xuống hợp đồng mượn xe của bạn</p>
              <button
                @click="viewContract"
                class="btn btn-primary w-full text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clip-rule="evenodd"/>
                </svg>
                Xem hợp đồng
              </button>
            </div>
          </div>

          <!-- Right Column - Stats & Actions -->
          <div class="space-y-6">
            <!-- Pricing -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Giá thuê</h2>
              <div class="text-2xl font-bold text-primary-600">
                {{ formatPrice(car.pricePerDay) }}
                <span class="text-sm font-normal text-gray-600">/ngày</span>
              </div>
              <div class="mt-2 text-sm text-gray-600">
                Tiền cọc: {{ formatPrice(car.deposit) }}
              </div>
            </div>

            <!-- Statistics -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Thống kê</h2>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Tổng chuyến</span>
                  <span class="font-medium">{{ car.totalTrips || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Doanh thu</span>
                  <span class="font-medium text-green-600">{{ formatPrice(car.totalRevenue || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Đánh giá</span>
                  <div class="flex items-center">
                    <span class="font-medium">{{ car.rating?.average?.toFixed(1) || '0.0' }}</span>
                    <svg class="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-xs text-gray-500 ml-1">({{ car.rating?.count || 0 }} đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold mb-4">Thao tác nhanh</h2>
              <div class="space-y-3">
                <button
                  @click="editCar"
                  class="btn btn-outline w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  Chỉnh sửa thông tin
                </button>
                <button
                  @click="viewRentalHistory"
                  class="btn btn-outline w-full text-green-600 border-green-300 hover:bg-green-50"
                >
                  <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  Lịch sử thuê
                </button>
                <button
                  @click="viewSettlement"
                  class="btn btn-outline w-full text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  Quyết toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Change Modal -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-5 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white"
        >
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-900">Đổi Trạng Thái Xe</h3>
              <button
                @click="showStatusModal = false"
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

            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-4">
                Xe: <strong>{{ car?.brand }} {{ car?.model }}</strong> ({{ car?.licensePlate }})
              </p>
              <p class="text-sm text-gray-600 mb-4">
                Trạng thái hiện tại: <span class="font-medium" :class="getStatusBadgeClass(car?.status)">{{ getStatusLabel(car?.status) }}</span>
              </p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Chọn trạng thái mới:</label>
              <div class="space-y-3">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedStatus === 'available' ? 'bg-green-50 border-green-500' : 'border-gray-300'">
                  <input
                    type="radio"
                    v-model="selectedStatus"
                    value="available"
                    class="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-green-700">Sẵn sàng</div>
                    <div class="text-sm text-gray-600">Xe sẵn sàng cho thuê</div>
                  </div>
                </label>

                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedStatus === 'maintenance' ? 'bg-yellow-50 border-yellow-500' : 'border-gray-300'">
                  <input
                    type="radio"
                    v-model="selectedStatus"
                    value="maintenance"
                    class="mr-3 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-yellow-700">Bảo trì</div>
                    <div class="text-sm text-gray-600">Xe đang bảo trì định kỳ</div>
                  </div>
                </label>

                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedStatus === 'repair' ? 'bg-red-50 border-red-500' : 'border-gray-300'">
                  <input
                    type="radio"
                    v-model="selectedStatus"
                    value="repair"
                    class="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-red-700">Sửa chữa</div>
                    <div class="text-sm text-gray-600">Xe đang sửa chữa</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="showStatusModal = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                @click="updateCarStatus"
                :disabled="!selectedStatus || selectedStatus === car?.status"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const car = ref(null);
const showStatusModal = ref(false);
const selectedStatus = ref("");

// Fetch car details
const fetchCarDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log('Fetching car details for ID:', route.params.id);
    console.log('Calling endpoint: /cars/' + route.params.id + '/manage');
    const response = await api.get(`/cars/${route.params.id}/manage`);
    console.log('Car details response:', response.data);
    console.log('Response status:', response.status);
    
    car.value = response.data.car || response.data;
    
    // Temporarily skip frontend ownership check - let backend handle it
    // const ownerId = car.value.owner._id || car.value.owner;
    // const userId = authStore.user.id;
    
    console.log('Ownership check:', {
      // ownerId,
      // userId,
      ownerType: typeof car.value.owner,
      // ownerIdType: typeof ownerId,
      // userIdType: typeof userId
      backendResponse: response.data
    });
    
    // if (ownerId !== userId) {
    //   error.value = "Bạn không có quyền xem thông tin xe này";
    //   return;
    // }
    
    selectedStatus.value = car.value.status;
    console.log('Car details loaded successfully');
  } catch (err) {
    console.error('Error fetching car details:', err);
    console.error('Error response:', err.response);
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    
    if (err.response?.status === 403) {
      error.value = "Bạn không có quyền xem thông tin xe này";
    } else if (err.response?.status === 404) {
      error.value = "Không tìm thấy xe";
    } else {
      error.value = err.response?.data?.message || "Không thể tải thông tin xe. Vui lòng thử lại sau.";
    }
  } finally {
    loading.value = false;
  }
};

// Status functions
const openStatusModal = () => {
  showStatusModal.value = true;
};

const updateCarStatus = async () => {
  if (!selectedStatus.value || selectedStatus.value === car.value.status) return;
  
  try {
    await api.put(`/cars/${car.value._id}/status`, {
      status: selectedStatus.value
    });
    
    toast.success('Cập nhật trạng thái xe thành công');
    car.value.status = selectedStatus.value;
    showStatusModal.value = false;
  } catch (error) {
    toast.error('Không thể cập nhật trạng thái xe');
  }
};

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    approved: "Đã duyệt",
    pending: "Chờ duyệt",
    rejected: "Bị từ chối",
    available: "Sẵn sàng",
    maintenance: "Bảo trì",
    repair: "Sửa chữa",
    inactive: "Không hoạt động",
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    approved: "badge-success",
    pending: "badge-warning",
    rejected: "badge-error",
    available: "badge-success",
    maintenance: "badge-warning",
    repair: "badge-error",
    inactive: "badge-info",
  };
  return classes[status] || "badge-info";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
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

const handleImageError = (event) => {
  event.target.src = '/logo.png';
};

// Navigation functions
const goBack = () => {
  // If in driver dashboard, go back to /driver/cars, otherwise /my-cars
  const redirectPath = route.path.startsWith('/driver') ? '/driver/cars' : '/my-cars'
  router.push(redirectPath);
};

const editCar = () => {
  console.log('Edit car clicked:', {
    carValue: car.value,
    carId: car.value?._id,
    carExists: !!car.value,
    carIdType: typeof car.value?._id
  });
  
  if (!car.value || !car.value._id) {
    console.error('Car data not available for editing');
    toast.error('Dữ liệu xe chưa sẵn sàng để chỉnh sửa');
    return;
  }
  
  // If in driver dashboard, use /driver/cars/add?id=xxx (edit mode), otherwise /edit-car/xxx
  const editPath = route.path.startsWith('/driver') 
    ? `/driver/cars/add?id=${car.value._id}` 
    : `/edit-car/${car.value._id}`;
  console.log('Navigating to edit car:', editPath);
  router.push(editPath);
};

const viewRentalHistory = () => {
  router.push(`/car-history/${car.value._id}`);
};

const viewSettlement = () => {
  router.push(`/car-settlement/${car.value._id}`);
};

const viewDocument = (docType) => {
  window.open(`/api/cars/${car.value._id}/documents/${docType}`, '_blank');
};

const viewContract = () => {
  // If in driver dashboard, use /driver/cars/:id/contract, otherwise /car-contract/:id
  const contractPath = route.path.startsWith('/driver')
    ? `/driver/cars/${car.value._id}/contract`
    : `/car-contract/${car.value._id}`;
  router.push(contractPath);
};

onMounted(() => {
  fetchCarDetails();
});
</script>

<style scoped>
.badge {
  @apply px-2 py-1 text-xs font-semibold rounded-full;
}

.badge-success {
  @apply bg-green-100 text-green-800;
}

.badge-warning {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-error {
  @apply bg-red-100 text-red-800;
}

.badge-info {
  @apply bg-blue-100 text-blue-800;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}
</style>
