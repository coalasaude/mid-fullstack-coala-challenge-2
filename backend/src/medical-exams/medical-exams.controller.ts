import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateMedicalExamDto } from './dto/create-medical-exam.dto';
import { ReportMedicalExamDto } from './dto/report-medical-exam.dto';
import { MedicalExamsService } from './medical-exams.service';

@Controller('exams')
export class MedicalExamsController {
  constructor(private readonly medicalExamsService: MedicalExamsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() req: Request & { user: JwtPayload }) {
    return this.medicalExamsService.listByUserRole(req.user);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ATTENDANT)
  upload(
    @Body() createMedicalExamDto: CreateMedicalExamDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.medicalExamsService.upload(createMedicalExamDto, req.user.id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  report(
    @Param('id') id: string,
    @Body() reportMedicalExamDto: ReportMedicalExamDto,
  ) {
    return this.medicalExamsService.submitReport(id, reportMedicalExamDto);
  }
}
