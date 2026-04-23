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
  return (
    <Chip
      label={labelForStatus(status)}
      color={colorForStatus(status)}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 800 }}
    />
  );
}
