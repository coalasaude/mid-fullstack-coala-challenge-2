export type AppLocale = 'pt-BR' | 'en-US';

export const DEFAULT_LOCALE: AppLocale = 'pt-BR';

export const enUS = {
  app: {
    brand: 'HealthFlow',
  },
  common: {
    signOut: 'Sign out',
    refreshNow: 'Refresh now',
    cancel: 'Cancel',
  },
  role: {
    attendant: 'Attendant',
    doctor: 'Doctor',
  },
  auth: {
    email: 'Email',
    password: 'Password',
    login: {
      title: 'HealthFlow',
      subtitle: 'Sign in to access the exam orchestration platform.',
      signIn: 'Sign in',
      signingIn: 'Signing in…',
      noAccount: "Don't have an account?",
      createAccount: 'Create one',
      errorUnexpected: 'Unexpected error during login',
    },
    register: {
      title: 'Create your account',
      subtitle: 'Register as an attendant or doctor.',
      submit: 'Create account',
      submitting: 'Creating…',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in',
      role: 'Role',
      errorUnexpected: 'Unexpected error creating the account',
    },
  },
  password: {
    helper:
      'Min. 8 characters with uppercase, lowercase, number and special character (@$!%*?&).',
  },
  attendant: {
    shellTitle: 'Attendant',
    heading: 'All exams',
    subheading:
      'Upload new exams and follow the processing pipeline in real time.',
    empty: 'No exams yet. Upload the first one to get started.',
    colFile: 'File',
    colStatus: 'Status',
    colUploadedBy: 'Uploaded by',
    colReportedBy: 'Reported by',
    colCreated: 'Created',
  },
  doctor: {
    shellTitle: 'Doctor',
    heading: 'Work queue',
    subheading:
      'Exams ready to be reviewed and reported. The queue refreshes automatically.',
    emptyQueue: 'No exams waiting for a report right now.',
    colFile: 'File',
    colStatus: 'Status',
    colUploadedBy: 'Uploaded by',
    colReceived: 'Received',
    colAction: 'Action',
    addReport: 'Add report',
    toastReportSubmitted: 'Report submitted successfully.',
  },
  upload: {
    button: 'Upload exam',
    uploading: 'Uploading…',
    success: '"{{file}}" uploaded and queued for processing.',
    error: 'Failed to upload the exam',
  },
  report: {
    dialogTitle: 'Submit report',
    file: 'File',
    fieldLabel: 'Report',
    placeholder: 'Describe findings and conclusions…',
    fileMeta: '{{mime}} · {{size}} · Uploaded {{date}}',
    cancel: 'Cancel',
    submit: 'Submit report',
    submitting: 'Submitting…',
    errorEmpty: 'Report cannot be empty.',
    errorSubmit: 'Failed to submit the report',
  },
  examStatus: {
    pending: 'Pending',
    processing: 'Processing',
    done: 'Ready for report',
    error: 'Error',
    reported: 'Reported',
  },
  errors: {
    loadExams: 'Failed to load exams',
  },
  settings: {
    language: 'Language',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    toggleTheme: 'Toggle light / dark theme',
    localePt: 'Português (BR)',
    localeEn: 'English (US)',
  },
};

type Widened<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? Widened<T[K]> : string;
};

export type MessageTree = Widened<typeof enUS>;

export const ptBR: MessageTree = {
  app: {
    brand: 'HealthFlow',
  },
  common: {
    signOut: 'Sair',
    refreshNow: 'Atualizar agora',
    cancel: 'Cancelar',
  },
  role: {
    attendant: 'Atendente',
    doctor: 'Médico',
  },
  auth: {
    email: 'E-mail',
    password: 'Senha',
    login: {
      title: 'HealthFlow',
      subtitle: 'Entre para acessar a plataforma de orquestração de exames.',
      signIn: 'Entrar',
      signingIn: 'Entrando…',
      noAccount: 'Não tem uma conta?',
      createAccount: 'Criar conta',
      errorUnexpected: 'Erro inesperado ao entrar',
    },
    register: {
      title: 'Crie sua conta',
      subtitle: 'Cadastre-se como atendente ou médico.',
      submit: 'Criar conta',
      submitting: 'Criando…',
      hasAccount: 'Já tem uma conta?',
      signIn: 'Entrar',
      role: 'Função',
      errorUnexpected: 'Erro inesperado ao criar a conta',
    },
  },
  password: {
    helper:
      'Mín. 8 caracteres com maiúscula, minúscula, número e caractere especial (@$!%*?&).',
  },
  attendant: {
    shellTitle: 'Atendente',
    heading: 'Todos os exames',
    subheading:
      'Envie novos exames e acompanhe o processamento em tempo quase real.',
    empty: 'Nenhum exame ainda. Envie o primeiro para começar.',
    colFile: 'Arquivo',
    colStatus: 'Status',
    colUploadedBy: 'Enviado por',
    colReportedBy: 'Laudado por',
    colCreated: 'Criado',
  },
  doctor: {
    shellTitle: 'Médico',
    heading: 'Fila de trabalho',
    subheading:
      'Exames prontos para revisão e laudo. A fila é atualizada automaticamente.',
    emptyQueue: 'Nenhum exame aguardando laudo no momento.',
    colFile: 'Arquivo',
    colStatus: 'Status',
    colUploadedBy: 'Enviado por',
    colReceived: 'Recebido',
    colAction: 'Ação',
    addReport: 'Adicionar laudo',
    toastReportSubmitted: 'Laudo enviado com sucesso.',
  },
  upload: {
    button: 'Enviar exame',
    uploading: 'Enviando…',
    success: '"{{file}}" enviado e colocado na fila de processamento.',
    error: 'Falha ao enviar o exame',
  },
  report: {
    dialogTitle: 'Enviar laudo',
    file: 'Arquivo',
    fieldLabel: 'Laudo',
    placeholder: 'Descreva achados e conclusões…',
    fileMeta: '{{mime}} · {{size}} · Enviado em {{date}}',
    cancel: 'Cancelar',
    submit: 'Enviar laudo',
    submitting: 'Enviando…',
    errorEmpty: 'O laudo não pode ficar vazio.',
    errorSubmit: 'Falha ao enviar o laudo',
  },
  examStatus: {
    pending: 'Pendente',
    processing: 'Processando',
    done: 'Pronto para laudo',
    error: 'Erro',
    reported: 'Laudado',
  },
  errors: {
    loadExams: 'Falha ao carregar exames',
  },
  settings: {
    language: 'Idioma',
    themeLight: 'Modo claro',
    themeDark: 'Modo escuro',
    toggleTheme: 'Alternar modo claro / escuro',
    localePt: 'Português (BR)',
    localeEn: 'English (US)',
  },
};

export const messagesByLocale: Record<AppLocale, MessageTree> = {
  'en-US': enUS,
  'pt-BR': ptBR,
};
