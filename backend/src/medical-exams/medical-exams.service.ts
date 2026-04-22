import { Injectable } from '@nestjs/common';
import { MedicalExamStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalExamDto } from './dto/create-medical-exam.dto';

@Injectable()
export class MedicalExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(createMedicalExamDto: CreateMedicalExamDto, attendantId: string) {
    return this.prisma.medicalExam.create({
      data: {
        fileReference: createMedicalExamDto.fileReference,
        status: MedicalExamStatus.PENDING,
        attendantId,
      },
    });
  }
}
