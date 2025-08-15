import apiClient from "./apiClient";

const itineraryService = {
  getAllItineraries: async () => {
    try {
      const response = await apiClient.get("/itineraries");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch itineraries"
      );
    }
  },

  getItineraryById: async (id) => {
    try {
      const response = await apiClient.get(`/itineraries/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch itinerary with ID ${id}`
      );
    }
  },

  createItinerary: async (itineraryData) => {
    try {
      const response = await apiClient.post("/itineraries", itineraryData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create itinerary"
      );
    }
  },

  updateItinerary: async (id, itineraryData) => {
    try {
      const response = await apiClient.put(`/itineraries/${id}`, itineraryData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to update itinerary with ID ${id}`
      );
    }
  },

  deleteItinerary: async (id) => {
    try {
      const response = await apiClient.delete(`/itineraries/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete itinerary with ID ${id}`
      );
    }
  },
};

export default itineraryService;
