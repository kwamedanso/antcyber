import axios from 'axios';

// In production, Vite replaces import.meta.env.VITE_API_BASE_URL. 
// If not defined, it falls back to '/api' for production reverse proxy, or local IP for dev.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:5178`);

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});