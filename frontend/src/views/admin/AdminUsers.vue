<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p class="text-gray-600 mt-1">Quản lý tất cả tài khoản người dùng trong hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <button @click="exportUsers" class="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all border border-white/30">
            <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Xuất Excel
          </button>
          <button @click="showAddUserModal = true" class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-lg">
            <svg class="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Thêm người dùng
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Tổng người dùng</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers || 0 }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Đang hoạt động</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.activeUsers || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Chưa xác minh</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.unverifiedUsers || 0 }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Bị khóa</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.blockedUsers || 0 }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Tên, email, SĐT..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
          <select v-model="filters.role" @change="fetchUsers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="user">Khách hàng</option>
            <option value="owner">Chủ xe</option>
            <option value="driver">Tài xế</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <select v-model="filters.status" @change="fetchUsers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Xác minh</label>
          <select v-model="filters.verified" @change="fetchUsers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="true">Đã xác minh</option>
            <option value="false">Chưa xác minh</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Danh sách người dùng</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Hiển thị {{ users.length }}/{{ pagination.totalUsers }} kết quả</span>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span class="text-white font-medium">{{ user.fullName?.charAt(0) || 'U' }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.fullName }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.phone || 'Chưa có' }}</div>
                <div class="text-sm text-gray-500 truncate max-w-[250px]" :title="user.addressId?.fullAddress || user.address">
                  {{ user.addressId?.fullAddress || user.address || 'Chưa có địa chỉ' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getRoleBadgeClass(user.role)">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ user.isVerified ? 'Đã xác minh' : 'Chưa xác minh' }}
                  </span>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="user.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'">
                    {{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="viewUser(user)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button @click="editUser(user)" class="text-green-600 hover:text-green-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </button>
                  <button @click="toggleUserStatus(user)" class="text-yellow-600 hover:text-yellow-900">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l3 3a1 1 0 000-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button @click="deleteUser(user._id)" class="text-red-600 hover:text-red-900">
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

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Hiển thị <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> đến 
            <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, pagination.totalUsers) }}</span> của 
            <span class="font-medium">{{ pagination.totalUsers }}</span> kết quả
          </div>
          <div class="flex items-center space-x-2">
            <button @click="prevPage" :disabled="!pagination.hasPrev" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>
            <span class="px-3 py-1 text-sm font-medium text-gray-700">
              {{ currentPage }} / {{ pagination.totalPages }}
            </span>
            <button @click="nextPage" :disabled="!pagination.hasNext" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Thêm người dùng mới</h3>
          <form @submit.prevent="addUser">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input v-model="newUser.fullName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="newUser.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input v-model="newUser.password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input v-model="newUser.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <AddressSelector ref="addUserAddressSelectorRef" v-model="newUser.address" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select v-model="newUser.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="user">Khách hàng</option>
                  <option value="owner">Chủ xe</option>
                  <option value="driver">Tài xế</option>
                  <option value="collaborator">CTV (Cộng tác viên)</option>
                </select>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="showAddUserModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View User Modal -->
    <div v-if="showViewUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Chi tiết người dùng</h3>
            <button @click="showViewUserModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedUser" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- User Profile -->
            <div class="text-center">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <span class="text-white font-bold text-3xl">{{ selectedUser.fullName?.charAt(0) || 'U' }}</span>
              </div>
              <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedUser.fullName }}</h4>
              <div class="space-y-2">
                <span class="px-3 py-1 text-sm font-semibold rounded-full" :class="getRoleBadgeClass(selectedUser.role)">
                  {{ getRoleText(selectedUser.role) }}
                </span>
                <span class="px-3 py-1 text-sm font-semibold rounded-full" :class="selectedUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ selectedUser.isVerified ? 'Đã xác minh' : 'Chưa xác minh' }}
                </span>
                <span class="px-3 py-1 text-sm font-semibold rounded-full" :class="selectedUser.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'">
                  {{ selectedUser.isActive ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </div>
            </div>
            
            <!-- User Details -->
            <div>
              <h5 class="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h5>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Email:</span>
                  <span class="font-medium">{{ selectedUser.email }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Số điện thoại:</span>
                  <span class="font-medium">{{ selectedUser.phone || 'Chưa có' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Địa chỉ:</span>
                  <span class="font-medium text-right ml-4">{{ selectedUser.addressId?.fullAddress || selectedUser.address || 'Chưa có' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Ngày đăng ký:</span>
                  <span class="font-medium">{{ formatDate(selectedUser.createdAt) }}</span>
                </div>
                <div class="flex justify-between py-2 border-b">
                  <span class="text-gray-600">Lần đăng nhập cuối:</span>
                  <span class="font-medium">{{ selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Chưa đăng nhập' }}</span>
                </div>
              </div>
              
              <!-- Role-specific info -->
              <div v-if="selectedUser.role === 'owner'" class="mt-4 p-3 bg-green-50 rounded-lg">
                <h5 class="font-medium text-green-900 mb-2">Thông tin chủ xe</h5>
                <p class="text-sm text-green-700">Số xe đã đăng ký: {{ selectedUser.carCount || 0 }}</p>
                <p class="text-sm text-green-700">Tỷ lệ duyệt: {{ selectedUser.approvalRate || 0 }}%</p>
              </div>
              
              <div v-if="selectedUser.role === 'driver'" class="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h5 class="font-medium text-yellow-900 mb-2">Thông tin tài xế</h5>
                <p class="text-sm text-yellow-700">Kinh nghiệm: {{ selectedUser.experience || 0 }} năm</p>
                <p class="text-sm text-yellow-700">Bằng lái: {{ selectedUser.licenseType || 'B2' }}</p>
                <p class="text-sm text-yellow-700">Đánh giá: {{ selectedUser.rating || 0 }}/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa người dùng</h3>
          <form @submit.prevent="updateUser">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input v-model="editingUser.fullName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="editingUser.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input v-model="editingUser.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <AddressSelector ref="editUserAddressSelectorRef" v-model="editingUser.address" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select v-model="editingUser.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="user">Khách hàng</option>
                  <option value="owner">Chủ xe</option>
                  <option value="driver">Tài xế</option>
                  <option value="collaborator">CTV (Cộng tác viên)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="flex items-center">
                <input v-model="editingUser.isVerified" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                <label class="ml-2 text-sm text-gray-700">Đã xác minh</label>
              </div>
              <div class="flex items-center">
                <input v-model="editingUser.isActive" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                <label class="ml-2 text-sm text-gray-700">Hoạt động</label>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="showEditUserModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import AddressSelector from '@/components/AddressSelector.vue'

const toast = useToast()

const users = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showAddUserModal = ref(false)
const showViewUserModal = ref(false)
const showEditUserModal = ref(false)
const selectedUser = ref(null)
const editingUser = ref({})
const addUserAddressSelectorRef = ref(null)
const editUserAddressSelectorRef = ref(null)

const filters = ref({
  role: '',
  verified: '',
  status: ''
})

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  unverifiedUsers: 0,
  blockedUsers: 0
})

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  hasNext: false,
  hasPrev: false
})

const newUser = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'user'
})

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchUsers()
  }, 500)
}

