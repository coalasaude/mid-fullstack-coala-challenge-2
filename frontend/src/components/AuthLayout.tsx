'use client';

import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BrandMark } from './BrandMark';
import { useThemeMode } from '@/lib/theme-context';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const bullets = [
  'Orquestração end-to-end do ciclo de exames',
  'Processamento assíncrono com fila dedicada',
  'Laudos médicos com contexto automatizado',
];

export function AuthLayout({ title, subtitle, children }: Props) {
  const theme = useTheme();
  const { mode, toggle } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          p: 6,
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 45%, ${theme.palette.secondary.main} 100%)`,
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent 40%)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <BrandMark variant="md" showWordmark={false} />
          <Typography
            component="span"
            sx={{
              ml: 1.5,
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              verticalAlign: 'middle',
              color: '#FFFFFF',
            }}
          >
            HealthFlow
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mb: 2,
              maxWidth: 480,
            }}
          >
            Imagem médica com fluxo previsível, do upload ao laudo.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: alpha('#FFFFFF', 0.85), mb: 4, maxWidth: 480 }}
          >
            Coordene atendentes e médicos em um só lugar, com processamento
            assíncrono e visibilidade em tempo real.
          </Typography>
          <Stack spacing={1.5}>
            {bullets.map((b) => (
              <Stack
                key={b}
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <CheckCircleRoundedIcon
                  sx={{ color: alpha('#FFFFFF', 0.9), fontSize: 20 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: alpha('#FFFFFF', 0.92) }}
                >
                  {b}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography
          variant="caption"
          sx={{ position: 'relative', zIndex: 1, color: alpha('#FFFFFF', 0.7) }}
        >
          © HealthFlow · desafio técnico Coala Saúde
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'}>
            <IconButton onClick={toggle} size="small">
              {mode === 'dark' ? (
                <LightModeRoundedIcon fontSize="small" />
              ) : (
                <DarkModeRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ mb: 4, display: { xs: 'block', md: 'none' } }}>
            <BrandMark />
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
