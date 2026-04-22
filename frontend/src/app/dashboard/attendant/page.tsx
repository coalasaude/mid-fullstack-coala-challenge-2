'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  clearAuthHeader,
  getAccessToken,
  setAuthHeader,
} from '@/services/api';
import { listExams, uploadExam } from '@/services/exams';
import type { MedicalExam, MedicalExamStatus } from '@/types/exam';

const POLL_INTERVAL_MS = 4000;

function statusColor(
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

export default function AttendantDashboardPage() {
  const router = useRouter();

  const [bootstrapped, setBootstrapped] = useState(false);
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [listLoading, setListLoading] = useState(true);
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
    } catch {
      setUploadError('Não foi possível criar o exame.');
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Painel do atendente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Crie novos exames e acompanhe o status (atualização automática a cada{' '}
              {POLL_INTERVAL_MS / 1000}s).
            </Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
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
                sx={{ minWidth: { sm: 180 }, height: 56 }}
              >
                {uploadLoading ? <CircularProgress size={22} color="inherit" /> : 'Criar exame'}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
              <Alert severity="info" sx={{ mt: listError ? 2 : 0 }}>
                Nenhum exame ainda. Crie o primeiro acima.
              </Alert>
            ) : null}

            {exams.length > 0 ? (
              <TableContainer sx={{ mt: 2 }}>
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
                          <Chip label={exam.status} color={statusColor(exam.status)} size="small" />
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
