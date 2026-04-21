'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import { api, extractApiError } from '@/lib/api';
import type { Role } from '@/lib/types';
import { AuthLayout } from '@/components/AuthLayout';

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('ATTENDANT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/users', { name, email, password, role });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 900);
    } catch (err) {
      setError(extractApiError(err, 'Falha ao criar conta'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Defina seu perfil para começar a usar o HealthFlow."
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Perfil
            </Typography>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(_, v) => v && setRole(v as Role)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  py: 1.25,
                  gap: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.14),
                    },
                  },
                },
              }}
            >
              <ToggleButton value="ATTENDANT">
                <AssignmentIndRoundedIcon fontSize="small" />
                Atendente
              </ToggleButton>
              <ToggleButton value="DOCTOR">
                <MedicalServicesRoundedIcon fontSize="small" />
                Médico
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="medium"
            helperText="Mínimo de 6 caracteres"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              Conta criada! Redirecionando para o login...
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ py: 1.25 }}
          >
            {submitting ? 'Enviando...' : 'Criar conta'}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center">
            Já tem conta?{' '}
            <Typography
              component={Link}
              href="/login"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Entrar
            </Typography>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
