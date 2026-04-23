'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageHeader } from '@/components/layout/PageHeader';
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PageHeader
            title="Painel do atendente"
            subtitle={`Crie novos exames e acompanhe o processamento. A lista atualiza automaticamente a cada ${
              POLL_INTERVAL_MS / 1000
            }s.`}
          />

          <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Novo exame
            </Typography>

            {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
            {uploadSuccess ? (
              <Alert severity="success" sx={{ mt: uploadError ? 2 : 0 }}>
                {uploadSuccess}
              </Alert>
            ) : null}

            <Box
              component="form"
              onSubmit={handleUpload}
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { sm: 'flex-start' },
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
                sx={{ minWidth: { sm: 200 }, height: 56, alignSelf: { sm: 'flex-start' } }}
              >
                {uploadLoading ? <CircularProgress size={22} color="inherit" /> : 'Criar exame'}
              </Button>
            </Box>
          </Paper>

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

            <Box
              sx={{
                mb: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Exames
              </Typography>
              {listLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando…
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {exams.length} exame(s)
                </Typography>
              )}
            </Box>

            {listError ? <Alert severity="error">{listError}</Alert> : null}

            {!listLoading && exams.length === 0 ? (
              <Box sx={{ mt: listError ? 2 : 0 }}>
                <EmptyState
                  title="Nenhum exame ainda"
                  description="Crie um exame acima para iniciar o fluxo. Quando o processamento terminar, o status mudará automaticamente aqui."
                />
              </Box>
            ) : null}

            {exams.length > 0 ? (
              <TableContainer
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
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
                        <TableCell sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {exam.fileReference}
                        </TableCell>
                        <TableCell>
                          <ExamStatusChip status={exam.status} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 520 }}>
                          <Typography variant="body2" color="text.secondary" noWrap>
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
      </Container>
    </Box>
  );
}
