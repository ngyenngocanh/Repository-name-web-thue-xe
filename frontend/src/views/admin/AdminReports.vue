<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Báo cáo hệ thống</h2>
          <p class="text-gray-600 mt-1">Xem và tải các báo cáo chi tiết về hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <select v-model="selectedReportType" class="border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="users">Báo cáo người dùng</option>
            <option value="bookings">Báo cáo đặt xe</option>
            <option value="revenue">Báo cáo doanh thu</option>
            <option value="cars">Báo cáo xe</option>
          </select>
          <button @click="generateReport" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 10-2 0v3a1 1 0 102 0v-3zm-4 3a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clip-rule="evenodd"/>
            </svg>
            Tạo báo cáo
          </button>
        </div>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Bộ lọc báo cáo</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
          <input
            v-model="reportFilters.startDate"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
          <input
            v-model="reportFilters.endDate"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Định dạng</label>
          <select v-model="reportFilters.format" class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Available Reports -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Báo cáo có sẵn</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="report in availableReports" :key="report.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div :class="`p-2 rounded-full ${report.color}`">
              <component :is="report.icon" class="w-5 h-5 text-white" />
            </div>
            <span class="text-xs text-gray-500">{{ report.frequency }}</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-2">{{ report.name }}</h4>
          <p class="text-sm text-gray-600 mb-3">{{ report.description }}</p>
          <div class="flex justify-between items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-500">Cập nhật: {{ report.lastUpdated }}</span>
            <button
              type="button"
              class="text-emerald-600 hover:text-emerald-800 text-sm font-semibold"
              @click="openReportPreview(report)"
            >
              Xem
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Báo cáo gần đây</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên báo cáo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khoảng thời gian</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="report in recentReports" :key="report.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ report.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ report.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ report.period }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ report.createdBy }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ report.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    title="Xem trước"
                    class="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    @click="openReportPreview(report)"
                  >
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button type="button" title="Xóa" class="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors" @click="deleteReport(report.id)">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Xem trước báo cáo → mới tải xuống -->
    <div v-if="showReportPreviewModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-900/60" aria-hidden="true" @click="closeReportPreview"></div>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-preview-title"
          class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
            <div>
              <h3 id="report-preview-title" class="text-lg font-bold text-gray-900">Xem trước báo cáo</h3>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ previewReport?.name }}</p>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Đóng"
              @click="closeReportPreview"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="px-6 py-4 max-h-[50vh] overflow-y-auto">
            <dl class="space-y-3 text-sm">
              <div v-for="(row, idx) in previewDetailRows" :key="idx" class="flex gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <dt class="w-36 shrink-0 font-medium text-gray-500">{{ row.label }}</dt>
                <dd class="text-gray-900 flex-1 break-words">{{ row.value }}</dd>
              </div>
            </dl>
            <p v-if="previewReport?.status === 'processing'" class="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Báo cáo đang xử lý — file tải xuống chỉ gồm thông tin tóm tắt hiện có.
            </p>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex flex-wrap justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white"
              @click="closeReportPreview"
            >
              Hủy
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50"
              :disabled="!previewReport"
              @click="confirmReportDownload"
            >
              Tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  DocumentTextIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

const toast = useToast()

const selectedReportType = ref('users')

const reportFilters = ref({
  startDate: '',
  endDate: '',
  format: 'pdf'
})

const availableReports = ref([
  {
    id: 1,
    name: 'Báo cáo người dùng hàng tháng',
    description: 'Thống kê người dùng mới và hoạt động hàng tháng',
    type: 'Người dùng',
    frequency: 'Hàng tháng',
    color: 'bg-blue-500',
    icon: UserGroupIcon,
    lastUpdated: '01/03/2024'
  },
  {
    id: 2,
    name: 'Báo cáo doanh thu hàng quý',
    description: 'Báo cáo chi tiết doanh thu theo từng quý',
    type: 'Doanh thu',
    frequency: 'Hàng quý',
    color: 'bg-green-500',
    icon: CurrencyDollarIcon,
    lastUpdated: '01/01/2024'
  },
  {
    id: 3,
    name: 'Báo cáo đặt xe',
    description: 'Thống kê các chuyến đặt xe và tỷ lệ hoàn thành',
    type: 'Đặt xe',
    frequency: 'Hàng tuần',
    color: 'bg-yellow-500',
    icon: CalendarIcon,
    lastUpdated: '20/03/2024'
  },
  {
    id: 4,
    name: 'Báo cáo hiệu suất xe',
    description: 'Phân tích hiệu suất và doanh thu của từng xe',
    type: 'Xe',
    frequency: 'Hàng tháng',
    color: 'bg-purple-500',
    icon: TruckIcon,
    lastUpdated: '01/03/2024'
  },
  {
    id: 5,
    name: 'Báo cáo thanh toán',
    description: 'Thống kê các giao dịch thanh toán thành công',
    type: 'Thanh toán',
    frequency: 'Hàng ngày',
    color: 'bg-indigo-500',
    icon: DocumentTextIcon,
    lastUpdated: '20/03/2024'
  },
  {
    id: 6,
    name: 'Báo cáo đánh giá',
    description: 'Tổng hợp đánh giá và phản hồi từ khách hàng',
    type: 'Đánh giá',
    frequency: 'Hàng tháng',
    color: 'bg-red-500',
    icon: DocumentTextIcon,
    lastUpdated: '15/03/2024'
  }
])

