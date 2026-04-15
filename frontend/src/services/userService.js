// userService.js - User API calls
import axiosInstance from './api';

const userService = {
  // Get all users
  getAllUsers: () => {
    return axiosInstance.get('/auth/users');
  },

  // Search users by name or email
  searchUsers: (query) => {
    return axiosInstance.get('/auth/search', {
      params: { query },
    });
  },

  // Block a user
  blockUser: (targetId) => {
    return axiosInstance.post(`/auth/block/${targetId}`);
  },

  // Unblock a user
  unblockUser: (targetId) => {
    return axiosInstance.post(`/auth/unblock/${targetId}`);
  },

  // Get current user
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },
};

export default userService;
