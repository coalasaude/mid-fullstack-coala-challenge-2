'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useAuth } from '@/lib/auth-context';
import { BrandMark } from '@/components/BrandMark';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role === 'ATTENDANT') router.replace('/attendant');
    else router.replace('/doctor');
  }, [user, loading, router]);

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
