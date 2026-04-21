import type { ExamStatus } from './types';

export const statusColor: Record<
  ExamStatus,
  'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'
> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  DONE: 'info',
  ERROR: 'error',
  REPORTED: 'success',
};

export const statusLabel: Record<ExamStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  DONE: 'Pronto p/ laudo',
  ERROR: 'Erro',
  REPORTED: 'Laudado',
};

export const statusDotColor: Record<ExamStatus, string> = {
  PENDING: '#94A3B8',
  PROCESSING: '#D97706',
  DONE: '#2563EB',
  ERROR: '#DC2626',
  REPORTED: '#059669',
};

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR');
}

export function formatRelative(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.round(h / 24);
  if (days < 30) return `há ${days} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function roleLabel(role: 'ATTENDANT' | 'DOCTOR') {
  return role === 'ATTENDANT' ? 'Atendente' : 'Médico';
}
