<template>
  <div class="contract-viewer">
    <!-- Contract Header -->
    <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Hợp đồng điện tử</h2>
          <p class="text-gray-600 mt-1">Số: {{ contract.contractId }}</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="downloadContract"
            class="btn btn-primary flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Tải xuống</span>
          </button>
          <button
            @click="printContract"
            class="btn btn-outline flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            <span>In hợp đồng</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contract Content -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div class="p-8">
        <div
          class="contract-content whitespace-pre-wrap text-base leading-relaxed"
          style="font-family: 'Times New Roman', Times, serif;"
          v-html="formattedContent"
        ></div>
      </div>
    </div>

    <!-- Contract Actions -->
    <div class="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-700">Hợp đồng có hiệu lực</span>
          </div>
          <div class="text-sm text-gray-500">
            Ngày ký: {{ formatDate(contract.createdAt) }}
          </div>
        </div>
        <div class="flex space-x-3">
          <button
            @click="signContract"
            v-if="!contract.isSigned"
            class="btn btn-success flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Ký hợp đồng</span>
          </button>
          <button
            @click="$emit('close')"
            class="btn btn-outline"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  contract: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'signed'])

const contractContent = ref('')

const formattedContent = computed(() => {
  if (!contractContent.value) return ''
  return contractContent.value
    .replace(/================================================================================/g, '<hr class="my-4 border-gray-300">')
    .replace(/\n/g, '<br>')
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const downloadContract = () => {
  const blob = new Blob([contractContent.value], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hop-dong-${props.contract.contractId}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const printContract = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Hợp đồng ${props.contract.contractId}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; }
          .contract-content { white-space: pre-wrap; }
          hr { border: 1px solid #ccc; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="contract-content">${contractContent.value}</div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

const signContract = async () => {
  try {
    // Here you would implement digital signature logic
    // For now, we'll just mark as signed
    emit('signed', props.contract.contractId)
  } catch (error) {
    console.error('Error signing contract:', error)
  }
}

const loadContractContent = async () => {
  try {
    const response = await api.get(`/contracts/${props.contract.fileName}`)
    contractContent.value = response.data
  } catch (error) {
    console.error('Error loading contract content:', error)
    contractContent.value = 'Không thể tải nội dung hợp đồng'
  }
}

onMounted(() => {
  loadContractContent()
})
</script>

<style scoped>
.contract-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.contract-content hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
}
</style>