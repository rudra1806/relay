import { create } from 'zustand';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/constants';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await api.get(ENDPOINTS.AUTH.CHECK);
      set({
        user: res.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.SIGNUP, data);
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Welcome to Relay!');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, data);
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
      set({
        user: null,
        isAuthenticated: false,
      });
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.put(ENDPOINTS.AUTH.UPDATE_PROFILE, data);
      set({
        user: res.data.user,
        isLoading: false,
      });
      toast.success('Profile updated');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  },
}));

export default useAuthStore;
