import apiClient from "./apiClient";

const searchService = {
  search: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get("/search", {
        params: { query, page, limit }
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