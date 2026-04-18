import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CurrentUser,
  ERole,
  JwtAuthGuard,
  JwtValidatedUser,
  Roles,
  RolesGuard,
} from '@healthflow/shared';
import type { IMemoryUploadedFile } from '../../../../../../shared/src/lib/types/memory-uploaded-file.interface';
import { CreateReportUseCase } from '../../../application/use-cases/create-report.use-case';
import { ListExamsUseCase } from '../../../application/use-cases/list-exams.use-case';
import { UploadExamUseCase } from '../../../application/use-cases/upload-exam.use-case';
import { CreateReportCommand } from '../../../application/commands/create-report.command';
import { ListExamsCommand } from '../../../application/commands/list-exams.command';
import { UploadExamCommand } from '../../../application/commands/upload-exam.command';
import { CreateReportDto } from '../dto/create-report.dto';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly uploadExamUseCase: UploadExamUseCase,
    private readonly listExamsUseCase: ListExamsUseCase,
    private readonly createReportUseCase: CreateReportUseCase,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERole.ATTENDANT)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }),
  )
  async upload(@UploadedFile() file: IMemoryUploadedFile | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    return this.uploadExamUseCase.execute(
      new UploadExamCommand(
        file.originalname,
        file.mimetype,
        file.size,
        file.buffer,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: JwtValidatedUser) {
    return this.listExamsUseCase.execute(new ListExamsCommand(user.role));
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERole.DOCTOR)
  async createReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.createReportUseCase.execute(
      new CreateReportCommand(id, dto.report),
    );
  }
}
