<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-black mb-1 tracking-tight">Quản lý Hợp đồng</h1>
          <p class="text-slate-300 text-sm font-medium">Toàn bộ hợp đồng thuê xe trong hệ thống</p>
        </div>
        <div class="text-right">
          <p class="text-3xl font-black">{{ contracts.length }}</p>
          <p class="text-slate-300 text-xs uppercase tracking-widest font-bold">Tổng hợp đồng</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-2xl font-black text-gray-900">{{ stat.value }}</p>
        <p class="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{{ stat.label }}</p>
        <div class="mt-2 h-1 rounded-full" :class="stat.color"></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        @click="filterStatus = f.value"
        class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all"
        :class="filterStatus === f.value ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >{{ f.label }}</button>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm mã đơn, tên khách..."
        class="ml-auto px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-slate-400"
      />
      <button @click="fetchContracts" class="p-2 text-slate-600 hover:text-slate-900 transition-colors" title="Làm mới">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading / Empty -->
    <div v-if="loading" class="text-center py-16 text-gray-400 font-bold">Đang tải...</div>
    <div v-else-if="filteredContracts.length === 0" class="text-center py-16 text-gray-400 font-bold">Không có hợp đồng nào</div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Xe / Loại</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
              <th class="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
              <th class="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
              <th class="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="b in filteredContracts"
              :key="b._id"
              class="hover:bg-gray-50/50 transition-colors group"
            >
              <td class="px-6 py-4">
                <p class="text-xs font-mono font-black text-gray-500">#{{ b._id?.slice(-8).toUpperCase() }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-gray-900">{{ b.renter?.fullName || '—' }}</p>
                <p class="text-xs text-gray-400">{{ b.renter?.phone || b.renter?.email || '' }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-gray-900">{{ b.car?.brand }} {{ b.car?.model }}</p>
                <p class="text-xs text-gray-400 uppercase">{{ getRentalTypeLabel(b.rentalType) }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-xs text-gray-700">{{ formatDate(b.startDate) }}</p>
                <p class="text-xs text-gray-400">→ {{ formatDate(b.endDate) }}</p>
              </td>
              <td class="px-6 py-4 text-right">
                <p class="text-sm font-black text-gray-900">{{ formatPrice(b.pricing?.totalAmount || 0) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="px-3 py-1 text-[10px] font-black uppercase rounded-full" :class="getStatusClass(b.status)">
                  {{ getStatusLabel(b.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  @click="viewDetail(b)"
                  class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedContract" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-lg font-black text-gray-900">Chi tiết hợp đồng #{{ selectedContract._id?.slice(-8).toUpperCase() }}</h2>
          <button @click="selectedContract = null" class="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div><p class="text-gray-400 text-xs uppercase font-black">Khách thuê</p><p class="font-bold mt-1">{{ selectedContract.renter?.fullName || '—' }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">SĐT</p><p class="font-bold mt-1">{{ selectedContract.renter?.phone || '—' }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Xe</p><p class="font-bold mt-1">{{ selectedContract.car?.brand }} {{ selectedContract.car?.model }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Biển số</p><p class="font-bold mt-1">{{ selectedContract.car?.licensePlate || '—' }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Bắt đầu</p><p class="font-bold mt-1">{{ formatDate(selectedContract.startDate) }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Kết thúc</p><p class="font-bold mt-1">{{ formatDate(selectedContract.endDate) }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Loại hợp đồng</p><p class="font-bold mt-1">{{ getRentalTypeLabel(selectedContract.rentalType) }}</p></div>
            <div><p class="text-gray-400 text-xs uppercase font-black">Trạng thái</p>
              <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full mt-1 inline-block" :class="getStatusClass(selectedContract.status)">{{ getStatusLabel(selectedContract.status) }}</span>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-4 space-y-2">
            <div class="flex justify-between"><span class="text-gray-500">Phí di chuyển</span><span class="font-bold">{{ formatPrice(selectedContract.pricing?.distanceFee || 0) }}</span></div>
            <div v-if="selectedContract.pricing?.driverTripFee" class="flex justify-between"><span class="text-gray-500">Phụ phí tài xế</span><span class="font-bold">{{ formatPrice(selectedContract.pricing.driverTripFee) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Phí sàn</span><span class="font-bold">{{ formatPrice(selectedContract.pricing?.serviceFee || 0) }}</span></div>
            <div v-if="selectedContract.pricing?.deposit" class="flex justify-between"><span class="text-gray-500">Tiền cọc</span><span class="font-bold text-orange-600">-{{ formatPrice(selectedContract.pricing.deposit) }}</span></div>
            <div class="flex justify-between border-t pt-2"><span class="font-black">Tổng thanh toán</span><span class="font-black text-lg">{{ formatPrice(selectedContract.pricing?.totalAmount || 0) }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const contracts = ref([])
const loading = ref(true)
const filterStatus = ref('all')
const searchQuery = ref('')
const selectedContract = ref(null)

const statusFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang diễn ra', value: 'active' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' }
]

const statCards = computed(() => [
  { label: 'Chờ duyệt', value: contracts.value.filter(b => b.status === 'pending').length, color: 'bg-yellow-400' },
  { label: 'Đang diễn ra', value: contracts.value.filter(b => b.status === 'active').length, color: 'bg-blue-400' },
  { label: 'Hoàn thành', value: contracts.value.filter(b => b.status === 'completed').length, color: 'bg-green-400' },
  { label: 'Đã hủy', value: contracts.value.filter(b => b.status === 'cancelled').length, color: 'bg-red-400' }
])

const filteredContracts = computed(() => {
  let list = contracts.value
  if (filterStatus.value !== 'all') list = list.filter(b => b.status === filterStatus.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b =>
      (b._id || '').toLowerCase().includes(q) ||
      (b.renter?.fullName || '').toLowerCase().includes(q) ||
      (b.car?.brand || '').toLowerCase().includes(q) ||
      (b.car?.model || '').toLowerCase().includes(q)
    )
  }
  return list
})

const fetchContracts = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/bookings?limit=200')
    contracts.value = response.data.bookings || response.data || []
  } catch (error) {
    toast.error('Không thể tải danh sách hợp đồng')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewDetail = (booking) => {
  selectedContract.value = booking
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

const getRentalTypeLabel = (type) => {
  const map = { self_drive: 'Tự lái', with_driver: 'Kèm tài', driver_only: 'Tài xế', trip: 'Theo chuyến' }
  return map[type] || type || '—'
}

const getStatusLabel = (status) => {
  const map = { pending: 'Chờ duyệt', confirmed: 'Xác nhận', active: 'Đang chạy', completed: 'Hoàn thành', cancelled: 'Đã hủy', disputed: 'Khiếu nại' }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    disputed: 'bg-orange-100 text-orange-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

onMounted(fetchContracts)
</script>