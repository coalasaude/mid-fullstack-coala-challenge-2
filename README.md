# HealthFlow

MVP para orquestração do ciclo de vida de exames de imagem médica — desafio técnico Coala Saúde (Dev Full Stack Pleno). O enunciado original está em [`CHALLENGE.md`](./CHALLENGE.md).

- **Backend:** NestJS 10 + Prisma + PostgreSQL + RabbitMQ + JWT
- **Frontend:** Next.js 14 (App Router) + React 18 + MUI 5
- **Infra:** Docker Compose (Postgres + RabbitMQ + backend + frontend)

## Fluxo de negócio

```
ATTENDANT faz upload → PENDING
        ↓ (publish em exam_processing_queue)
ExamConsumer         → PROCESSING → DONE | ERROR
        ↓
DOCTOR escreve laudo → REPORTED
```

Dois perfis:
- **ATTENDANT** — faz upload e acompanha todos os exames.
- **DOCTOR** — vê apenas exames com status `DONE` e emite laudos.

## Rodando com Docker (tudo containerizado)

```bash
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:3030
- Backend:  http://localhost:3001
- RabbitMQ UI: http://localhost:15672 (`healthflow` / `healthflow`)
- Postgres: `localhost:5436`

Para atualizar após mudar código:

```bash
docker compose up -d --build frontend   # ou backend
```

## Rodando em dev (sem Docker para apps)

```bash
docker compose up -d postgres rabbitmq

cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run start:dev

cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

## Deploy em servidor (AWS EC2, VPS, etc.)

No servidor:

```bash
git clone <repo> && cd <repo>
cp .env.production.example .env
# edita .env e troca: PUBLIC_HOST, JWT_SECRET, POSTGRES_PASSWORD, RABBITMQ_PASSWORD
docker compose up -d --build
```

Variáveis que importam:

| Variável | Para que serve |
| --- | --- |
| `PUBLIC_HOST` | Host que o navegador usa para chamar a API. Em produção, IP público ou domínio (sem `http://` e sem porta). |
| `FRONTEND_HOST_PORT` | Porta pública do frontend (default `3030`) |
| `BACKEND_HOST_PORT` | Porta pública do backend (default `3001`) |
| `JWT_SECRET` | Segredo para assinar tokens. **Trocar em produção.** |
| `POSTGRES_PASSWORD`, `RABBITMQ_PASSWORD` | Credenciais de infra. **Trocar em produção.** |

O frontend é construído com `NEXT_PUBLIC_API_URL=http://${PUBLIC_HOST}:${BACKEND_HOST_PORT}` embutido no bundle. Se mudar `PUBLIC_HOST` ou `BACKEND_HOST_PORT`, precisa rebuildar o frontend:

```bash
docker compose up -d --build frontend
```

**Security Group / firewall** — libere as portas `3030` (frontend) e `3001` (backend). As portas do Postgres/RabbitMQ ficam acessíveis no host do servidor, mas recomenda-se bloqueá-las externamente.

## Contas de teste

Acesse `/register` para criar uma conta `ATTENDANT` e outra `DOCTOR`.

## Endpoints

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/auth/login` | Público |
| `POST` | `/users` | Público |
| `POST` | `/exams/upload` | `ATTENDANT` |
| `POST` | `/exams/:id/report` | `DOCTOR` |
| `GET` | `/exams` | `ATTENDANT` (todos) / `DOCTOR` (só `DONE`) |

## Estrutura do repositório

```
.
├── backend/              # API NestJS
├── frontend/             # UI Next.js
├── docker-compose.yml    # Postgres + RabbitMQ + backend + frontend
├── .env.example          # config para rodar local
├── .env.production.example
└── README.md
```

## Bônus implementados

- **LoggingInterceptor global** — `backend/src/common/interceptors/logging.interceptor.ts` loga método, URL, status, duração e `userId` em cada request.
- **Dead Letter Queue** — `exam_processing_queue` tem `deadLetterExchange` apontando para `exam_processing_dlx`, que bind-a a DLQ `exam_processing_dlq`. Mensagens que falham são `nack`adas sem requeue e roteadas para a DLQ. Ver `backend/src/messaging/rabbitmq.service.ts`.
