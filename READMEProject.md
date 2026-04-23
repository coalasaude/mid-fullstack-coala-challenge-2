# HealthFlow

Projeto full stack que simula o fluxo de exames de imagem.

A ideia é simples:

1. a atendente cadastra o exame;
2. o sistema processa isso em background usando fila;
3. depois o médico acessa e faz o laudo.

## Stack que usei

- **Backend:** NestJS, Prisma, PostgreSQL, RabbitMQ, JWT, bcrypt  
- **Frontend:** Next.js (App Router), React, TypeScript, MUI, Axios  
- **Infra local:** Docker Compose (Postgres + RabbitMQ)

## Como rodar o projeto

### 1. Subir banco + RabbitMQ

```bash
docker compose up -d
```

RabbitMQ Management: `http://localhost:15672`  
Login padrão:: `healthflow` / `healthflow`

### 2) Rodar Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

### 3) Rodar Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponível em: `http://localhost:3000`

## Extras que implementei

### Logs HTTP
- Tem interceptor global registrando:
  - método
  - rota
  - status code
  - tempo de resposta em ms

### DLQ no processamento
- Configurei fila principal + dead letter queue:
  - fila principal: `exam_processing_queue`
  - DLQ: `exam_processing_dlq`
  - DLX: `exam_processing_dlx`

Se der erro inesperado no consumer, a mensagem vai pra DLQ.

## Observação importante

Se a fila exam_processing_queue já existir criada sem dead-letter configurada, o RabbitMQ pode reclamar conflito de configuração no assertQueue.

Se acontecer isso:

apaga a fila antiga no painel do RabbitMQ
sobe o backend de novo