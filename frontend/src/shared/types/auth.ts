import { ERole } from './role';

export interface AuthUser {
  id: string;
  email: string;
  role: ERole;
}

export interface LoginResponse extends AuthUser {
  access_token: string;
}

export interface CreateUserResponse extends AuthUser {
  createdAt: string;
}
