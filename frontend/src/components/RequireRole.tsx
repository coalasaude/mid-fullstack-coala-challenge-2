'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { BrandMark } from './BrandMark';
import { useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === 'ATTENDANT' ? '/attendant' : '/doctor');
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <BrandMark variant="lg" showWordmark={false} />
          <CircularProgress size={24} thickness={4.5} />
          <Typography variant="body2" color="text.secondary">
            Carregando...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
