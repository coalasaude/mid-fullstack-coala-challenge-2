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
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  ERole,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  type LoggedUser,
} from '@healthflow/shared';
import type { IMemoryUploadedFile } from '../../../../../../shared/src/lib/types/memory-uploaded-file.interface';
import { CreateReportUseCase } from '../../../application/use-cases/create-report.use-case';
import { ListExamsUseCase } from '../../../application/use-cases/list-exams.use-case';
import { UploadExamUseCase } from '../../../application/use-cases/upload-exam.use-case';
import { CreateReportCommand } from '../../../application/commands/create-report.command';
import { ListExamsCommand } from '../../../application/commands/list-exams.command';
import { UploadExamCommand } from '../../../application/commands/upload-exam.command';
import { CreateReportDto } from '../dto/create-report.dto';
import { CreateReportResponseDto } from '../dto/create-report-response.dto';
import { ListExamItemResponseDto } from '../dto/list-exam-item-response.dto';
import { UploadExamResponseDto } from '../dto/upload-exam-response.dto';

@ApiTags('exams')
@ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Upload a new medical exam file (ATTENDANT only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Exam uploaded and queued for processing',
    type: UploadExamResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – DOCTOR role cannot upload',
  })
  async upload(
    @UploadedFile() file: IMemoryUploadedFile | undefined,
    @CurrentUser() user: LoggedUser,
  ): Promise<UploadExamResponseDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    return this.uploadExamUseCase.execute(
      new UploadExamCommand(
        file.originalname,
        file.mimetype,
        file.size,
        file.buffer,
        user,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List medical exams',
    description:
      'ATTENDANT receives all exams. DOCTOR receives only DONE exams (their work queue).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of exams',
    type: [ListExamItemResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @CurrentUser() user: LoggedUser,
  ): Promise<ListExamItemResponseDto[]> {
    return this.listExamsUseCase.execute(new ListExamsCommand(user));
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERole.DOCTOR)
  @ApiOperation({ summary: 'Submit a report for a DONE exam (DOCTOR only)' })
  @ApiParam({ name: 'id', description: 'Exam UUID' })
  @ApiResponse({
    status: 201,
    description: 'Report submitted successfully',
    type: CreateReportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Exam is not in DONE status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – ATTENDANT role cannot report',
  })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async createReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: LoggedUser,
  ): Promise<CreateReportResponseDto> {
    return this.createReportUseCase.execute(
      new CreateReportCommand(id, dto.report, user),
    );
  }
}
