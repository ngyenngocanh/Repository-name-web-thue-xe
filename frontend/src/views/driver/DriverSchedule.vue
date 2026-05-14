<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      <div class="relative z-10">
        <h1 class="text-3xl font-black mb-1 tracking-tight">Đăng ký lịch làm việc</h1>
        <p class="text-indigo-100 text-sm font-medium opacity-90">Thiết lập lịch theo ca hoặc toàn thời gian để nhận chuyến</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Schedule Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-50">
            <h2 class="text-lg font-black text-gray-900 uppercase tracking-widest">Tạo lịch mới</h2>
          </div>

          <form @submit.prevent="createSchedule" class="p-6 space-y-6">
            <!-- Schedule Type -->
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Loại lịch</label>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="form.type = 'fulltime'"
                  class="flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2"
                  :class="form.type === 'fulltime' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'"
                >
                  <div class="text-2xl mb-1">🕐</div>
                  Toàn thời gian
                </button>
                <button
                  type="button"
                  @click="form.type = 'parttime'"
                  class="flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2"
                  :class="form.type === 'parttime' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'"
                >
                  <div class="text-2xl mb-1">⏰</div>
                  Bán thời gian
                </button>
              </div>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ngày bắt đầu</label>
                <input
                  v-model="form.startDate"
                  type="date"
                  :min="today"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ngày kết thúc</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  :min="form.startDate || today"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <!-- Shifts (for parttime) -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ca làm việc</label>
                <button
                  type="button"
                  @click="addShift"
                  class="px-3 py-1.5 text-xs font-black bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Thêm ca
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(shift, idx) in form.shifts"
                  :key="idx"
                  class="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <select
                    v-model="shift.dayOfWeek"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                  >
                    <option value="">Chọn ngày</option>
                    <option v-for="day in weekDays" :key="day.value" :value="day.value">{{ day.label }}</option>
                  </select>
                  <input
                    v-model="shift.startTime"
                    type="time"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-400 outline-none bg-white w-28"
                  />
                  <span class="text-gray-300 font-black">→</span>
                  <input
                    v-model="shift.endTime"
                    type="time"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-400 outline-none bg-white w-28"
                  />
                  <button
                    type="button"
                    @click="form.shifts.splice(idx, 1)"
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    v-if="form.shifts.length > 1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <!-- Quick fill for fulltime -->
              <div v-if="form.type === 'fulltime'" class="mt-3">
                <button
                  type="button"
                  @click="fillFullWeek"
                  class="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  ⚡ Tự động điền cả tuần (7h - 21h)
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="saving"
              class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ saving ? 'Đang lưu...' : 'Đăng ký lịch làm việc' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Right: Current Schedules -->
      <div class="space-y-6">
        <!-- Summary card -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Tổng quan</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-indigo-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-black text-indigo-700">{{ schedules.length }}</p>
              <p class="text-[10px] font-black text-indigo-400 uppercase">Lịch đăng ký</p>
            </div>
            <div class="bg-emerald-50 rounded-2xl p-4 text-center">
              <p class="text-2xl font-black text-emerald-700">{{ activeSchedules.length }}</p>
              <p class="text-[10px] font-black text-emerald-400 uppercase">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <!-- Schedule List -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 border-b border-gray-50">
            <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">Lịch đã đăng ký</h3>
          </div>

          <div v-if="loadingSchedules" class="p-8 text-center text-gray-400 font-bold">Đang tải...</div>

          <div v-else-if="!schedules.length" class="p-8 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p class="text-gray-400 text-sm font-bold">Chưa có lịch nào</p>
            <p class="text-gray-300 text-xs mt-1">Tạo lịch mới để bắt đầu nhận chuyến</p>
          </div>

          <div v-else class="divide-y divide-gray-50">
            <div
              v-for="schedule in schedules"
              :key="schedule._id"
              class="p-4 hover:bg-gray-50/50 transition-all"
            >
              <div class="flex items-center justify-between mb-2">
                <span
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  :class="schedule.type === 'fulltime' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'"
                >
                  {{ schedule.type === 'fulltime' ? 'Toàn thời gian' : 'Bán thời gian' }}
                </span>
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                  :class="isScheduleActive(schedule) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'"
                >
                  {{ isScheduleActive(schedule) ? '● Đang hoạt động' : 'Hết hạn' }}
                </span>
              </div>

              <div class="text-xs text-gray-600 font-bold mb-2">
                {{ formatDate(schedule.startDate) }} → {{ formatDate(schedule.endDate) }}
              </div>

              <div class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="shift in schedule.shifts"
                  :key="shift._id"
                  class="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500"
                >
                  {{ shift.dayOfWeek }} {{ shift.startTime }}-{{ shift.endTime }}
                </span>
              </div>

              <div class="flex gap-2 mt-2">
                <button
                  v-if="isScheduleActive(schedule)"
                  @click="toggleScheduleOnline(schedule)"
                  class="flex-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                  :class="schedule.isOnline ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                >
                  {{ schedule.isOnline ? '🟢 Online' : '⚫ Offline' }}
                </button>
                <button
                  @click="deleteSchedule(schedule._id)"
                  class="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-black hover:bg-red-100 transition-all"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Calendar Preview -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Tuần này</h3>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in weekDays"
              :key="day.value"
              class="text-center p-2 rounded-xl transition-all"
              :class="hasShiftOnDay(day.value) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-300'"
            >
              <p class="text-[9px] font-black uppercase">{{ day.value }}</p>
              <div v-if="hasShiftOnDay(day.value)" class="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>
            </div>
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

