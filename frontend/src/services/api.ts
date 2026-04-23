import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('healthflow_access_token');
}

export function setAuthHeader(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthHeader() {
  delete api.defaults.headers.common.Authorization;
}
