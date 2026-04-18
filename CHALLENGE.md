### **Desafio Técnico: Dev Full Stack Pleno (Coala Saúde)**

**Introdução**

Olá! Bem-vindo(a) ao nosso desafio técnico. Este projeto foi desenhado para simular um problema real e nos dará uma ótima visão sobre suas habilidades técnicas, sua forma de resolver problemas e suas decisões de arquitetura.

O desafio consiste em construir o MVP (Produto Mínimo Viável) de um sistema que chamaremos de **"HealthFlow"**, uma plataforma para orquestrar o processamento e laudo de exames de imagem médica.

*   **Prazo:** O desafio começa no dia **16 de abril** e a entrega final deve ser feita até o final do dia **23 de abril**.
*   **Entrega:** Ao finalizar, abra um Pull Request no repositório. No corpo do PR, você encontrará um template com seções a serem preenchidas sobre suas decisões de arquitetura e instruções de como rodar o projeto.

**Contexto do Problema**

Em nossa clínica, exames de imagem passam por um fluxo: são cadastrados por um atendente, processados por um sistema automatizado e, finalmente, laudados por um médico. O HealthFlow irá gerenciar este ciclo de vida completo.

---

### **Definição de Papéis (Roles) e Fluxos**

O sistema terá dois tipos de usuários:

1.  **ATTENDANT (Atendente):**
    *   **Responsabilidade:** Fazer a interface entre o mundo físico/digital e a plataforma, cadastrando novos exames.
    *   **Fluxo:** Acessa uma dashboard que exibe **todos os exames** do sistema para que possa acompanhar o progresso de tudo que foi cadastrado. Sua principal ação é o **upload de novos exames**.

2.  **DOCTOR (Médico):**
    *   **Responsabilidade:** Analisar os exames que foram processados com sucesso e emitir um laudo técnico.
    *   **Fluxo:** Acessa uma dashboard focada em sua "fila de trabalho", que exibe apenas exames com status `DONE`. Ele seleciona um exame, **escreve um laudo** e, ao submetê-lo, o status do exame muda para `REPORTED`, finalizando o processo.

---

### **Requisitos do Backend (NestJS)**

#### **Milestone 1: Estrutura, Autenticação e Modelagem**

1.  **Modelagem de Dados (Prisma):**
    *  Crie a tabela de `User`;
    *  Crie a tabela `MedicalExam`.

2.  **Módulo de Usuários e Autenticação:**
    *   **Criação de Usuários:** Endpoint público para criar contas de `ATTENDANT` ou `DOCTOR`.
    *   **Login:** Endpoint de login que retorna um token JWT com `id`, `email` e `role`.

3.  **Authentication e Authorization Guards (NestJS):**
    *   Você deve implementar e utilizar guards para proteger os endpoints.
    *   **`JwtAuthGuard`:** Valida o token JWT em rotas protegidas.
    *   **`RolesGuard`:** Verifica o `role` do usuário para garantir a permissão de acesso.

#### **Milestone 2: O Fluxo de Upload e Processamento (Attendant e Sistema)**

1.  **Upload e Enfileiramento (MedicalExam):**
    *   A lógica na service para criar um exame deve salvá-lo com status `PENDING` e, em seguida, publicar uma mensagem na fila do RabbitMQ `exam_processing_queue` com o `examId`.

2.  **Consumidor e Processamento Simulado:**
    *   O `ExamConsumer` escuta a fila. Ao receber uma mensagem:
    *   a. Muda o status para `PROCESSING`.
    *   b. Simula um processamento com `setTimeout` de duração **aleatória**.
    *   c. Usa `Math.random()` para simular o resultado:
        *   **Sucesso:** Muda o status para `DONE` e salva um texto em `processingResult`.
        *   **Falha:** Muda o status para `ERROR` e salva uma mensagem de erro em `processingResult`.

#### **Milestone 3: O Fluxo de Laudo do Médico (Doctor)**

Esta etapa foca na principal interação do médico com o sistema: a submissão de laudos.

