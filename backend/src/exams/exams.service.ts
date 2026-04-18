import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ExamStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { EXAM_PROCESSING_QUEUE } from '../messaging/rabbitmq.constants';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateReportDto } from './dto/create-report.dto';

export interface ExamQueueMessage {
  examId: string;
}

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitMQService,
  ) {}

  async create(dto: CreateExamDto, userId: string) {
    const exam = await this.prisma.medicalExam.create({
      data: {
        patientName: dto.patientName,
        examType: dto.examType,
        status: ExamStatus.PENDING,
        createdById: userId,
      },
    });

    try {
      this.rabbit.publish(EXAM_PROCESSING_QUEUE, { examId: exam.id });
    } catch (err) {
      this.logger.error(`enqueue failed for ${exam.id}: ${(err as Error).message}`);
    }

    return exam;
  }

  async listForUser(user: { id: string; role: Role }) {
    if (user.role === Role.DOCTOR) {
      return this.prisma.medicalExam.findMany({
        where: { status: ExamStatus.DONE },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.medicalExam.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReport(examId: string, dto: CreateReportDto, doctorId: string) {
    const exam = await this.prisma.medicalExam.findUnique({
      where: { id: examId },
    });
    if (!exam) throw new NotFoundException('Exame não encontrado');

    if (exam.status !== ExamStatus.DONE) {
      throw new BadRequestException(
        `Exame está em status ${exam.status} e não pode receber laudo`,
      );
    }

    return this.prisma.medicalExam.update({
      where: { id: examId },
      data: {
        report: dto.report,
        status: ExamStatus.REPORTED,
        reportedById: doctorId,
      },
    });
  }

  async markProcessing(examId: string) {
    return this.prisma.medicalExam.update({
      where: { id: examId },
      data: { status: ExamStatus.PROCESSING },
    });
  }

  async markDone(examId: string, processingResult: string) {
    return this.prisma.medicalExam.update({
      where: { id: examId },
      data: { status: ExamStatus.DONE, processingResult },
    });
  }

  async markError(examId: string, processingResult: string) {
    return this.prisma.medicalExam.update({
      where: { id: examId },
      data: { status: ExamStatus.ERROR, processingResult },
    });
  }

  findById(id: string) {
    return this.prisma.medicalExam.findUnique({ where: { id } });
  }
}
