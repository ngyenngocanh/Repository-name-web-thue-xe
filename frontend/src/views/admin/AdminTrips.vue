<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-black mb-1 tracking-tight">Quản lý Chuyến</h1>
          <p class="text-purple-200 text-sm font-medium">Cấu hình giá cước, phụ phí và danh sách xe theo từng phương án</p>
        </div>
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-3 bg-white text-purple-700 font-black rounded-xl hover:bg-purple-50 transition-all shadow-lg text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          {{ saving ? 'Đang lưu...' : 'Lưu cấu hình' }}
        </button>
      </div>
    </div>

    <!-- Rule Banner -->
    <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
      <div class="mt-0.5 shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div class="text-sm text-purple-800">
        <p class="font-black mb-1">Quy tắc tự động phân loại phương án theo khoảng cách:</p>
        <div class="flex flex-wrap gap-4 mt-1 text-xs font-bold">
          <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">🔵 Quãng ngắn: &lt; 10 km</span>
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🟢 Đường dài: 10 – 100 km</span>
          <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">🟠 Công tác: &gt; 100 km</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-400 font-bold">Đang tải cấu hình...</div>

    <div v-else class="space-y-6">
      <!-- Tier Cards -->
      <div v-for="tier in tierList" :key="tier.key" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Tier Header -->
        <div class="p-5 flex items-center gap-4" :class="tier.headerClass">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="tier.iconBg">
            <component :is="tier.icon" class="w-6 h-6" :class="tier.iconColor" />
          </div>
          <div>
            <h2 class="text-lg font-black" :class="tier.titleColor">{{ tier.label }}</h2>
            <p class="text-xs font-bold opacity-70" :class="tier.titleColor">{{ tier.description }}</p>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Price Fields -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Giá cước / km</label>
              <div class="relative">
                <input
                  v-model.number="settings.tiers[tier.key].pricePerKm"
                  type="number"
                  min="0"
                  step="1000"
                  class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₫/km</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">= {{ formatPrice(settings.tiers[tier.key].pricePerKm) }}/km</p>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phụ phí tài xế / ngày</label>
              <div class="relative">
                <input
                  v-model.number="settings.tiers[tier.key].driverFeePerDay"
                  type="number"
                  min="0"
                  step="50000"
                  class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₫/ngày</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">= {{ formatPrice(settings.tiers[tier.key].driverFeePerDay) }}/ngày</p>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phụ phí ngoài giờ / giờ</label>
              <div class="relative">
                <input
                  v-model.number="settings.tiers[tier.key].overTimeFee"
                  type="number"
                  min="0"
                  step="10000"
                  class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-black text-gray-900 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₫/giờ</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">= {{ formatPrice(settings.tiers[tier.key].overTimeFee) }}/giờ</p>
            </div>
          </div>

          <!-- Preview calculation -->
          <div class="bg-gray-900 text-white rounded-xl p-4 flex flex-wrap gap-6 items-center">
            <div class="text-xs text-gray-400 font-black uppercase tracking-widest">Ví dụ ước tính</div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-400">{{ tier.exampleKm }}km ×</span>
              <span class="font-black text-white">{{ formatPrice(settings.tiers[tier.key].pricePerKm) }}</span>
              <span v-if="tier.key === 'business'" class="text-gray-400">+ phụ phí tài xế</span>
              <span class="text-gray-400">→</span>
              <span class="text-xl font-black text-purple-400">{{ formatPrice(calcExample(tier)) }}</span>
            </div>
          </div>

          <!-- Applicable Cars -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-gray-700 uppercase tracking-widest">Xe hỗ trợ phương án này</h3>
              <button
                @click="openCarPicker(tier.key)"
                class="px-4 py-2 text-xs font-black bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all flex items-center gap-2"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Thêm xe
              </button>
            </div>

            <div v-if="!getApplicableCars(tier.key).length" class="text-center py-6 text-gray-400 text-xs font-bold bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              Chưa có xe nào được chỉ định cho phương án này.<br>
              <span class="text-purple-500">Nếu để trống = tất cả xe có isWithDriver đều hỗ trợ.</span>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="car in getApplicableCars(tier.key)"
                :key="car._id"
                class="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 group"
              >
                <div class="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                  <img v-if="car.imageUrl" :src="car.imageUrl" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/></svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-black text-gray-900 truncate">{{ car.brand }} {{ car.model }}</p>
                  <p class="text-[10px] text-gray-400 font-bold">{{ car.licensePlate }}</p>
                </div>
                <button
                  @click="removeCarFromTier(tier.key, car._id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Car Picker Modal -->
    <div v-if="showCarPicker" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div class="p-5 border-b flex justify-between items-center">
          <div>
            <h3 class="text-lg font-black text-gray-900">Chọn xe cho phương án <span class="text-purple-600">{{ tierList.find(t => t.key === pickerTierKey)?.label }}</span></h3>
            <p class="text-xs text-gray-400 mt-0.5">Chỉ hiển thị xe hỗ trợ thuê theo chuyến (isWithDriver)</p>
          </div>
          <button @click="showCarPicker = false" class="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-4 border-b">
          <input
            v-model="carSearch"
            type="text"
            placeholder="Tìm kiếm xe theo tên, biển số..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div class="overflow-y-auto flex-1 p-4">
          <div v-if="!filteredPickerCars.length" class="text-center text-gray-400 text-sm py-8">Không tìm thấy xe phù hợp</div>
          <div class="space-y-2">
            <label
              v-for="car in filteredPickerCars"
              :key="car._id"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-all border border-transparent"
              :class="isCarInTier(pickerTierKey, car._id) ? 'bg-purple-50 border-purple-200' : ''"
            >
              <input
                type="checkbox"
                :checked="isCarInTier(pickerTierKey, car._id)"
                @change="toggleCarInTier(pickerTierKey, car._id)"
                class="w-4 h-4 rounded text-purple-600 focus:ring-purple-400"
              />
              <div class="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                <img v-if="car.imageUrl" :src="car.imageUrl" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/></svg>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-black text-gray-900">{{ car.brand }} {{ car.model }} <span class="text-gray-400 font-bold">{{ car.year }}</span></p>
                <p class="text-xs text-gray-500">{{ car.licensePlate }} · {{ car.seats }} chỗ · {{ car.transmission === 'automatic' ? 'Tự động' : 'Số sàn' }}</p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="px-2 py-0.5 text-[10px] font-black rounded-full" :class="car.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                  {{ car.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt' }}
                </span>
                <span v-if="car.isTripSupport" class="px-2 py-0.5 text-[10px] font-black rounded-full bg-purple-100 text-purple-700">
                  ✓ Theo chuyến
                </span>
                <span v-else class="px-2 py-0.5 text-[10px] font-black rounded-full bg-gray-100 text-gray-400">
                  Chưa bật
                </span>
              </div>
            </label>
          </div>
        </div>

        <div class="p-4 border-t flex justify-between items-center">
          <span class="text-xs text-gray-500 font-bold">
            Đã chọn <strong class="text-purple-600">{{ getApplicableCars(pickerTierKey).length }}</strong> xe
          </span>
          <button @click="showCarPicker = false" class="px-6 py-2.5 bg-purple-600 text-white text-sm font-black rounded-xl hover:bg-purple-700 transition-all">
            Xong
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

