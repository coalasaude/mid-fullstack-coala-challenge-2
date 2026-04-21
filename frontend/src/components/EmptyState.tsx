'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

interface Props {
  title: string;
  description?: string;
  icon?: SvgIconComponent;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = InboxOutlinedIcon,
  action,
}: Props) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          mb: 0.5,
        }}
      >
        <Icon />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 420 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}
