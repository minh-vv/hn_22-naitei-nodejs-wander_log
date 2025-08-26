import apiClient from './apiClient';

export const notificationAPI = {
  getAllNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
};


