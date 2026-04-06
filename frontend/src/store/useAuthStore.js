import { create } from 'zustand';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/constants';
import toast from 'react-hot-toast';
import useSocketStore from './useSocketStore';
import useKeyStore from './useKeyStore';

// Debounce helper to prevent multiple rapid calls
let authCheckTimeout = null;

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  pendingVerification: null, // Store email pending verification
  pendingPasswordReset: null, // Store email pending password reset
  pendingKeyData: null, // E2EE: temporary key data during signup flow
  pendingRecoveryPhrase: null, // E2EE: recovery phrase to show after verification

  checkAuth: async () => {
    // Clear any pending auth check
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
    }
    
    // Debounce auth checks to prevent rapid successive calls
    authCheckTimeout = setTimeout(async () => {
      try {
        const res = await api.get(ENDPOINTS.AUTH.CHECK);
        set({
          user: res.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
        // Connect socket after successful auth check
        useSocketStore.getState().connectSocket(res.data.user._id);

        // E2EE: Try to restore keys from session (survives page refresh)
        const keyStore = useKeyStore.getState();
        if (!keyStore.isKeyReady) {
          const restored = await keyStore.loadKeysFromSession();
          if (!restored) {
            // Session keys expired (browser was closed/restarted).
            // Force a clean re-login so the login flow can decrypt keys with the password.
            console.warn('E2EE session keys expired — forcing re-login');
            useSocketStore.getState().disconnectSocket();
            await keyStore.clearKeys();
            try { await api.post(ENDPOINTS.AUTH.LOGOUT); } catch { /* best effort */ }
            set({
              user: null,
              isAuthenticated: false,
              isCheckingAuth: false,
            });
            toast('Your encryption session expired. Please sign in again.', { icon: '🔒' });
            return;
          }
        }
      } catch (error) {
        // Handle rate limiting gracefully
        if (error.response?.status === 429) {
          console.warn('Rate limited during auth check, will retry...');
          // Set a longer delay before retrying
          setTimeout(() => {
            const currentState = get();
            if (currentState.isCheckingAuth) {
              get().checkAuth();
            }
          }, 3000);
          return;
        }
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      }
    }, 100); // 100ms debounce
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      // E2EE: Generate keys during signup (before sending to server)
      const keyStore = useKeyStore.getState();
      const keyData = await keyStore.generateAndStoreKeys(data.password);

      const res = await api.post(ENDPOINTS.AUTH.SIGNUP, data);
      set({
        isLoading: false,
        pendingVerification: res.data.email,
        // Store key data and recovery phrase for after verification
        pendingKeyData: {
          publicKey: keyData.publicKey,
          encryptedPrivateKey: keyData.encryptedPrivateKey,
          keyIv: keyData.keyIv,
          keySalt: keyData.keySalt,
        },
        pendingRecoveryPhrase: keyData.recoveryPhrase,
      });
      toast.success('Verification code sent to your email!');
      return { success: true, requiresVerification: true, email: res.data.email };
    } catch (error) {
      set({ isLoading: false });
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        const message = 'Too many signup attempts. Please try again later.';
        toast.error(message);
        return { success: false, message };
      }
      
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  verifyEmail: async (email, otp) => {
    set({ isLoading: true });
    try {
      // E2EE: Include key material in verification request
      const { pendingKeyData } = get();
      const payload = { email, otp };
      if (pendingKeyData) {
        Object.assign(payload, pendingKeyData);
      }

      const res = await api.post(ENDPOINTS.AUTH.VERIFY_EMAIL, payload);
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
        pendingVerification: null,
        pendingKeyData: null,
      });
      useSocketStore.getState().connectSocket(res.data._id);
      toast.success('Email verified! Welcome to Relay!');
      // Return recovery phrase so AuthPage can show the modal
      const recoveryPhrase = get().pendingRecoveryPhrase;
      return { success: true, recoveryPhrase };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Verification failed';
      const expired = error.response?.data?.expired || false;
      toast.error(message);
      return { success: false, message, expired };
    }
  },

  resendOTP: async (email) => {
    set({ isLoading: true });
    try {
      await api.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
      set({ isLoading: false });
      toast.success('New verification code sent!');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Failed to resend code';
      const retryAfter = error.response?.data?.retryAfter;
      toast.error(message);
      return { success: false, message, retryAfter };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, data);

      // E2EE: Decrypt private key with password
      const keyStore = useKeyStore.getState();
      if (res.data.encryptedPrivateKey) {
        try {
          await keyStore.initializeKeys(data.password, {
            encryptedPrivateKey: res.data.encryptedPrivateKey,
            keyIv: res.data.keyIv,
            keySalt: res.data.keySalt,
            publicKey: res.data.publicKey,
          });
        } catch (keyError) {
          console.error('Failed to decrypt E2EE keys:', keyError);
          // Don't block login — user can still use the app, just without E2EE
          toast.error('Failed to decrypt encryption keys. Messages may not be readable.');
        }
      }

      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
      useSocketStore.getState().connectSocket(res.data._id);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        const message = 'Too many login attempts. Please try again later.';
        toast.error(message);
        return { success: false, message };
      }
      
      const message = error.response?.data?.message || 'Login failed';
      const requiresVerification = error.response?.data?.requiresVerification || false;
      const email = error.response?.data?.email;
      
      if (requiresVerification) {
        set({ pendingVerification: email });
        toast.error(message);
        return { success: false, message, requiresVerification: true, email };
      }
      
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
      useSocketStore.getState().disconnectSocket();
      // E2EE: Clear all key material
      await useKeyStore.getState().clearKeys();
      set({
        user: null,
        isAuthenticated: false,
        pendingRecoveryPhrase: null,
        pendingKeyData: null,
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

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      set({ isLoading: false });
      
      // Check if email was actually sent (backend returns success flag)
      if (res.data.success) {
        set({ pendingPasswordReset: email });
        toast.success('Password reset code sent to your email!');
        return { success: true, email };
      } else {
        // User doesn't exist, but show generic message for security
        toast.success(res.data.message);
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        const message = `Please wait ${retryAfter} seconds before requesting another code`;
        toast.error(message);
        return { success: false, message, retryAfter };
      }
      
      const message = error.response?.data?.message || 'Failed to send reset code';
      const retryAfter = error.response?.data?.retryAfter;
      toast.error(message);
      return { success: false, message, retryAfter };
    }
  },

  resetPassword: async (email, otp, newPassword, keyData = null) => {
    set({ isLoading: true });
    try {
      const payload = { email, otp, newPassword };
      // E2EE: Include key material if provided (recovery phrase or new keys)
      if (keyData) {
        Object.assign(payload, keyData);
      }
      await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
      set({
        isLoading: false,
        pendingPasswordReset: null,
      });
      toast.success('Password reset successfully! You can now login.');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Password reset failed';
      const expired = error.response?.data?.expired || false;
      toast.error(message);
      return { success: false, message, expired };
    }
  },
}));

export default useAuthStore;
