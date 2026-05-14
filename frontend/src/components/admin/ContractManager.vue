<template>
  <div class="contract-manager">
    <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h2>
        <div class="flex space-x-3">
          <button
            @click="refreshContracts"
            class="btn btn-outline flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <div class="flex-1 min-w-64">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tìm kiếm theo số hợp đồng hoặc tên khách hàng..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <select
          v-model="filters.type"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả loại hợp đồng</option>
          <option value="self-drive">Thuê xe tự lái</option>
          <option value="with-driver">Thuê xe kèm tài xế</option>
          <option value="trip-driver">Thuê tài xế theo chuyến</option>
        </select>
        <select
          v-model="filters.status"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Có hiệu lực</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <!-- Contracts Table -->
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số hợp đồng
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại hợp đồng
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày ký
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contract in filteredContracts" :key="contract._id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ contract.contractId }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getContractTypeClass(contract.contractType)"
                >
                  {{ getContractTypeLabel(contract.contractType) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ contract.customerName }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ contract.customerPhone }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(contract.createdAt) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusClass(contract.status)"
                >
                  {{ getStatusLabel(contract.status) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewContract(contract)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Xem
                  </button>
                  <button
                    @click="downloadContract(contract)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Tải
                  </button>
                  <button
                    @click="deleteContract(contract)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} đến {{ Math.min(currentPage * itemsPerPage, totalContracts) }} trong tổng số {{ totalContracts }} hợp đồng
        </div>
        <div class="flex space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="btn btn-outline"
          >
            Trước
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="btn btn-outline"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- Contract Viewer Modal -->
    <div
      v-if="selectedContract"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Xem hợp đồng {{ selectedContract.contractId }}
            </h3>
            <button
              @click="closeViewer"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <ContractViewer
            :contract="selectedContract"
            @close="closeViewer"
            @signed="onContractSigned"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import ContractViewer from '@/components/ContractViewer.vue'

const contracts = ref([])
const selectedContract = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const filters = ref({
  search: '',
  type: '',
  status: ''
})

const filteredContracts = computed(() => {
  let filtered = contracts.value

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(contract =>
      (contract.contractId || '').toLowerCase().includes(searchTerm) ||
      (contract.customerName || '').toLowerCase().includes(searchTerm) ||
      contract.customerPhone.includes(searchTerm)
    )
  }

  if (filters.value.type) {
    filtered = filtered.filter(contract => contract.contractType === filters.value.type)
  }

  if (filters.value.status) {
    filtered = filtered.filter(contract => contract.status === filters.value.status)
  }

  return filtered
})

const totalContracts = computed(() => filteredContracts.value.length)
const totalPages = computed(() => Math.ceil(totalContracts.value / itemsPerPage.value))

const getContractTypeClass = (type) => {
  const classes = {
    'self-drive': 'bg-blue-100 text-blue-800',
    'with-driver': 'bg-green-100 text-green-800',
    'trip-driver': 'bg-purple-100 text-purple-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getContractTypeLabel = (type) => {
  const labels = {
    'self-drive': 'Thuê xe tự lái',
    'with-driver': 'Thuê xe kèm tài xế',
    'trip-driver': 'Thuê tài xế theo chuyến'
  }
  return labels[type] || type
}

const getStatusClass = (status) => {
  const classes = {
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Có hiệu lực',
    'expired': 'Hết hạn',
    'cancelled': 'Đã hủy'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const loadContracts = async () => {
  try {
    const response = await api.get('/admin/contracts')
    contracts.value = response.data
  } catch (error) {
    console.error('Error loading contracts:', error)
  }
}

const refreshContracts = () => {
  loadContracts()
}

const viewContract = (contract) => {
  selectedContract.value = contract
}

const closeViewer = () => {
  selectedContract.value = null
}

const downloadContract = async (contract) => {
  try {
    const response = await api.get(`/contracts/${contract.fileName}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `hop-dong-${contract.contractId}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading contract:', error)
  }
}

const deleteContract = async (contract) => {
  if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return

  try {
    await api.delete(`/admin/contracts/${contract._id}`)
    await loadContracts()
  } catch (error) {
    console.error('Error deleting contract:', error)
  }
}

const onContractSigned = (contractId) => {
  // Handle contract signing
  closeViewer()
  loadContracts()
}

onMounted(() => {
  loadContracts()
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}
</style>