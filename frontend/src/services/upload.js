import apiClient from "./apiClient";

const uploadService = {
  uploadItineraryCover: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post("/uploads/itinerary-cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.url;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload itinerary cover image"
      );
    }
  },
};

export default uploadService;
