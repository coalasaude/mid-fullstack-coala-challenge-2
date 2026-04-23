export type UserRole = 'ATTENDANT' | 'DOCTOR';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
  exp?: number;
  iat?: number;
};
