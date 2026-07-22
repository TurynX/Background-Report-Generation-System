import { Module } from '@nestjs/common';
import { ReportController } from './infrastructure/controller/report/report.controller';
import { ReportRepository } from './infrastructure/prisma/report.repository';
import { REPORT_PORT } from './domain/report.repository';
import { UpdateStatusUseCase } from './application/use-cases/update-status.use-case';
import { AuthModule } from 'src/auth/auth.module';
import { GetReportByIdUseCase } from './application/use-cases/get-report-by-id.use-case';
import { BullModule } from '@nestjs/bullmq';
import { ReportWorker } from './application/worker/report.worker';
import { S3StorageService } from './infrastructure/storage/services/s3-storage.service';
import { ReportLifeCycleWorker } from './application/worker/report-life-cycle.worker';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'report-queue',
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  controllers: [ReportController],
  providers: [
    { provide: REPORT_PORT, useClass: ReportRepository },
    GetReportByIdUseCase,
    CreateReportUseCase,
    UpdateStatusUseCase,
    S3StorageService,
    ReportWorker,
    ReportLifeCycleWorker,
  ],
})
export class ReportModule {}
