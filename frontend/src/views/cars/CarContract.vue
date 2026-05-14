<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Hợp Đồng Mượn Xe</h1>
        </div>
        <div class="flex space-x-3">
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
            @click="downloadPDF"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Tải PDF
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Đang tải hợp đồng...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Không thể tải hợp đồng</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="goBack" class="btn btn-primary">
          Quay lại
        </button>
      </div>

      <!-- Contract Content -->
      <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
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
              <p class="mb-2 text-center font-bold text-lg">{{ car?.owner?.fullName || user?.fullName || '[Tên Cộng tác viên]' }}</p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Số CMND/CCCD:</strong> [Số CMND/CCCD]</div>
                <div><strong>Ngày cấp:</strong> [Ngày cấp]</div>
                <div><strong>Nơi cấp:</strong> [Nơi cấp]</div>
                <div><strong>Địa chỉ:</strong> [Địa chỉ thường trú]</div>
                <div><strong>Điện thoại:</strong> {{ car?.owner?.phone || user?.phone || '[Số điện thoại]' }}</div>
                <div><strong>Email:</strong> {{ car?.owner?.email || user?.email || '[Email]' }}</div>
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
                <div><strong>Hãng sản xuất:</strong> {{ car?.brand || '...' }}</div>
                <div><strong>Dòng xe:</strong> {{ car?.model || '...' }}</div>
                <div><strong>Biển số xe:</strong> {{ car?.licensePlate || '...' }}</div>
                <div><strong>Năm sản xuất:</strong> {{ car?.year || '...' }}</div>
                <div><strong>Màu sắc:</strong> {{ car?.color || '...' }}</div>
                <div><strong>Số chỗ ngồi:</strong> {{ car?.seats || '...' }}</div>
                <div><strong>Loại xe:</strong> {{ car?.type || '...' }}</div>
                <div><strong>Số km đã đi:</strong> {{ car?.mileage || '...' }} km</div>
                <div class="col-span-2"><strong>Tình trạng xe:</strong> Tốt, hoạt động bình thường</div>
              </div>
            </div>
          </div>

          <!-- Contract Terms (Summary for CTV) -->
          <div class="mb-8 max-w-4xl mx-auto">
            <h3 class="text-lg font-bold mb-6 text-center uppercase">Điều Khoản Chính</h3>
            
            <div class="space-y-6 text-justify">
              <div class="bg-white p-4 rounded-lg border">
                <h4 class="font-bold mb-3">1. Thời Hạn Hợp Đồng</h4>
                <p class="text-sm leading-relaxed pl-6">12 tháng kể từ ngày ký. Sau thời hạn này, hai bên có thể gia hạn nếu có sự đồng thuận bằng văn bản.</p>
              </div>
              
              <div class="bg-white p-4 rounded-lg border">
                <h4 class="font-bold mb-3">2. Quyền Lợi Của Bạn</h4>
                <ul class="list-disc ml-6 text-sm space-y-1">
                  <li>Nhận hoa hồng hấp dẫn theo doanh thu</li>
                  <li>Được hỗ trợ kỹ thuật 24/7</li>
                  <li>Được cung cấp ứng dụng quản lý xe miễn phí</li>
                  <li>Được tham gia các chương trình đào tạo chuyên nghiệp</li>
                </ul>
              </div>
              
              <div class="bg-white p-4 rounded-lg border">
                <h4 class="font-bold mb-3">3. Hoa Hồng</h4>
                <div class="p-3 bg-indigo-50 rounded-lg text-center mb-3">
                  <p class="text-xs text-indigo-600 mb-1">Tỷ lệ hoa hồng cố định</p>
                  <p class="text-2xl font-black text-indigo-700">30%</p>
                  <p class="text-xs text-indigo-500">trên mỗi đơn thuê xe</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Thanh toán:</strong> Ngày 05 hàng tháng</div>
                  <div><strong>Phương thức:</strong> Chuyển khoản</div>
                </div>
              </div>
              
              <div class="bg-white p-4 rounded-lg border">
                <h4 class="font-bold mb-3">4. Nghĩa Vụ Của Bạn</h4>
                <ul class="list-disc ml-6 text-sm space-y-1">
                  <li>Bảo quản xe cẩn thận, giữ xe sạch sẽ</li>
                  <li>Chỉ sử dụng xe cho mục đích cho thuê</li>
                  <li>Đảm bảo chất lượng dịch vụ ≥ 4.5/5 sao</li>
                  <li>Báo cáo tình hình xe định kỳ</li>
                  <li>Tuân thủ quy định về giá thuê</li>
                </ul>
              </div>
              
              <div class="bg-white p-4 rounded-lg border">
                <h4 class="font-bold mb-3">5. Chi Phí</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="space-y-1">
                    <div><strong>Bảo dưỡng định kỳ:</strong> <span class="text-green-600">Công ty 100%</span></div>
                    <div><strong>Sửa chữa lớn (&gt;2tr):</strong> <span class="text-blue-600">CT 70% - Bạn 30%</span></div>
                  </div>
                  <div class="space-y-1">
                    <div><strong>Sửa chữa nhỏ (≤2tr):</strong> <span class="text-orange-600">Bạn 100%</span></div>
                    <div><strong>Bảo hiểm xe:</strong> <span class="text-green-600">Công ty 100%</span></div>
                  </div>
                </div>
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
                <p class="font-bold">{{ car?.owner?.fullName || user?.fullName || '[Tên Cộng tác viên]' }}</p>
              </div>
            </div>
          </div>

          <!-- Date -->
          <div class="text-center mt-16 mb-8">
            <p class="font-bold">Đã ký tại [Địa điểm], ngày {{ new Date().getDate() }} tháng {{ new Date().getMonth() + 1 }} năm {{ new Date().getFullYear() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import html2pdf from "html2pdf.js";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const car = ref(null);
const contractNumber = ref("");
const user = computed(() => authStore.user);

// Fetch car details for contract
const fetchCarDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log('Fetching car details for contract ID:', route.params.id);
    const response = await api.get(`/cars/${route.params.id}/manage`);
    console.log('Car contract response:', response.data);
    console.log('Response structure:', {
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      hasCar: !!response.data?.car,
      carKeys: response.data?.car ? Object.keys(response.data.car) : [],
      hasOwner: !!response.data?.car?.owner,
      ownerKeys: response.data?.car?.owner ? Object.keys(response.data.car.owner) : []
    });
    
    car.value = response.data.car || response.data;
    
    // Check if car and owner exist
    if (!car.value || !car.value.owner) {
      console.error('Car or owner data missing:', {
        car: car.value,
        owner: car.value?.owner,
        response: response.data
      });
      error.value = "Dữ liệu xe không đầy đủ";
      return;
    }
    
    // Check if user owns this car and car is approved
    const ownerId = car.value.owner._id || car.value.owner;
    const userId = authStore.user.id || authStore.user._id;
    
    console.log('Auth store check:', {
      authStoreUser: authStore.user,
      userKeys: authStore.user ? Object.keys(authStore.user) : [],
      userId: authStore.user?.id,
      user_id: authStore.user?._id,
      finalUserId: userId
    });
    
    // Handle type mismatch - convert both to string
    const ownerIdStr = ownerId && ownerId.toString ? ownerId.toString() : String(ownerId || '');
    const userIdStr = userId && userId.toString ? userId.toString() : String(userId || '');
    
    console.log('Contract ownership check:', {
      carOwnerId: car.value.owner._id,
      carOwnerString: car.value.owner,
      extractedOwnerId: ownerId,
      userId: userId,
      ownerIdStr,
      userIdStr,
      ownerType: typeof car.value.owner,
      ownerIdType: typeof ownerId,
      userIdType: typeof userId,
      comparison: ownerIdStr === userIdStr,
      carStatus: car.value.status,
      authUser: authStore.user
    });
    
    if (ownerIdStr !== userIdStr) {
      console.error('Ownership check failed:', {
        reason: 'ownerIdStr !== userIdStr',
        ownerIdStr,
        userIdStr
      });
      error.value = "Bạn không có quyền xem hợp đồng xe này";
      return;
    }
    
    if (car.value.status !== 'approved' && car.value.status !== 'available') {
      error.value = "Chỉ xe đã được duyệt mới có hợp đồng";
      return;
    }
    
    // Generate contract number
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 1000);
    contractNumber.value = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${randomNum}`;
    console.log('Contract loaded successfully');
  } catch (err) {
    console.error('Error fetching car details for contract:', err);
    console.error('Error response:', err.response);
    
    if (err.response?.status === 403) {
      error.value = "Bạn không có quyền xem hợp đồng xe này";
    } else if (err.response?.status === 404) {
      error.value = "Không tìm thấy xe";
    } else {
      error.value = err.response?.data?.message || "Không thể tải thông tin hợp đồng. Vui lòng thử lại sau.";
    }
  } finally {
    loading.value = false;
  }
};

// Navigation functions
const goBack = () => {
  router.push(`/car-details/${route.params.id}`);
};

const printContract = () => {
  window.print();
};

const downloadPDF = async () => {
  const element = document.querySelector('.max-h-[75vh]');
  if (!element) return;
  const opt = {
    margin:       10,
    filename:     `HopDongMuonXe_${car.value?.owner?.fullName || user.value?.fullName}_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  await html2pdf().set(opt).from(element).save();
  toast.success('Đã tải xuống hợp đồng PDF');
};

onMounted(() => {
  fetchCarDetails();
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
  
  .bg-gray-50 {
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
  
  .flex.justify-between.items-center.mb-8 button {
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

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}
</style>
