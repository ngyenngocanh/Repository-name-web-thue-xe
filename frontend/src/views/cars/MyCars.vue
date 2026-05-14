<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Xe của tôi</h1>
        <router-link to="/add-car" class="btn btn-primary">
          + Thêm xe mới
        </router-link>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-primary-600">
            {{ stats.total }}
          </div>
          <div class="text-gray-600">Tổng số xe</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-green-600">
            {{ stats.approved }}
          </div>
          <div class="text-gray-600">Đã duyệt</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-yellow-600">
            {{ stats.pending }}
          </div>
          <div class="text-gray-600">Chờ duyệt</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-2xl font-bold text-red-600">
            {{ stats.rejected }}
          </div>
          <div class="text-gray-600">Bị từ chối</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="py-4 px-6 text-sm font-medium border-b-2 transition-colors"
              :class="
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
            >
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Cars List -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div v-for="i in 6" :key="i" class="card">
          <div class="skeleton skeleton-image"></div>
          <div class="card-body">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredCars.length === 0" class="text-center py-12">
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
          <path
            d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có xe nào</h3>
        <p class="text-gray-600 mb-4">
          Bắt đầu kiếm thêm thu nhập bằng cách đăng xe cho thuê.
        </p>
        <router-link to="/add-car" class="btn btn-primary">
          Thêm xe đầu tiên
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="car in filteredCars" :key="car._id" class="card">
          <div class="relative">
            <img
              :src="getCarImageUrl(car, 0)"
              :alt="`${car.brand} ${car.model}`"
              class="w-full h-48 object-cover rounded-t-lg"
              @error="handleImageError"
            />
            <div class="absolute top-2 right-2">
              <span class="badge" :class="getStatusBadgeClass(car.status)">
                {{ getStatusLabel(car.status) }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <h3 class="text-lg font-semibold mb-2">
              {{ car.brand }} {{ car.model }}
            </h3>
            <div class="flex items-center text-gray-600 mb-2">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ car.location?.city || car.addressId?.province?.name || '' }}
            </div>
            <div class="flex items-center justify-between mb-4">
              <div class="text-primary-600 font-semibold">
                {{ formatPrice(car.pricePerDay) }}/ngày
              </div>
              <div class="flex items-center gap-2">
                <!-- Rating -->
                <div v-if="car.rating?.count > 0" class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm font-medium">{{ car.rating?.average?.toFixed(1) }}</span>
                </div>
                <span class="text-sm text-gray-500">• {{ car.totalTrips || 0 }} chuyến</span>
              </div>
            </div>

            <div class="flex space-x-2">
              <button
                @click="viewCarDetails(car._id)"
                class="btn btn-outline btn-sm flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Chi tiết
              </button>
              <button
                @click="openStatusModal(car)"
                class="btn btn-outline btn-sm flex-1 text-green-600 border-green-300 hover:bg-green-50"
              >
                Trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="mt-8">
        <Pagination
          :current-page="pagination.page"
          :total-pages="pagination.pages"
          :total="pagination.total"
          @page-change="handlePageChange"
        />
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
              Xe: <strong>{{ selectedCar?.brand }} {{ selectedCar?.model }}</strong> ({{ selectedCar?.licensePlate }})
            </p>
            <!-- Trạng thái phê duyệt -->
            <p class="text-sm text-gray-600 mb-2">
              Trạng thái phê duyệt: <span class="font-medium" :class="getStatusBadgeClass(selectedCar?.approvalStatus || selectedCar?.status)">{{ getStatusLabel(selectedCar?.approvalStatus || selectedCar?.status) }}</span>
            </p>
            <!-- Trạng thái hoạt động -->
            <p class="text-sm text-gray-600 mb-4">
              Trạng thái hoạt động: <span class="font-medium" :class="getOperationalStatusBadgeClass(selectedCar?.operationalStatus)">{{ getOperationalStatusLabel(selectedCar?.operationalStatus) }}</span>
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">Chọn trạng thái hoạt động mới:</label>
            <div class="space-y-3">
              <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedOperationalStatus === 'available' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="selectedOperationalStatus"
                  value="available"
                  class="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-blue-700">Sẵn sàng</div>
                  <div class="text-sm text-gray-600">Xe sẵn sàng cho thuê</div>
                </div>
              </label>

              <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedOperationalStatus === 'rented' ? 'bg-purple-50 border-purple-500' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="selectedOperationalStatus"
                  value="rented"
                  class="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-purple-700">Đang cho thuê</div>
                  <div class="text-sm text-gray-600">Xe đang được thuê</div>
                </div>
              </label>

              <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedOperationalStatus === 'maintenance' ? 'bg-yellow-50 border-yellow-500' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="selectedOperationalStatus"
                  value="maintenance"
                  class="mr-3 text-yellow-600 focus:ring-yellow-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-yellow-700">Bảo dưỡng</div>
                  <div class="text-sm text-gray-600">Xe đang bảo trì định kỳ</div>
                </div>
              </label>

              <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedOperationalStatus === 'repair' ? 'bg-red-50 border-red-500' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="selectedOperationalStatus"
                  value="repair"
                  class="mr-3 text-red-600 focus:ring-red-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-red-700">Sửa chữa</div>
                  <div class="text-sm text-gray-600">Xe đang sửa chữa</div>
                </div>
              </label>

              <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="selectedOperationalStatus === 'inactive' ? 'bg-gray-50 border-gray-500' : 'border-gray-300'">
                <input
                  type="radio"
                  v-model="selectedOperationalStatus"
                  value="inactive"
                  class="mr-3 text-gray-600 focus:ring-gray-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-700">Ngưng hoạt động</div>
                  <div class="text-sm text-gray-600">Xe tạm ngưng hoạt động</div>
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
              @click="updateOperationalStatus"
              :disabled="!selectedOperationalStatus || selectedOperationalStatus === selectedCar?.operationalStatus"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import Pagination from "@/components/common/Pagination.vue";

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const cars = ref([]);
const activeTab = ref("all");
const showStatusModal = ref(false);
const selectedCar = ref(null);
const selectedOperationalStatus = ref("");
const user = computed(() => authStore.user);
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0,
});

