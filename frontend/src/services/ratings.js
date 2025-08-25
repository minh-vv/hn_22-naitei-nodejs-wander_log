// src/services/ratingsService.js
import apiClient from "./apiClient";

const ratingsService = {
  rate: async (itineraryId, value) => {
    try {
      const response = await apiClient.post(`/ratings/${itineraryId}`, { value });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to submit rating"
      );
    }
  },
  
  getUserRating: async (itineraryId, userId) => {
    try {
      const response = await apiClient.get(`/ratings/${itineraryId}/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch user rating"
      );
    }
  },
  
  getAverageRating: async (itineraryId) => {
    try {
      const response = await apiClient.get(`/ratings/average/${itineraryId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch average rating"
      );
    }
  }
};

export default ratingsService;
