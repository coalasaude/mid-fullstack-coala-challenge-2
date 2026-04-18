'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  InputAdornment,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { formatRelative, statusLabel } from '@/lib/exam-utils';
import type { ExamStatus, MedicalExam } from '@/lib/types';
import { StatusPill } from './StatusPill';
import { EmptyState } from './EmptyState';

interface Props {
  exams: MedicalExam[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowAction?: (exam: MedicalExam) => void;
  actionLabel?: string;
  actionEnabled?: (exam: MedicalExam) => boolean;
}

const STATUS_OPTIONS: Array<{ value: 'ALL' | ExamStatus; label: string }> = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'PENDING', label: statusLabel.PENDING },
  { value: 'PROCESSING', label: statusLabel.PROCESSING },
  { value: 'DONE', label: statusLabel.DONE },
  { value: 'REPORTED', label: statusLabel.REPORTED },
  { value: 'ERROR', label: statusLabel.ERROR },
];

export function ExamsTable({
  exams,
  loading = false,
  emptyTitle = 'Nenhum exame encontrado',
  emptyDescription,
  onRowAction,
  actionLabel = 'Abrir',
  actionEnabled,
}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExamStatus>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exams.filter((e) => {
      const matchesQuery =
        !q ||
        e.patientName.toLowerCase().includes(q) ||
        e.examType.toLowerCase().includes(q) ||
        (e.processingResult ?? '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'ALL' || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [exams, search, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const showToolbar = exams.length > 0 || search || statusFilter !== 'ALL';

  return (
    <Card>
      {showToolbar && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            placeholder="Buscar paciente, tipo ou resultado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 260px', maxWidth: 420 }}
          />
          <TextField
            select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | ExamStatus);
              setPage(0);
            }}
            sx={{ minWidth: 200, flex: '0 0 auto' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {filtered.length} de {exams.length} exames
          </Typography>
        </Box>
      )}

      {loading && exams.length === 0 ? (
        <Box sx={{ p: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={52}
              sx={{ mb: 1, borderRadius: 1.5 }}
            />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={
            search || statusFilter !== 'ALL'
              ? 'Ajuste a busca ou o filtro de status.'
              : emptyDescription
          }
        />
      ) : (
        <>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Resultado automatizado</TableCell>
                  <TableCell>Criado</TableCell>
                  {onRowAction && <TableCell align="right">Ações</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((exam) => (
                  <TableRow
                    key={exam.id}
                    hover
                    sx={{
                      transition: 'background-color 120ms ease',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            flexShrink: 0,
                          }}
                        >
                          <PersonOutlineRoundedIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {exam.patientName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScienceOutlinedIcon
                          fontSize="small"
                          sx={{ color: 'text.secondary' }}
                        />
                        <Typography variant="body2">{exam.examType}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={exam.status} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      {exam.processingResult ? (
                        <Tooltip title={exam.processingResult} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'text.secondary',
                            }}
                          >
                            {exam.processingResult}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.disabled' }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={new Date(exam.createdAt).toLocaleString('pt-BR')}
                        arrow
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                        >
                          {formatRelative(exam.createdAt)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    {onRowAction && (
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          disabled={actionEnabled ? !actionEnabled(exam) : false}
                          onClick={() => onRowAction(exam)}
                        >
                          {actionLabel}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filtered.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Linhas:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count}`
              }
            />
          )}
        </>
      )}
    </Card>
  );
}
