<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center" v-if="status">
      
      <div v-if="status === 'processing'" class="mb-6 py-8">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Đang xác thực thông tin...</h2>
        <p class="text-gray-500">Vui lòng đợi giây lát, không tắt trình duyệt vào lúc này.</p>
      </div>

      <div v-else-if="status === 'success'" class="mb-6">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-900 mb-2">Thanh toán thành công!</h2>
        <p class="text-gray-500">Giao dịch của bạn đã được xác nhận. Vui lòng kiểm tra lại lịch sử đơn đặt xe.</p>
      </div>
      
      <div v-else class="mb-6">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-900 mb-2">Giao dịch thất bại!</h2>
        <p class="text-gray-500">Thanh toán bị lỗi hoặc đã bị hủy. Vui lòng thử lại sau.</p>
      </div>
      
      <div v-if="status !== 'processing'" class="mt-8 space-y-3">
        <router-link :to="bookingLink" class="w-full block py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all">Xem chi tiết đơn xe</router-link>
        <router-link to="/" class="w-full block py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-2xl border-2 border-gray-200 transition-all">Về trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const status = ref('processing');
const bookingId = ref('');

onMounted(async () => {
  const query = route.query;
  
  // VNPay Response
  if (query.vnp_ResponseCode) {
    if (query.vnp_ResponseCode === '00') {
      try {
        const res = await api.get('/vnpay/vnpay_return', { params: query });
        if (res.data.success) {
          status.value = 'success';
          bookingId.value = res.data.bookingId || query.vnp_TxnRef.split('_')[0];
        } else {
          status.value = 'failed';
        }
      } catch (err) {
        console.error('VNPay verification error:', err);
        status.value = 'failed';
      }
    } else {
      status.value = 'failed';
      if (query.vnp_TxnRef) {
        bookingId.value = query.vnp_TxnRef.split('_')[0];
      }
    }
  } 
  // payOS Response - payOS redirects with query params: code, id, cancel, status, orderCode
  else if (query.orderCode || query.code === '00' || query.status === 'PAID') {
    try {
      // payOS returns code=00 for success, cancel=true if cancelled
      if (query.cancel === 'true') {
        status.value = 'failed';
      } else if (query.code === '00' || query.status === 'PAID') {
        status.value = 'success';
        // Try to find booking by orderCode via the backend
        if (query.orderCode) {
          try {
            const res = await api.get(`/payos/payment-info/${query.orderCode}`);
            if (res.data.success) {
              console.log('[PayOS Return] Payment info:', res.data.data);
            }
          } catch (e) {
            console.log('[PayOS Return] Could not fetch payment info:', e.message);
          }
        }
      } else {
        status.value = 'failed';
      }
    } catch (err) {
      console.error('PayOS verification error:', err);
      status.value = 'failed';
    }
  } else {
    status.value = 'failed';
  }
});

const bookingLink = computed(() => {
  if (bookingId.value) return `/bookings/${bookingId.value}`;
  return '/my-bookings';
});
</script>
