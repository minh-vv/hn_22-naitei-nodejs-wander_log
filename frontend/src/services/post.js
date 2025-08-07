const API_BASE_URL = "http://localhost:3000/posts";

const postService = {
  getPosts: async (token) => {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch posts");
    }
    return response.json();
  },

  delete: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete post with id ${id}");
    }
    return response.json();
  },

  update: async (token, id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update post with id ${id}");
    }
    return response.json();
  },

  create: async (postData, token) => {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create itinerary");
    }
    return response.json();
  },

  uploadMediaFiles: async (files) => {
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      uploadedUrls.push(...result.mediaUrls);
    }

    return uploadedUrls;
  },
};

export default postService;
