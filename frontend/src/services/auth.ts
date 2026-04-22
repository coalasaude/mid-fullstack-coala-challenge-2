import axios from 'axios';
import type { JwtPayload, LoginRequest, LoginResponse } from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:3001';

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
  const { data } = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    credentials,
  );

  const payload = decodeJwtPayload(data.accessToken);

  console.log(payload);

  localStorage.setItem('healthflow_access_token', data.accessToken);
  localStorage.setItem('healthflow_user_role', payload.role);

  return payload;
}
