'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';

interface Props {
  variant?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { box: 32, icon: 18, font: '1rem' },
  md: { box: 40, icon: 22, font: '1.25rem' },
  lg: { box: 56, icon: 30, font: '1.75rem' },
};

export function BrandMark({ variant = 'md', showWordmark = true }: Props) {
  const theme = useTheme();
  const s = sizeMap[variant];

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: s.box,
          height: s.box,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#FFFFFF',
          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
        }}
      >
        <HealingRoundedIcon sx={{ fontSize: s.icon }} />
      </Box>
      {showWordmark && (
        <Typography
          component="span"
          sx={{
            fontSize: s.font,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          HealthFlow
        </Typography>
      )}
    </Box>
  );
}
