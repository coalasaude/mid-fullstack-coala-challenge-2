'use client';

import Chip from '@mui/material/Chip';
import { EMedicalExamStatus } from '@/shared/types';
import { useI18n } from '@/shared/i18n';
import type { MessagePath } from '@/shared/i18n';

const STATUS_KEYS: Record<EMedicalExamStatus, MessagePath> = {
  [EMedicalExamStatus.PENDING]: 'examStatus.pending',
  [EMedicalExamStatus.PROCESSING]: 'examStatus.processing',
  [EMedicalExamStatus.DONE]: 'examStatus.done',
  [EMedicalExamStatus.ERROR]: 'examStatus.error',
  [EMedicalExamStatus.REPORTED]: 'examStatus.reported',
};

const COLORS: Record<
  EMedicalExamStatus,
  'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'
> = {
  [EMedicalExamStatus.PENDING]: 'default',
  [EMedicalExamStatus.PROCESSING]: 'info',
  [EMedicalExamStatus.DONE]: 'warning',
  [EMedicalExamStatus.ERROR]: 'error',
  [EMedicalExamStatus.REPORTED]: 'success',
};

export function StatusChip({ status }: { status: EMedicalExamStatus }) {
  const { t } = useI18n();

  return (
    <Chip
      size="small"
      color={COLORS[status]}
      label={t(STATUS_KEYS[status])}
      variant={status === EMedicalExamStatus.PENDING ? 'outlined' : 'filled'}
    />
  );
}
