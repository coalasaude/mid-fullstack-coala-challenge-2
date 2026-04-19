'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { dashboardPathFor, useAuth } from '@/core/auth';
import { ERole } from '@/shared/types';

interface RouteGuardProps {
  role: ERole;
  children: React.ReactNode;
}

export function RouteGuard({ role, children }: RouteGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(dashboardPathFor(user.role));
    }
  }, [loading, user, role, router]);

  if (loading || !user || user.role !== role) {
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

  return <>{children}</>;
}
