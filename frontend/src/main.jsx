import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

// Route all API calls directly to live Render backend with Auth token when running inside Native App
if (Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = function(resource, init = {}) {
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      resource = `https://notesapp-pbjv.onrender.com${resource}`;
    }
    const token = localStorage.getItem('token');
    if (token) {
      init = init || {};
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return originalFetch.call(this, resource, init);
  };
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
