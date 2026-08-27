/**
 * Shared axios instance for ThermalTrace API.
 * Base URL is configured via environment variable VITE_API_URL or VITE_API_BASE_URL.
 */
import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Strip trailing /api/v1 if present to avoid double /api/v1 paths
const normalizedBaseUrl = rawApiUrl.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
