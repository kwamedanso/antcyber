import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5177`; // Use env var in prod, fallback to local network in dev

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});