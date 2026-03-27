export const API_BASE_URL = '/api';

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CHECK: `${API_BASE_URL}/auth/check`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  MESSAGES: {
    CONTACTS: `${API_BASE_URL}/message/contacts`,
    CHATS: `${API_BASE_URL}/message/chats`,
    GET: (userId) => `${API_BASE_URL}/message/${userId}`,
    SEND: (userId) => `${API_BASE_URL}/message/send/${userId}`,
    MARK_READ: (userId) => `${API_BASE_URL}/message/read/${userId}`,
  },
};
