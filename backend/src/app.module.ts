import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MedicalExamsModule } from './medical-exams/medical-exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    QueueModule,
    UsersModule,
    AuthModule,
    MedicalExamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
