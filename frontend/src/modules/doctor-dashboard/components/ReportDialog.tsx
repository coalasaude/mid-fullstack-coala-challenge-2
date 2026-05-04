'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { apiClient, ApiError } from '@/core/api';
import type { ExamListItem } from '@/shared/types';
import { useI18n } from '@/shared/i18n';
import { AppTextField } from '@/shared/ui';
import { formatDateTime, formatFileSize, safeHttpUrl } from '@/shared/utils';

interface ReportDialogProps {
  exam: ExamListItem | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReportDialog({ exam, onClose, onSubmitted }: ReportDialogProps) {
  const { t, locale } = useI18n();
  const [report, setReport] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!exam) return;
    const trimmed = report.trim();
    if (!trimmed) {
      setError(t('report.errorEmpty'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.exams.submitReport(exam.id, trimmed);
      onSubmitted();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('report.errorSubmit'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={!!exam}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{t('report.dialogTitle')}</DialogTitle>
      <DialogContent dividers>
        {exam && (
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('report.file')}
              </Typography>
              {(() => {
                const fileUrl = safeHttpUrl(exam.examDocument.url);
                return fileUrl ? (
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    {exam.examDocument.fileName}
                  </Link>
                ) : (
                  <Typography>{exam.examDocument.fileName}</Typography>
                );
              })()}
              <Typography variant="caption" color="text.secondary">
                {t('report.fileMeta', {
                  mime: exam.examDocument.mimeType,
                  size: formatFileSize(exam.examDocument.fileSize),
                  date: formatDateTime(exam.createdAt, locale),
                })}
              </Typography>
            </Stack>

            <Divider />

            <AppTextField
              label={t('report.fieldLabel')}
              placeholder={t('report.placeholder')}
              value={report}
              onChange={(e) => setReport(e.target.value)}
              multiline
              minRows={6}
              autoFocus
              disabled={submitting}
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t('report.submitting') : t('report.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
