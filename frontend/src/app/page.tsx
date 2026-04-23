'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { login } from '@/services/auth';
import { PageHeader } from '@/components/layout/PageHeader';
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ minHeight: '100vh', py: { xs: 6, sm: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <PageHeader
              title="Entrar"
              subtitle="Acesse com suas credenciais. Você será redirecionado automaticamente para o painel correto."
            />

            <Divider />

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
      </Container>
    </Box>
  );
}
