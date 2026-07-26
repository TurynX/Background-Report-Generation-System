import {
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  REPORT_PORT,
  type ReportPort,
} from 'src/report/domain/report.repository';
import { GetReportDto } from '../dtos/get-report.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReportLifeCycleWorker } from '../worker/report-life-cycle.worker';
import { S3StorageService } from 'src/report/infrastructure/storage/services/s3-storage.service';

@Injectable()
export class GetReportByIdUseCase {
  constructor(
    @Inject(REPORT_PORT)
    private readonly reportRepository: ReportPort,
    private readonly s3Service: S3StorageService,
  ) {}

  async execute(reportId: string) {
    const report = await this.reportRepository.getReportById(reportId);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status === 'EXPIRED') {
      throw new GoneException('Report expired');
    }

    if (!report.fileKey) {
      throw new NotFoundException('Not provide fileKey');
    }

    const presignedUrl = await this.s3Service.generatePresignedUrl(
      report.fileKey,
    );

    const { fileUrl, ...reportWithoutFileUrl } = report;

    return {
      ...reportWithoutFileUrl,
      url: presignedUrl,
    };
  }
}
