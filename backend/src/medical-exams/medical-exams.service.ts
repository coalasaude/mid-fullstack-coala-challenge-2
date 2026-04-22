import { Injectable } from '@nestjs/common';
import { MedicalExamStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalExamDto } from './dto/create-medical-exam.dto';
import { RabbitMqService } from '../queue/rabbitmq.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';

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

  async listByUserRole(user: JwtPayload) {
    if (user.role === UserRole.ATTENDANT) {
      return this.prisma.medicalExam.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.medicalExam.findMany({
      where: { status: MedicalExamStatus.DONE },
      orderBy: { createdAt: 'desc' },
    });
  }
}