import { create } from 'zustand';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/constants';
import toast from 'react-hot-toast';

const useContactStore = create((set, get) => ({
  pendingRequests: [],
  sentRequests: [],
  isLoadingRequests: false,

  fetchPendingRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      const res = await api.get(ENDPOINTS.CONTACTS.PENDING_REQUESTS);
      set({ pendingRequests: res.data, isLoadingRequests: false });
    } catch {
      set({ isLoadingRequests: false });
      toast.error('Failed to load contact requests');
    }
  },

  fetchSentRequests: async () => {
    try {
      const res = await api.get(ENDPOINTS.CONTACTS.SENT_REQUESTS);
      set({ sentRequests: res.data });
    } catch {
      toast.error('Failed to load sent requests');
    }
  },

  sendContactRequest: async (userId) => {
    try {
      await api.post(ENDPOINTS.CONTACTS.SEND_REQUEST(userId));
      toast.success('Contact request sent');
      get().fetchSentRequests();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
      return false;
    }
  },

  acceptRequest: async (requestId) => {
    set({ isLoadingRequests: true });
    try {
      await api.patch(ENDPOINTS.CONTACTS.ACCEPT(requestId));
      toast.success('Contact request accepted');
      
      // Remove from pending requests
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
        isLoadingRequests: false,
      }));
      
      // Refresh contacts list to show new contact
      const useChatStore = await import('./useChatStore.js');
      useChatStore.default.getState().fetchContacts();
      
      return true;
    } catch (error) {
      set({ isLoadingRequests: false });
      toast.error(error.response?.data?.message || 'Failed to accept request');
      return false;
    }
  },

  declineRequest: async (requestId) => {
    set({ isLoadingRequests: true });
    try {
      await api.patch(ENDPOINTS.CONTACTS.DECLINE(requestId));
      toast.success('Contact request declined');
      
      // Remove from pending requests
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
        isLoadingRequests: false,
      }));
      
      return true;
    } catch (error) {
      set({ isLoadingRequests: false });
      toast.error(error.response?.data?.message || 'Failed to decline request');
      return false;
    }
  },

  cancelRequest: async (requestId) => {
    try {
      await api.delete(ENDPOINTS.CONTACTS.CANCEL(requestId));
      toast.success('Contact request cancelled');
      
      // Remove from sent requests
      set((state) => ({
        sentRequests: state.sentRequests.filter((r) => r._id !== requestId),
      }));
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
      return false;
    }
  },

  removeContact: async (userId) => {
    try {
      await api.delete(ENDPOINTS.CONTACTS.REMOVE(userId));
      toast.success('Contact removed');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove contact');
      return false;
    }
  },

  // Called by socket when new request arrives
  addIncomingRequest: (request) => {
    set((state) => ({
      pendingRequests: [request, ...state.pendingRequests],
    }));
    toast.success(`${request.senderId.name} sent you a contact request`);
  },

  // Called by socket when someone accepts your request
  handleRequestAccepted: (requestId) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter((r) => r._id !== requestId),
    }));
  },
}));

export default useContactStore;
