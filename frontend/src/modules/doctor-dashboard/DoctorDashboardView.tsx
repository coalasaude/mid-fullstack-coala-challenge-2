'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useExamPolling } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { AppShell } from '@/shared/layouts';
import { StatusChip } from '@/shared/ui';
import { formatDateTime, formatFileSize, safeHttpUrl } from '@/shared/utils';
import { EMedicalExamStatus, type ExamListItem } from '@/shared/types';
import { ReportDialog } from './components/ReportDialog';

export function DoctorDashboardView() {
  const { t, locale } = useI18n();
  const { exams, loading, refreshing, error, refresh } = useExamPolling();
  const [selected, setSelected] = useState<ExamListItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const queue = exams.filter((e) => e.status === EMedicalExamStatus.DONE);

  return (
    <AppShell title={t('doctor.shellTitle')}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Box>
            <Typography variant="h5">{t('doctor.heading')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('doctor.subheading')}
            </Typography>
          </Box>
          <Tooltip title={t('common.refreshNow')}>
            <span>
              <IconButton
                onClick={() => void refresh()}
                disabled={refreshing || loading}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper variant="outlined">
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : queue.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {t('doctor.emptyQueue')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('doctor.colFile')}</TableCell>
                    <TableCell>{t('doctor.colStatus')}</TableCell>
                    <TableCell>{t('doctor.colUploadedBy')}</TableCell>
                    <TableCell>{t('doctor.colReceived')}</TableCell>
                    <TableCell align="right">{t('doctor.colAction')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queue.map((exam) => {
                    const fileUrl = safeHttpUrl(exam.examDocument.url);
                    return (
                    <TableRow key={exam.id} hover>
                      <TableCell>
                        <Stack spacing={0.3}>
                          {fileUrl ? (
                            <Link
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {exam.examDocument.fileName}
                            </Link>
                          ) : (
                            <Typography variant="body2">
                              {exam.examDocument.fileName}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {exam.examDocument.mimeType} ·{' '}
                            {formatFileSize(exam.examDocument.fileSize)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={exam.status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {exam.uploadedBy.email ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(exam.createdAt, locale)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelected(exam)}
                        >
                          {t('doctor.addReport')}
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <ReportDialog
        key={selected?.id ?? 'closed'}
        exam={selected}
        onClose={() => setSelected(null)}
        onSubmitted={() => {
          setToast(t('doctor.toastReportSubmitted'));
          void refresh();
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setToast(null)}
            sx={{ width: '100%' }}
          >
            {toast}
          </Alert>
        ) : undefined}
      </Snackbar>
    </AppShell>
  );
}
