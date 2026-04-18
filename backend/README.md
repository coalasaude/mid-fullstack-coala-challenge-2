# HealthFlow — Backend (NestJS)

API do HealthFlow. Stack: NestJS 10, Prisma, PostgreSQL, RabbitMQ, JWT.

## Pré-requisitos

- Node.js 20+
- Docker + Docker Compose (para Postgres e RabbitMQ)

## Setup

```bash
# Da raiz do repositório, suba a infra:
docker compose up -d

# Dentro de backend/
npm install
cp .env.example .env
npm run prisma:migrate   # cria o banco e aplica migrations (primeira vez)
npm run prisma:generate
npm run start:dev
```

API disponível em `http://localhost:3001`.

## Variáveis de ambiente (`.env`)

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | URL do Postgres |
| `RABBITMQ_URL` | URL do RabbitMQ |
| `JWT_SECRET` | Segredo usado para assinar tokens |
| `JWT_EXPIRES_IN` | Tempo de expiração (default `1d`) |
| `PORT` | Porta HTTP (default `3001`) |
| `CORS_ORIGIN` | Origin liberado para CORS (default `http://localhost:3000`) |

## Endpoints

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/auth/login` | Público |
| `POST` | `/users` | Público |
| `POST` | `/exams/upload` | `ATTENDANT` |
| `POST` | `/exams/:id/report` | `DOCTOR` |
| `GET` | `/exams` | `ATTENDANT`, `DOCTOR` |

## Fluxo de processamento

1. `ATTENDANT` dispara `POST /exams/upload` → exame criado com `PENDING`.
2. `ExamsService` publica `{ examId }` em `exam_processing_queue`.
3. `ExamConsumer` consome a mensagem → `PROCESSING` → `setTimeout` aleatório → `DONE` ou `ERROR` (via `Math.random`).
4. `DOCTOR` vê exames `DONE` em `GET /exams` e envia `POST /exams/:id/report` → status vira `REPORTED`.

## RabbitMQ — Dead Letter Queue

O topology setup acontece no boot do `RabbitMQService`:

- **Exchange:** `exam_processing_dlx` (direct, durable)
- **DLQ:** `exam_processing_dlq` (durable, bind com routing key `dead`)
- **Fila principal:** `exam_processing_queue` configurada com `x-dead-letter-exchange` apontando para o DLX.

Quando o handler do consumer lança uma exceção inesperada, fazemos `nack(msg, false, false)` — sem requeue. O broker então roteia a mensagem para a DLQ, onde ela pode ser inspecionada pela UI do management (`http://localhost:15672`, user/pass `healthflow/healthflow`).

Por que? Mensagens que falham repetidas vezes não devem ficar em loop na fila principal. A DLQ permite diagnóstico offline sem bloquear o processamento de novos exames.

## Interceptor de logging

`LoggingInterceptor` está registrado globalmente em `main.ts`. Para cada request HTTP loga: `METHOD URL STATUS - DURATIONms - user=<id>`. Erros são logados em nível `error` com a mensagem da exceção.
