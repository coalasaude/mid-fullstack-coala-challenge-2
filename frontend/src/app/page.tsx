'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { login } from '@/services/auth';
import { getHttpErrorMessage } from '@/utils/http-error';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = await login({ email, password });

      if (payload.role === 'ATTENDANT') {
        router.push('/dashboard/attendant');
        return;
      }

      router.push('/dashboard/doctor');
    } catch (err) {
      setError(getHttpErrorMessage(err, 'Não foi possível autenticar. Verifique email e senha.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F7F4FC',
        p: { xs: 2, md: 3 },
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1160,
          minHeight: { xs: 'auto', md: 700 },
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(111, 70, 190, 0.14)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(420px, 46%) 1fr' },
          boxShadow: '0 26px 60px rgba(74, 45, 125, 0.12)',
          bgcolor: '#FFFFFF',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit}
            sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1F1732', mt: 0.5 }}>
                Entrar na plataforma
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
                Acesse com seu email e senha para continuar no painel.
              </Typography>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{
                py: 1.35,
                bgcolor: '#6F46BE',
                '&:hover': { bgcolor: '#5E39A8' },
              }}
            >
              {loading ? <CircularProgress color="inherit" size={22} /> : 'Entrar'}
            </Button>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'relative',
            overflow: 'hidden',
            px: { md: 5, lg: 7 },
            py: { md: 5, lg: 6 },
            background:
              'linear-gradient(165deg, #6F46BE 0%, #7B57C6 35%, #A284DC 100%)',
            color: '#FFFFFF',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              top: -120,
              right: -100,
              bgcolor: 'rgba(255,255,255,0.16)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              bottom: -80,
              left: -60,
              bgcolor: 'rgba(255,255,255,0.12)',
            }}
          />

          <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: 0.9 }}>
              Plataforma clínica
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Fluxo de exames com acompanhamento claro e objetivo.
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Upload, processamento assíncrono e laudo em um fluxo único para times de
              atendimento e médicos.
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ position: 'relative', zIndex: 1, flexWrap: 'wrap', rowGap: 1.5 }}
          >
            <Chip label="Desafio Coala Saúde" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
