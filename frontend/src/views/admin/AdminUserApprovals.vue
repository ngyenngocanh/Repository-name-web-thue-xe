<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 text-white">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold mb-2">Phê duyệt người dùng</h1>
          <p class="text-blue-100 text-lg">Xác minh và phê duyệt người dùng đăng ký</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="text-2xl font-bold">{{ pendingUsers.length }}</p>
            <p class="text-sm text-blue-100">Chờ phê duyệt</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <UserGroupIcon class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
          <p class="text-sm text-gray-500 mt-1">Chờ duyệt</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-100 rounded-lg">
            <CheckCircleIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.verified }}</p>
          <p class="text-sm text-gray-500 mt-1">Đã xác minh</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
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

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
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
            :class="selectedFilter === filter.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <select v-model="roleFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả vai trò</option>
            <option value="user">Khách hàng</option>
            <option value="owner">Chủ xe</option>
            <option value="driver">Tài xế</option>
            <option value="collaboratorRequest">CTV chờ duyệt</option>
          </select>
        </div>
        <div class="ml-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm người dùng..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Users List -->
    <div class="space-y-4">
      <p v-if="filteredUsers.length === 0" class="text-center text-gray-500 py-12">Không có người dùng nào phù hợp</p>
      <div
        v-for="user in filteredUsers"
        :key="user._id"
        class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <!-- User Info -->
            <div class="flex space-x-6">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span class="text-white font-bold text-xl">{{ user.fullName?.charAt(0) || 'U' }}</span>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-900">{{ user.fullName }}</h3>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getRoleBadgeClass(user.role)">
                    {{ getRoleText(user.role) }}
                  </span>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusBadgeClass(user.isVerified)">
                    {{ user.isVerified ? 'Đã xác minh' : 'Chờ xác minh' }}
                  </span>
                  <span v-if="user.type === 'collaboratorRequest'" class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    Yêu cầu CTV
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Email:</span>
                    <p class="font-medium">{{ user.email }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Số điện thoại:</span>
                    <p class="font-medium">{{ user.phone || 'Chưa có' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Ngày đăng ký:</span>
                    <p class="font-medium">{{ formatDate(user.createdAt) }}</p>
                  </div>
                </div>

                <div class="mt-3">
                  <p class="text-sm text-gray-600">{{ user.address || 'Chưa có địa chỉ' }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col space-y-2 ml-4">
              <!-- CTV Detail button: show when user is an actual collaborator or has a pending CTV request -->
              <button
                v-if="user.type === 'collaboratorRequest' || user.role === 'collaborator'"
                @click="openCollabModal(user)"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
              >
                <CheckCircleIcon class="w-4 h-4 inline mr-1" />
                Chi tiết CTV
              </button>

              <!-- Standard verify/reject for all other non-CTV users -->
              <template v-if="user.type !== 'collaboratorRequest' && user.role !== 'collaborator'">
                <button
                  v-if="!user.isVerified"
                  @click="verifyUser(user)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircleIcon class="w-4 h-4 inline mr-1" />
                  Xác minh
                </button>
                <button
                  v-if="!user.isVerified"
                  @click="openRejectModal(user)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <XCircleIcon class="w-4 h-4 inline mr-1" />
                  Từ chối
                </button>
                <span v-if="user.isVerified" class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">✓ Đã duyệt</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Từ chối {{ selectedUser?.fullName || 'người dùng' }}</h3>
          <div v-if="!showRejectReasonInput" class="py-8 text-center">
            <XCircleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p class="text-lg font-semibold mb-2">Xác nhận từ chối?</p>
            <p class="text-gray-600 mb-6">Người dùng sẽ nhận thông báo từ chối.</p>
            <div class="flex justify-center space-x-3">
              <button @click="showRejectModal = false; rejectionReason = ''" class="px-6 py-2 border rounded-lg text-gray-700">Hủy</button>
              <button @click="showRejectReasonInput = true" class="px-6 py-2 bg-red-600 text-white rounded-lg">Tiếp tục từ chối</button>
            </div>
          </div>
          <form v-else @submit.prevent="rejectUser">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối <span class="text-red-500">*</span></label>
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
              <button type="button" @click="showRejectReasonInput = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Quay lại</button>
              <button type="submit" :disabled="!rejectionReason.trim()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Từ chối</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Collaborator Review Modal – Full detail -->
    <div v-if="showCollabModal && collabSelected" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-3xl text-white">
          <div>
            <h3 class="text-2xl font-black">{{ collabSelected.fullName }}</h3>
            <p class="text-purple-200 text-sm mt-1">{{ collabSelected.email }} · {{ collabSelected.phone || 'Chưa có SĐT' }}</p>
            <div class="flex items-center gap-3 mt-3">
              <span class="px-3 py-1 rounded-full text-xs font-black uppercase"
                :class="collabSelected.collaboratorRequest?.status === 'pending' ? 'bg-yellow-400 text-yellow-900' : collabSelected.collaboratorRequest?.status === 'approved' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'"
              >
                {{ collabSelected.collaboratorRequest?.status === 'pending' ? 'Chờ duyệt' : collabSelected.collaboratorRequest?.status === 'approved' ? 'Đã duyệt' : 'Từ chối' }}
              </span>
              <span class="text-xs text-purple-200 font-bold">Gửi lúc: {{ collabSelected.collaboratorRequest?.requestedAt ? new Date(collabSelected.collaboratorRequest.requestedAt).toLocaleDateString('vi-VN') : '—' }}</span>
            </div>
          </div>
          <button @click="showCollabModal = false" class="text-white/70 hover:text-white p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          <!-- Thông tin cá nhân -->
          <div>
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin cá nhân</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 rounded-2xl p-4">
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Họ tên</p>
                <p class="font-bold mt-0.5">{{ collabSelected.fullName }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Email</p>
                <p class="font-bold mt-0.5">{{ collabSelected.email }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Điện thoại</p>
                <p class="font-bold mt-0.5">{{ collabSelected.phone || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Ngày sinh</p>
                <p class="font-bold mt-0.5">{{ collabSelected.dateOfBirth ? new Date(collabSelected.dateOfBirth).toLocaleDateString('vi-VN') : '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Vai trò hiện tại</p>
                <p class="font-bold mt-0.5 capitalize">{{ collabSelected.role }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[10px] uppercase font-black">Xác minh</p>
                <p class="font-bold mt-0.5">{{ collabSelected.isVerified ? '✓ Đã xác minh' : 'Chưa xác minh' }}</p>
              </div>
              <div class="col-span-2 md:col-span-3" v-if="collabSelected.collaboratorRequest?.note">
                <p class="text-gray-400 text-[10px] uppercase font-black">Ghi chú từ CTV</p>
                <p class="font-medium mt-0.5 text-gray-700 italic">"{{ collabSelected.collaboratorRequest.note }}"</p>
              </div>
            </div>
          </div>

          <!-- Giấy tờ CCCD -->
          <div>
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">CCCD / CMND</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="collabSelected.collaboratorRequest?.idCardFrontImage" class="space-y-2">
                <p class="text-xs font-black text-gray-600">Mặt trước</p>
                <img 
                  :src="collabSelected.collaboratorRequest.idCardFrontImage" 
                  class="w-full max-h-52 object-contain rounded-xl border-2 border-gray-100 bg-gray-50 cursor-pointer hover:scale-[1.02] transition-transform"
                  @click="openImageFullscreen(collabSelected.collaboratorRequest.idCardFrontImage)"
                />
              </div>
              <div v-if="collabSelected.collaboratorRequest?.idCardBackImage" class="space-y-2">
                <p class="text-xs font-black text-gray-600">Mặt sau</p>
                <img 
                  :src="collabSelected.collaboratorRequest.idCardBackImage" 
                  class="w-full max-h-52 object-contain rounded-xl border-2 border-gray-100 bg-gray-50 cursor-pointer hover:scale-[1.02] transition-transform"
                  @click="openImageFullscreen(collabSelected.collaboratorRequest.idCardBackImage)"
                />
              </div>
              <p v-if="!collabSelected.collaboratorRequest?.idCardFrontImage && !collabSelected.collaboratorRequest?.idCardBackImage" class="text-gray-400 text-sm col-span-2">Chưa có ảnh CCCD</p>
            </div>
          </div>

          <!-- Bằng lái xe -->
          <div v-if="collabSelected.collaboratorRequest?.licenseImage">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bằng lái xe</h4>
            <img 
              :src="collabSelected.collaboratorRequest.licenseImage" 
              class="w-full max-w-xs max-h-52 object-contain rounded-xl border-2 border-gray-100 bg-gray-50 cursor-pointer hover:scale-[1.02] transition-transform"
              @click="openImageFullscreen(collabSelected.collaboratorRequest.licenseImage)"
            />
          </div>

          <!-- Tài liệu bổ sung -->
          <div v-if="collabSelected.collaboratorRequest?.additionalDocs?.length">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tài liệu bổ sung</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <img v-for="(doc, i) in collabSelected.collaboratorRequest.additionalDocs" :key="i"
                :src="doc"
                class="w-full max-h-40 object-contain rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:scale-[1.02] transition-transform"
                @click="openImageFullscreen(doc)"
              />
            </div>
          </div>

          <!-- Xe đăng ký (nếu có) -->
          <div v-if="collabSelected.collaboratorRequest?.carSubmissions?.length">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Xe đăng ký kèm</h4>
            <div v-for="(car, ci) in collabSelected.collaboratorRequest.carSubmissions" :key="ci" class="mb-4 p-4 bg-blue-50 rounded-2xl">
              <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                <div><p class="text-[10px] text-gray-400 uppercase font-black">Hãng</p><p class="font-bold">{{ car.make }}</p></div>
                <div><p class="text-[10px] text-gray-400 uppercase font-black">Dòng xe</p><p class="font-bold">{{ car.model }}</p></div>
                <div><p class="text-[10px] text-gray-400 uppercase font-black">Năm</p><p class="font-bold">{{ car.year }}</p></div>
                <div><p class="text-[10px] text-gray-400 uppercase font-black">Biển số</p><p class="font-bold">{{ car.licensePlate }}</p></div>
              </div>
              <div v-if="car.photos?.length" class="flex gap-2 flex-wrap">
                <img v-for="(ph, pi) in car.photos" :key="pi" :src="ph" class="h-24 w-36 object-cover rounded-xl cursor-pointer" @click="openImageFullscreen(ph)" />
              </div>
            </div>
          </div>

          <!-- Lý do từ chối (nếu đã bị từ chối) -->
          <div v-if="collabSelected.collaboratorRequest?.status === 'rejected' && collabSelected.collaboratorRequest?.reason" class="p-4 bg-red-50 rounded-2xl border border-red-200">
            <p class="text-xs font-black text-red-400 uppercase mb-1">Lý do từ chối</p>
            <p class="text-red-700 font-medium">{{ collabSelected.collaboratorRequest.reason }}</p>
          </div>

          <!-- Hợp đồng điện tử -->
          <div v-if="collabSelected.contract?.isAgreed" class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Hợp đồng điện tử</p>
                <p class="text-indigo-900 font-bold">Chữ ký: <span class="font-black">{{ collabSelected.contract.signatureName }}</span></p>
                <p class="text-indigo-700 text-xs mt-1">Ký lúc: {{ new Date(collabSelected.contract.agreedAt).toLocaleString('vi-VN') }}</p>
              </div>
              <button @click="downloadContractPDF(collabSelected)" class="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors shadow-sm text-sm font-bold flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Tải PDF
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-gray-100 flex justify-between items-center">
          <button @click="showCollabModal = false" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-bold">Đóng</button>
          <div class="flex gap-3" v-if="collabSelected.collaboratorRequest?.status === 'pending'">
            <button @click="rejectCollab" class="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-black transition-all shadow-sm">
              Từ chối CTV
            </button>
            <button @click="approveCollab" class="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-black transition-all shadow-lg shadow-green-200">
              ✓ Phê duyệt CTV
            </button>
          </div>
          <div class="flex gap-3" v-else-if="collabSelected.collaboratorRequest?.status === 'approved'">
            <button @click="rejectCollab" class="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-black transition-all shadow-sm">
              Hủy tư cách CTV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Fullscreen Viewer -->
    <div v-if="fullscreenImage" @click="fullscreenImage = null" class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center cursor-zoom-out p-4">
      <img :src="fullscreenImage" class="max-w-full max-h-full object-contain rounded-xl" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import { generateContractPDF } from '@/utils/contractGenerator'

const toast = useToast()

const users = ref([])
const searchQuery = ref('')
const selectedFilter = ref('pending')
const roleFilter = ref('')

const showRejectModal = ref(false)
const showRejectReasonInput = ref(false)
const selectedUser = ref(null)
const rejectionReason = ref('')

const showCollabModal = ref(false)
const collabSelected = ref(null)
const fullscreenImage = ref(null)

const openImageFullscreen = (src) => { fullscreenImage.value = src }

const downloadContractPDF = (user) => {
  generateContractPDF(user)
}

const statusFilters = [
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'verified' },
  { label: 'Tất cả', value: 'all' }
]

const statsData = ref({ pending: 0, approved: 0, rejected: 0, total: 0 })

// All users that are not yet verified (for header count)
const pendingUsers = computed(() => users.value.filter(u => !u.isVerified || u.type === 'collaboratorRequest'))

const stats = computed(() => ({
  pending: statsData.value.pending || users.value.filter(u => !u.isVerified).length,
  verified: statsData.value.approved || users.value.filter(u => u.isVerified).length,
  rejected: statsData.value.rejected || 0,
  total: statsData.value.total || users.value.length
}))

const filteredUsers = computed(() => {
  let list = [...users.value]

  if (selectedFilter.value === 'pending') list = list.filter(u => !u.isVerified)
  else if (selectedFilter.value === 'verified') list = list.filter(u => u.isVerified)

  if (roleFilter.value === 'collaboratorRequest') {
    list = list.filter(u => u.type === 'collaboratorRequest')
  } else if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      u.phone?.includes(q)
    )
  }

  return list
})

const fetchUsers = async () => {
  try {
    // 1. Load real stats
    try {
      const statsResp = await api.get('/admin/collaborators/stats')
      statsData.value = statsResp.data
    } catch (e) { /* skip */ }

    // 2. Fetch normal users (tagged by collaboratorRequest status)
    const response = await api.get('/admin/users?limit=200')
    const normalUsers = (response.data.users || []).map(u => {
      const isRealCollab = u.collaboratorRequest?.status === 'pending' && 
                           (u.role === 'collaborator' || !!u.collaboratorRequest?.idCardFrontImage)
      return {
        ...u,
        type: isRealCollab ? 'collaboratorRequest' : 'user'
      }
    })

    // 3. Fetch full CTV pending (has images) — deduplicate with normalUsers
    let collabUsers = []
    try {
      const collabResp = await api.get('/admin/collaborators/pending')
      const pendingList = Array.isArray(collabResp.data) ? collabResp.data : []
      const existingIds = new Set(normalUsers.map(u => u._id?.toString()))
      // Replace matching entries in normalUsers with full-data version from CTV endpoint
      pendingList.forEach(ctv => {
        const id = ctv._id?.toString()
        if (existingIds.has(id)) {
          // Update the entry in normalUsers with full image data
          const idx = normalUsers.findIndex(u => u._id?.toString() === id)
          if (idx !== -1) normalUsers[idx] = { ...ctv, type: 'collaboratorRequest' }
        } else {
          collabUsers.push({ ...ctv, type: 'collaboratorRequest' })
        }
      })
    } catch (e) {
      console.warn('Cannot reach /admin/collaborators/pending:', e.message)
    }

    users.value = [...normalUsers, ...collabUsers]
  } catch (error) {
    toast.error('Không thể tải danh sách người dùng')
    console.error(error)
  }
}

const verifyUser = async (user) => {
  try {
    await api.put(`/admin/users/${user._id}/verify`)
    toast.success(`Đã xác minh ${user.fullName}`)
    fetchUsers()
  } catch (error) {
    toast.error('Không thể xác minh người dùng')
  }
}

const openRejectModal = (user) => {
  selectedUser.value = user
  rejectionReason.value = ''
  showRejectReasonInput.value = false
  showRejectModal.value = true
}

const rejectUser = async () => {
  if (!rejectionReason.value.trim()) return
  try {
    await api.put(`/admin/users/${selectedUser.value._id}/status`, { isActive: false })
    toast.success(`Đã từ chối ${selectedUser.value.fullName}`)
    showRejectModal.value = false
    rejectionReason.value = ''
    fetchUsers()
  } catch (error) {
    toast.error('Không thể từ chối người dùng')
  }
}

const openCollabModal = (user) => {
  collabSelected.value = user
  showCollabModal.value = true
}

const approveCollab = async () => {
  try {
    await api.put(`/admin/collaborators/${collabSelected.value._id}/approve`)
    toast.success('Đã phê duyệt yêu cầu cộng tác viên!')
    showCollabModal.value = false
    fetchUsers()
  } catch (error) {
    toast.error('Không thể phê duyệt: ' + (error.response?.data?.message || error.message))
  }
}

const rejectCollab = async () => {
  const reason = prompt('Nhập lý do từ chối CTV:')
  if (reason === null) return
  try {
    await api.put(`/admin/collaborators/${collabSelected.value._id}/reject`, { reason })
    toast.success('Đã từ chối yêu cầu cộng tác viên')
    showCollabModal.value = false
    fetchUsers()
  } catch (error) {
    toast.error('Không thể từ chối: ' + (error.response?.data?.message || error.message))
  }
}

// Helper formatters
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-700',
    owner: 'bg-blue-100 text-blue-700',
    driver: 'bg-green-100 text-green-700',
    collaborator: 'bg-purple-100 text-purple-700',
    user: 'bg-gray-100 text-gray-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

const getRoleText = (role) => {
  const labels = {
    admin: 'Quản trị',
    owner: 'Chủ xe',
    driver: 'Tài xế',
    collaborator: 'Cộng tác viên',
    user: 'Khách hàng'
  }
  return labels[role] || role
}

const getStatusBadgeClass = (isVerified) => {
  return isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
}

onMounted(fetchUsers)
</script>
