import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { EXAM_PROCESSING_QUEUE } from '../messaging/rabbitmq.constants';
import { ExamQueueMessage, ExamsService } from './exams.service';

const SUCCESS_MESSAGES = [
  'Imagem processada sem alterações relevantes detectadas.',
  'Processamento concluído. Contraste dentro dos parâmetros esperados.',
  'Análise automática finalizada sem indicadores de atenção.',
];

const ERROR_MESSAGES = [
  'Falha no processamento: qualidade da imagem insuficiente.',
  'Não foi possível processar o exame: metadados DICOM inválidos.',
  'Erro no pipeline de análise automatizada.',
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

@Injectable()
export class ExamConsumer implements OnModuleInit {
  private readonly logger = new Logger(ExamConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly examsService: ExamsService,
  ) {}

  async onModuleInit() {
    await this.rabbit.consume(EXAM_PROCESSING_QUEUE, async (msg) => {
      const raw = msg.content.toString();
      let payload: ExamQueueMessage;
      try {
        payload = JSON.parse(raw);
      } catch {
        this.logger.error(`invalid payload: ${raw}`);
        throw new Error('invalid payload');
      }

      const { examId } = payload;
      if (!examId) throw new Error('missing examId');

      const exam = await this.examsService.findById(examId);
      if (!exam) {
        this.logger.warn(`exam ${examId} not found, skipping`);
        return;
      }

      await this.examsService.markProcessing(examId);

      const durationMs = 2000 + Math.floor(Math.random() * 4000);
      await new Promise((resolve) => setTimeout(resolve, durationMs));

      if (Math.random() > 0.25) {
        await this.examsService.markDone(examId, pick(SUCCESS_MESSAGES));
        this.logger.log(`exam ${examId} done in ${durationMs}ms`);
      } else {
        await this.examsService.markError(examId, pick(ERROR_MESSAGES));
        this.logger.warn(`exam ${examId} failed in ${durationMs}ms`);
      }
    });

    this.logger.log(`consuming ${EXAM_PROCESSING_QUEUE}`);
  }
}
