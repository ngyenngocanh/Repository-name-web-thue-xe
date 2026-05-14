<template>
  <div class="contract-display">
    <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div class="flex flex-col gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Hợp đồng điện tử</h3>
          <p class="text-gray-600 mt-1">Hợp đồng cho chuyến đi của bạn</p>
        </div>
        <div class="flex space-x-3">
          <button
            v-if="!contract"
            @click="generateContract"
            :disabled="loading"
            class="btn btn-primary flex items-center space-x-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span v-else>Tạo hợp đồng</span>
          </button>
          <button
            v-if="contract"
            @click="viewContract"
            class="btn btn-outline flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span>Xem hợp đồng</span>
          </button>
          <button
            v-if="contract"
            @click="downloadContract"
            class="btn btn-success flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Tải xuống</span>
          </button>
        </div>
      </div>

      <!-- Contract Status -->
      <div v-if="contract" class="mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <h4 class="text-sm font-medium text-green-800">
                Hợp đồng đã được tạo thành công
              </h4>
              <div class="mt-2 text-sm text-green-700">
                <p>Số hợp đồng: <span class="font-medium">{{ contract.contractId }}</span></p>
                <p>Ngày ký: <span class="font-medium">{{ formatDate(contract.createdAt) }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Preview -->
      <div v-if="contract && showPreview" class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-900">Nội dung hợp đồng</h4>
            <button
              @click="showPreview = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div class="contract-content whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded">
            {{ contractContent }}
          </div>
        </div>
      </div>
    </div>

    <!-- Contract Viewer Modal -->
    <div
      v-if="showViewer"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Xem hợp đồng {{ contract.contractId }}
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
            :contract="contract"
            @close="closeViewer"
            @signed="onContractSigned"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import ContractViewer from '@/components/ContractViewer.vue'

const router = useRouter()

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['contractGenerated'])

const contract = ref(null)
const contractContent = ref('')
const loading = ref(false)
const showPreview = ref(false)
const showViewer = ref(false)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const generateContract = async () => {
  loading.value = true
  try {
    const response = await api.post(`/contracts/generate/${props.booking._id}`)
    contract.value = response.data.contract
    emit('contractGenerated', contract.value)
  } catch (error) {
    console.error('Error generating contract:', error)
  } finally {
    loading.value = false
  }
}

const viewContract = () => {
  const routeMap = {
    'self_drive': 'SelfDriveContract',
    'with_driver': 'WithDriverContract',
    'driver_only': 'SoloDriverContract',
    'trip': 'TripDriverContract'
  }
  const routeName = routeMap[props.booking.rentalType] || 'SelfDriveContract'
  router.push({ name: routeName, params: { id: props.booking._id } })
}

const closeViewer = () => {
  showViewer.value = false
}

const downloadContract = async () => {
  try {
    const response = await api.get(`/contracts/${contract.value.fileName}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `hop-dong-${contract.value.contractId}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading contract:', error)
  }
}

const onContractSigned = (contractId) => {
  // Handle contract signing
  closeViewer()
  // Refresh contract data if needed
}

const loadContract = async () => {
  try {
    // Check if contract exists for this booking
    const response = await api.get(`/contracts/booking/${props.booking._id}`)
    contract.value = response.data
  } catch (error) {
    // Contract doesn't exist yet, that's fine
  }
}

// Load contract on mount
loadContract()
</script>

<style scoped>
.contract-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #374151;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
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

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}
</style>