'use client';

import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
  label: string;
  value: number;
  tone: 'neutral' | 'warning' | 'info' | 'success' | 'error';
  icon?: SvgIconComponent;
  hint?: string;
}

const toneColors = {
  neutral: '#64748B',
  warning: '#D97706',
  info: '#2563EB',
  success: '#059669',
  error: '#DC2626',
};

export function StatsCard({ label, value, tone, icon: Icon, hint }: Props) {
  const theme = useTheme();
  const color = toneColors[tone];
  const bg = alpha(color, theme.palette.mode === 'dark' ? 0.16 : 0.1);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {Icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: bg,
                color,
                flexShrink: 0,
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, lineHeight: 1.1, mt: 0.5 }}
            >
              {value}
            </Typography>
            {hint && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
              >
                {hint}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