const showReportPreviewModal = ref(false)
const previewReport = ref(null)

const recentReports = ref([
  {
    id: 'RPT001',
    name: 'Báo cáo doanh thu Tháng 2/2024',
    type: 'Doanh thu',
    period: '01/02/2024 - 29/02/2024',
    createdBy: 'Admin',
    status: 'completed'
  },
  {
    id: 'RPT002',
    name: 'Báo cáo người dùng Tuần 12/2024',
    type: 'Người dùng',
    period: '18/03/2024 - 24/03/2024',
    createdBy: 'Admin',
    status: 'completed'
  },
  {
    id: 'RPT003',
    name: 'Báo cáo đặt xe Quý 1/2024',
    type: 'Đặt xe',
    period: '01/01/2024 - 31/03/2024',
    createdBy: 'Admin',
    status: 'processing'
  }
])

const generateReport = async () => {
  if (!reportFilters.value.startDate || !reportFilters.value.endDate) {
    toast.error('Vui lòng chọn khoảng thời gian cho báo cáo')
    return
  }
  
  try {
    toast.info(`Đang tạo báo cáo ${selectedReportType.value}...`)
    
    // Generate report based on type
    let reportData = []
    let fileName = ''
    
    switch (selectedReportType.value) {
      case 'users':
        reportData = await generateUserReport()
        fileName = `user_report_${new Date().toISOString().split('T')[0]}`
        break
      case 'bookings':
        reportData = await generateBookingReport()
        fileName = `booking_report_${new Date().toISOString().split('T')[0]}`
        break
      case 'revenue':
        reportData = await generateRevenueReport()
        fileName = `revenue_report_${new Date().toISOString().split('T')[0]}`
        break
      case 'cars':
        reportData = await generateCarReport()
        fileName = `car_report_${new Date().toISOString().split('T')[0]}`
        break
    }
    
    // Download based on format
    if (reportFilters.value.format === 'csv') {
      downloadCSV(reportData, fileName)
    } else if (reportFilters.value.format === 'excel') {
      downloadExcel(reportData, fileName)
    } else {
      downloadPDF(reportData, fileName)
    }
    
    // Add to recent reports
    addToRecentReports(fileName)
    
    toast.success('Báo cáo đã được tạo thành công!')
  } catch (error) {
    toast.error('Không thể tạo báo cáo')
    console.error('Report generation error:', error)
  }
}

