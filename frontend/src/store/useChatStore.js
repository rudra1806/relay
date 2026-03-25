import { create } from 'zustand';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/constants';
import toast from 'react-hot-toast';
import useAuthStore from './useAuthStore';

const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  selectedContact: null,
  isLoadingContacts: false,
  isLoadingMessages: false,
  isSending: false,
  lastMessages: {}, // { contactId: { text, image, createdAt, senderId } }
  unreadCounts: {},  // { contactId: number }

  fetchContacts: async () => {
    set({ isLoadingContacts: true });
    try {
      const res = await api.get(ENDPOINTS.MESSAGES.CONTACTS);
      const contacts = res.data;
      set({ contacts, isLoadingContacts: false });

      // Fetch last message for each contact in background
      get().fetchLastMessages(contacts);
    } catch {
      set({ isLoadingContacts: false });
      toast.error('Failed to load contacts');
    }
  },

  fetchLastMessages: async (contacts) => {
    if (!contacts || contacts.length === 0) return;

    const lastMessages = {};
    const unreadCounts = {};
    const currentUserId = useAuthStore.getState().user?._id;

    // Fetch messages for each contact (in parallel, limited batches)
    const batchSize = 5;
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((c) => api.get(ENDPOINTS.MESSAGES.GET(c._id)))
      );
      results.forEach((result, idx) => {
        const contactId = batch[idx]._id;
        if (result.status === 'fulfilled' && result.value.data.length > 0) {
          const msgs = result.value.data;
          const lastMsg = msgs[msgs.length - 1];
          lastMessages[contactId] = {
            text: lastMsg.text || '',
            image: !!lastMsg.image,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
          };

          // Count unread: messages received (not from me) that are not read
          const unread = msgs.filter(
            (m) => m.senderId !== currentUserId && !m.isRead
          ).length;
          if (unread > 0) {
            unreadCounts[contactId] = unread;
          }
        }
      });
    }
    set({ lastMessages, unreadCounts });
  },

  fetchMessages: async (userId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await api.get(ENDPOINTS.MESSAGES.GET(userId));
      set({ messages: res.data, isLoadingMessages: false });
    } catch {
      set({ isLoadingMessages: false });
      toast.error('Failed to load messages');
    }
  },

  sendMessage: async (userId, data) => {
    set({ isSending: true });
    try {
      const res = await api.post(ENDPOINTS.MESSAGES.SEND(userId), data);
      const newMsg = res.data;
      set((state) => ({
        messages: [...state.messages, newMsg],
        isSending: false,
        // Update last message for this contact
        lastMessages: {
          ...state.lastMessages,
          [userId]: {
            text: newMsg.text || '',
            image: !!newMsg.image,
            createdAt: newMsg.createdAt,
            senderId: newMsg.senderId,
          },
        },
      }));
      return { success: true };
    } catch (error) {
      set({ isSending: false });
      const message = error.response?.data?.message || 'Failed to send';
      toast.error(message);
      return { success: false };
    }
  },

  setSelectedContact: (contact) => {
    set((state) => {
      const newUnreadCounts = { ...state.unreadCounts };
      if (contact) {
        // Clear unread count when opening conversation
        delete newUnreadCounts[contact._id];
      }
      return {
        selectedContact: contact,
        messages: [],
        unreadCounts: newUnreadCounts,
      };
    });
    if (contact) {
      get().fetchMessages(contact._id);
      // Mark messages from this contact as read on the backend
      api.patch(ENDPOINTS.MESSAGES.MARK_READ(contact._id)).catch(() => {});
    }
  },

  clearChat: () => {
    set({ selectedContact: null, messages: [] });
  },
}));

export default useChatStore;
