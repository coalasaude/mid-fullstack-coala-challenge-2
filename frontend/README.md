# HealthFlow – Frontend

Next.js 16 (App Router) + React 19 + MUI 9 interface for the HealthFlow medical exam orchestration platform.

## Stack

- **Next.js 16** with the App Router and Turbopack
- **React 19**
- **MUI 9** (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`)
- **TypeScript**

## Prerequisites

- Node.js 20+
- The HealthFlow backend running locally (see `../backend/README.md`)

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` if the backend runs anywhere other than `http://localhost:3000`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running

```bash
npm run dev       # dev server on http://localhost:3001
npm run build     # production build
npm run start     # production server on http://localhost:3001
npm run lint      # ESLint
```

The dev server listens on **3001** so it doesn't collide with the backend on **3000**.

## Project layout

Camadas e dependências sugeridas: **`app` → `modules` → `core` / `shared`**, com `core` dependendo só de `shared`.

```
src/
├── app/                       # rotas Next.js (ficam finas; só compõem módulos)
│   ├── layout.tsx             # root + AppProviders
│   ├── page.tsx               # redirect: login ou dashboard por papel
│   ├── login/page.tsx         # → LoginView
│   ├── register/page.tsx      # → RegisterView
│   └── dashboard/
│       ├── attendant/         # RouteGuard ATTENDANT + AttendantDashboardView
│       └── doctor/            # RouteGuard DOCTOR + DoctorDashboardView
│
├── modules/                   # telas e fluxos por domínio (UI + composição)
│   ├── auth/                  # LoginView, RegisterView
│   ├── attendant-dashboard/   # AttendantDashboardView, components/UploadExamButton
│   └── doctor-dashboard/      # DoctorDashboardView, components/ReportDialog
│
├── core/                      # infra de app: API, auth, guards, providers
│   ├── api/                   # http.ts (fetch + ApiError), api-client, endpoints/*
│   ├── auth/                  # AuthProvider, useAuth, auth-storage (localStorage)
│   ├── guards/                # RouteGuard
│   └── providers/             # AppProviders (MUI + Auth)
│
└── shared/                    # reutilizável e sem regra de negócio de feature
    ├── types/                 # enums + DTOs alinhados ao backend
    ├── ui/                    # StatusChip, PasswordHelper, …
    ├── layouts/               # AppShell
    ├── hooks/                 # useExamPolling
    ├── utils/                 # format (tamanho de arquivo, data)
    └── theme/                 # tema MUI
```

Aliases: importe com `@/…` (mapeado em `tsconfig.json` para `./src/*`).

## Flows

### Login / register (public)

- `POST /auth/login` returns `{ id, email, role, access_token }`. The token and user are stored in `localStorage` under `healthflow.token` / `healthflow.user`.
- `POST /users` registers a new ATTENDANT or DOCTOR. After registration the user is logged in automatically and redirected to the matching dashboard.
- Password requirements (enforced by the backend) are surfaced as form helper text.

### ATTENDANT dashboard (`/dashboard/attendant`)

- Lists all exams returned by `GET /exams`. The list auto-refreshes every 5 seconds via `shared/hooks/useExamPolling`.
- `Upload exam` opens a native file picker and sends the file as `multipart/form-data` to `POST /exams/upload`. The list is refreshed as soon as the upload completes so the new `PENDING` entry shows up without waiting for the next poll.
- Colored status chips (`PENDING`, `PROCESSING`, `DONE`, `ERROR`, `REPORTED`) make the pipeline state obvious.

### DOCTOR dashboard (`/dashboard/doctor`)

- The backend already restricts `GET /exams` to `DONE` exams for doctors. The page filters again defensively so the queue never shows anything else.
- Clicking `Add report` opens a dialog with the file preview link and a textarea. On submit the frontend calls `POST /exams/:id/report`; on success the exam disappears from the queue (the backend moves it to `REPORTED`) and a snackbar confirms.
- The dialog uses a `key` derived from the selected exam id so its internal state resets cleanly between openings.

### Route protection

- Every dashboard segment is wrapped in `core/guards/RouteGuard` (`<RouteGuard role={...}>`), which:
  - redirects to `/login` if there's no session,
  - redirects to the other dashboard if the logged-in role doesn't match.
- `/login` and `/register` redirect authenticated users to their dashboard.
- `401` responses from the API clear the session automatically.

### Auth transport

- All authenticated requests attach `Authorization: Bearer <token>` via the API client.
- Errors are normalized into `ApiError` with the backend's `message` / `error` body surfaced to the UI (validation errors included).
