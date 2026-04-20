import { authStorage } from '@/core/auth/auth-storage';
import type { ApiErrorBody } from '@/shared/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ??
  'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiErrorBody | null;

  constructor(status: number, message: string, details: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function extractMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (typeof body.message === 'string') return body.message;
  if (body.error) return body.error;
  return fallback;
}

async function parseJsonSafe(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, formData } = options;

  const headers: Record<string, string> = {};
  if (auth) {
    const token = authStorage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (formData) {
    init.body = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch (err) {
    throw new ApiError(
      0,
      err instanceof Error
        ? `Network error: ${err.message}`
        : 'Network error reaching the API',
      null,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    if (res.status === 401) {
      authStorage.clear();
    }
    throw new ApiError(
      res.status,
      extractMessage(data, `Request failed with status ${res.status}`),
      data,
    );
  }

  return data as unknown as T;
}
