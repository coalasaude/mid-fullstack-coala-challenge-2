'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import { formatRelative } from '@/lib/exam-utils';
import { AppBar } from '@/components/AppBar';
import { ExamsTable } from '@/components/ExamsTable';
import { RequireRole } from '@/components/RequireRole';
import { StatsCard } from '@/components/StatsCard';
import { useExamsPolling } from '@/hooks/useExamsPolling';
import { api, extractApiError } from '@/lib/api';
import type { MedicalExam } from '@/lib/types';

function DoctorInner() {
  const { exams, loading, error, refresh } = useExamsPolling(3000);
  const [selected, setSelected] = useState<MedicalExam | null>(null);
  const [report, setReport] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const pending = exams.filter((e) => e.status === 'DONE');
    const types = new Set(pending.map((e) => e.examType));
    const oldest = pending.reduce<string | null>((acc, e) => {
      if (!acc) return e.createdAt;
      return new Date(e.createdAt) < new Date(acc) ? e.createdAt : acc;
    }, null);
    return {
      pending: pending.length,
      types: types.size,
      oldest,
    };
  }, [exams]);

  function openExam(exam: MedicalExam) {
    setSelected(exam);
    setReport('');
    setSubmitError(null);
  }

  function closeExam() {
    setSelected(null);
    setReport('');
    setSubmitError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/exams/${selected.id}/report`, { report });
      closeExam();
      await refresh();
    } catch (err) {
      setSubmitError(extractApiError(err, 'Falha ao enviar laudo'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppBar />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Fila de laudos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Exames processados aguardando parecer médico.
            </Typography>
          </Box>
          <Tooltip title="Atualizar">
            <span>
              <IconButton
                onClick={refresh}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <StatsCard
              label="Aguardando laudo"
              value={stats.pending}
              tone="info"
              icon={PendingActionsRoundedIcon}
              hint={stats.pending > 0 ? 'prioridade do dia' : 'fila vazia'}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatsCard
              label="Tipos distintos"
              value={stats.types}
              tone="neutral"
              icon={CategoryRoundedIcon}
              hint={stats.types === 1 ? 'tipo de exame' : 'tipos de exame'}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2.5, display: 'flex', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(217,119,6,0.16)'
                        : 'rgba(217,119,6,0.1)',
                    color: 'warning.main',
                    flexShrink: 0,
                  }}
                >
                  <ScheduleRoundedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 600,
                    }}
                  >
                    Mais antigo
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.1, mt: 0.5 }}
                  >
                    {stats.oldest ? formatRelative(stats.oldest) : '—'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    na fila
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ExamsTable
          exams={exams}
          loading={loading}
          emptyTitle="Nenhum exame aguardando laudo"
          emptyDescription="Novos exames aparecem aqui assim que são processados."
          onRowAction={openExam}
          actionLabel="Laudar"
          actionEnabled={(e) => e.status === 'DONE'}
        />
      </Container>

      <Dialog
        open={!!selected}
        onClose={closeExam}
        fullWidth
        maxWidth="md"
      >
        <form onSubmit={onSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              pb: 1,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                Laudo médico
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {selected?.patientName}
                </Typography>
                <Chip
                  size="small"
                  label={selected?.examType}
                  sx={{ bgcolor: 'action.hover' }}
                />
              </Stack>
            </Box>
            <IconButton size="small" onClick={closeExam} aria-label="Fechar">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {selected?.processingResult && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(56,189,248,0.1)'
                        : 'rgba(37,99,235,0.06)',
                    border: '1px solid',
                    borderColor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(56,189,248,0.25)'
                        : 'rgba(37,99,235,0.18)',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <AutoAwesomeRoundedIcon
                      fontSize="small"
                      sx={{ color: 'info.main' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'info.main',
                      }}
                    >
                      Resultado automatizado
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {selected.processingResult}
                  </Typography>
                </Box>
              )}
              <TextField
                label="Laudo médico"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                required
                multiline
                minRows={8}
                size="medium"
                placeholder="Descreva o achado clínico, hipóteses e conclusões..."
              />
              {submitError && <Alert severity="error">{submitError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={closeExam} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ minWidth: 160 }}
            >
              {submitting ? 'Enviando...' : 'Submeter laudo'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default function DoctorPage() {
  return (
    <RequireRole role="DOCTOR">
      <DoctorInner />
    </RequireRole>
  );
}
