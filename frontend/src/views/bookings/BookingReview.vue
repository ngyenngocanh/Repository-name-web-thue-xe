<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="spinner mr-4"></div>
      <span class="text-gray-500 font-medium">Đang tải thông tin...</span>
    </div>

    <div v-else-if="!booking" class="text-center py-20 bg-white rounded-3xl shadow-sm">
      <p class="text-gray-500 font-bold">Không tìm thấy thông tin chuyến đi.</p>
      <button @click="router.back()" class="mt-4 text-primary-600 font-black uppercase text-sm">Quay lại</button>
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-black text-gray-900 mb-2">Đánh giá dịch vụ</h1>
        <p class="text-gray-500 font-medium italic">Chia sẻ trải nghiệm của bạn về chuyến đi #{{ booking._id.slice(-8) }}</p>
      </div>

      <!-- Review Form -->
      <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
        <form @submit.prevent="submitReview" class="space-y-12">
          
          <!-- Car Review Section -->
          <div v-if="showCarReview" class="space-y-6">
            <div class="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-xl">🚗</div>
              <div>
                <h3 class="text-xl font-black text-gray-900">Đánh giá phương tiện</h3>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">{{ booking.car?.brand }} {{ booking.car?.model }}</p>
              </div>
            </div>

            <div class="space-y-8">
              <div class="flex flex-col items-center">
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Chất lượng xe & Vệ sinh</p>
                <div class="flex gap-2 text-4xl">
                  <span 
                    v-for="star in 5" 
                    :key="star" 
                    @click="carRating = star"
                    class="cursor-pointer transition-all hover:scale-125"
                    :class="carRating >= star ? 'text-yellow-400' : 'text-gray-200'"
                  >
                    ★
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 text-center">Nhận xét về xe</label>
                <textarea 
                  v-model="carComment" 
                  rows="4" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  placeholder="Xe đi êm, sạch sẽ, máy lạnh mạnh..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Driver Review Section -->
          <div v-if="showDriverReview" class="space-y-6 pt-12 border-t border-gray-100">
            <div class="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">👤</div>
              <div>
                <h3 class="text-xl font-black text-gray-900">Đánh giá {{ booking.rentalType === 'self_drive' ? 'Chủ xe' : 'Tài xế' }}</h3>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">{{ driverName }}</p>
              </div>
            </div>

            <div class="space-y-8">
              <div class="flex flex-col items-center">
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thái độ & Phục vụ</p>
                <div class="flex gap-2 text-4xl">
                  <span 
                    v-for="star in 5" 
                    :key="star" 
                    @click="driverRating = star"
                    class="cursor-pointer transition-all hover:scale-125"
                    :class="driverRating >= star ? 'text-yellow-400' : 'text-gray-200'"
                  >
                    ★
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 text-center">Nhận xét về {{ booking.rentalType === 'self_drive' ? 'chủ xe' : 'tài xế' }}</label>
                <textarea 
                  v-model="driverComment" 
                  rows="4" 
                  class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  placeholder="Tài xế nhiệt tình, đi đúng giờ..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-8">
            <button 
              type="submit" 
              :disabled="submitting" 
              class="w-full py-5 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-200 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Đang xử lý...' : (hasExistingReview ? 'Cập nhật đánh giá' : 'Hoàn tất đánh giá') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const booking = ref(null)
const loading = ref(true)
const submitting = ref(false)

const carRating = ref(5)
const carComment = ref('')
const driverRating = ref(5)
const driverComment = ref('')

const showCarReview = computed(() => booking.value?.rentalType !== 'driver_only')
const showDriverReview = computed(() => booking.value?.rentalType !== 'self_drive')

const hasExistingReview = computed(() => {
  return booking.value?.reviews?.carReview || booking.value?.reviews?.renterReview
})

const driverName = computed(() => {
  if (booking.value?.driver) return booking.value.driver.fullName
  if (booking.value?.owner) return booking.value.owner.fullName
  return 'Đối tác'
})

const fetchBooking = async () => {
  try {
    const response = await api.get(`/bookings/${route.params.id}`)
    booking.value = response.data.booking

    // Pre-fill existing car review
    if (booking.value.reviews?.carReview) {
      try {
        const carRevRes = await api.get(`/reviews/${booking.value.reviews.carReview}`)
        if (carRevRes.data.review) {
          carRating.value = carRevRes.data.review.rating.overall || 5
          carComment.value = carRevRes.data.review.comment || ''
        }
      } catch (err) {
        console.error('Error fetching car review:', err)
        if (err.response?.status === 404) {
          booking.value.reviews.carReview = null
        }
      }
    }

    // Pre-fill existing driver/owner review
    if (booking.value.reviews?.renterReview) {
      try {
        const driverRevRes = await api.get(`/reviews/${booking.value.reviews.renterReview}`)
        if (driverRevRes.data.review) {
          driverRating.value = driverRevRes.data.review.rating.overall || 5
          driverComment.value = driverRevRes.data.review.comment || ''
        }
      } catch (err) {
        console.error('Error fetching driver review:', err)
        if (err.response?.status === 404) {
          booking.value.reviews.renterReview = null
        }
      }
    }

  } catch (error) {
    toast.error('Không tìm thấy chuyến đi')
    router.push('/my-bookings')
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  try {
    submitting.value = true
    let successCount = 0
    
    // 1. Submit or Update Car Review
    if (showCarReview.value) {
      try {
        if (booking.value.reviews?.carReview) {
          await api.put(`/reviews/${booking.value.reviews.carReview}`, {
            rating: { overall: carRating.value },
            comment: carComment.value
          })
          successCount++
        } else {
          await api.post('/reviews', {
            booking: booking.value._id,
            type: 'car_review',
            rating: { overall: carRating.value },
            comment: carComment.value
          })
          successCount++
        }
      } catch (e) {
        if (!e.response?.data?.message?.includes('already exists')) throw e
      }
    }

    // 2. Submit or Update Driver/Owner Review
    if (showDriverReview.value) {
      try {
        if (booking.value.reviews?.renterReview) {
           await api.put(`/reviews/${booking.value.reviews.renterReview}`, {
             rating: { overall: driverRating.value },
             comment: driverComment.value
           })
           successCount++
        } else {
          await api.post('/reviews', {
            booking: booking.value._id,
            type: 'renter_to_owner',
            rating: { overall: driverRating.value },
            comment: driverComment.value
          })
          successCount++
        }
      } catch (e) {
        if (!e.response?.data?.message?.includes('already exists')) throw e
      }
    }

    toast.success(hasExistingReview.value ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã gửi đánh giá!')
    router.push(`/bookings/${booking.value._id}`)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý đánh giá')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchBooking)
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
