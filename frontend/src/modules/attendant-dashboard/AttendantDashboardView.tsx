'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
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
import { UploadExamButton } from './components/UploadExamButton';

export function AttendantDashboardView() {
  const { t, locale } = useI18n();
  const { exams, loading, refreshing, error, refresh } = useExamPolling();

  return (
    <AppShell title={t('attendant.shellTitle')}>
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
            <Typography variant="h5">{t('attendant.heading')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('attendant.subheading')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
            <UploadExamButton onUploaded={() => void refresh()} />
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper variant="outlined">
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : exams.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('attendant.empty')}</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('attendant.colFile')}</TableCell>
                    <TableCell>{t('attendant.colStatus')}</TableCell>
                    <TableCell>{t('attendant.colUploadedBy')}</TableCell>
                    <TableCell>{t('attendant.colReportedBy')}</TableCell>
                    <TableCell>{t('attendant.colCreated')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => {
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
                          {exam.reportedBy?.email ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(exam.createdAt, locale)}
                        </Typography>
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
    </AppShell>
  );
}
