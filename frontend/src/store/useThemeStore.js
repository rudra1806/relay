import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('relay-theme') || 'dark',

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('relay-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

  initTheme: () => {
    const saved = localStorage.getItem('relay-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    set({ theme: saved });
  },
}));

export default useThemeStore;
