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

  // Called by the socket store when a real-time message arrives
  addIncomingMessage: (message) => {
    set((state) => {
      const senderId = message.senderId;
      const isFromSelectedContact = state.selectedContact?._id === senderId;

      // Update last message for this sender
      const newLastMessages = {
        ...state.lastMessages,
        [senderId]: {
          text: message.text || '',
          image: !!message.image,
          createdAt: message.createdAt,
          senderId: message.senderId,
        },
      };

      // If from the currently selected contact, add to messages array
      // and mark as read on the backend so it persists across refreshes
      if (isFromSelectedContact) {
        api.patch(ENDPOINTS.MESSAGES.MARK_READ(senderId)).catch(() => {});
        return {
          messages: [...state.messages, message],
          lastMessages: newLastMessages,
        };
      }

      // Otherwise, increment unread count for that sender
      const newUnreadCounts = { ...state.unreadCounts };
      newUnreadCounts[senderId] = (newUnreadCounts[senderId] || 0) + 1;

      return {
        lastMessages: newLastMessages,
        unreadCounts: newUnreadCounts,
      };
    });
  },

  // Called when the receiver reads our messages (via socket event)
  markMessagesAsRead: (readBy) => {
    set((state) => {
      // Only update if we're currently chatting with this person
      if (state.selectedContact?._id !== readBy) return state;

      const updatedMessages = state.messages.map((msg) => {
        // Mark our sent messages to this contact as read
        if (msg.senderId !== readBy && !msg.isRead) {
          return { ...msg, isRead: true };
        }
        return msg;
      });

      return { messages: updatedMessages };
    });
  },
}));

export default useChatStore;
