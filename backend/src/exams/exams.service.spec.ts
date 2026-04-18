import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamStatus, Role } from '@prisma/client';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { EXAM_PROCESSING_QUEUE } from '../messaging/rabbitmq.constants';

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: {
    medicalExam: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let rabbit: { publish: jest.Mock };

  beforeEach(async () => {
    prisma = {
      medicalExam: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    rabbit = { publish: jest.fn().mockReturnValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RabbitMQService, useValue: rabbit },
      ],
    }).compile();

    service = module.get(ExamsService);
  });

  describe('create', () => {
    it('saves exam as PENDING and publishes to the queue', async () => {
      const created = {
        id: 'exam-1',
        patientName: 'Jane',
        examType: 'X-Ray',
        status: ExamStatus.PENDING,
      };
      prisma.medicalExam.create.mockResolvedValue(created);

      const result = await service.create(
        { patientName: 'Jane', examType: 'X-Ray' },
        'user-1',
      );

      expect(prisma.medicalExam.create).toHaveBeenCalledWith({
        data: {
          patientName: 'Jane',
          examType: 'X-Ray',
          status: ExamStatus.PENDING,
          createdById: 'user-1',
        },
      });
      expect(rabbit.publish).toHaveBeenCalledWith(EXAM_PROCESSING_QUEUE, {
        examId: 'exam-1',
      });
      expect(result).toBe(created);
    });

    it('does not throw if publishing to the queue fails', async () => {
      prisma.medicalExam.create.mockResolvedValue({ id: 'exam-2' });
      rabbit.publish.mockImplementation(() => {
        throw new Error('broker down');
      });

      await expect(
        service.create({ patientName: 'J', examType: 'CT' }, 'u'),
      ).resolves.toBeDefined();
    });
  });

  describe('listForUser', () => {
    it('returns only DONE exams for a DOCTOR', async () => {
      prisma.medicalExam.findMany.mockResolvedValue([]);
      await service.listForUser({ id: 'd', role: Role.DOCTOR });

      expect(prisma.medicalExam.findMany).toHaveBeenCalledWith({
        where: { status: ExamStatus.DONE },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns all exams for an ATTENDANT', async () => {
      prisma.medicalExam.findMany.mockResolvedValue([]);
      await service.listForUser({ id: 'a', role: Role.ATTENDANT });

      expect(prisma.medicalExam.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createReport', () => {
    it('throws NotFoundException when the exam does not exist', async () => {
      prisma.medicalExam.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport('missing', { report: 'x' }, 'doc-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when status is not DONE', async () => {
      prisma.medicalExam.findUnique.mockResolvedValue({
        id: 'exam-3',
        status: ExamStatus.PROCESSING,
      });

      await expect(
        service.createReport('exam-3', { report: 'x' }, 'doc-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.medicalExam.update).not.toHaveBeenCalled();
    });

    it('updates the exam to REPORTED when status is DONE', async () => {
      prisma.medicalExam.findUnique.mockResolvedValue({
        id: 'exam-4',
        status: ExamStatus.DONE,
      });
      prisma.medicalExam.update.mockResolvedValue({
        id: 'exam-4',
        status: ExamStatus.REPORTED,
        report: 'All clear.',
      });

      const result = await service.createReport(
        'exam-4',
        { report: 'All clear.' },
        'doc-7',
      );

      expect(prisma.medicalExam.update).toHaveBeenCalledWith({
        where: { id: 'exam-4' },
        data: {
          report: 'All clear.',
          status: ExamStatus.REPORTED,
          reportedById: 'doc-7',
        },
      });
      expect(result.status).toBe(ExamStatus.REPORTED);
    });
  });

  describe('status transitions', () => {
    it('markProcessing sets status to PROCESSING', async () => {
      prisma.medicalExam.update.mockResolvedValue({});
      await service.markProcessing('exam-5');

      expect(prisma.medicalExam.update).toHaveBeenCalledWith({
        where: { id: 'exam-5' },
        data: { status: ExamStatus.PROCESSING },
      });
    });

    it('markDone saves processingResult and DONE status', async () => {
      prisma.medicalExam.update.mockResolvedValue({});
      await service.markDone('exam-6', 'ok');

      expect(prisma.medicalExam.update).toHaveBeenCalledWith({
        where: { id: 'exam-6' },
        data: { status: ExamStatus.DONE, processingResult: 'ok' },
      });
    });

    it('markError saves processingResult and ERROR status', async () => {
      prisma.medicalExam.update.mockResolvedValue({});
      await service.markError('exam-7', 'boom');

      expect(prisma.medicalExam.update).toHaveBeenCalledWith({
        where: { id: 'exam-7' },
        data: { status: ExamStatus.ERROR, processingResult: 'boom' },
      });
    });
  });
});
