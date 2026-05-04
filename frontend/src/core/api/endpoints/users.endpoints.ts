import { request } from '../http';
import type { CreateUserResponse, ERole } from '@/shared/types';

export const usersEndpoints = {
  create(payload: { email: string; password: string; role: ERole }) {
    return request<CreateUserResponse>('/users', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },
};