const generateUserReport = async () => {
  const response = await api.get('/admin/users', {
    params: {
      limit: 1000,
      startDate: reportFilters.value.startDate,
      endDate: reportFilters.value.endDate
    }
  })
  
  const users = response.data.users || []
  
  return [
    ['ID', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tham gia'],
    ...users.map(user => [
      user._id,
      user.fullName,
      user.email,
      user.phone || '',
      user.role,
      user.isActive ? 'Hoạt động' : 'Bị khóa',
      new Date(user.createdAt).toLocaleDateString('vi-VN')
    ])
  ]
}

const generateBookingReport = async () => {
  const response = await api.get('/admin/bookings', {
    params: {
      limit: 1000,
      startDate: reportFilters.value.startDate,
      endDate: reportFilters.value.endDate
    }
  })
  
  const bookings = response.data.bookings || []
  
  return [
    ['ID', 'Khách hàng', 'Xe', 'Ngày bắt đầu', 'Ngày kết thúc', 'Tổng tiền', 'Trạng thái'],
    ...bookings.map(booking => [
      booking._id,
      booking.user?.fullName || '',
      `${booking.car?.brand} ${booking.car?.model}`,
      new Date(booking.startDate).toLocaleDateString('vi-VN'),
      new Date(booking.endDate).toLocaleDateString('vi-VN'),
      booking.pricing?.totalAmount || 0,
      booking.status
    ])
  ]
}

const generateRevenueReport = async () => {
  const response = await api.get('/admin/bookings?status=completed', {
    params: {
      limit: 1000,
      startDate: reportFilters.value.startDate,
      endDate: reportFilters.value.endDate
    }
  })
  
  const bookings = response.data.bookings || []
  
  return [
    ['ID', 'Khách hàng', 'Xe', 'Ngày đặt', 'Doanh thu', 'Phí dịch vụ', 'Tổng cộng'],
    ...bookings.map(booking => [
      booking._id,
      booking.user?.fullName || '',
      `${booking.car?.brand} ${booking.car?.model}`,
      new Date(booking.createdAt).toLocaleDateString('vi-VN'),
      booking.pricing?.subtotal || 0,
      booking.pricing?.serviceFee || 0,
      booking.pricing?.totalAmount || 0
    ])
  ]
}

const generateCarReport = async () => {
  const response = await api.get('/admin/cars', {
    params: {
      limit: 1000
    }
  })
  
  const cars = response.data.cars || []
  
  return [
    ['ID', 'Hãng xe', 'Dòng xe', 'Biển số', 'Giá/ngày', 'Giá/tháng', 'Trạng thái', 'Chủ xe'],
    ...cars.map(car => [
      car._id,
      car.brand,
      car.model,
      car.licensePlate,
      car.pricePerDay || 0,
      car.pricePerMonth || 0,
      car.status,
      car.owner?.fullName || ''
    ])
  ]
}

const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const downloadCSV = (data, fileName) => {
  const csvContent = '\uFEFF' + data.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${fileName}.csv`)
}

const downloadExcel = (data, fileName) => {
  // For now, download as CSV (in real app, use a library like xlsx)
  const csvContent = '\uFEFF' + data.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${fileName}.csv`)
  toast.info('Định dạng Excel sẽ được hỗ trợ trong phiên bản tới')
}

const downloadPDF = (data, fileName) => {
  // For now, download as CSV (in real app, use a library like jsPDF)
  const csvContent = '\uFEFF' + data.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${fileName}.csv`)
  toast.info('Định dạng PDF sẽ được hỗ trợ trong phiên bản tới')
}

const downloadFile = (blob, fileName) => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const addToRecentReports = (fileName) => {
  const newReport = {
    id: `RPT${String(recentReports.value.length + 1).padStart(3, '0')}`,
    name: fileName,
    type: selectedReportType.value,
    period: `${reportFilters.value.startDate} - ${reportFilters.value.endDate}`,
    createdBy: 'Admin',
    status: 'completed'
  }
  
  recentReports.value.unshift(newReport)
  
  // Keep only last 10 reports
  if (recentReports.value.length > 10) {
    recentReports.value = recentReports.value.slice(0, 10)
  }
}

const getReportCsvMatrix = (report) => {
  const rows = [
    ['Báo cáo', report.name],
    ['Loại', report.type]
  ]
  if (report.period) rows.push(['Khoảng thời gian', report.period])
  if (report.frequency) rows.push(['Tần suất', report.frequency])
  if (report.description) rows.push(['Mô tả', report.description])
  if (report.lastUpdated) rows.push(['Cập nhật gần nhất', report.lastUpdated])
  if (report.createdBy) rows.push(['Người tạo', report.createdBy])
  if (report.status != null && report.status !== '') {
    rows.push(['Trạng thái', report.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'])
  }
  rows.push(['Ngày tải', new Date().toLocaleDateString('vi-VN')])
  return rows
}

const previewDetailRows = computed(() => {
  const r = previewReport.value
  if (!r) return []
  return getReportCsvMatrix(r).map(([label, value]) => ({ label, value }))
})

const openReportPreview = (report) => {
  previewReport.value = report
  showReportPreviewModal.value = true
}

const closeReportPreview = () => {
  showReportPreviewModal.value = false
  previewReport.value = null
}

const downloadReportFile = (report) => {
  const matrix = getReportCsvMatrix(report)
  const csvContent = '\uFEFF' + matrix.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const safeName = String(report.name || 'bao_cao').replace(/\s+/g, '_').replace(/[/\\?%*:|"<>]/g, '')
  downloadFile(blob, `${safeName}.csv`)
}

const confirmReportDownload = () => {
  const report = previewReport.value
  if (!report) return
  try {
    downloadReportFile(report)
    toast.success('Tải báo cáo thành công!')
    closeReportPreview()
  } catch (error) {
    console.error(error)
    toast.error('Không thể tải báo cáo')
  }
}

const deleteReport = (reportId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return
  
  toast.success('Xóa báo cáo thành công!')
  // Remove from list
  const index = recentReports.value.findIndex(r => r.id === reportId)
  if (index > -1) {
    recentReports.value.splice(index, 1)
  }
}

onMounted(() => {
  // Load reports data
})
</script>
