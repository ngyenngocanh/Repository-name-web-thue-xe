<template>
  <div class="space-y-6">
    <div
      class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p class="text-gray-500 mt-1">
          Quản lý thông tin tài xế và xác thực của bạn
        </p>
      </div>
      <div
        class="px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold flex items-center"
      >
        <span
          class="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"
        ></span>
        {{ user?.isVerified ? "Tài khoản đã xác minh" : "Đang chờ xác minh" }}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Avatar & Quick Actions -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="text-center">
            <div class="relative inline-block group">
              <div
                class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4 bg-gray-100 ring-4 ring-primary-50"
              >
                <img
                  v-if="getUserAvatarUrl(user?._id, user?.avatar)"
                  :src="getUserAvatarUrl(user?._id, user?.avatar)"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                />
                <div
                  v-if="!getUserAvatarUrl(user?._id, user?.avatar)"
                  class="w-full h-full flex items-center justify-center text-primary-300"
                >
                  <svg
                    class="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
              <button
                @click="$refs.avatarInput.click()"
                class="absolute bottom-4 right-0 bg-primary-600 text-white rounded-full p-2.5 shadow-lg transform translate-x-2 -translate-y-2 hover:scale-110 transition-all border-2 border-white"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
              </button>
            </div>

            <h2 class="text-xl font-bold text-gray-900 mt-2">
              {{ user?.fullName || "Tài xế" }}
            </h2>
            <p class="text-gray-500 text-sm">{{ user?.email }}</p>

            <div class="mt-6 grid grid-cols-2 gap-4">
              <div class="p-3 bg-gray-50 rounded-xl">
                <p
                  class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1"
                >
                  Đánh giá
                </p>
                <div class="flex items-center justify-center text-yellow-500">
                  <span class="font-bold text-lg mr-1">{{
                    user?.rating?.average?.toFixed(1) || "5.0"
                  }}</span>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
              </div>
              <div class="p-3 bg-gray-50 rounded-xl">
                <p
                  class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1"
                >
                  Chuyến
                </p>
                <p class="font-bold text-lg text-gray-900">
                  {{ user?.totalTrips?.asOwner || 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Thông tin bằng lái
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Hạng bằng lái:</span>
              <span
                class="font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg"
                >{{ user?.driverInfo?.licenseClass || "B2" }}</span
              >
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Kinh nghiệm:</span>
              <span class="font-medium text-gray-900">{{
                user?.driverInfo?.experience
                  ? user.driverInfo.experience + " năm"
                  : "3 năm"
              }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Giấy phép:</span>
              <span class="font-medium text-gray-900">{{
                user?.driverInfo?.driverLicense
              }}</span>
            </div>
          </div>
        </div>
        <div v-if="user?.contract?.isAgreed" class="bg-indigo-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
          <h3 class="font-bold text-indigo-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Hợp đồng Điện tử
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-start text-sm">
              <span class="text-indigo-700/70">Trạng thái:</span>
              <span class="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg text-right">Đã ký xác nhận<br><span class="text-[10px]">{{ new Date(user.contract.agreedAt).toLocaleDateString() }}</span></span>
            </div>
            <button @click="downloadContract" class="w-full mt-2 py-3 bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center group shadow-sm">
              <svg class="w-4 h-4 mr-2 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Tải File PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Personal Information Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <svg
              class="w-6 h-6 mr-2 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Thông tin cá nhân
          </h3>

          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Họ và tên</label
                >
                <input
                  v-model="profileForm.fullName"
                  type="text"
                  class="input bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl py-3 px-4 w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Email</label
                >
                <input
                  v-model="profileForm.email"
                  type="email"
                  class="input bg-gray-100 border-gray-200 cursor-not-allowed rounded-xl py-3 px-4 w-full"
                  disabled
                />
                <p
                  class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest px-1"
                >
                  Email không thể thay đổi
                </p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Số điện thoại</label
                >
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Ngày sinh</label
                >
                <input
                  v-model="profileForm.dateOfBirth"
                  type="date"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Số CCCD/CMND</label
                >
                <input
                  v-model="profileForm.idCardNumber"
                  type="text"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                  placeholder="Số CCCD (12 chữ số)"
                />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                type="submit"
                class="btn btn-primary px-10 py-3 rounded-xl shadow-lg shadow-primary-100 flex items-center"
                :disabled="updating"
              >
                <span v-if="updating" class="spinner mr-2"></span>
                {{ updating ? "Đang lưu..." : "Lưu thay đổi" }}
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center text-green-700">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Tài khoản nhận lương & hoa hồng
          </h3>

          <form @submit.prevent="updateProfile" class="space-y-6 mt-6">
            <div class="space-y-5">
              <!-- Tên ngân hàng -->
              <div class="relative group">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-green-600 transition-colors">Tên ngân hàng</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  </div>
                  <select
                    v-model="profileForm.bankName"
                    class="appearance-none w-full pl-12 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all cursor-pointer shadow-sm"
                    required
                  >
                    <option value="" disabled selected class="text-gray-400 font-medium">-- Vui lòng chọn ngân hàng --</option>
                    <option v-for="bank in vietnamBanks" :key="bank" :value="bank" class="font-medium">{{ bank }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Số tài khoản -->
                <div class="relative group">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-green-600 transition-colors">Số tài khoản</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    </div>
                    <input
                      v-model="profileForm.accountNumber"
                      type="text"
                      class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-black text-green-700 text-lg tracking-wider focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
                      placeholder="VD: 1903567890"
                    />
                  </div>
                </div>

                <!-- Tên chủ tài khoản -->
                <div class="relative group">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-green-600 transition-colors">Tên chủ tài khoản</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <input
                      v-model="profileForm.accountName"
                      type="text"
                      placeholder="NGUYEN VAN A"
                      class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all uppercase shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                type="submit"
                class="btn bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-black px-10 py-3.5 rounded-2xl shadow-lg shadow-green-200 uppercase tracking-widest flex items-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="updating"
              >
                <span v-if="updating" class="loading loading-spinner loading-sm mr-2"></span>
                {{ updating ? "Đang lưu..." : "Cập nhật ngân hàng" }}
              </button>
            </div>
          </form>
        </div>        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3
            class="text-lg font-bold text-gray-900 mb-6 flex items-center text-red-700"
          >
            <svg
              class="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Bảo mật
          </h3>

          <form @submit.prevent="changePassword" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Mật khẩu hiện tại</label
                >
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Mật khẩu mới</label
                >
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >Xác nhận mật khẩu</label
                >
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="input bg-gray-50 border-gray-200 focus:bg-white rounded-xl py-3 px-4 w-full"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                type="submit"
                class="btn bg-gray-900 text-white hover:bg-black px-10 py-3 rounded-xl shadow-lg shadow-gray-100 flex items-center transition-all"
                :disabled="changingPassword"
              >
                <span v-if="changingPassword" class="spinner mr-2"></span>
                {{ changingPassword ? "Đang cập nhật..." : "Đổi mật khẩu" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import { generateContractPDF } from "@/utils/contractGenerator";

const downloadContract = () => {
  if (user.value) {
    generateContractPDF(user.value);
  }
};

const vietnamBanks = [
  "Vietcombank (Ngân hàng Ngoại thương VN)",
  "Techcombank (Ngân hàng Kỹ Thương VN)",
  "MBBank (Ngân hàng Quân Đội)",
  "VietinBank (Ngân hàng Công Thương VN)",
  "BIDV (Ngân hàng Đầu tư và Phát triển VN)",
  "Agribank (Ngân hàng NN&PTNT VN)",
  "ACB (Ngân hàng Á Châu)",
  "TPBank (Ngân hàng Tiên Phong)",
  "VPBank (Ngân hàng VN Thịnh Vượng)",
  "Sacombank (Ngân hàng Sài Gòn Thương Tín)",
  "VIB (Ngân hàng Quốc tế VN)",
  "SeABank (Ngân hàng Đông Nam Á)",
  "OCB (Ngân hàng Phương Đông)",
  "MSB (Ngân hàng Hàng Hải VN)",
  "SHB (Ngân hàng Sài Gòn - Hà Nội)",
  "HDBank (Ngân hàng Phát triển TP.HCM)",
  "Eximbank (Ngân hàng XNK VN)",
  "SCB (Ngân hàng Sài Gòn)",
  "Nam A Bank (Ngân hàng Nam Á)",
  "LPBank (Ngân hàng Lộc Phát VN)",
  "Bac A Bank (Ngân hàng Bắc Á)",
  "PVcomBank (Ngân hàng Đại chúng VN)",
  "VietABank (Ngân hàng Việt Á)",
  "NCB (Ngân hàng Quốc Dân)",
  "DongA Bank (Ngân hàng Đông Á)",
  "OceanBank (Ngân hàng Đại Dương)",
  "CBBank (Ngân hàng Xây dựng VN)",
  "BaoViet Bank (Ngân hàng Bảo Việt)",
  "PGBank (Ngân hàng Xăng dầu Petrolimex)",
  "Vietbank (Ngân hàng Việt Nam Thương Tín)"
];

const authStore = useAuthStore();
const toast = useToast();

const updating = ref(false);
const changingPassword = ref(false);
const user = computed(() => authStore.user);
const avatarInput = ref(null);

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const fd = new FormData();
    fd.append('avatar', file);
    await api.put('/auth/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await authStore.fetchUser();
    toast.success('Cập nhật ảnh đại diện thành công');
  } catch (err) {
    toast.error('Cập nhật ảnh đại diện thất bại');
  }
}

// Hàm lấy URL avatar - kiểm tra nếu có binary data thì dùng API, nếu không thì dùng URL
const getUserAvatarUrl = (userId, avatarData) => {
  if (!userId) return null
  // Nếu avatarData là string URL, dùng trực tiếp
  if (avatarData && typeof avatarData === 'string') {
    if (avatarData.startsWith('http') || avatarData.startsWith('data:')) return avatarData
    if (avatarData.startsWith('/api/')) return avatarData
    return `http://localhost:3000${avatarData}`
  }
  // Nếu có avatar nhưng không phải URL string -> gọi API binary
  if (avatarData) {
    return `/api/users/${userId}/avatar`
  }
  return null
}

const profileForm = ref({
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  idCardNumber: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
});





const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const updateProfile = async () => {
  try {
    updating.value = true;
    
    const formData = new FormData();
    formData.append('fullName', profileForm.value.fullName);
    formData.append('phone', profileForm.value.phone);
    formData.append('dateOfBirth', profileForm.value.dateOfBirth);
    formData.append('idCard', JSON.stringify({ number: profileForm.value.idCardNumber }));
    formData.append('driverInfo', JSON.stringify({ idCard: profileForm.value.idCardNumber }));
    formData.append('bankAccount', JSON.stringify({
      bankName: profileForm.value.bankName,
      accountNumber: profileForm.value.accountNumber,
      accountName: profileForm.value.accountName
    }));
    
    const response = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    authStore.user = response.data.user;
    
    // Update form với data mới từ server - gán từng field
    const u = response.data.user;
    profileForm.value.fullName = u.fullName || "";
    profileForm.value.email = u.email || "";
    profileForm.value.phone = u.phone || "";
    profileForm.value.dateOfBirth = u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : "";
    profileForm.value.idCardNumber = u.idCard?.number || u.driverInfo?.idCard || "";
    profileForm.value.bankName = u.bankAccount?.bankName || "";
    profileForm.value.accountNumber = u.bankAccount?.accountNumber || "";
    profileForm.value.accountName = u.bankAccount?.accountName || "";
    
    toast.success("Cập nhật hồ sơ thành công");
  } catch (error) {
    toast.error(error.response?.data?.message || "Cập nhật thất bại");
  } finally {
    updating.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error("Mật khẩu xác nhận không khớp");
    return;
  }

  try {
    changingPassword.value = true;
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    toast.success("Đổi mật khẩu thành công");
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
  } finally {
    changingPassword.value = false;
  }
};

onMounted(async () => {
  // Luôn fetch fresh user data (bao gồm avatar) từ server
  try {
    await authStore.fetchUser();
  } catch (e) { /* ignore */ }
  
  await nextTick();
  
  if (user.value) {
    profileForm.value.fullName = user.value.fullName || "";
    profileForm.value.email = user.value.email || "";
    profileForm.value.phone = user.value.phone || "";
    profileForm.value.dateOfBirth = user.value.dateOfBirth
      ? new Date(user.value.dateOfBirth).toISOString().split("T")[0]
      : "";
    profileForm.value.idCardNumber = user.value.idCard?.number || user.value.driverInfo?.idCard || "";
    profileForm.value.bankName = user.value.bankAccount?.bankName || "";
    profileForm.value.accountNumber = user.value.bankAccount?.accountNumber || "";
    profileForm.value.accountName = user.value.bankAccount?.accountName || "";
  }
});

// Watch user changes để cập nhật form
watch(() => authStore.user, async (newUser) => {
  if (newUser) {
    await nextTick();
    profileForm.value.fullName = newUser.fullName || "";
    profileForm.value.email = newUser.email || "";
    profileForm.value.phone = newUser.phone || "";
    profileForm.value.dateOfBirth = newUser.dateOfBirth ? new Date(newUser.dateOfBirth).toISOString().split("T")[0] : "";
    profileForm.value.idCardNumber = newUser.idCard?.number || newUser.driverInfo?.idCard || "";
    profileForm.value.bankName = newUser.bankAccount?.bankName || "";
    profileForm.value.accountNumber = newUser.bankAccount?.accountNumber || "";
    profileForm.value.accountName = newUser.bankAccount?.accountName || "";
  }
}, { deep: true });
</script>

<style scoped>
.input {
  @apply block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none;
}
.badge {
  @apply px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm;
}
.badge-success {
  @apply bg-green-100 text-green-700;
}
.badge-warning {
  @apply bg-yellow-100 text-yellow-700;
}
</style>
