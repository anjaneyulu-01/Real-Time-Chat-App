// messageService.js - Message API calls
import axiosInstance from './api';

const messageService = {
  // Get all messages with a user
  getMessages: (receiverId) => {
    return axiosInstance.get(`/messages/${receiverId}`);
  },

  // Get last message with a user
  getLastMessage: (receiverId) => {
    return axiosInstance.get(`/messages/last/${receiverId}`);
  },

  // Search messages
  searchMessages: (query) => {
    return axiosInstance.get(`/messages/search/${query}`);
  },

  // Delete a message
  deleteMessage: (messageId, forEveryone = false) => {
    return axiosInstance.put(`/messages/${messageId}/delete`, null, {
      params: { forEveryone },
    });
  },

  // Mark messages as delivered
  markAsDelivered: (receiverId) => {
    return axiosInstance.put(`/messages/delivered/${receiverId}`);
  },
};

export default messageService;
