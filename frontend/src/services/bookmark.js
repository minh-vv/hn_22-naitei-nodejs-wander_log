import apiClient from "./apiClient";

const bookmarkService = {
  create: async (data) => {
    try {
      const res = await apiClient.post("/bookmarks", data);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create bookmark"
      );
    }
  },

  remove: async (bookmarkId) => {
    try {
      const res = await apiClient.delete(`/bookmarks/${bookmarkId}`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to remove bookmark"
      );
    }
  },

  check: async (type, itemId) => {
    try {
      const res = await apiClient.get(
        `/bookmarks/check?type=${type}&itemId=${itemId}`
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to check bookmark"
      );
    }
  },

  list: async () => {
    try {
      const res = await apiClient.get("/bookmarks");
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookmarks"
      );
    }
  },
};

export default bookmarkService;
