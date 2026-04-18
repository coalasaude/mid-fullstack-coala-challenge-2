import { Injectable } from '@nestjs/common';
import { PrismaService } from '@healthflow/infra';
import { Option } from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { MedicalExamMapper } from '../mappers/medical-exam.mapper';

@Injectable()
export class PrismaMedicalExamRepository extends MedicalExamRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async persist(exam: MedicalExam): Promise<MedicalExam> {
    const data = MedicalExamMapper.toPersistence(exam);
    const existing = await this.prisma.medicalExam.findUnique({
      where: { id: exam.id },
    });

    if (!existing) {
      const row = await this.prisma.medicalExam.create({ data });
      return MedicalExamMapper.toDomain(row);
    }

    const row = await this.prisma.medicalExam.update({
      where: { id: exam.id },
      data,
    });
    return MedicalExamMapper.toDomain(row);
  }

  async findById(id: string): Promise<Option<MedicalExam>> {
    const row = await this.prisma.medicalExam.findUnique({ where: { id } });
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
    });
    return rows.map((row) => MedicalExamMapper.toDomain(row));
  }
}
