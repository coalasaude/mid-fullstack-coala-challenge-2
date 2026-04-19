import { request } from '../http';
import type { LoginResponse } from '@/shared/types';

export const authEndpoints = {
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },
};
