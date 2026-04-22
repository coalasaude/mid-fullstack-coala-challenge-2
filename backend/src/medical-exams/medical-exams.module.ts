import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { MedicalExamsController } from './medical-exams.controller';
import { MedicalExamsService } from './medical-exams.service';

@Module({
  imports: [AuthModule],
  controllers: [MedicalExamsController],
  providers: [MedicalExamsService, RolesGuard],
})
export class MedicalExamsModule {}