const today = new Date().toISOString().split('T')[0]
const saving = ref(false)
const loadingSchedules = ref(true)
const schedules = ref([])

const weekDays = [
  { value: 'Mon', label: 'Thứ 2' },
  { value: 'Tue', label: 'Thứ 3' },
  { value: 'Wed', label: 'Thứ 4' },
  { value: 'Thu', label: 'Thứ 5' },
  { value: 'Fri', label: 'Thứ 6' },
  { value: 'Sat', label: 'Thứ 7' },
  { value: 'Sun', label: 'CN' }
]

const form = ref({
  type: 'fulltime',
  startDate: today,
  endDate: '',
  shifts: [{ dayOfWeek: 'Mon', startTime: '07:00', endTime: '21:00' }]
})

const activeSchedules = computed(() =>
  schedules.value.filter(s => isScheduleActive(s))
)

const isScheduleActive = (schedule) => {
  const now = new Date()
  return new Date(schedule.endDate) >= now
}

const hasShiftOnDay = (dayValue) => {
  return schedules.value.some(s =>
    isScheduleActive(s) && s.shifts?.some(sh => sh.dayOfWeek === dayValue)
  )
}

const addShift = () => {
  form.value.shifts.push({ dayOfWeek: '', startTime: '07:00', endTime: '21:00' })
}

const fillFullWeek = () => {
  form.value.shifts = weekDays.map(day => ({
    dayOfWeek: day.value,
    startTime: '07:00',
    endTime: '21:00'
  }))
  toast.success('Đã tự động điền lịch cả tuần!')
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fetchSchedules = async () => {
  loadingSchedules.value = true
  try {
    const res = await api.get('/driver/schedule')
    schedules.value = res.data.schedules || []
  } catch (e) {
    console.error('Fetch schedules error:', e)
  } finally {
    loadingSchedules.value = false
  }
}

const createSchedule = async () => {
  if (!form.value.startDate || !form.value.endDate) {
    toast.error('Vui lòng chọn ngày bắt đầu và kết thúc')
    return
  }
  const validShifts = form.value.shifts.filter(s => s.dayOfWeek && s.startTime && s.endTime)
  if (!validShifts.length) {
    toast.error('Vui lòng thêm ít nhất 1 ca làm việc')
    return
  }

  saving.value = true
  try {
    await api.post('/driver/schedule', {
      type: form.value.type,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      shifts: validShifts
    })
    toast.success('Đăng ký lịch làm việc thành công! 🎉')
    form.value = {
      type: 'fulltime',
      startDate: today,
      endDate: '',
      shifts: [{ dayOfWeek: 'Mon', startTime: '07:00', endTime: '21:00' }]
    }
    await fetchSchedules()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Lỗi khi đăng ký lịch')
  } finally {
    saving.value = false
  }
}

const toggleScheduleOnline = async (schedule) => {
  try {
    const newStatus = !schedule.isOnline
    await api.post('/driver/schedule/online', {
      scheduleId: schedule._id,
      isOnline: newStatus
    })
    schedule.isOnline = newStatus
    toast.success(newStatus ? '🟢 Bật trực tuyến cho lịch này' : '⚫ Tắt trực tuyến')
  } catch (e) {
    toast.error('Không thể cập nhật trạng thái')
  }
}

const deleteSchedule = async (id) => {
  if (!confirm('Bạn chắc chắn muốn xóa lịch này?')) return
  try {
    await api.delete(`/driver/schedule/${id}`)
    toast.success('Đã xóa lịch làm việc')
    await fetchSchedules()
  } catch (e) {
    toast.error('Không thể xóa lịch')
  }
}

onMounted(() => {
  fetchSchedules()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
