import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { ExamConsumer } from './exam.consumer';

@Module({
  controllers: [ExamsController],
  providers: [ExamsService, ExamConsumer],
  exports: [ExamsService],
})
export class ExamsModule {}
