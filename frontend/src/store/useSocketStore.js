import { create } from 'zustand';
import { io } from 'socket.io-client';
import useChatStore from './useChatStore';
import useContactStore from './useContactStore';

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  typingUsers: {}, // { senderId: true }

  connectSocket: (userId) => {
    const { socket } = get();
    // Don't reconnect if already connected
    if (socket?.connected) return;

    const newSocket = io('/', {
      withCredentials: true,
      query: { userId },
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
    });

    // Online users list
    newSocket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Incoming message from another user
    newSocket.on('newMessage', (message) => {
      useChatStore.getState().addIncomingMessage(message);
    });

    // Typing indicators
    newSocket.on('userTyping', ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });

    newSocket.on('userStopTyping', ({ senderId }) => {
      set((state) => {
        const updated = { ...state.typingUsers };
        delete updated[senderId];
        return { typingUsers: updated };
      });
    });

    // Read receipts — sender's messages marked as read by receiver
    newSocket.on('messagesRead', ({ readBy }) => {
      useChatStore.getState().markMessagesAsRead(readBy);
    });

    // Contact request events
    newSocket.on('contactRequest', ({ request }) => {
      try {
        useContactStore.getState().addIncomingRequest(request);
      } catch (error) {
        console.error('Error handling contact request:', error);
      }
    });

    newSocket.on('contactAccepted', ({ userId, requestId }) => {
      try {
        useContactStore.getState().handleRequestAccepted(requestId);
        // Refresh contacts list to show new contact
        useChatStore.getState().fetchContacts();
      } catch (error) {
        console.error('Error handling contact accepted:', error);
      }
    });

    // Handle when someone removes you as a contact
    newSocket.on('contactRemoved', ({ removedBy }) => {
      try {
        const chatStore = useChatStore.getState();
        // If currently chatting with the person who removed you, clear the chat
        if (chatStore.selectedContact?._id === removedBy) {
          chatStore.clearChat();
        }
        // Refresh contacts list to remove them
        chatStore.fetchContacts();
      } catch (error) {
        console.error('Error handling contact removed:', error);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [], typingUsers: {} });
    }
  },

  emitTyping: (receiverId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('typing', { receiverId });
    }
  },

  emitStopTyping: (receiverId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('stopTyping', { receiverId });
    }
  },
}));

export default useSocketStore;
