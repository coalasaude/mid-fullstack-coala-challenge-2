'use client';

import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { apiClient, ApiError } from '@/core/api';
import { useI18n } from '@/shared/i18n';

interface UploadExamButtonProps {
  onUploaded: () => void;
}

export function UploadExamButton({ onUploaded }: UploadExamButtonProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [snack, setSnack] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await apiClient.exams.upload(file);
      setSnack({
        severity: 'success',
        message: t('upload.success', { file: file.name }),
      });
      onUploaded();
    } catch (err) {
      setSnack({
        severity: 'error',
        message:
          err instanceof ApiError ? err.message : t('upload.error'),
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleFile}
        accept="image/*,application/dicom,application/pdf,.dcm"
      />
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        disabled={uploading}
        onClick={openPicker}
      >
        {uploading ? t('upload.uploading') : t('upload.button')}
      </Button>
      <Snackbar
        open={!!snack}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert
            onClose={() => setSnack(null)}
            severity={snack.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snack.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
