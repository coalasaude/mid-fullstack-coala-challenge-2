import Chip from '@mui/material/Chip';
import type { MedicalExamStatus } from '@/types/exam';

function labelForStatus(status: MedicalExamStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente';
    case 'PROCESSING':
      return 'Processando';
    case 'DONE':
      return 'Pronto';
    case 'ERROR':
      return 'Erro';
    case 'REPORTED':
      return 'Laudado';
    default:
      return status;
  }
}

function colorForStatus(
  status: MedicalExamStatus,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PROCESSING':
      return 'info';
    case 'DONE':
      return 'success';
    case 'ERROR':
      return 'error';
    case 'REPORTED':
      return 'secondary';
    default:
      return 'default';
  }
}

export function ExamStatusChip({ status }: { status: MedicalExamStatus }) {
  const color = colorForStatus(status);

  return (
    <Chip
      label={labelForStatus(status)}
      color={color}
      size="small"
      sx={{
        fontWeight: 800,
        borderRadius: 999,
        ...(color === 'default'
          ? {
              bgcolor: 'rgba(111, 70, 190, 0.12)',
              color: 'primary.main',
            }
          : {}),
      }}
    />
  );
}