// Heroicons inline SVGs replaced with components below
const RouteIcon = markRaw({ template: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>' })
const RoadIcon = markRaw({ template: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' })
const PlaneIcon = markRaw({ template: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>' })

const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const showCarPicker = ref(false)
const pickerTierKey = ref('short')
const carSearch = ref('')
const allCars = ref([]) // all isWithDriver cars

const settings = ref({
  tiers: {
    short: { pricePerKm: 1000, driverFeePerDay: 500000, overTimeFee: 100000, applicableCars: [] },
    long: { pricePerKm: 18000, driverFeePerDay: 500000, overTimeFee: 120000, applicableCars: [] },
    business: { pricePerKm: 20000, driverFeePerDay: 700000, overTimeFee: 10000, applicableCars: [] }
  }
})

const tierList = [
  {
    key: 'short',
    label: 'Quãng ngắn',
    description: 'Áp dụng cho hành trình dưới 10 km — nội thành, ngắn',
    exampleKm: 8,
    icon: RouteIcon,
    headerClass: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800'
  },
  {
    key: 'long',
    label: 'Đường dài',
    description: 'Áp dụng cho hành trình 10 – 100 km — liên tỉnh, ngoại ô',
    exampleKm: 50,
    icon: RoadIcon,
    headerClass: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800'
  },
  {
    key: 'business',
    label: 'Công tác',
    description: 'Áp dụng cho hành trình trên 100 km — tỉnh xa, đi công tác',
    exampleKm: 200,
    icon: PlaneIcon,
    headerClass: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800'
  }
]

// Get car objects for a tier's applicableCars ids
const getApplicableCars = (tierKey) => {
  const ids = settings.value.tiers[tierKey]?.applicableCars || []
  return allCars.value.filter(c => ids.includes(c._id))
}

const isCarInTier = (tierKey, carId) => {
  return (settings.value.tiers[tierKey]?.applicableCars || []).includes(carId)
}

const toggleCarInTier = (tierKey, carId) => {
  const list = settings.value.tiers[tierKey].applicableCars
  const idx = list.indexOf(carId)
  if (idx === -1) list.push(carId)
  else list.splice(idx, 1)
}

const removeCarFromTier = (tierKey, carId) => {
  const list = settings.value.tiers[tierKey].applicableCars
  const idx = list.indexOf(carId)
  if (idx !== -1) list.splice(idx, 1)
}

const openCarPicker = (tierKey) => {
  pickerTierKey.value = tierKey
  carSearch.value = ''
  showCarPicker.value = true
}

const filteredPickerCars = computed(() => {
  const q = carSearch.value.toLowerCase().trim()
  if (!q) return allCars.value
  return allCars.value.filter(c =>
    `${c.brand || ''} ${c.model || ''}`.toLowerCase().includes(q) ||
    (c.licensePlate || '').toLowerCase().includes(q)
  )
})

const calcExample = (tier) => {
  const t = settings.value.tiers[tier.key]
  const km = tier.exampleKm
  const kmFee = t.pricePerKm * km
  const driverFee = tier.key === 'business' ? t.driverFeePerDay * 2 : 0 // 2 days for business example
  const serviceFee = 30000
  return kmFee + driverFee + serviceFee
}

const formatPrice = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

const resolveImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `http://localhost:3000${url}`
}

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await api.get('/trip-settings')
    const data = res.data
    if (data?.tiers) {
      // Normalize applicableCars to arrays of string IDs
      for (const key of ['short', 'long', 'business']) {
        const tier = data.tiers[key] || {}
        settings.value.tiers[key] = {
          pricePerKm: tier.pricePerKm ?? 1000,
          driverFeePerDay: tier.driverFeePerDay ?? 500000,
          overTimeFee: tier.overTimeFee ?? 100000,
          applicableCars: (tier.applicableCars || []).map(c =>
            typeof c === 'object' ? c._id?.toString() : c?.toString()
          ).filter(Boolean)
        }
      }
    }
  } catch (e) {
    toast.error('Không thể tải cấu hình chuyến')
  } finally {
    loading.value = false
  }
}

const fetchCars = async () => {
  try {
    // Load ALL approved cars so admin can pick any car to add to a tier
    // Backend will set isWithDriver=true automatically on save
    const res = await api.get('/admin/cars?limit=300&status=approved')
    const list = res.data.cars || res.data || []
    allCars.value = list.map(c => ({
      ...c,
      imageUrl: c.images?.[0]?.url ? resolveImageUrl(c.images[0].url) : ''
    }))
  } catch (e) {
    console.error('Cannot load cars:', e)
    try {
      const res2 = await api.get('/admin/cars?limit=300')
      const list = res2.data.cars || res2.data || []
      allCars.value = list.map(c => ({
        ...c,
        imageUrl: c.images?.[0]?.url ? resolveImageUrl(c.images[0].url) : ''
      }))
    } catch (_) {}
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await api.post('/trip-settings', { tiers: settings.value.tiers })
    toast.success('Đã lưu cấu hình chuyến thành công!')
  } catch (e) {
    toast.error('Lỗi khi lưu: ' + (e.response?.data?.message || e.message))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchSettings(), fetchCars()])
})
</script>
