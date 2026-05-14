<template>
  <div class="flex items-center justify-between">
    <div class="text-sm text-gray-700">
      Hiển thị 
      <span class="font-medium">{{ startItem }}</span> 
      đến 
      <span class="font-medium">{{ endItem }}</span> 
      của 
      <span class="font-medium">{{ total }}</span> kết quả
    </div>

    <div class="flex items-center space-x-2">
      <!-- Previous Button -->
      <button 
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-sm border rounded-md transition-colors"
        :class="currentPage === 1 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center space-x-1">
        <!-- First page -->
        <button 
          v-if="showFirstPage"
          @click="goToPage(1)"
          class="px-3 py-2 text-sm border rounded-md transition-colors"
          :class="currentPage === 1 
            ? 'bg-primary-600 text-white border-primary-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          1
        </button>

        <!-- Ellipsis -->
        <span v-if="showStartEllipsis" class="px-2 text-gray-500">...</span>

        <!-- Page range -->
        <button 
          v-for="page in pageRange" 
          :key="page"
          @click="goToPage(page)"
          class="px-3 py-2 text-sm border rounded-md transition-colors"
          :class="currentPage === page 
            ? 'bg-primary-600 text-white border-primary-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          {{ page }}
        </button>

        <!-- Ellipsis -->
        <span v-if="showEndEllipsis" class="px-2 text-gray-500">...</span>

        <!-- Last page -->
        <button 
          v-if="showLastPage"
          @click="goToPage(totalPages)"
          class="px-3 py-2 text-sm border rounded-md transition-colors"
          :class="currentPage === totalPages 
            ? 'bg-primary-600 text-white border-primary-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next Button -->
      <button 
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 text-sm border rounded-md transition-colors"
        :class="currentPage === totalPages 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-change'])

const itemsPerPage = 12 // This should match the backend limit

const startItem = computed(() => {
  return props.total === 0 ? 0 : (props.currentPage - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * itemsPerPage
  return end > props.total ? props.total : end
})

// Show/hide logic for pagination elements
const showFirstPage = computed(() => {
  return props.totalPages > 1 && props.currentPage > 3
})

const showLastPage = computed(() => {
  return props.totalPages > 1 && props.currentPage < props.totalPages - 2
})

const showStartEllipsis = computed(() => {
  return props.totalPages > 5 && props.currentPage > 4
})

const showEndEllipsis = computed(() => {
  return props.totalPages > 5 && props.currentPage < props.totalPages - 3
})

// Calculate page range to show
const pageRange = computed(() => {
  const range = []
  let start = Math.max(1, props.currentPage - 2)
  let end = Math.min(props.totalPages, props.currentPage + 2)

  // Adjust range to always show 5 pages if possible
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(props.totalPages, 5)
    } else if (end === props.totalPages) {
      start = Math.max(1, props.totalPages - 4)
    }
  }

  for (let i = start; i <= end; i++) {
    // Skip first and last page as they're handled separately
    if ((i !== 1 || !showFirstPage.value) && 
        (i !== props.totalPages || !showLastPage.value)) {
      range.push(i)
    }
  }

  return range
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>
