# HealthFlow — Frontend (Next.js)

UI do HealthFlow. Stack: Next.js 14 (App Router), React 18, MUI 5.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App disponível em `http://localhost:3000`. Certifique-se de que o backend esteja rodando em `http://localhost:3001`.

## Variáveis

| Variável | Default |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |

## Estrutura

- `src/app/login` — página de login
- `src/app/register` — criação de conta (ATTENDANT ou DOCTOR)
- `src/app/attendant` — dashboard do atendente (tabela de todos os exames + upload)
- `src/app/doctor` — fila de laudos (apenas `DONE`)
- `src/lib/auth-context.tsx` — token + user em `localStorage`, context React
- `src/lib/api.ts` — axios com interceptor que injeta `Authorization: Bearer`
- `src/hooks/useExamsPolling.ts` — polling a cada 3s em `GET /exams`

## Autenticação

Após login, o token JWT é armazenado em `localStorage` e enviado em todo request via `Authorization: Bearer`. Respostas 401 limpam o token e redirecionam para `/login`.

O componente `RequireRole` protege rotas com base no papel do usuário. Se o role atual não corresponder, o usuário é redirecionado para sua dashboard correta.
