import {
  Body,
  Controller,
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
import { MedicalExamsService } from './medical-exams.service';

@Controller('exams')
export class MedicalExamsController {
  constructor(private readonly medicalExamsService: MedicalExamsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ATTENDANT)
  upload(
    @Body() createMedicalExamDto: CreateMedicalExamDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.medicalExamsService.upload(createMedicalExamDto, req.user.id);
  }
}
