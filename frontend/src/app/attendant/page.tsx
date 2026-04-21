'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { AppBar } from '@/components/AppBar';
import { ExamsTable } from '@/components/ExamsTable';
import { RequireRole } from '@/components/RequireRole';
import { StatsCard } from '@/components/StatsCard';
import { useExamsPolling } from '@/hooks/useExamsPolling';
import { api, extractApiError } from '@/lib/api';

function AttendantInner() {
  const { exams, loading, error, refresh } = useExamsPolling(3000);
  const [open, setOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [examType, setExamType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const count = (s: string) => exams.filter((e) => e.status === s).length;
    return {
      total: exams.length,
      pending: count('PENDING'),
      processing: count('PROCESSING'),
      done: count('DONE'),
      reported: count('REPORTED'),
    };
  }, [exams]);

  function close() {
    setOpen(false);
    setPatientName('');
    setExamType('');
    setSubmitError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/exams/upload', { patientName, examType });
      close();
      await refresh();
    } catch (err) {
      setSubmitError(extractApiError(err, 'Falha ao enviar exame'));
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
              Exames
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Visão do atendente — todos os exames do sistema.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
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
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setOpen(true)}
              sx={{ py: 1, px: 2 }}
            >
              Novo exame
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <StatsCard
              label="Total"
              value={stats.total}
              tone="neutral"
              icon={AssignmentRoundedIcon}
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatsCard
              label="Pendentes"
              value={stats.pending}
              tone="neutral"
              icon={HourglassEmptyRoundedIcon}
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatsCard
              label="Processando"
              value={stats.processing}
              tone="warning"
              icon={AutorenewRoundedIcon}
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatsCard
              label="Prontos p/ laudo"
              value={stats.done}
              tone="info"
              icon={TaskAltRoundedIcon}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatsCard
              label="Laudados"
              value={stats.reported}
              tone="success"
              icon={VerifiedRoundedIcon}
            />
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
          emptyTitle="Nenhum exame cadastrado"
          emptyDescription="Clique em Novo exame para começar."
        />
      </Container>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <form onSubmit={onSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 1,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Novo exame
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Envie para a fila de processamento
              </Typography>
            </Box>
            <IconButton size="small" onClick={close} aria-label="Fechar">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome do paciente"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                autoFocus
                size="medium"
              />
              <TextField
                label="Tipo de exame"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                required
                size="medium"
                placeholder="Ex: Raio-X tórax, Tomografia..."
              />
              {submitError && <Alert severity="error">{submitError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={close} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ minWidth: 120 }}
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default function AttendantPage() {
  return (
    <RequireRole role="ATTENDANT">
      <AttendantInner />
    </RequireRole>
  );
}