const stats = computed(() => {
  const approved = cars.value.filter((car) => car.status === "approved").length;
  const pending = cars.value.filter((car) => car.status === "pending").length;
  const rejected = cars.value.filter((car) => car.status === "rejected").length;

  return {
    total: cars.value.length,
    approved,
    pending,
    rejected,
  };
});

const tabs = computed(() => [
  { key: "all", label: "Tất cả", count: cars.value.length },
  {
    key: "approved",
    label: "Đã duyệt",
    count: cars.value.filter((car) => car.status === "approved").length,
  },
  {
    key: "pending",
    label: "Chờ duyệt",
    count: cars.value.filter((car) => car.status === "pending").length,
  },
  {
    key: "rejected",
    label: "Bị từ chối",
    count: cars.value.filter((car) => car.status === "rejected").length,
  },
]);

const filteredCars = computed(() => {
  if (activeTab.value === "all") return cars.value;
  return cars.value.filter((car) => car.status === activeTab.value);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

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

// Trạng thái hoạt động
const getOperationalStatusLabel = (status) => {
  const labels = {
    available: "Sẵn sàng",
    rented: "Đang cho thuê",
    maintenance: "Bảo dưỡng",
    repair: "Sửa chữa",
    inactive: "Ngưng hoạt động",
  };
  return labels[status] || status || "Chưa xác định";
};

const getOperationalStatusBadgeClass = (status) => {
  const classes = {
    available: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    repair: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const fetchCars = async () => {
  try {
    loading.value = true;
    console.log('MyCars: Fetching cars for user:', authStore.user?.id)
    console.log('MyCars: User role:', authStore.user?.role)
    
    const response = await api.get("/cars/my/listings", {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
      },
    });
    
    console.log('MyCars: Response received:', response.data)
    console.log('MyCars: Cars count:', response.data.cars?.length)
    
    cars.value = response.data.cars || [];
    pagination.value = response.data.pagination;
    
    console.log('MyCars: Cars loaded successfully:', cars.value.length)
  } catch (error) {
    console.error('MyCars: Error fetching cars:', error);
    toast.error("Không thể tải danh sách xe");
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.value.page = page;
  fetchCars();
};

const editCar = (carId) => {
  router.push(`/car-details/${carId}`);
};

const deleteCar = async (carId) => {
  if (!confirm("Bạn có chắc chắn muốn xóa xe này?")) return;

  try {
    await api.delete(`/cars/${carId}`);
    toast.success("Xóa xe thành công");
    fetchCars();
  } catch (error) {
    toast.error("Không thể xóa xe");
  }
};

// Image handling functions
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

// Status change functions
const openStatusModal = (car) => {
  selectedCar.value = car;
  selectedOperationalStatus.value = car.operationalStatus || 'available';
  showStatusModal.value = true;
};

const updateOperationalStatus = async () => {
  if (!selectedCar.value || !selectedOperationalStatus.value) return;
  
  try {
    await api.put(`/cars/${selectedCar.value._id}/operational-status`, {
      operationalStatus: selectedOperationalStatus.value
    });
    
    toast.success('Cập nhật trạng thái hoạt động xe thành công');
    showStatusModal.value = false;
    selectedCar.value = null;
    selectedOperationalStatus.value = '';
    fetchCars();
  } catch (error) {
    toast.error('Không thể cập nhật trạng thái hoạt động xe');
  }
};

// View car details
const viewCarDetails = (carId) => {
  console.log('Navigating to car details for ID:', carId);
  router.push(`/car-details/${carId}`);
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

/* Card styles */
.card {
  @apply bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg;
}

.card-body {
  @apply p-4;
}

.skeleton {
  @apply bg-gray-200 rounded animate-pulse;
}

.skeleton-image {
  @apply h-48;
}

.skeleton-title {
  @apply h-6 w-3/4 mb-2;
}

.skeleton-text {
  @apply h-4 w-full mb-1;
}

.skeleton-text:last-child {
  @apply w-5/6;
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

.text-primary-600 {
  @apply text-blue-600;
}
</style>
