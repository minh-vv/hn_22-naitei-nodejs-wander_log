import apiClient from "./apiClient";

const authService = {
  signup: async (email, password, name) => {
    try {
      const response = await apiClient.post("/auth/signup", {
        email,
        password,
        name,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to sign up");
    }
  },

  signin: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to sign in");
    }
  },

  socialSignin: async (provider, token) => {
    try {
      const response = await apiClient.post("/auth/social-signin", {
        provider,
        token,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to sign in with social account"
      );
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to request password reset"
      );
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  },
};

export default authService;
