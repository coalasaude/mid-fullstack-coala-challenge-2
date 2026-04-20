'use client';

import Image from 'next/image';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ThemeLocaleToolbar } from '@/core/components/ThemeLocaleToolbar';
import healthFlowBackground from '@/shared/assets/health-flow-background.jpg';

interface AuthScreenShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthScreenShell({ title, subtitle, children }: AuthScreenShellProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: { xs: '1 1 auto', lg: '0 0 30%' },
          width: { xs: '100%', lg: '30%' },
          minWidth: 0,
          minHeight: { xs: 'auto', lg: '100vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          py: { xs: 4, sm: 5, lg: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.45)'
                  : '0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 40px rgba(15, 23, 42, 0.06)',
            })}
          >
            <Stack spacing={3.5}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.55 }}
                  >
                    {subtitle}
                  </Typography>
                </Stack>
                <ThemeLocaleToolbar dense />
              </Stack>
              {children}
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'relative',
          flex: { lg: '0 0 70%' },
          width: { lg: '70%' },
          minHeight: { lg: '100vh' },
        }}
      >
        <Image
          src={healthFlowBackground}
          alt=""
          fill
          priority
          sizes="(max-width: 1199px) 100vw, 70vw"
          placeholder="blur"
          style={{
            objectFit: 'cover',
            objectPosition: 'right center',
          }}
        />
      </Box>
    </Box>
  );
}
