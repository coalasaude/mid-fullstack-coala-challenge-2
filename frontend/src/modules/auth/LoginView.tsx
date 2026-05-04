'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { apiClient, ApiError } from '@/core/api';
import { dashboardPathFor, useAuth } from '@/core/auth';
import { useI18n } from '@/shared/i18n';
import { AppTextField } from '@/shared/ui';
import { AuthScreenShell } from './AuthScreenShell';

export function LoginView() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading, setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(dashboardPathFor(user.role));
    }
  }, [loading, user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiClient.auth.login({ email, password });
      setSession(
        { id: res.id, email: res.email, role: res.role },
        res.access_token,
      );
      router.replace(dashboardPathFor(res.role));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('auth.login.errorUnexpected'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthScreenShell
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.75}>
          <AppTextField
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <AppTextField
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ mt: 0.5, py: 1.35, borderRadius: 2 }}
          >
            {submitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', pt: 0.5 }}
          >
            {t('auth.login.noAccount')}{' '}
            <MuiLink
              component={Link}
              href="/register"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              {t('auth.login.createAccount')}
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    </AuthScreenShell>
  );
}
