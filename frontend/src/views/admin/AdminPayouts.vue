<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-[2rem] shadow-sm border border-gray-100">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Trả Lương / Hoa Hồng</h1>
        <p class="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-[10px]">Quản lý thu nhập & thanh toán cho Tài xế, CTV</p>
      </div>
      
      <!-- Stats Summary -->
      <div class="mt-4 md:mt-0 flex gap-4">
         <div class="px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-right">
            <p class="text-[10px] font-black text-red-400 uppercase tracking-widest">Tổng nợ</p>
            <p class="text-lg font-black text-red-600">{{ formatPrice(totalUnpaid) }}</p>
         </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex space-x-1 w-fit">
      <button 
        @click="activeTab = 'driver'" 
        class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        :class="activeTab === 'driver' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
      >
        Tài xế
      </button>
      <button 
        @click="activeTab = 'collaborator'" 
        class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        :class="activeTab === 'collaborator' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
      >
        Cộng tác viên
      </button>
    </div>

    <!-- List -->
    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
        <span class="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Người nhận</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngân hàng</th>
              <th class="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã thanh toán</th>
              <th class="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chưa thanh toán</th>
              <th class="text-center py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg mr-3">
                    {{ user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-gray-900">{{ user.fullName }}</h3>
                    <p class="text-xs text-gray-500 font-medium">{{ user.phone }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Bank Info -->
              <td class="py-4 px-6">
                <div v-if="user.bankAccount && user.bankAccount.accountNumber" class="text-sm">
                  <p class="font-bold text-gray-900">{{ user.bankAccount.bankName }}</p>
                  <p class="text-gray-500">{{ user.bankAccount.accountNumber }} - {{ user.bankAccount.accountName }}</p>
                  <button @click="openBankModal(user)" class="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest mt-1">Sửa</button>
                </div>
                <div v-else>
                  <button @click="openBankModal(user)" class="text-xs font-bold text-orange-500 hover:text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Thêm tài khoản
                  </button>
                </div>
              </td>
              
              <!-- Paid -->
              <td class="py-4 px-6 text-right">
                <p class="text-sm font-black text-gray-900">{{ formatPrice(user.totalPaid) }}</p>
                <button @click="openHistoryModal(user)" class="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest mt-1 underline">Lịch sử</button>
              </td>
              
              <!-- Unpaid Balance -->
              <td class="py-4 px-6 text-right">
                <p class="text-sm font-black" :class="user.unpaidBalance > 0 ? 'text-red-600' : 'text-gray-400'">
                  {{ formatPrice(user.unpaidBalance) }}
                </p>
                <p class="text-[10px] text-gray-400 mt-1 uppercase" v-if="user.unpaidBalance > 0">Cần trả</p>
              </td>
              
              <!-- Action -->
              <td class="py-4 px-6 text-center">
                <button 
                  @click="openPayoutModal(user)" 
                  :disabled="user.unpaidBalance <= 0 || !user.bankAccount || !user.bankAccount.accountNumber"
                  class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                  :class="user.unpaidBalance > 0 && user.bankAccount?.accountNumber ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : ''"
                >
                  Thanh toán
                </button>
                 <p v-if="user.unpaidBalance > 0 && (!user.bankAccount || !user.bankAccount.accountNumber)" class="text-[9px] text-orange-500 mt-1">*Cần thêm Bank</p>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
               <td colspan="5" class="py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  Không có dữ liệu
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payout Modal -->
    <div v-if="showPayoutModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-black text-gray-900 tracking-tight">Thanh toán lương</h3>
          <button @click="showPayoutModal = false" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
             <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Người nhận</p>
             <p class="font-bold text-gray-900 text-sm mt-1">{{ selectedUser?.fullName }}</p>
             <p class="text-xs text-gray-600">{{ selectedUser?.bankAccount?.bankName }} - {{ selectedUser?.bankAccount?.accountNumber }} - {{ selectedUser?.bankAccount?.accountName }}</p>
          </div>

          <form @submit.prevent="submitPayout" class="space-y-4">
            <div>
              <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Số tiền (VNĐ)</label>
              <input 
                v-model.number="payoutForm.amount" 
                type="number" 
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                required
                min="1000"
                :max="selectedUser?.unpaidBalance"
              >
              <div class="flex justify-between mt-1">
                 <p class="text-xs text-gray-500">Tối đa: <span class="font-bold text-red-500">{{ formatPrice(selectedUser?.unpaidBalance) }}</span></p>
                 <button type="button" @click="payoutForm.amount = selectedUser?.unpaidBalance" class="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Điền tối đa</button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Mã giao dịch (Nội dung CK)</label>
              <input 
                v-model="payoutForm.transactionId" 
                type="text" 
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                placeholder="VD: MBBANK123456"
              >
            </div>
            
            <div>
              <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Ghi chú</label>
              <textarea 
                v-model="payoutForm.notes" 
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none h-24"
                placeholder="Ghi chú thêm..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              :disabled="submitting || payoutForm.amount > selectedUser?.unpaidBalance"
              class="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 uppercase tracking-widest transition-all disabled:bg-gray-300 disabled:shadow-none"
            >
              {{ submitting ? 'Đang lưu...' : 'Xác nhận Đã chuyển khoản' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Update Bank Modal -->
    <div v-if="showBankModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-black text-gray-900 tracking-tight">Thông tin Ngân hàng</h3>
          <button @click="showBankModal = false" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="submitBankUpdate" class="space-y-5">
            <!-- Tên ngân hàng -->
            <div class="relative group">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">Tên ngân hàng</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
                <select 
                  v-model="bankForm.bankName" 
                  class="appearance-none w-full pl-12 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                  required
                >
                  <option value="" disabled selected class="text-gray-400 font-medium">-- Vui lòng chọn ngân hàng --</option>
                  <option v-for="bank in vietnamBanks" :key="bank" :value="bank" class="font-medium">{{ bank }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <!-- Số tài khoản -->
            <div class="relative group">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">Số tài khoản</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                </div>
                <input 
                  v-model="bankForm.accountNumber" 
                  type="text" 
                  class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-black text-indigo-900 text-lg tracking-wider focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  required
                  placeholder="Ví dụ: 1903567890"
                >
              </div>
            </div>

            <!-- Tên chủ tài khoản -->
            <div class="relative group">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">Tên chủ tài khoản</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <input 
                  v-model="bankForm.accountName" 
                  type="text" 
                  class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase shadow-sm"
                  required
                  placeholder="NGUYEN VAN A"
                >
              </div>
            </div>

            <!-- Nút Xác nhận -->
            <button 
              type="submit" 
              :disabled="submitting"
              class="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="submitting" class="loading loading-spinner loading-sm mr-2"></span>
              {{ submitting ? 'Đang lưu hệ thống...' : 'Cập nhật tài khoản' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="text-xl font-black text-gray-900 tracking-tight">Lịch sử trả lương</h3>
            <p class="text-xs font-bold text-gray-500 mt-1">{{ selectedUser?.fullName }}</p>
          </div>
          <button @click="showHistoryModal = false" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
           <div v-if="loadingHistory" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <span class="loading loading-spinner text-indigo-600"></span>
           </div>

           <div v-if="payoutHistory.length === 0" class="text-center text-gray-500 font-bold uppercase tracking-widest text-xs py-10">
              Chưa có lịch sử thanh toán nào.
           </div>

           <div class="space-y-4">
             <div v-for="item in payoutHistory" :key="item._id" class="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-300 transition-colors flex justify-between items-center">
                <div>
                   <p class="text-xs font-black text-gray-400 uppercase tracking-widest">{{ new Date(item.createdAt).toLocaleString('vi-VN') }}</p>
                   <p class="text-sm font-bold text-gray-900 mt-1">Mã GD: <span class="text-indigo-600">{{ item.transactionId || 'N/A' }}</span></p>
                   <p v-if="item.notes" class="text-xs text-gray-500 mt-1 italic">{{ item.notes }}</p>
                </div>
                <div class="text-right">
                   <p class="text-lg font-black text-green-600">+ {{ formatPrice(item.amount) }}</p>
                   <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Đã chuyển khoản</p>
                </div>
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

const vietnamBanks = [
  "Vietcombank (Ngân hàng Ngoại thương VN)",
  "Techcombank (Ngân hàng Kỹ Thương VN)",
  "MBBank (Ngân hàng Quân Đội)",
  "VietinBank (Ngân hàng Công Thương VN)",
  "BIDV (Ngân hàng Đầu tư và Phát triển VN)",
  "Agribank (Ngân hàng NN&PTNT VN)",
  "ACB (Ngân hàng Á Châu)",
  "TPBank (Ngân hàng Tiên Phong)",
  "VPBank (Ngân hàng VN Thịnh Vượng)",
  "Sacombank (Ngân hàng Sài Gòn Thương Tín)",
  "VIB (Ngân hàng Quốc tế VN)",
  "SeABank (Ngân hàng Đông Nam Á)",
  "OCB (Ngân hàng Phương Đông)",
  "MSB (Ngân hàng Hàng Hải VN)",
  "SHB (Ngân hàng Sài Gòn - Hà Nội)",
  "HDBank (Ngân hàng Phát triển TP.HCM)",
  "Eximbank (Ngân hàng XNK VN)",
  "SCB (Ngân hàng Sài Gòn)",
  "Nam A Bank (Ngân hàng Nam Á)",
  "LPBank (Ngân hàng Lộc Phát VN)",
  "Bac A Bank (Ngân hàng Bắc Á)",
  "PVcomBank (Ngân hàng Đại chúng VN)",
  "VietABank (Ngân hàng Việt Á)",
  "NCB (Ngân hàng Quốc Dân)",
  "DongA Bank (Ngân hàng Đông Á)",
  "OceanBank (Ngân hàng Đại Dương)",
  "CBBank (Ngân hàng Xây dựng VN)",
  "BaoViet Bank (Ngân hàng Bảo Việt)",
  "PGBank (Ngân hàng Xăng dầu Petrolimex)",
  "Vietbank (Ngân hàng Việt Nam Thương Tín)"
];

const toast = useToast()
const loading = ref(true)
const submitting = ref(false)
const users = ref([])
const activeTab = ref('driver') // 'driver' or 'collaborator'

const showPayoutModal = ref(false)
const showBankModal = ref(false)
const showHistoryModal = ref(false)

const selectedUser = ref(null)
const payoutHistory = ref([])
const loadingHistory = ref(false)

const payoutForm = ref({
  amount: 0,
  transactionId: '',
  notes: ''
})

const bankForm = ref({
  bankName: '',
  accountNumber: '',
  accountName: ''
})

const filteredUsers = computed(() => {
  return users.value.filter(u => u.role === activeTab.value)
})

const totalUnpaid = computed(() => {
  return filteredUsers.value.reduce((sum, u) => sum + (u.unpaidBalance || 0), 0)
})

const fetchBalances = async () => {
  loading.value = true
  try {
    const response = await api.get('/payouts/balances')
    users.value = response.data
  } catch (error) {
    toast.error('Lỗi tải danh sách số dư')
  } finally {
    loading.value = false
  }
}

const openPayoutModal = (user) => {
  selectedUser.value = user
  payoutForm.value = {
    amount: user.unpaidBalance,
    transactionId: '',
    notes: ''
  }
  showPayoutModal.value = true
}

const openBankModal = (user) => {
  selectedUser.value = user
  bankForm.value = {
    bankName: user.bankAccount?.bankName || '',
    accountNumber: user.bankAccount?.accountNumber || '',
    accountName: user.bankAccount?.accountName || ''
  }
  showBankModal.value = true
}

const openHistoryModal = async (user) => {
  selectedUser.value = user
  showHistoryModal.value = true
  loadingHistory.value = true
  
  try {
    const response = await api.get(`/payouts/history/${user._id}`)
    payoutHistory.value = response.data
  } catch (error) {
    toast.error('Lỗi tải lịch sử')
  } finally {
    loadingHistory.value = false
  }
}

const submitPayout = async () => {
  if (payoutForm.value.amount <= 0 || payoutForm.value.amount > selectedUser.value.unpaidBalance) {
    toast.error('Số tiền không hợp lệ')
    return
  }

  submitting.value = true
  try {
    await api.post('/payouts', {
      payeeId: selectedUser.value._id,
      amount: payoutForm.value.amount,
      transactionId: payoutForm.value.transactionId,
      notes: payoutForm.value.notes
    })
    
    toast.success('Ghi nhận thanh toán khoản lương thành công!')
    showPayoutModal.value = false
    await fetchBalances() // Refresh data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Lỗi khi thanh toán')
  } finally {
    submitting.value = false
  }
}

const submitBankUpdate = async () => {
  if (!bankForm.value.bankName || !bankForm.value.accountNumber || !bankForm.value.accountName) {
    toast.error('Vui lòng điền đủ thông tin')
    return
  }

  submitting.value = true
  try {
    await api.put(`/payouts/bank/${selectedUser.value._id}`, bankForm.value)
    
    toast.success('Cập nhật thông tin ngân hàng thành công!')
    showBankModal.value = false
    await fetchBalances() // Refresh data
  } catch (error) {
    toast.error(error.response?.data?.message || 'Lỗi khi cập nhật ngân hàng')
  } finally {
    submitting.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

onMounted(() => {
  fetchBalances()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
