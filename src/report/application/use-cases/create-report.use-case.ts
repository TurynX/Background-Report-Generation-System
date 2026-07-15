import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/report/domain/report.repositoriy.entity';
import {
  type ReportPort,
  REPORT_PORT,
} from 'src/report/domain/report.repository';
import { ReportStatus, ReportType } from '@prisma/client';

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_PORT) private readonly reportRepository: ReportPort,
  ) {}

  async execute(
    userId: string,
    type: ReportType,
    filters: any,
    status: ReportStatus,
  ): Promise<ReportEntity> {
    const report = await this.reportRepository.createReport(
      userId,
      type,
      filters,
      status,
    );
    if (!report) {
      throw new BadRequestException('Failed to create report.');
    }

    return report;
  }
}
