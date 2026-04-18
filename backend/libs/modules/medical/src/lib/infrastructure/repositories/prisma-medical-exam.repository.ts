import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Option } from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import {
  MedicalExamMapper,
  MedicalExamRow,
} from '../mappers/medical-exam.mapper';

const examInclude = { uploadedBy: true, reportedBy: true } as const;

@Injectable()
export class PrismaMedicalExamRepository extends MedicalExamRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async persist(exam: MedicalExam): Promise<MedicalExam> {
    const data = MedicalExamMapper.toPersistenceUnchecked(exam);
    const existing = await this.prisma.medicalExam.findUnique({
      where: { id: exam.id },
    });

    if (!existing) {
      const row = await this.prisma.medicalExam.create({
        data,
        include: examInclude,
      });
      return MedicalExamMapper.toDomain(row);
    }

    const { id, ...updateData } = data;
    void id;
    const row = await this.prisma.medicalExam.update({
      where: { id: exam.id },
      data: updateData,
      include: examInclude,
    });
    return MedicalExamMapper.toDomain(row);
  }

  async findById(id: string): Promise<Option<MedicalExam>> {
    const row = await this.prisma.medicalExam.findUnique({
      where: { id },
      include: examInclude,
    });
    return row ? MedicalExamMapper.toDomain(row) : null;
  }

  async getBy(
    filters: {
      status?: EMedicalExamStatus;
    },
    orderBy: {
      createdAt: 'asc' | 'desc';
    },
  ): Promise<MedicalExam[]> {
    const rows = await this.prisma.medicalExam.findMany({
      where: filters,
      orderBy: { createdAt: orderBy.createdAt },
      include: examInclude,
    });
    return rows.map((row: MedicalExamRow) => MedicalExamMapper.toDomain(row));
  }
}
