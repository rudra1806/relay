import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e21',
            color: '#f0ece4',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            padding: '12px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          },
          success: {
            iconTheme: { primary: '#5cb87a', secondary: '#1e1e21' },
          },
          error: {
            iconTheme: { primary: '#e06c75', secondary: '#1e1e21' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
