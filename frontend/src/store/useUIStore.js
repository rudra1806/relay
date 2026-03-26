import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  profileOpen: false,
  imagePreview: null,
  activeTab: 'recent',       // 'recent' | 'all' | 'unread'
  replyingTo: null,           // message object or null
  contextMenu: null,          // { messageId, x, y } or null

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setProfileOpen: (open) =>
    set({ profileOpen: open }),

  setImagePreview: (src) =>
    set({ imagePreview: src }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  setReplyingTo: (message) =>
    set({ replyingTo: message }),

  clearReply: () =>
    set({ replyingTo: null }),

  setContextMenu: (menu) =>
    set({ contextMenu: menu }),

  clearContextMenu: () =>
    set({ contextMenu: null }),
}));

export default useUIStore;
