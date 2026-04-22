'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { login } from '@/services/auth';

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
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f7fb',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              HealthFlow
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Faça login para continuar.
            </Typography>
          </Box>

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
            sx={{ py: 1.25 }}
          >
            {loading ? <CircularProgress color="inherit" size={22} /> : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
