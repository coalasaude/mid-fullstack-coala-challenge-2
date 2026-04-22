import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ExamProcessingConsumer } from './exam-processing.consumer';
import { RabbitMqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RabbitMqService, ExamProcessingConsumer],
  exports: [RabbitMqService],
})
export class QueueModule {}
