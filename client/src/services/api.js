import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const productionApiUrl = 'https://notesapp-pbjv.onrender.com/api';

const api = axios.create({
  baseURL: Capacitor.isNativePlatform()
    ? productionApiUrl
    : import.meta.env.VITE_API_URL || productionApiUrl,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const hasAuth = config.headers.Authorization || config.headers.authorization;
    if (!hasAuth) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
