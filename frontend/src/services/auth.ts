import type { JwtPayload, LoginRequest, LoginResponse } from '@/types/auth';
import { api, setAuthHeader } from '@/services/api';

function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const payloadJson = atob(padded);
  const payload = JSON.parse(payloadJson) as JwtPayload;

  if (!payload?.role || !payload?.email || !payload?.id) {
    throw new Error('Invalid token payload');
  }

  return payload;
}

export async function login(credentials: LoginRequest): Promise<JwtPayload> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);

  const payload = decodeJwtPayload(data.accessToken);

  localStorage.setItem('healthflow_access_token', data.accessToken);
  localStorage.setItem('healthflow_user_role', payload.role);
  setAuthHeader(data.accessToken);

  return payload;
}