1.  **Lógica de Submissão de Laudo:**
    *   Na service, crie um método para adicionar um laudo a um exame (ex: `createReport`).
    *   Este método deve conter a seguinte lógica de negócio:
        *   a. Encontrar o exame pelo `id`.
        *   b. **Validar o Status:** Verificar se o status atual do exame é `DONE`. Um laudo só pode ser adicionado a um exame processado com sucesso. Se o status for diferente, deve retornar um erro apropriado (ex: `BadRequestException`).
        *   c. **Atualizar o Exame:** Se a validação passar, o método deve:
            *   Salvar o texto do laudo no campo `report`.
            *   Mudar o status do exame de `DONE` para `REPORTED`.
        *   d. Salvar as alterações no banco de dados.

2.  **Validação de Dados:**
    *   Crie um DTO (Data Transfer Object), como `CreateReportDto`, para validar o corpo da requisição, garantindo que o campo do laudo (`report`) não esteja vazio.

---

### **Endpoints da API e Permissões**

| Verbo | Rota                    | Responsabilidade                                   | Acesso                                 |
| :---- | :---------------------- | :------------------------------------------------- | :------------------------------------- |
| `POST`  | `/auth/login`           | Autenticar qualquer usuário.                       | Público                                |
| `POST`  | `/users`                | Registrar novos usuários.                          | Público (para fins de teste)           |
| `POST`  | `/exams/upload`         | Criar um novo exame.                               | `ATTENDANT` (protegido por `JwtAuthGuard` e `RolesGuard`) |
| `POST`  | `/exams/:id/report`     | Submeter o laudo de um exame.                      | `DOCTOR` (protegido por `JwtAuthGuard` e `RolesGuard`)  |
| `GET`   | `/exams`                | Listar exames com base no `role` do usuário.       | `ATTENDANT`, `DOCTOR` (protegido por `JwtAuthGuard`) |

**Regra para `GET /exams`:** A lógica dentro do serviço deve verificar o `role` do usuário autenticado:
*   Se for `ATTENDANT`, retorna **todos** os exames.
*   Se for `DOCTOR`, retorna apenas exames com status `DONE`.

---

### **Requisitos da Interface (Frontend - Next.js)**

1.  **Página de Login:**
    *   Formulário de login que armazena o token e redireciona para a dashboard correta.

2.  **Tela do ATTENDANT:**
    *   Dashboard com um botão para **upload de novos exames**.
    *   Uma visualização de **todos os exames** e seus status, com atualização automática (polling).

3.  **Tela do DOCTOR:**
    *   Dashboard que exibe uma lista de exames com status `DONE` (sua fila de trabalho).
    *   Ao interagir com um exame, deve ser possível **adicionar o laudo** através de um campo de texto e um botão de submissão, que consumirá o endpoint `POST /exams/:id/report`.
    *   Após submeter o laudo com sucesso, o exame deve desaparecer da lista principal.

---

### **Bônus (Diferenciais)**

*   **Observabilidade:** Adicione um interceptor no NestJS para logar os detalhes de todas as requisições recebidas.
*   **Tratamento de Dead Letter Queue (DLQ):** Configure uma DLQ no RabbitMQ para capturar mensagens que falharam no processamento por erros inesperados. Explique no seu PR como e por que você fez isso.

### **Critérios de Avaliação**

*   **Arquitetura e Boas Práticas:** Qualidade da estrutura no backend (módulos, services, SOLID) e no frontend.
*   **Lógica de Negócio e Fluxo de Dados:** Correta implementação dos fluxos assíncronos e das regras de permissão e validação de status.
*   **Qualidade do Código:** Código limpo, legível e consistente.
*   **Proficiência com o Stack:** Uso eficaz de NestJS, Guards, RabbitMQ, Next.js, Prisma, React, MUI.
*   **Comunicação:** Clareza nas explicações fornecidas no template do Pull Request.

Após a entrega, o seu projeto será avaliado pela nossa equipe e, posteriormente, entraremos em contato para agendar uma nova reunião junto à nossa equipe caso você siga em nosso processo seletivo.
Boa sorte!
