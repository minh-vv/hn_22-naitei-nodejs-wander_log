import apiClient from "./apiClient";

const searchService = {
  search: async (query) => {
    try {
      const response = await apiClient.get("/search", {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to perform search"
      );
    }
  },
};

export default searchService;