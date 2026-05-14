<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 mb-8 border border-white">
        <div class="flex items-center space-x-6">
          <div class="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-200 animate-pulse">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <h1 class="text-3xl font-black text-gray-900 leading-tight">
              {{ isEditMode ? 'Chỉnh sửa xe' : 'Đăng xe cho thuê' }}
            </h1>
            <p class="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
              {{ isEditMode ? 'Cập nhật thông tin xe của bạn' : 'Đưa xe của bạn lên hệ thống chỉ trong vài bước' }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Main Form Container -->
        <div class="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-white">
          <div class="p-10 space-y-12">
            
            <!-- Section 1: Thông tin cơ bản -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Thông tin cơ bản
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Hãng xe *</label>
                  <select v-model="form.brand" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none">
                    <option value="">Chọn hãng</option>
                    <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Dòng xe *</label>
                  <input v-model="form.model" type="text" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all" placeholder="VD: Vios, Civic...">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Biển số *</label>
                  <input v-model="form.licensePlate" type="text" required placeholder="VD: 30A-12345" class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all uppercase">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Năm SX *</label>
                  <input v-model="form.year" type="number" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Màu sắc *</label>
                  <input v-model="form.color" type="text" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all" placeholder="VD: Trắng, Đen...">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Số chỗ *</label>
                  <select v-model="form.seats" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Chọn số chỗ</option>
                    <option value="2">2 chỗ</option>
                    <option value="4">4 chỗ</option>
                    <option value="5">5 chỗ</option>
                    <option value="7">7 chỗ</option>
                    <option value="9">9 chỗ</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Section 2: Đặc điểm kỹ thuật -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Đặc điểm kỹ thuật
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Loại xe *</label>
                  <select v-model="form.type" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Chọn loại</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="pickup">Bán tải</option>
                    <option value="mpv">MPV</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Hộp số *</label>
                  <select v-model="form.transmission" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Chọn hộp số</option>
                    <option value="automatic">Tự động</option>
                    <option value="manual">Số sàn</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nhiên liệu *</label>
                  <select v-model="form.fuel" required class="w-full bg-gray-50 border-0 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Chọn loại</option>
                    <option value="gasoline">Xăng</option>
                    <option value="diesel">Dầu Diesel</option>
                    <option value="electric">Điện</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Section 3: Tình trạng xe -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Tình trạng xe
              </h4>
              <div class="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
                <label class="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2 text-center">Số KM đã đi (Odometer) *</label>
                <div class="relative max-w-xs mx-auto">
                   <input v-model.number="form.mileage" type="number" required min="0" class="w-full bg-white border-0 rounded-[2rem] px-8 py-5 text-2xl font-black text-center text-primary-600 focus:ring-4 focus:ring-primary-100 transition-all shadow-lg" placeholder="0">
                   <span class="absolute right-6 top-6 text-xs font-black text-gray-300">KM</span>
                </div>
              </div>
            </section>

            <!-- Section 4: Tiện nghi -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Tiện nghi & Tính năng
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <label 
                  v-for="opt in availableFeatures" :key="opt.value"
                  class="flex flex-col items-center justify-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all hover:border-primary-200 group relative"
                  :class="form.features.includes(opt.value) ? 'border-primary-600 bg-primary-50 shadow-xl scale-105 z-10' : 'border-gray-50 bg-gray-50 opacity-60'"
                >
                  <input type="checkbox" :value="opt.value" v-model="form.features" class="sr-only">
                  <span class="text-3xl mb-3 transform group-hover:scale-125 transition-transform">{{ opt.emoji }}</span>
                  <span class="text-[9px] font-black uppercase text-center leading-tight tracking-wider text-gray-700">{{ opt.label }}</span>
                  <div v-if="form.features.includes(opt.value)" class="absolute -top-2 -right-2 bg-primary-600 text-white p-1 rounded-full shadow-lg">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  </div>
                </label>
              </div>
            </section>

            <!-- Section 5: Vị trí -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Vị trí đặt xe
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div class="relative">
                    <select v-model="form.location.city" class="w-full pl-6 pr-6 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none shadow-sm" required>
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      <option v-for="prov in locations" :key="prov.province_code" :value="prov.name">{{ prov.name }}</option>
                    </select>
                 </div>
                 <div class="relative">
                    <select v-model="form.location.district" class="w-full pl-6 pr-6 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none shadow-sm" required :disabled="!filteredWards.length">
                      <option value="">Chọn Quận/Huyện</option>
                      <option v-for="ward in filteredWards" :key="ward.ward_code" :value="ward.name">{{ ward.name }}</option>
                    </select>
                 </div>
              </div>
              <div class="mt-4">
                 <textarea v-model="form.location.address" rows="2" class="w-full px-6 py-5 bg-gray-50 rounded-3xl border-0 focus:ring-2 focus:ring-primary-500 transition-all font-bold placeholder:font-medium shadow-sm" placeholder="Số nhà, tên đường cụ thể..." required></textarea>
              </div>
            </section>

            
            <!-- Section 6: Hình ảnh & Chứng từ -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Hình ảnh & Hồ sơ xe
              </h4>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Car Images -->
                <div class="space-y-6">
                  <div class="flex justify-between items-center px-1">
                    <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh chi tiết (2-5 ảnh) *</label>
                    <span class="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{{ imageFiles.length }}/10</span>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <div v-for="i in 6" :key="i" class="aspect-square bg-gray-50 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden group border-2 border-dashed border-gray-100 hover:border-primary-300 hover:bg-white transition-all">
                       <input 
                         @change="(e) => handleImageUploadAtPosition(e, i-1)" 
                         type="file" 
                         accept="image/*" 
                         class="absolute inset-0 opacity-0 z-10 cursor-pointer"
                       >
                       <img v-if="imagePreviews[i-1]" :src="imagePreviews[i-1]" class="w-full h-full object-cover">
                       <div v-else class="text-gray-200 text-3xl font-black">+</div>
                       <div v-if="imagePreviews[i-1]" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <p class="text-[9px] font-black text-white uppercase tracking-tighter">Thay đổi</p>
                       </div>
                       <button 
                         v-if="imagePreviews[i-1]"
                         type="button"
                         @click.stop="removeImage(i-1)"
                         class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center z-20 hover:scale-110 transition-transform shadow-lg"
                       >
                         <span class="text-xs leading-none">×</span>
                       </button>
                    </div>
                  </div>
                </div>

                <!-- Documents -->
                <div class="space-y-6">
                   <div class="p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 shadow-inner">
                      <div class="space-y-6">
                        <div>
                          <label class="block text-[11px] font-black text-blue-900 uppercase tracking-widest mb-3 px-1">Giấy đăng kí xe (Cà vẹt) *</label>
                          <div class="relative h-28 bg-white rounded-[1.5rem] border-2 border-dashed border-blue-200 flex items-center justify-center group overflow-hidden shadow-sm hover:border-blue-500 transition-all">
                             <input @change="handleDocUpload($event, 'registration')" type="file" accept="image/*" class="absolute inset-0 opacity-0 z-10 cursor-pointer">
                             <div class="text-center group-hover:scale-110 transition-transform">
                                <span class="text-3xl">📄</span>
                                <p class="text-[8px] font-black text-blue-600 uppercase mt-2">{{ docFiles.registration?.name || 'Chọn tệp hình ảnh' }}</p>
                             </div>
                             <img v-if="docPreviews.registration" :src="docPreviews.registration" class="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none">
                          </div>
                        </div>
                        <div>
                          <label class="block text-[11px] font-black text-blue-900 uppercase tracking-widest mb-3 px-1">Bảo hiểm xe *</label>
                          <div class="relative h-28 bg-white rounded-[1.5rem] border-2 border-dashed border-blue-200 flex items-center justify-center group overflow-hidden shadow-sm hover:border-blue-500 transition-all">
                             <input @change="handleDocUpload($event, 'insurance')" type="file" accept="image/*" class="absolute inset-0 opacity-0 z-10 cursor-pointer">
                             <div class="text-center group-hover:scale-110 transition-transform">
                                <span class="text-3xl">🛡️</span>
                                <p class="text-[8px] font-black text-blue-600 uppercase mt-2">{{ docFiles.insurance?.name || 'Chọn tệp hình ảnh' }}</p>
                             </div>
                             <img v-if="docPreviews.insurance" :src="docPreviews.insurance" class="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none">
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            <!-- Section 7: Mô tả chi tiết -->
            <section>
              <h4 class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-8 flex items-center">
                <span class="w-10 h-1 bg-primary-100 rounded-full mr-4"></span> Mô tả & Điều khoản
              </h4>
              <div class="relative">
                <textarea v-model="form.description" rows="6" placeholder="Chia sẻ thêm về trải nghiệm lái xe, bảo dưỡng kỳ hạn hoặc bất kỳ lưu ý nào cho người thuê..." class="w-full bg-gray-50 border-0 rounded-[2.5rem] px-8 py-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary-500 transition-all shadow-sm" maxlength="1000"></textarea>
                <div class="absolute bottom-6 right-8 text-[10px] font-black text-gray-300 uppercase">
                  {{ form.description?.length || 0 }} / 1000
                </div>
              </div>
            </section>
          </div>

          <!-- Form Footer -->
          <div class="bg-gray-50 px-10 py-10 border-t border-gray-100 flex justify-between items-center mt-auto">
            <button 
              type="button" 
              @click="router.back()" 
              class="px-8 py-4 bg-white text-gray-400 font-black rounded-2xl border border-gray-100 hover:text-gray-600 hover:bg-gray-100 transition-all uppercase text-[10px] tracking-widest"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              :disabled="submitting"
              class="px-12 py-5 bg-primary-600 text-white font-black rounded-[2rem] shadow-2xl shadow-primary-200 hover:scale-105 transition-all uppercase text-[11px] tracking-widest flex items-center"
            >
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
              {{ submitting ? 'Đang khởi tạo...' : 'Xác nhận đăng xe' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id)
const carId = computed(() => route.params.id)

const submitting = ref(false)
const imageFiles = ref([])
const imagePreviews = ref([])
const locations = ref([])

const docFiles = ref({
  registration: null,
  insurance: null
})

const docPreviews = ref({
  registration: '',
  insurance: ''
})

const brands = ref(['Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Skoda', 'Peugeot', 'Renault', 'Fiat', 'Jeep', 'Land Rover', 'Jaguar', 'Porsche', 'Lexus', 'Infiniti', 'Acura', 'Genesis', 'Cadillac', 'Buick', 'GMC', 'Chevrolet', 'Chrysler', 'Dodge', 'Ram', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren', 'Pagani', 'Koenigsegg', 'Rimac', 'Tesla', 'Rivian', 'Lucid Motors', 'Faraday Future', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'Great Wall Motors', 'BYD', 'Chery', 'JAC Motors', 'BAIC Group', 'Brilliance Auto', 'Dongfeng Motor', 'FAW Group', 'GAC Group', 'Guangqi Honda', 'Guangzhou Automobile', 'Haima Automobile', 'Hawtai Motor', 'Jiangling Motors', 'JMC Heavy Duty Vehicle', 'King Long', 'Lifan Group', 'Qoros Auto', 'Roewe', 'SAIC Motor', 'Soueast Motors', 'Venucia', 'Wuling Motors', 'Yema Auto', 'Zhonghua Auto', 'Zotye Auto'])

const form = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  color: '',
  seats: '',
  transmission: '',
  fuel: '',
  type: '',
  mileage: '',
  location: {
    address: '',
    city: '',
    district: ''
  },
  features: [],
  description: '',
  isSelfDrive: true,
  isWithDriver: false,
  driverFeePerDay: 0
})

const filteredWards = computed(() => {
  const prov = locations.value.find(p => p.name === form.value.location.city)
  return prov ? prov.wards : []
})

watch(() => form.value.location.city, () => {
  form.value.location.district = ''
})

const availableFeatures = [
  { value: 'air_conditioning', label: 'Điều hòa', emoji: '❄️' },
  { value: 'gps', label: 'GPS', emoji: '🗺️' },
  { value: 'bluetooth', label: 'Bluetooth', emoji: '📶' },
  { value: 'usb_charger', label: 'Cổng sạc', emoji: '⚡' },
  { value: 'child_seat', label: 'Ghế trẻ em', emoji: '👶' },
  { value: 'cruise_control', label: 'Ga tự động', emoji: '🏎️' },
  { value: 'parking_sensors', label: 'Cảm biến', emoji: '🅿️' },
  { value: 'camera', label: 'Camera lùi', emoji: '📷' },
  { value: 'abs', label: 'Phanh ABS', emoji: '🛡️' },
  { value: 'airbags', label: 'Túi khí', emoji: '🎈' }
]

const handleImageUploadAtPosition = (event, index) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ảnh tối đa 5MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviews.value[index] = e.target.result
    imageFiles.value[index] = file
  }
  reader.readAsDataURL(file)
}

const handleDocUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ảnh tối đa 5MB')
    return
  }

  docFiles.value[type] = file
  const reader = new FileReader()
  reader.onload = (e) => {
    docPreviews.value[type] = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = (index) => {
  imageFiles.value[index] = null
  imagePreviews.value[index] = null
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    // Clean up null entries from image clusters
    const activeImages = imageFiles.value.filter(f => f !== null)
    const existingImages = imagePreviews.value.filter(p => p && !p.file) // Existing images from DB
    
    // For edit mode, allow keeping existing images
    const totalImages = activeImages.length + existingImages.length
    
    if (!isEditMode.value && totalImages < 2) {
      toast.error('Vui lòng tải lên ít nhất 2 ảnh xe')
      return
    } else if (isEditMode.value && totalImages < 1) {
      toast.error('Xe phải có ít nhất 1 ảnh')
      return
    }

    const formData = new FormData()
    
    // Add form fields
    Object.keys(form.value).forEach(key => {
      if (typeof form.value[key] === 'object' && !Array.isArray(form.value[key])) {
        Object.keys(form.value[key]).forEach(nestedKey => {
          formData.append(`${key}[${nestedKey}]`, form.value[key][nestedKey])
        })
      } else if (Array.isArray(form.value[key])) {
        form.value[key].forEach(item => {
          formData.append(key, item)
        })
      } else {
        formData.append(key, form.value[key])
      }
    })
    
    // Add images
    activeImages.forEach(file => {
      formData.append('images', file)
    })
    
    // Add documents
    if (docFiles.value.registration) {
      formData.append('registration', docFiles.value.registration)
    }
    if (docFiles.value.insurance) {
      formData.append('insurance', docFiles.value.insurance)
    }
    
    // Different endpoints for add vs edit
    let response
    if (isEditMode.value) {
      console.log('Updating car:', currentCarId)
      console.log('Form data being sent:', formData)
      
      response = await api.put(`/cars/${currentCarId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Update response:', response.data)
      toast.success('Cập nhật xe thành công!')
      
      // Clear form data to force reload
      setTimeout(() => {
        console.log('Clearing form data after update')
        Object.keys(form.value).forEach(key => {
          if (Array.isArray(form.value[key])) {
            form.value[key] = []
          } else if (typeof form.value[key] === 'object') {
            form.value[key] = {}
          } else {
            form.value[key] = ''
          }
        })
        imageFiles.value = []
        imagePreviews.value = []
      }, 1000)
      
    } else {
      console.log('Creating new car')
      response = await api.post('/cars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Đăng xe thành công! Xe của bạn đã được gửi. Admin sẽ xem xét và thiết lập giá thuê.')
    }
    
    console.log('Redirecting based on route context')
    // If in driver dashboard, redirect to /driver/cars, otherwise /my-cars
    const redirectPath = route.path.startsWith('/driver') ? '/driver/cars' : '/my-cars'
    router.push(redirectPath)
  } catch (error) {
    console.error('Car submission error:', error)
    
    if (error.response?.status === 400 && error.response?.data?.errors) {
      // Show specific validation errors
      const validationErrors = error.response.data.errors
      const errorMessages = validationErrors.map(err => {
        // Translate field names to Vietnamese
        const fieldMap = {
          'brand': 'Hãng xe',
          'model': 'Dòng xe', 
          'year': 'Năm sản xuất',
          'licensePlate': 'Biển số xe',
          'color': 'Màu sắc',
          'seats': 'Số chỗ ngồi',
          'transmission': 'Hộp số',
          'fuel': 'Loại nhiên liệu',
          'mileage': 'Số km đã đi',
          'location.address': 'Địa chỉ',
          'location.city': 'Tỉnh/Thành phố',
          'location.district': 'Quận/Huyện'
        }
        
        const fieldName = fieldMap[err.path] || err.path
        return `${fieldName}: ${err.msg}`
      })
      
      toast.error(`Lỗi xác thực:\n${errorMessages.join('\n')}`)
    } else if (error.response?.status === 403) {
      toast.error('Bạn không có quyền đăng xe. Vui lòng kiểm tra lại tài khoản.')
    } else {
      toast.error(error.response?.data?.message || 'Đăng xe thất bại. Vui lòng thử lại.')
    }
  } finally {
    submitting.value = false
  }
}

// Load car data for edit mode
const loadCarData = async () => {
  if (!isEditMode.value) return
  
  try {
    const currentCarId = route.params.id
    console.log('Loading car data for edit:', currentCarId)
    console.log('Route params:', route.params)
    console.log('CarId computed:', carId.value)
    
    const response = await api.get(`/cars/${currentCarId}/manage`)
    const carData = response.data.car || response.data
    
    console.log('Car data loaded:', carData)
    
    // Populate form with car data
    if (carData.brand) form.value.brand = carData.brand
    if (carData.model) form.value.model = carData.model
    if (carData.year) form.value.year = carData.year
    if (carData.licensePlate) form.value.licensePlate = carData.licensePlate
    if (carData.color) form.value.color = carData.color
    if (carData.seats) form.value.seats = carData.seats
    if (carData.type) form.value.type = carData.type
    if (carData.transmission) form.value.transmission = carData.transmission
    if (carData.fuel) form.value.fuel = carData.fuel
    if (carData.mileage) form.value.mileage = carData.mileage
    if (carData.pricePerDay) form.value.pricePerDay = carData.pricePerDay
    if (carData.pricePerHalfMonth) form.value.pricePerHalfMonth = carData.pricePerHalfMonth
    if (carData.pricePerMonth) form.value.pricePerMonth = carData.pricePerMonth
    if (carData.deposit) form.value.deposit = carData.deposit
    if (carData.description) form.value.description = carData.description
    if (carData.features) form.value.features = [...carData.features]
    
    // Load images if available
    if (carData.images && carData.images.length > 0) {
      console.log('Loading existing images:', carData.images)
      console.log('Image structure analysis:', {
        imagesType: typeof carData.images,
        imagesLength: carData.images.length,
        firstImageType: typeof carData.images[0],
        firstImageKeys: carData.images[0] ? Object.keys(carData.images[0]) : [],
        sampleImage: carData.images[0]
      })
      
      imagePreviews.value = carData.images.map((img, index) => {
        console.log(`Processing image ${index}:`, img)
        
        // Handle binary images from database
        let imageUrl = ''
        if (img.url) {
          // If URL exists, use it
          imageUrl = img.url
          console.log(`Using existing URL: ${imageUrl}`)
        } else if (img.data && img.contentType) {
          // For binary images, create blob URL
          const blob = new Blob([img.data], { type: img.contentType })
          imageUrl = URL.createObjectURL(blob)
          console.log(`Created blob URL from binary data: ${imageUrl}`)
        } else {
          // Fallback to API endpoint
          imageUrl = `/api/cars/${currentCarId}/images/${index}`
          console.log(`Using fallback API URL: ${imageUrl}`)
        }
        
        console.log(`Final image URL for ${index}: ${imageUrl}`)
        
        return {
          url: imageUrl,
          name: `Image ${index + 1}`,
          file: null, // Don't set file for existing images
          isBlob: img.data && img.contentType // Track if it's a blob URL
        }
      })
      console.log('Image previews after loading:', imagePreviews.value)
    }
    
  } catch (error) {
    console.error('Error loading car data:', error)
    toast.error('Không thể tải thông tin xe')
    // If in driver dashboard, redirect to /driver/cars, otherwise /my-cars
    const redirectPath = route.path.startsWith('/driver') ? '/driver/cars' : '/my-cars'
    router.push(redirectPath)
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    const locRes = await fetch('/data.json')
    locations.value = await locRes.json()
  } catch (err) {
    console.error('Error loading locations:', err)
  }
  
  loadCarData()
})
</script>

<style scoped>
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

input:focus, select:focus, textarea:focus {
  outline: none;
}
</style>
