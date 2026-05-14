<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-center">
              <div class="relative inline-block">
                <img 
                  v-if="getUserAvatarUrl(user?._id, user?.avatar)" 
                  :src="getUserAvatarUrl(user?._id, user?.avatar)" 
                  :alt="user?.fullName"
                  class="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                >
                <div 
                  v-if="!getUserAvatarUrl(user?._id, user?.avatar)" 
                  class="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4"
                >
                  <span class="text-primary-600 text-3xl font-bold">
                    {{ user?.fullName?.charAt(0) || 'U' }}
                  </span>
                </div>
                <button 
                  @click="$refs.avatarInput.click()"
                  class="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 shadow-lg"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </button>
                <input ref="avatarInput" type="file" class="hidden" accept="image/*" @change="handleAvatarUpload">
              </div>
              
              <h2 class="text-xl font-semibold">{{ user?.fullName }}</h2>
              <p class="text-gray-600 truncate px-2">{{ user?.email }}</p>
              
              <div class="mt-4 flex items-center justify-center">
                <div class="text-yellow-400">⭐</div>
                <span class="ml-1">{{ user?.rating?.average?.toFixed(1) || 'Chưa có đánh giá' }}</span>
              </div>
              
              <div class="mt-4">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="user?.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ user?.isVerified ? '✓ Đã xác minh' : 'Chưa xác minh' }}
                </span>
              </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="mt-6 pt-6 border-t">
              <h3 class="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wider">Thống kê nhanh</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span class="text-gray-600 text-sm">Tổng chuyến đi</span>
                  <span class="font-bold text-gray-900">{{ formattedTotalTrips }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Profile Form -->
          <div class="bg-white rounded-lg shadow p-8 mb-6">
            <h2 class="text-xl font-semibold mb-6 flex items-center">
              <span class="w-1 h-6 bg-primary-600 rounded-full mr-3"></span>
              Thông tin cá nhân
            </h2>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                  <input v-model="profileForm.fullName" type="text" class="input input-bordered w-full rounded-xl" required>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                  <input v-model="profileForm.phone" type="tel" class="input input-bordered w-full rounded-xl" required>
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                  <input v-model="profileForm.dateOfBirth" type="date" class="input input-bordered w-full rounded-xl" required>
                </div>
              </div>

              <!-- Box Địa chỉ -->
              <div class="pt-6 border-t mt-8">
                 <h3 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest text-[11px]">Địa chỉ liên lạc</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                       <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tỉnh/Thành phố</label>
                       <select v-model="profileForm.address.city" class="select select-bordered w-full rounded-xl" required>
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                       </select>
                    </div>
                    <div>
                       <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quận/Huyện</label>
                       <select v-model="profileForm.address.district" class="select select-bordered w-full rounded-xl" :disabled="!filteredWards.length" required>
                          <option value="">Chọn Quận/Huyện</option>
                          <option v-for="ward in filteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể</label>
                    <input v-model="profileForm.address.street" type="text" class="input input-bordered w-full rounded-xl" placeholder="Số nhà, đường/phố, phường/xã...">
                 </div>
              </div>

              <!-- Documentation Section -->
              <div class="pt-8 border-t">
                 <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span class="w-1 h-6 bg-primary-600 rounded-full mr-3"></span>
                    Giấy tờ xác minh
                 </h3>

                 <div class="space-y-8">
                    <!-- ID Card -->
                    <div>
                       <label class="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest text-[11px]">Chứng minh nhân dân / CCCD</label>
                       <div class="mb-4">
                          <input v-model="profileForm.idCard.number" type="text" class="input input-bordered w-full rounded-xl" placeholder="Số CCCD (12 chữ số)">
                       </div>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div class="space-y-2">
                             <p class="text-[10px] font-black text-gray-400 uppercase">Mặt trước</p>
                             <div @click="$refs.idFrontInput.click()" class="relative aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-center">
                                <img v-if="previews.idFront" :src="previews.idFront" class="absolute inset-0 w-full h-full object-cover">
                                <div v-else class="text-center p-4">
                                   <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                   <p class="text-[10px] font-bold text-gray-400">TẢI LÊN MẶT TRƯỚC</p>
                                </div>
                             </div>
                             <input ref="idFrontInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload('idFront', $event)">
                          </div>
                          <div class="space-y-2">
                             <p class="text-[10px] font-black text-gray-400 uppercase">Mặt sau</p>
                             <div @click="$refs.idBackInput.click()" class="relative aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-center">
                                <img v-if="previews.idBack" :src="previews.idBack" class="absolute inset-0 w-full h-full object-cover">
                                <div v-else class="text-center p-4">
                                   <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                   <p class="text-[10px] font-bold text-gray-400">TẢI LÊN MẶT SAU</p>
                                </div>
                             </div>
                             <input ref="idBackInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload('idBack', $event)">
                          </div>
                       </div>
                    </div>

                    <!-- Driving License -->
                    <div>
                       <label class="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest text-[11px]">Bằng lái xe (Ô tô)</label>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <input v-model="profileForm.driverInfo.licenseNumber" type="text" class="input input-bordered w-full rounded-xl" placeholder="Số GPLX">
                          <select v-model="profileForm.driverInfo.licenseClass" class="select select-bordered w-full rounded-xl">
                             <option value="">Hạng bằng</option>
                             <option value="B1">B1</option>
                             <option value="B2">B2</option>
                             <option value="C">C</option>
                             <option value="D">D</option>
                             <option value="E">E</option>
                          </select>
                       </div>
                       <div class="space-y-2">
                          <p class="text-[10px] font-black text-gray-400 uppercase">Ảnh bằng lái (Mặt trước)</p>
                          <div @click="$refs.licenseFrontInput.click()" class="relative aspect-video max-w-sm bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-center">
                             <img v-if="previews.licenseFront" :src="previews.licenseFront" class="absolute inset-0 w-full h-full object-cover">
                             <div v-else class="text-center p-4">
                                <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                <p class="text-[10px] font-bold text-gray-400">TẢI LÊN ẢNH BẰNG LÁI</p>
                             </div>
                          </div>
                          <input ref="licenseFrontInput" type="file" class="hidden" accept="image/*" @change="handleFileUpload('licenseFront', $event)">
                       </div>
                    </div>
                 </div>
              </div>

              <div class="flex justify-end pt-8">
                <button type="submit" class="btn btn-primary px-10 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-200" :disabled="updating">
                  <span v-if="updating" class="spinner mr-2"></span>
                  {{ updating ? 'Đang cập nhật...' : 'Cập nhật Profile' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Password Change -->
          <div class="bg-white rounded-lg shadow p-8 mb-6">
            <h2 class="text-xl font-semibold mb-6">Đổi mật khẩu</h2>
            
            <form @submit.prevent="changePassword" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <input v-model="passwordForm.currentPassword" type="password" class="input input-bordered w-full rounded-xl" required>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                  <input v-model="passwordForm.newPassword" type="password" class="input input-bordered w-full rounded-xl" required minlength="6">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu</label>
                  <input v-model="passwordForm.confirmPassword" type="password" class="input input-bordered w-full rounded-xl" required>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button type="submit" class="btn btn-outline px-8 rounded-xl font-bold uppercase tracking-widest" :disabled="changingPassword">
                  {{ changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const updating = ref(false)
const changingPassword = ref(false)
const locations = ref([])
const user = computed(() => authStore.user)

const formattedTotalTrips = computed(() => {
  const trips = user.value?.totalTrips
  if (typeof trips === 'number') return trips
  if (trips && typeof trips === 'object') {
    return (trips.asRenter || 0) + (trips.asOwner || 0)
  }
  return 0
})

const profileForm = ref({
  fullName: '',
  phone: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    district: ''
  },
  idCard: {
    number: ''
  },
  driverInfo: {
    licenseNumber: '',
    licenseClass: ''
  }
})

const previews = ref({
  idFront: '',
  idBack: '',
  licenseFront: ''
})

const files = ref({
  idFront: null,
  idBack: null,
  licenseFront: null
})

const filteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === profileForm.value.address.city)
  return prov ? prov.wards : []
})

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

watch(() => profileForm.value.address.city, () => {
  profileForm.value.address.district = ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleFileUpload = (type, event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Chỉ chấp nhận file ảnh')
    return
  }
  files.value[type] = file
  const reader = new FileReader()
  reader.onload = (e) => previews.value[type] = e.target.result
  reader.readAsDataURL(file)
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    const fd = new FormData()
    fd.append('avatar', file)
    await api.put('/auth/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await authStore.fetchUser()
    toast.success('Cập nhật ảnh đại diện thành công')
  } catch (err) {
    toast.error('Cập nhật ảnh đại diện thất bại')
  }
}

const updateProfile = async () => {
  try {
    updating.value = true
    const fd = new FormData()
    fd.append('fullName', profileForm.value.fullName)
    fd.append('phone', profileForm.value.phone)
    fd.append('dateOfBirth', profileForm.value.dateOfBirth)
    fd.append('address', JSON.stringify(profileForm.value.address))
    fd.append('idCard', JSON.stringify(profileForm.value.idCard))
    fd.append('driverInfo', JSON.stringify(profileForm.value.driverInfo))

    if (files.value.idFront) fd.append('idCardFront', files.value.idFront)
    if (files.value.idBack) fd.append('idCardBack', files.value.idBack)
    if (files.value.licenseFront) fd.append('drivingLicenseFront', files.value.licenseFront)

    const response = await api.put('/users/profile', fd, {
       headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    authStore.user = response.data.user
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    toast.success('Cập nhật hồ sơ thành công')
    
    const redirectUrl = localStorage.getItem('redirectAfterProfileUpdate')
    if (redirectUrl) {
       localStorage.removeItem('redirectAfterProfileUpdate')
       router.push(redirectUrl)
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Cập nhật thất bại')
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Mật khẩu xác nhận không khớp')
    return
  }
  try {
    changingPassword.value = true
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    toast.success('Đổi mật khẩu thành công')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại')
  } finally {
    changingPassword.value = false
  }
}

watch(user, (u) => {
  if (u) {
    const addr = u.addressId || u.address || {}
    profileForm.value = {
      fullName: u.fullName || u.name || '',
      phone: u.phone || '',
      dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
      address: {
        street: addr.street || '',
        city: addr.province?.name || addr.city || '',
        district: addr.ward?.name || addr.district || ''
      },
      idCard: {
        number: u.idCard?.number || ''
      },
      driverInfo: {
        licenseNumber: u.drivingLicense?.number || u.driverInfo?.licenseNumber || '',
        licenseClass: u.drivingLicense?.type || u.driverInfo?.licenseClass || ''
      }
    }
    previews.value.idFront = u.idCard?.frontImage || ''
    previews.value.idBack = u.idCard?.backImage || ''
    previews.value.licenseFront = u.drivingLicense?.frontImage || ''
  }
}, { immediate: true })

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  try {
    await authStore.fetchUser()
  } catch (err) {
    console.warn('fetchUser failed:', err.message)
  }
  
  try {
    const locRes = await fetch('/data.json')
    locations.value = await locRes.json()
  } catch (err) {}
})
</script>
