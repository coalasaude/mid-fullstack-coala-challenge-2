import { Injectable } from '@nestjs/common';
import { MedicalExamStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalExamDto } from './dto/create-medical-exam.dto';
import { RabbitMqService } from '../queue/rabbitmq.service';

@Injectable()
export class MedicalExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async upload(createMedicalExamDto: CreateMedicalExamDto, attendantId: string) {
    const exam = await this.prisma.medicalExam.create({
      data: {
        fileReference: createMedicalExamDto.fileReference,
        status: MedicalExamStatus.PENDING,
        attendantId,
      },
    });

    await this.rabbitMqService.publishExamProcessing(exam.id);

    return exam;
  }
}
