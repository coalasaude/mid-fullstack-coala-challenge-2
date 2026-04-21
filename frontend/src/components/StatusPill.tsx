'use client';

import { Box, Typography, useTheme, alpha } from '@mui/material';
import { statusDotColor, statusLabel } from '@/lib/exam-utils';
import type { ExamStatus } from '@/lib/types';

interface Props {
  status: ExamStatus;
  dense?: boolean;
}

export function StatusPill({ status, dense = false }: Props) {
  const theme = useTheme();
  const color = statusDotColor[status];
  const bg = alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.1);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: dense ? 0.75 : 1.25,
        py: dense ? 0.25 : 0.5,
        borderRadius: 999,
        bgcolor: bg,
        color,
        fontWeight: 600,
        fontSize: dense ? '0.7rem' : '0.75rem',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow:
            status === 'PROCESSING'
              ? `0 0 0 3px ${alpha(color, 0.25)}`
              : undefined,
          animation:
            status === 'PROCESSING' ? 'pulse 1.6s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.45 },
          },
        }}
      />
      <Typography
        component="span"
        sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
      >
        {statusLabel[status]}
      </Typography>
    </Box>
  );
}
