import { create } from 'zustand';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/constants';
import toast from 'react-hot-toast';
import useAuthStore from './useAuthStore';
import useKeyStore from './useKeyStore';
import { encryptMessage, decryptMessage, decodeBase64 } from '../lib/crypto';

// ──────────────────────────────────────────────
// Public key cache — avoids redundant API calls
// ──────────────────────────────────────────────
const publicKeyCache = new Map(); // userId → Uint8Array

async function getPublicKeyForUser(userId) {
  if (publicKeyCache.has(userId)) {
    return publicKeyCache.get(userId);
  }

  try {
    const res = await api.get(ENDPOINTS.ENCRYPTION.PUBLIC_KEY(userId));
    const pk = decodeBase64(res.data.publicKey);
    publicKeyCache.set(userId, pk);
    return pk;
  } catch (error) {
    console.error(`Failed to fetch public key for user ${userId}:`, error);
    return null;
  }
}

// Exported so key regeneration flows can invalidate stale entries
export function clearPublicKeyCache() {
  publicKeyCache.clear();
}

// ──────────────────────────────────────────────
// Decrypt helper — decrypts a single message
// ──────────────────────────────────────────────
async function decryptMessageFields(msg, currentUserId) {
  // If no nonce, message is not encrypted (shouldn't happen with clean DB, but safety check)
  if (!msg.nonce) return msg;

  const keyStore = useKeyStore.getState();
  const myPrivateKey = keyStore.getPrivateKey();
  if (!myPrivateKey) return { ...msg, _decryptFailed: true };

  // Determine the other party's ID to fetch their public key
  const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
  const otherPublicKey = await getPublicKeyForUser(otherUserId);

  if (!otherPublicKey) return { ...msg, _decryptFailed: true };

  const decrypted = { ...msg };

  // Decrypt text
  if (msg.text) {
    const plaintext = decryptMessage(msg.text, msg.nonce, otherPublicKey, myPrivateKey);
    // Backward compatibility: If the decrypted text is the dummy '📷' used for image-only messages, strip it.
    decrypted.text = (plaintext !== null && plaintext !== '📷') ? plaintext : null;
    if (plaintext === null) decrypted._decryptFailed = true;
  }

  // NOTE: Image URLs (Cloudinary) are stored unencrypted in the DB.
  // They pass through as-is via the `{ ...msg }` spread above.

  return decrypted;
}

// ──────────────────────────────────────────────
// Decrypt a batch of messages
// ──────────────────────────────────────────────
async function decryptMessages(messages, currentUserId) {
  return Promise.all(messages.map((msg) => decryptMessageFields(msg, currentUserId)));
}

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
      for (let idx = 0; idx < results.length; idx++) {
        const result = results[idx];
        const contactId = batch[idx]._id;
        if (result.status === 'fulfilled' && result.value.data.length > 0) {
          const msgs = result.value.data;
          const lastMsg = msgs[msgs.length - 1];

          // E2EE: Decrypt the last message for sidebar preview
          const decryptedLast = await decryptMessageFields(lastMsg, currentUserId);

          lastMessages[contactId] = {
            text: decryptedLast.text || '',
            image: !!decryptedLast.image,
            createdAt: decryptedLast.createdAt,
            senderId: decryptedLast.senderId,
          };

          // Count unread: messages received (not from me) that are not read
          const unread = msgs.filter(
            (m) => m.senderId !== currentUserId && !m.isRead
          ).length;
          if (unread > 0) {
            unreadCounts[contactId] = unread;
          }
        }
      }
    }
    set({ lastMessages, unreadCounts });
  },

  fetchMessages: async (userId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await api.get(ENDPOINTS.MESSAGES.GET(userId));
      const currentUserId = useAuthStore.getState().user?._id;

      // E2EE: Decrypt all messages
      const decrypted = await decryptMessages(res.data, currentUserId);
      set({ messages: decrypted, isLoadingMessages: false });
    } catch {
      set({ isLoadingMessages: false });
      toast.error('Failed to load messages');
    }
  },

  sendMessage: async (userId, data) => {
    set({ isSending: true });
    try {
      // E2EE: Encrypt message fields before sending
      const keyStore = useKeyStore.getState();
      const myPrivateKey = keyStore.getPrivateKey();
      const receiverPublicKey = await getPublicKeyForUser(userId);

      let encryptedData = { ...data };
      let messageNonce = null;

      if (myPrivateKey && receiverPublicKey) {
        if (data.text) {
          const result = encryptMessage(data.text, receiverPublicKey, myPrivateKey);
          encryptedData.text = result.encrypted;
          messageNonce = result.nonce;
        }

        // Note: Images are uploaded to Cloudinary server-side, so they pass through
        // as base64. The server needs the raw image data to upload to Cloudinary.
        // The Cloudinary URL ends up in the DB unencrypted — this is a known limitation
        // of server-side image upload. Text content IS fully encrypted.
        if (data.image && !messageNonce) {
          // Image-only message — generate nonce to mark message as E2EE.
          // We encrypt a throwaway value just to derive the nonce; the text
          // is NOT sent to the server so it doesn't leak '📷' as visible content.
          const result = encryptMessage('📷', receiverPublicKey, myPrivateKey);
          messageNonce = result.nonce;
          delete encryptedData.text; // ensure no dummy text is sent
        }

        if (messageNonce) {
          encryptedData.nonce = messageNonce;
        }
      }

      const res = await api.post(ENDPOINTS.MESSAGES.SEND(userId), encryptedData);
      const newMsg = res.data;

      // E2EE: Decrypt the response message for local display
      const currentUserId = useAuthStore.getState().user?._id;
      const decryptedMsg = await decryptMessageFields(newMsg, currentUserId);

      set((state) => ({
        messages: [...state.messages, decryptedMsg],
        isSending: false,
        // Update last message for this contact
        lastMessages: {
          ...state.lastMessages,
          [userId]: {
            text: decryptedMsg.text || '',
            image: !!decryptedMsg.image,
            createdAt: decryptedMsg.createdAt,
            senderId: decryptedMsg.senderId,
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
  addIncomingMessage: async (message) => {
    const currentUserId = useAuthStore.getState().user?._id;
    // E2EE: Decrypt the incoming message
    const decryptedMsg = await decryptMessageFields(message, currentUserId);

    set((state) => {
      const senderId = message.senderId;
      const isFromSelectedContact = state.selectedContact?._id === senderId;

      // Update last message for this sender
      const newLastMessages = {
        ...state.lastMessages,
        [senderId]: {
          text: decryptedMsg.text || '',
          image: !!decryptedMsg.image,
          createdAt: decryptedMsg.createdAt,
          senderId: decryptedMsg.senderId,
        },
      };

      // If from the currently selected contact, add to messages array
      // and mark as read on the backend so it persists across refreshes
      if (isFromSelectedContact) {
        api.patch(ENDPOINTS.MESSAGES.MARK_READ(senderId)).catch(() => {});
        return {
          messages: [...state.messages, decryptedMsg],
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