// Fetch users with pagination and filtering
const fetchUsers = async () => {
  try {
    const response = await api.get('/admin/users', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        role: filters.value.role,
        verified: filters.value.verified,
        status: filters.value.status
      }
    })
    users.value = response.data.users
    pagination.value = response.data.pagination
    
    // Calculate stats
    stats.value = {
      totalUsers: response.data.pagination.totalUsers,
      activeUsers: users.value.filter(u => u.isActive).length,
      unverifiedUsers: users.value.filter(u => !u.isVerified).length,
      blockedUsers: users.value.filter(u => !u.isActive).length
    }
  } catch (error) {
    toast.error('Không thể tải danh sách người dùng')
  }
}

// Add new user
const addUser = async () => {
  try {
    // Create user first without address
    const userData = {
      ...newUser.value,
      addressId: null // Don't set addressId yet
    }
    
    const response = await api.post('/auth/register', userData)
    const createdUser = response.data.user || response.data
    
    // Now create address if provided and associate with the user
    let addressId = null
    if (addUserAddressSelectorRef.value && addUserAddressSelectorRef.value.isAddressComplete()) {
      addressId = await addUserAddressSelectorRef.value.saveAddressToDB('User', createdUser._id, createdUser._id)
      if (!addressId) {
        toast.error('Không thể lưu địa chỉ')
        return
      }
      
      // Update user with addressId
      await api.put(`/admin/users/${createdUser._id}`, { addressId: addressId })
    }
    
    toast.success('Thêm người dùng thành công')
    showAddUserModal.value = false
    resetNewUser()
    fetchUsers()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Thêm người dùng thất bại')
  }
}

// Reset new user form
const resetNewUser = () => {
  newUser.value = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user'
  }
  // Reset address selector
  if (addUserAddressSelectorRef.value) {
    addUserAddressSelectorRef.value.clearForm()
  }
}

// Toggle user status
const toggleUserStatus = async (user) => {
  try {
    const newStatus = !user.isActive
    await api.put(`/admin/users/${user._id}/status`, { isActive: newStatus })
    user.isActive = newStatus
    toast.success(`Cập nhật trạng thái thành công`)
    fetchUsers()
  } catch (error) {
    toast.error('Cập nhật trạng thái thất bại')
  }
}

// Delete user
const deleteUser = async (userId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
  
  try {
    await api.delete(`/admin/users/${userId}`)
    toast.success('Xóa người dùng thành công')
    fetchUsers()
  } catch (error) {
    toast.error('Xóa người dùng thất bại')
  }
}

