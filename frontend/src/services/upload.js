import apiClient from "./apiClient";

const uploadService = {
  uploadItineraryCover: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to upload itinerary cover image"
      );
    }
  },

  uploadMediaFiles: async (files) => {
    try {
      const promises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const endpoint = file.type.startsWith("video/")
          ? "/upload/video"
          : "/upload/image";

        const res = await apiClient.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          skipAuth: true,
        });

        return { url: res.data.url, publicId: res.data.public_id };
      });

      return await Promise.all(promises);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload media files"
      );
    }
  },

  deleteMedia: async (publicId, type) => {
    if (!publicId) throw new Error("publicId is required to delete media");

    const res = await apiClient.delete("/upload", {
      data: { public_id: publicId, type },
    });

    return res.data;
  },
};

export default uploadService;
