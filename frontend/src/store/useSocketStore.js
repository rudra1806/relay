import { create } from 'zustand';
import { io } from 'socket.io-client';
import useChatStore from './useChatStore';

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
