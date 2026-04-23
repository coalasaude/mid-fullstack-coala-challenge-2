import axios from 'axios';

export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      if (Array.isArray(message) && message.length > 0) {
        const first = message[0];
        if (typeof first === 'string' && first.trim()) {
          return first;
        }
      }
    }

    if (error.response?.status === 401) {
      return 'Sessão inválida ou expirada. Faça login novamente.';
    }

    if (error.response?.status === 403) {
      return 'Você não tem permissão para executar esta ação.';
    }
  }

  return fallback;
}
