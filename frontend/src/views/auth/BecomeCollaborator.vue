<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card">
              <div class="card-header">
                <h1 class="text-2xl font-bold text-gray-900">Yêu cầu trở thành cộng tác viên</h1>
                <p class="text-gray-600">Cung cấp giấy tờ cá nhân. Thông tin xe là tùy chọn (nếu có).</p>
              </div>

        <div class="card-body">
          <form @submit.prevent="submitRequest" class="space-y-8">
            <!-- Personal Documents -->
            <div>
              <h2 class="text-lg font-semibold mb-4">Giấy tờ cá nhân</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-black uppercase tracking-widest text-gray-400">CCCD/CMND (mặt trước)</label>
                  <div @click="$refs.idFrontInput.click()" class="relative aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center group">
                    <img v-if="docPreviews.idFront" :src="docPreviews.idFront" class="w-full h-full object-cover">
                    <div v-else class="text-center p-6">
                      <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" /></svg>
                      <p class="text-[10px] font-bold text-gray-400 uppercase">Tải ảnh CCCD mặt trước</p>
                    </div>
                  </div>
                  <input ref="idFrontInput" type="file" class="hidden" accept="image/*" @change="handleDocUpload($event, 'idFront')">
                </div>

                <div>
                  <label class="block text-xs font-black uppercase tracking-widest text-gray-400">CCCD/CMND (mặt sau)</label>
                  <div @click="$refs.idBackInput.click()" class="relative aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center group">
                    <img v-if="docPreviews.idBack" :src="docPreviews.idBack" class="w-full h-full object-cover">
                    <div v-else class="text-center p-6">
                      <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" /></svg>
                      <p class="text-[10px] font-bold text-gray-400 uppercase">Tải ảnh CCCD mặt sau</p>
                    </div>
                  </div>
                  <input ref="idBackInput" type="file" class="hidden" accept="image/*" @change="handleDocUpload($event, 'idBack')">
                </div>

                <div>
                  <label class="block text-xs font-black uppercase tracking-widest text-gray-400">Bằng lái (nếu có)</label>
                  <div @click="$refs.licenseInput.click()" class="relative aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center group">
                    <img v-if="docPreviews.license" :src="docPreviews.license" class="w-full h-full object-cover">
                    <div v-else class="text-center p-6">
                      <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" /></svg>
                      <p class="text-[10px] font-bold text-gray-400 uppercase">Tải ảnh bằng lái</p>
                    </div>
                  </div>
                  <input ref="licenseInput" type="file" class="hidden" accept="image/*" @change="handleDocUpload($event, 'license')">
                </div>
              </div>

              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú (không bắt buộc)</label>
                <textarea v-model="note" class="input w-full" rows="3" placeholder="Kinh nghiệm, số xe..."></textarea>
              </div>
            </div>

            <!-- Car information removed: car fields are no longer part of CTV request -->

            <!-- E-Contract Signature -->
            <div class="mt-8 border-t pt-8">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Hợp đồng điện tử Liên kết Cộng tác viên</h3>
              <div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4 h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed shadow-inner">
                 <h4 class="font-bold text-center mb-4 uppercase">HỢP ĐỒNG NGUYÊN TẮC HỢP TÁC</h4>
                 <p class="mb-2"><strong>Bên A (Nền tảng):</strong> Web Thuê Xe</p>
                 <p class="mb-2"><strong>Bên B (Đối tác Cộng tác viên):</strong> {{ authStore.user?.fullName || '....................' }}</p>
                 <p class="mb-2">Hai bên thỏa thuận ký kết hợp đồng hợp tác với các điều khoản như sau:</p>
                 <ol class="list-decimal pl-5 mb-4 space-y-2">
                   <li><strong>Phạm vi hợp tác:</strong> Bên B đồng ý đóng vai trò là Cộng tác viên, cung cấp nguồn xe hoặc giới thiệu khách hàng trên nền tảng của Bên A.</li>
                   <li><strong>Quyền và Nghĩa vụ của Bên A:</strong> Cung cấp nền tảng công nghệ, hỗ trợ kết nối khách hàng và đối soát thanh toán chiết khấu kinh doanh định kỳ cho Bên B.</li>
                   <li><strong>Quyền và Nghĩa vụ của Bên B:</strong>
                      <ul class="list-disc pl-5 mt-1 space-y-1">
                         <li>Cung cấp thông tin xe (nếu có) chính xác và trung thực.</li>
                         <li>Không thực hiện các hành vi gian lận ảnh hưởng đến uy tín Nền tảng.</li>
                         <li>Chịu hoàn toàn trách nhiệm pháp lý đối với phương tiện đăng tải.</li>
                      </ul>
                   </li>
                   <li><strong>Phân chia doanh thu:</strong> Theo mức chiết khấu quy định đối với vai trò Cộng tác viên được niêm yết trên ứng dụng tại thời điểm phát sinh giao dịch.</li>
                   <li><strong>Chấm dứt hợp đồng:</strong> Một trong hai bên có quyền chấm dứt hợp đồng báo trước 07 ngày hoặc chấm dứt ngay lập tức nếu bên kia vi phạm.</li>
                   <li><strong>Hiệu lực:</strong> Hợp đồng có hiệu lực ngay khi Bên B ký xác nhận bên dưới.</li>
                 </ol>
              </div>
              
              <div class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                <label class="block text-xs font-black text-indigo-900 uppercase tracking-widest mb-2">Chữ ký điện tử (Gõ đầy đủ Họ và tên)</label>
                <input 
                  v-model="contract.signatureName" 
                  type="text" 
                  class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase"
                  placeholder="VD: NGUYEN VAN A"
                >
                <p v-if="contractError.signatureName" class="mt-1 text-xs text-red-600 font-medium">{{ contractError.signatureName }}</p>
                
                <div class="flex items-start mt-4">
                  <input id="agreeContract" v-model="contract.isAgreed" type="checkbox" class="mt-1.5 h-5 w-5 text-indigo-600 border-indigo-300 rounded cursor-pointer">
                  <label for="agreeContract" class="ml-3 block text-sm text-indigo-900 cursor-pointer font-medium">
                    Tôi đã đọc, hiểu và đồng ý ký xác nhận Hợp đồng hợp tác này.
                  </label>
                </div>
                <p v-if="contractError.isAgreed" class="mt-1 text-xs text-red-600 font-medium">{{ contractError.isAgreed }}</p>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <router-link to="/profile" class="btn btn-outline">Hủy</router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner mr-2"></span>
                Gửi yêu cầu
              </button>
            </div>

            <p v-if="message" class="mt-4 text-sm text-green-600">{{ message }}</p>
            <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const note = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

