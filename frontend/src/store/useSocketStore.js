import { create } from 'zustand';
import { io } from 'socket.io-client';
import useChatStore from './useChatStore';
import useContactStore from './useContactStore';
import useCallStore from './useCallStore';

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

    // ──────────────────────────────────────────────
    // WebRTC Call Events
    // ──────────────────────────────────────────────

    // Incoming call from someone
    newSocket.on('call:incoming', (data) => {
      useCallStore.getState().handleIncomingCall(data);
    });

    // Our call was accepted
    newSocket.on('call:accepted', () => {
      useCallStore.getState().handleCallAccepted();
    });

    // Our call was rejected
    newSocket.on('call:rejected', () => {
      useCallStore.getState().handleCallRejected();
    });

    // Call ended by the other party
    newSocket.on('call:ended', ({ endedBy, reason }) => {
      useCallStore.getState().handleCallEnded({ reason });
    });

    // Received WebRTC offer
    newSocket.on('call:offer', (data) => {
      useCallStore.getState().handleOffer(data);
    });

    // Received WebRTC answer
    newSocket.on('call:answer', (data) => {
      useCallStore.getState().handleAnswer(data);
    });

    // Received ICE candidate
    newSocket.on('call:ice-candidate', (data) => {
      useCallStore.getState().handleICECandidate(data);
    });

    // Remote user toggled media (mute/camera)
    newSocket.on('call:toggle-media', (data) => {
      useCallStore.getState().handleRemoteMediaToggle(data);
    });

    // User is busy (already in a call)
    newSocket.on('call:busy', (data) => {
      useCallStore.getState().handleCallBusy(data);
    });

    // User is offline
    newSocket.on('call:unavailable', () => {
      useCallStore.getState().handleCallUnavailable();
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
