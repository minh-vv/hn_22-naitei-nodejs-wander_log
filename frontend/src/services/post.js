import apiClient from "./apiClient";

const postService = {
  getAllPosts: async () => {
    try {
      const res = await apiClient.get("/posts", { skipAuth: true });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch posts");
    }
  },

  getNewsFeed: async () => {
    try {
      const res = await apiClient.get("/posts/feed");
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch news feed"
      );
    }
  },

  deletePost: async (id) => {
    try {
      const res = await apiClient.delete(`/posts/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to delete post with ID ${id}`
      );
    }
  },

  updatePost: async (id, updateData) => {
    try {
      const res = await apiClient.put(`/posts/${id}`, updateData);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to update post with ID ${id}`
      );
    }
  },

  createPost: async (postData) => {
    try {
      const res = await apiClient.post("/posts", postData);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create post");
    }
  },

  uploadMediaFiles: async (files) => {
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiClient.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          skipAuth: true,
        });
        uploadedUrls.push(...res.data.mediaUrls);
      }
      return uploadedUrls;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload media files"
      );
    }
  },

  likePost: async (id) => {
    try {
      const res = await apiClient.post(`/posts/${id}/like`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to like post with ID ${id}`
      );
    }
  },

  getComments: async (id) => {
    try {
      const res = await apiClient.get(`/posts/${id}/comment`, {
        skipAuth: true,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch comments for post ID ${id}`
      );
    }
  },

  createComment: async (id, commentData) => {
    try {
      const res = await apiClient.post(`/posts/${id}/comment`, commentData);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to create comment for post ID ${id}`
      );
    }
  },

  deleteComment: async (id, commentId) => {
    try {
      const res = await apiClient.delete(`/posts/${id}/comment/${commentId}`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete comment ${commentId} for post ID ${id}`
      );
    }
  },
};

export default postService;
