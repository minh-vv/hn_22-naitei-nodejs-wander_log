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

export const fetchUsers = async (query = '') => {
    try {
        const response = await apiClient.get('/admin/users', {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

export const fetchUserById = async (userId) => {
    try {
        const response = await apiClient.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user details:", error);
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

export const fetchItineraries = async (query = '') => {
    try {
        const response = await apiClient.get('/admin/itineraries', {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch itineraries:", error);
        throw error;
    }
};

export const fetchItineraryById = async (itineraryId) => {
    try {
        const response = await apiClient.get(`/admin/itineraries/${itineraryId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch itinerary details:", error);
        throw error;
    }
};

export const deleteItinerary = async (itineraryId) => {
    try {
        const response = await apiClient.delete(`/admin/itineraries/${itineraryId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete itinerary:", error);
        throw error;
    }
};


