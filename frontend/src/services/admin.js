import apiClient from '../services/apiClient';

export const fetchDashboardStats = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const updateUserStatus = async (userId, isActive, reason) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}/status`, { isActive, reason });
        return response.data;
    } catch (error) {
        console.error("Failed to update user status:", error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw error;
    }
};

export const fetchItineraries = async () => {
    try {
        const response = await apiClient.get('/admin/itineraries');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch itineraries:", error);
        throw error;
    }
};
