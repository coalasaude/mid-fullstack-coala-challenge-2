Gabriel Ferreira | 18-04-2026

## Descrição

MVP do HealthFlow cobrindo todo o ciclo de vida do exame: atendente faz upload, um worker consome da fila e simula o processamento, e o médico laúda os exames que terminaram com sucesso.

Backend em NestJS com Prisma, Postgres, JWT e RabbitMQ. Frontend em Next.js 14 com MUI. Tudo sobe com um único `docker compose up -d --build` (Postgres, RabbitMQ, backend e frontend containerizados).

Os dois bônus estão entregues: interceptor global de logs de request e DLQ no RabbitMQ.

## Decisões Técnicas e Trade-offs

- **`amqplib` direto em vez de `@nestjs/microservices`.** Consigo declarar o exchange DLX, a DLQ e os argumentos `x-dead-letter-exchange` da fila principal no `onModuleInit` do `RabbitMQService` sem abstrações. O transport do Nest encaixa bem em RPC, mas esconde essas opções e ficaria mais verboso configurar a DLQ corretamente.

- **Regra de role do `GET /exams` dentro da service, não por query param.** A service recebe o `user` autenticado e decide o filtro (médico só vê `DONE`, atendente vê tudo). Deixa a regra fora do transport e não depende do cliente passar nada.

- **`@Roles(...)` + `RolesGuard` com `Reflector`.** Padrão canônico do Nest, combinado com `JwtAuthGuard` no mesmo `@UseGuards`. `RolesGuard` só valida; se a rota não tem metadata de roles, deixa passar.

- **DLQ simples, sem retry com delay.** Quando o handler do consumer lança, faço `nack(msg, false, false)` e a mensagem cai direto na DLQ via `deadLetterExchange`. Sem `requeue: true`, sem camada extra de retry. Evita loop infinito e mantém o fluxo transparente — retry exponencial com delay seria outra feature e não era o escopo do MVP.

- **Token no `localStorage` + AuthContext.** Na UI o token vai no `localStorage` e o axios injeta `Authorization: Bearer` via interceptor. Sei que cookie httpOnly é mais robusto contra XSS, mas exigiria configurar CORS com `credentials: true` e endpoints de refresh, o que sairia do escopo. O interceptor limpa o storage e redireciona em 401.

- **Polling de 3s em vez de WebSocket/SSE.** O enunciado pede polling explicitamente. Implementei em um hook `useExamsPolling` e reaproveito nas duas dashboards.

- **Validação com `class-validator` + `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted` + `transform`).** DTOs separados para cada caso de uso. `HttpExceptionFilter` global padroniza a resposta de erro.

- **Deploy inteiro via Docker Compose parametrizado.** Um único `.env` na raiz controla host, portas e secrets. Backend e frontend têm Dockerfile multi-stage. Frontend recebe `NEXT_PUBLIC_API_URL` como build arg pra que o bundle aponte pro host correto em produção.

## URL de Deploy

http://3.138.37.212

(EC2 na AWS, subiu com `docker compose up -d --build` a partir do `.env.production.example`.)

## Como executar o projeto localmente

**Tudo em Docker (recomendado):**

```
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:3030
- Backend: http://localhost:3001
- RabbitMQ UI: http://localhost:15672 (`healthflow` / `healthflow`)

**Dev sem Docker para os apps:**

```
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

Crie uma conta ATTENDANT e outra DOCTOR em `/register` e use cada uma para entrar no fluxo.

## Comentários Adicionais ou implementação dos requisitos bonus

**LoggingInterceptor** (`backend/src/common/interceptors/logging.interceptor.ts`) está registrado globalmente em `main.ts`. Loga método, URL, status, duração e id do usuário autenticado. Ignora contextos não-HTTP para não poluir o log do consumer.

**DLQ** em `backend/src/messaging/rabbitmq.service.ts`:
- exchange direct `exam_processing_dlx` durável
- fila `exam_processing_dlq` bindada pela routing key `dead`
- fila `exam_processing_queue` com `deadLetterExchange` apontando para o DLX

Quando o consumer falha, a mensagem é `nack`ada sem requeue e o broker entrega direto na DLQ. Fiz assim porque, na prática, uma mensagem com payload inválido ou `examId` que não existe não vai ter sucesso em retry imediato — ela precisa ser inspecionada. A DLQ fica acessível na UI do management para esse debug.

Testes unitários cobrem a lógica de negócio das services e o `RolesGuard`: `npm test` no backend.

Checklist

- [x] O código segue as diretrizes e padrões de estilo do projeto.
- [x] Eu revisei o código e verifiquei a presença de bugs ou problemas.
- [x] Eu verifiquei que todas as funcionalidades estão funcionando como esperado.
- [x] Eu realizei o deploy da aplicação para um ambiente de produção.
