import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

// Route all API calls directly to live Render backend with Auth token when running inside Native App
if (Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = function(resource, init) {
    let finalUrl = resource;
    const isBackendApi = typeof resource === 'string' && (resource.startsWith('/api/') || resource.includes('notesapp-pbjv.onrender.com'));

    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      finalUrl = `https://notesapp-pbjv.onrender.com${resource}`;
    }
    
    // Only attach Backend Authorization token for our NoteShare API, NEVER for third-party Cloudflare R2 / S3 presigned URLs or CDNs
    if (isBackendApi) {
      const token = localStorage.getItem('token');
      const newInit = init ? { ...init } : {};
      const headers = new Headers(init?.headers || {});
      
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      newInit.headers = headers;
      return originalFetch.call(this, finalUrl, newInit);
    }
    
    return originalFetch.call(this, finalUrl, init);
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
