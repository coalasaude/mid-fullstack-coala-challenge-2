import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('upload')
  @Roles(Role.ATTENDANT)
  upload(
    @Body() dto: CreateExamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.examsService.create(dto, user.id);
  }

  @Get()
  @Roles(Role.ATTENDANT, Role.DOCTOR)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.examsService.listForUser(user);
  }

  @Post(':id/report')
  @Roles(Role.DOCTOR)
  report(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.examsService.createReport(id, dto, user.id);
  }
}
