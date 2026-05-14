import { defineStore } from 'pinia';
import api from '@/services/api';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    intervalId: null
  }),

  actions: {
    _isAuthenticated() {
      // Kiểm tra token trực tiếp từ localStorage để tránh circular dependency
      return !!localStorage.getItem('token');
    },

    async fetchNotifications() {
      if (this.loading || !this._isAuthenticated()) return;
      this.loading = true;
      try {
        const response = await api.get('/notifications?limit=20');
        this.notifications = response.data.notifications;
        this.unreadCount = response.data.unreadCount;
      } catch (error) {
        // Nếu 401 thì dừng polling, không log lỗi gây nhiễu
        if (error.response?.status === 401) {
          this.stopPolling();
          return;
        }
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUnreadCount() {
      if (!this._isAuthenticated()) return;
      try {
        const response = await api.get('/notifications/unread-count');
        this.unreadCount = response.data.unreadCount;
      } catch (error) {
        // Nếu 401 thì dừng polling
        if (error.response?.status === 401) {
          this.stopPolling();
        }
      }
    },
    
    startPolling() {
      if (this.intervalId) return;
      if (!this._isAuthenticated()) return;
      this.fetchNotifications();
      // Lấy số lượng thông báo chưa đọc mỗi 30s
      this.intervalId = setInterval(() => {
        this.fetchUnreadCount();
      }, 30000);
    },
    
    stopPolling() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async markAsRead(id) {
      if (!id) return;
      try {
        await api.put(`/notifications/${id}/read`);
        const item = this.notifications.find(n => n._id === id);
        if (item && !item.read) {
          item.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },

    async markAllAsRead() {
      if (this.unreadCount === 0) return;
      try {
        await api.put('/notifications/read-all');
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
  }
});
