import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  profileOpen: false,
  imagePreview: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setProfileOpen: (open) =>
    set({ profileOpen: open }),

  setImagePreview: (src) =>
    set({ imagePreview: src }),
}));

export default useUIStore;