// View user details
const viewUser = (user) => {
  selectedUser.value = user
  showViewUserModal.value = true
}

// Edit user
const editUser = (user) => {
  console.log('Editing user:', user)
  editingUser.value = { ...user }
  showEditUserModal.value = true
  nextTick(() => {
    setTimeout(() => {
      if (editUserAddressSelectorRef.value) {
        console.log('Loading address for user:', editingUser.value)
        
        // Try to load address from different possible structures
        if (editingUser.value.addressId && typeof editingUser.value.addressId === 'object') {
          // If addressId is a populated object from backend
          console.log('Loading address from addressId object:', editingUser.value.addressId)
          editUserAddressSelectorRef.value.loadAddressFromObject(editingUser.value.addressId)
        } else if (editingUser.value.addressId && typeof editingUser.value.addressId === 'string') {
          // If addressId is just an ID, load by ID
          console.log('Loading address by ID:', editingUser.value.addressId)
          editUserAddressSelectorRef.value.loadAddressById(editingUser.value.addressId)
        } else if (editingUser.value.addressId?.fullAddress || editingUser.value.address) {
          // Fallback to string parsing
          const addressToParse = editingUser.value.addressId?.fullAddress || editingUser.value.address
          console.log('Parsing address string:', addressToParse)
          editUserAddressSelectorRef.value.parseAddress?.(addressToParse)
        } else {
          console.log('No address data found for user')
        }
      }
    }, 200)
  })
}

// Update user
const updateUser = async () => {
  try {
    // Save or update address first
    const existingAddressId = editingUser.value.addressId?._id || editingUser.value.addressId
    let addressId = existingAddressId
    
    if (editUserAddressSelectorRef.value && editUserAddressSelectorRef.value.isAddressComplete()) {
      try {
        if (existingAddressId) {
          addressId = await editUserAddressSelectorRef.value.updateAddressInDB(existingAddressId, 'User', editingUser.value._id)
        } else {
          addressId = await editUserAddressSelectorRef.value.saveAddressToDB('User', editingUser.value._id, editingUser.value._id)
        }
        
        if (!addressId && !existingAddressId) { // Only error if we didn't have one and failed to create one
          toast.error('Không thể lưu địa chỉ mới')
          return
        }
      } catch (err) {
        console.error('Address sync error:', err)
        // Non-critical: keep old addressId if it exists
        addressId = existingAddressId
      }
    }
    
    // Prepare user data
    const userData = {
      ...editingUser.value,
      addressId: addressId || existingAddressId
    }
    
    const response = await api.put(`/admin/users/${editingUser.value._id}`, userData)
    const updatedUser = response.data.user
    
    toast.success('Cập nhật người dùng thành công')
    showEditUserModal.value = false
    editingUser.value = {}
    
    // Update the user in the local list to have the latest data
    const userIndex = users.value.findIndex(u => u._id === updatedUser._id)
    if (userIndex !== -1) {
      users.value[userIndex] = updatedUser
    }
    
    fetchUsers()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Cập nhật người dùng thất bại')
  }
}

// Export users to Excel
const exportUsers = async () => {
  try {
    toast.info('Đang xuất dữ liệu...')
    
    // Get all users for export
    const response = await api.get('/admin/users', {
      params: { limit: 1000, search: searchQuery.value, ...filters.value }
    })
    
    const users = response.data.users || []
    
    // Create CSV content
    const csvContent = [
      ['ID', 'Họ và tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Trạng thái', 'Xác minh', 'Ngày đăng ký'],
      ...users.map(user => [
        user._id,
        user.fullName,
        user.email,
        user.phone || '',
        user.address || '',
        getRoleText(user.role),
        user.isActive ? 'Hoạt động' : 'Bị khóa',
        user.isVerified ? 'Đã xác minh' : 'Chưa xác minh',
        formatDate(user.createdAt)
      ])
    ].map(row => row.join(',')).join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Xuất dữ liệu thành công!')
  } catch (error) {
    toast.error('Không thể xuất dữ liệu')
  }
}

// Pagination
const nextPage = () => {
  if (pagination.value.hasNext) {
    currentPage.value++
    fetchUsers()
  }
}

const prevPage = () => {
  if (pagination.value.hasPrev) {
    currentPage.value--
    fetchUsers()
  }
}

// Helper functions
const getRoleText = (role) => {
  const roles = {
    user: 'Khách hàng',
    owner: 'Chủ xe',
    driver: 'Tài xế',
    collaborator: 'CTV',
    admin: 'Admin'
  }
  return roles[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    user: 'bg-blue-100 text-blue-800',
    owner: 'bg-green-100 text-green-800',
    driver: 'bg-yellow-100 text-yellow-800',
    collaborator: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchUsers()
})
</script>
