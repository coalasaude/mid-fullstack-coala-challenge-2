'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeLocaleToolbar } from '@/core/components/ThemeLocaleToolbar';
import { useAuth } from '@/core/auth';
import { useI18n } from '@/shared/i18n';
import { ERole } from '@/shared/types';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const roleLabel =
    user?.role === ERole.DOCTOR ? t('role.doctor') : t('role.attendant');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, minWidth: 0 }}>
            {t('app.brand')} · {title}
          </Typography>
          <ThemeLocaleToolbar dense />
          {user && (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Chip
                label={roleLabel}
                size="small"
                color={user.role === ERole.DOCTOR ? 'secondary' : 'primary'}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 220 }}
                noWrap
              >
                {user.email}
              </Typography>
              <Button variant="outlined" size="small" onClick={logout}>
                {t('common.signOut')}
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
