'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ExamStatusChip } from '@/components/exams/ExamStatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  clearAuthHeader,
  getAccessToken,
  setAuthHeader,
} from '@/services/api';
import { listExams, uploadExam } from '@/services/exams';
import type { MedicalExam } from '@/types/exam';
import { getHttpErrorMessage } from '@/utils/http-error';

const POLL_INTERVAL_MS = 4000;

export default function AttendantDashboardPage() {
  const router = useRouter();
  const firstListLoadRef = useRef(true);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [fileReference, setFileReference] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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

    if (!token || role !== 'ATTENDANT') {
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

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);
    setUploadLoading(true);

    try {
      await uploadExam(fileReference.trim());
      setFileReference('');
      setUploadSuccess('Exame criado com sucesso.');
      await refreshExams();
    } catch (error) {
      setUploadError(
        getHttpErrorMessage(error, 'Não foi possível criar o exame. Tente novamente.'),
      );
    } finally {
      setUploadLoading(false);
    }
  }

  const pendingCount = exams.filter((exam) => exam.status === 'PENDING').length;
  const processingCount = exams.filter((exam) => exam.status === 'PROCESSING').length;
  const doneCount = exams.filter((exam) => exam.status === 'DONE').length;
  const errorCount = exams.filter((exam) => exam.status === 'ERROR').length;

  if (!bootstrapped) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              background:
                'linear-gradient(120deg, rgba(111, 70, 190, 0.14), rgba(111, 70, 190, 0.04))',
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Dashboard do atendente
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Cadastro e acompanhamento do fluxo de exames em tempo quase real.
                </Typography>
              </Box>
              <Chip
                label={`Atualização automática: ${POLL_INTERVAL_MS / 1000}s`}
                sx={{
                  bgcolor: 'rgba(111, 70, 190, 0.12)',
                  color: 'primary.main',
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total de exames
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {exams.length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  PENDING
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {pendingCount}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  PROCESSING
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {processingCount}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  DONE
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {doneCount}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  ERROR
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {errorCount}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Paper sx={{ p: { xs: 2.5, sm: 3 }, position: { lg: 'sticky' }, top: { lg: 20 } }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Criar novo exame
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Informe a referência do arquivo e envie para iniciar o pipeline de processamento.
                </Typography>
                <Divider />

                {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
                {uploadSuccess ? <Alert severity="success">{uploadSuccess}</Alert> : null}

                <Box
                  component="form"
                  onSubmit={handleUpload}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <TextField
                    label="Referência do arquivo"
                    value={fileReference}
                    onChange={(event) => setFileReference(event.target.value)}
                    required
                    fullWidth
                    placeholder="ex: exam-001.dcm"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={uploadLoading}
                    sx={{ minHeight: 48 }}
                  >
                    {uploadLoading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      'Criar exame'
                    )}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative', overflow: 'hidden' }}>
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

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Monitoramento de exames
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Acompanhe status e resultado de processamento de todos os exames cadastrados.
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 2.5,
                  mb: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                {listLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Carregando...
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {exams.length} exame(s) encontrado(s)
                  </Typography>
                )}
              </Box>

              {listError ? <Alert severity="error">{listError}</Alert> : null}

              {!listLoading && exams.length === 0 ? (
                <Box sx={{ mt: listError ? 2 : 0 }}>
                  <EmptyState
                    title="Nenhum exame cadastrado"
                    description="Use o formulário lateral para criar o primeiro exame e iniciar o acompanhamento."
                  />
                </Box>
              ) : null}

              {exams.length > 0 ? (
                <TableContainer
                  sx={{
                    mt: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#fff',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Referência</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Resultado</TableCell>
                        <TableCell>Criado em</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id} hover>
                          <TableCell
                            sx={{
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              fontWeight: 600,
                            }}
                          >
                            {exam.fileReference}
                          </TableCell>
                          <TableCell>
                            <ExamStatusChip status={exam.status} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 460 }}>
                            <Typography variant="body2" color="text.secondary">
                              {exam.processingResult ?? '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {new Date(exam.createdAt).toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