const docFiles = ref({
  idFront: null,
  idBack: null,
  license: null
})

const docPreviews = ref({
  idFront: '',
  idBack: '',
  license: ''
})

const contract = ref({
  signatureName: '',
  isAgreed: false
})
const contractError = ref({})

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

// Helper: convert data URL to File so we can append to FormData
const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl) return null
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  try {
    return new File([u8arr], filename || 'file.jpg', { type: mime })
  } catch (e) {
    // fallback for environments without File constructor
    const blob = new Blob([u8arr], { type: mime })
    blob.name = filename || 'file.jpg'
    return blob
  }
}

onMounted(async () => {
  // ensure user is loaded
  if (!authStore.user) {
    try { await authStore.fetchUser() } catch (e) { /* ignore */ }
  }

  const user = authStore.user || {}

  // Try to load existing CCCD images from profile (ownerInfo / driverInfo / collaboratorRequest)
  const existing = user.ownerInfo || user.driverInfo || user.collaboratorRequest || {}
  if (existing.idCardFrontImage) {
    docPreviews.value.idFront = existing.idCardFrontImage
    const f = dataURLtoFile(existing.idCardFrontImage, 'cccd-front.jpg')
    if (f) docFiles.value.idFront = f
  }
  if (existing.idCardBackImage) {
    docPreviews.value.idBack = existing.idCardBackImage
    const f = dataURLtoFile(existing.idCardBackImage, 'cccd-back.jpg')
    if (f) docFiles.value.idBack = f
  }
  if (existing.licenseImage) {
    docPreviews.value.license = existing.licenseImage
    const f = dataURLtoFile(existing.licenseImage, 'license.jpg')
    if (f) docFiles.value.license = f
  }
})
const handleDocUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 6 * 1024 * 1024) return toast.error('Ảnh tối đa 6MB')
  docFiles.value[type] = file
  const reader = new FileReader()
  reader.onload = (e) => docPreviews.value[type] = e.target.result
  reader.readAsDataURL(file)
}


const submitRequest = async () => {
  loading.value = true
  error.value = ''
  try {
    contractError.value = {}
    if (!contract.value.signatureName) contractError.value.signatureName = 'Vui lòng gõ họ tên làm chữ ký'
    if (!contract.value.isAgreed) contractError.value.isAgreed = 'Bạn phải đồng ý với hợp đồng'
    if (Object.keys(contractError.value).length > 0) return toast.error('Vui lòng hoàn thành Hợp đồng điện tử')

    const formData = new FormData()
    formData.append('note', note.value)
    formData.append('idCardFrontImage', docFiles.value.idFront)
    formData.append('idCardBackImage', docFiles.value.idBack)
    if (docFiles.value.license) formData.append('licenseImage', docFiles.value.license)
    formData.append('contract', JSON.stringify(contract.value))

    // no car data included — collaborator request based on CCCD and optional license only

    const response = await api.post('/users/become-collaborator', formData)
    message.value = response.data.message || 'Yêu cầu đã gửi'
    await authStore.fetchUser()
    toast.success('Yêu cầu đã gửi. Đang chuyển về hồ sơ...')
    router.push('/profile')
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Lỗi'
  } finally {
    loading.value = false
  }
}
</script>
