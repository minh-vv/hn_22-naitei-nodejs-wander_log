import apiClient from "./apiClient";

const userService = {
  getMyProfile: async () => {
    try {
      const response = await apiClient.get("/users/profile");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },

  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/users/profile", profileData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  getUserStats: async () => {
    try {
      const response = await apiClient.get("/users/profile/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user stats"
      );
    }
  },

  getMyItineraries: async () => {
    try {
      const response = await apiClient.get("/users/profile/itineraries");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch itineraries"
      );
    }
  },

  getUserItineraries: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/itineraries`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user itineraries"
      );
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user posts"
      );
    }
  },

  followUser: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to follow user");
    }
  },

  unfollowUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to unfollow user"
      );
    }
  },
};

export default userService;
