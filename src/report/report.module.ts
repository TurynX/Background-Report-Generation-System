import { Module } from '@nestjs/common';
import { ReportController } from './infrastructure/controller/report/report.controller';
import { ReportRepository } from './infrastructure/prisma/report.repository';
import { REPORT_PORT } from './domain/report.repository';
import { UpdateStatusUseCase } from './application/use-cases/update-status.use-case';
import { AuthModule } from 'src/auth/auth.module';
import { GetReportUseCase } from './application/use-cases/get-report.use-case';
import { BullModule } from '@nestjs/bullmq';
import { ReportWorker } from './application/worker/report.worker';
import { S3StorageService } from './infrastructure/storage/services/s3-storage.service';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'report-queue',
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  controllers: [ReportController],
  providers: [
    { provide: REPORT_PORT, useClass: ReportRepository },
    GetReportUseCase,
    UpdateStatusUseCase,
    S3StorageService,
    ReportWorker,
  ],
})
export class ReportModule {}
