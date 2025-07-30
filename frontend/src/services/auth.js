import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost3000/api';

const authService = {
  signup: async (email, password, username, name) => { 
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, { email, password, username, name }); 
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
  },

  signin: async(email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  socialSignin: async (provider, token) => { 
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/social-signin`, { provider, token }); 
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (email) => { 
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email }); 
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (token, newPassword) => { 
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword }); 
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  changePassword: async (currentPassword, newPassword, token) => { // 
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

};

export default authService;
