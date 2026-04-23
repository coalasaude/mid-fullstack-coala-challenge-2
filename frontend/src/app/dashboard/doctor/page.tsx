'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { ExamStatusChip } from '@/components/exams/ExamStatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { getHttpErrorMessage } from '@/utils/http-error';

const POLL_INTERVAL_MS = 4000;

export default function DoctorDashboardPage() {
  const router = useRouter();
  const firstListLoadRef = useRef(true);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
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

    const isFirstLoad = firstListLoadRef.current;
    if (isFirstLoad) {
      setListLoading(true);
    } else {
      setListRefreshing(true);
    }

    try {
      const data = await listExams();
      setExams(data);
      setListError(null);
    } catch (error) {
      setListError(
        getHttpErrorMessage(error, 'Não foi possível carregar os exames. Tente novamente.'),
      );
    } finally {
      setListLoading(false);
      setListRefreshing(false);
      firstListLoadRef.current = false;
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
    } catch (error) {
      setSubmitErrorByExamId((prev) => ({
        ...prev,
        [examId]: getHttpErrorMessage(error, 'Não foi possível enviar o laudo. Tente novamente.'),
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, sm: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ display: 'flex' }}>
          <PageHeader
            title="Painel do médico"
            subtitle={`Aqui aparecem apenas exames prontos para laudo. A fila atualiza automaticamente a cada ${
              POLL_INTERVAL_MS / 1000
            }s.`}
          />

          <Paper sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative', overflow: 'hidden' }}>
            {listRefreshing ? (
              <LinearProgress
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
            ) : null}

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
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
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
              <Box sx={{ mt: listError || globalSuccess ? 2 : 0 }}>
                <EmptyState
                  title="Nada na fila"
                  description="Quando houver exames com processamento concluído, eles aparecerão aqui automaticamente."
                />
              </Box>
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
                        <ExamStatusChip status={exam.status} />
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
                            sx={{ minWidth: 170 }}
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
