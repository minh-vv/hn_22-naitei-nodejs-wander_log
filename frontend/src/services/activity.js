import apiClient from "./apiClient";

const activityService = {
  createActivity: async (activityData) => {
    try {
      const response = await apiClient.post("/activities", activityData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create activity"
      );
    }
  },

  updateActivity: async (id, activityData) => {
    try {
      const response = await apiClient.put(`/activities/${id}`, activityData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to update activity with id ${id}`
      );
    }
  },

  deleteActivity: async (id) => {
    try {
      const response = await apiClient.delete(`/activities/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete activity with id ${id}`
      );
    }
  },
};

export default activityService;
