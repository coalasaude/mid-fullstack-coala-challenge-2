'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  clearAuthHeader,
  getAccessToken,
  setAuthHeader,
} from '@/services/api';
import { listExams, submitExamReport } from '@/services/exams';
import type { MedicalExam } from '@/types/exam';

const POLL_INTERVAL_MS = 4000;

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [bootstrapped, setBootstrapped] = useState(false);
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [reportsByExamId, setReportsByExamId] = useState<Record<string, string>>(
    {},
  );
  const [submittingExamId, setSubmittingExamId] = useState<string | null>(null);
  const [submitErrorByExamId, setSubmitErrorByExamId] = useState<
    Record<string, string | undefined>
  >({});

  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const refreshExams = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    setAuthHeader(token);

    try {
      const data = await listExams();
      setExams(data);
      setListError(null);
    } catch {
      setListError('Não foi possível carregar os exames.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const role = localStorage.getItem('healthflow_user_role');

    if (!token || role !== 'DOCTOR') {
      clearAuthHeader();
      router.replace('/');
      return;
    }

    setAuthHeader(token);
    setBootstrapped(true);

    void refreshExams();

    const intervalId = window.setInterval(() => {
      void refreshExams();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshExams, router]);

  async function handleSubmitReport(event: FormEvent<HTMLFormElement>, examId: string) {
    event.preventDefault();

    const report = (reportsByExamId[examId] ?? '').trim();
    if (!report) {
      setSubmitErrorByExamId((prev) => ({
        ...prev,
        [examId]: 'O laudo não pode ser vazio.',
      }));
      return;
    }

    setSubmitErrorByExamId((prev) => ({ ...prev, [examId]: undefined }));
    setSubmittingExamId(examId);
    setGlobalSuccess(null);

    try {
      await submitExamReport(examId, report);
      setReportsByExamId((prev) => ({ ...prev, [examId]: '' }));
      setGlobalSuccess('Laudo enviado com sucesso.');
      await refreshExams();
    } catch {
      setSubmitErrorByExamId((prev) => ({
        ...prev,
        [examId]: 'Não foi possível enviar o laudo.',
      }));
    } finally {
      setSubmittingExamId(null);
    }
  }

  if (!bootstrapped) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ display: 'flex' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Painel do médico
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Exames prontos para laudo (atualização automática a cada{' '}
              {POLL_INTERVAL_MS / 1000}s).
            </Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Fila de laudos
              </Typography>
              {listLoading ? (
                <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando…
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {exams.length} exame(s)
                </Typography>
              )}
            </Stack>

            {globalSuccess ? <Alert severity="success">{globalSuccess}</Alert> : null}
            {listError ? (
              <Alert severity="error" sx={{ mt: globalSuccess ? 2 : 0 }}>
                {listError}
              </Alert>
            ) : null}

            {!listLoading && exams.length === 0 ? (
              <Alert severity="info" sx={{ mt: listError || globalSuccess ? 2 : 0 }}>
                Nenhum exame disponível para laudo no momento.
              </Alert>
            ) : null}

            <Stack spacing={2} sx={{ mt: 2, display: 'flex' }}>
              {exams.map((exam) => (
                <Card key={exam.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={1.5} sx={{ display: 'flex' }}>
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 1,
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {exam.fileReference}
                        </Typography>
                        <Chip label={exam.status} color="success" size="small" />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" noWrap>
                        Resultado: {exam.processingResult ?? '—'}
                      </Typography>

                      {submitErrorByExamId[exam.id] ? (
                        <Alert severity="error">{submitErrorByExamId[exam.id]}</Alert>
                      ) : null}

                      <Box
                        component="form"
                        onSubmit={(event) => handleSubmitReport(event, exam.id)}
                      >
                        <TextField
                          label="Laudo"
                          value={reportsByExamId[exam.id] ?? ''}
                          onChange={(event) =>
                            setReportsByExamId((prev) => ({
                              ...prev,
                              [exam.id]: event.target.value,
                            }))
                          }
                          required
                          fullWidth
                          multiline
                          minRows={4}
                          placeholder="Escreva o laudo aqui…"
                        />

                        <CardActions sx={{ px: 0, pt: 2, justifyContent: 'flex-end' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={submittingExamId === exam.id}
                          >
                            {submittingExamId === exam.id ? (
                              <CircularProgress size={22} color="inherit" />
                            ) : (
                              'Enviar laudo'
                            )}
                          </Button>
                        </CardActions>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
