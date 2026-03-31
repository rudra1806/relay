// Buffer polyfill for bip39 (requires Node.js Buffer in browser)
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useThemeStore from './store/useThemeStore';
import App from './App.jsx';
import './index.css';

// Initialize theme before first render
useThemeStore.getState().initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--bg-glass-border)',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            padding: '12px 20px',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: { primary: 'var(--color-success)', secondary: 'var(--bg-elevated)' },
          },
          error: {
            iconTheme: { primary: 'var(--color-error)', secondary: 'var(--bg-elevated)' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
