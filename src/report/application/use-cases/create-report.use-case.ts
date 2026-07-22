import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/report/domain/report.repositoriy.entity';
import {
  type ReportPort,
  REPORT_PORT,
} from 'src/report/domain/report.repository';
import { ReportType } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_PORT) private readonly reportRepository: ReportPort,
    @InjectQueue('report-queue') private readonly reportQueue: Queue,
  ) {}

  async execute(
    userId: string,
    type: ReportType,
    filters: any,
  ): Promise<ReportEntity> {
    const report = await this.reportRepository.createReport(
      userId,
      type,
      filters,
    );

    await this.reportQueue.add('generate-report', {
      type: type,
      filters: filters,
      reportId: report.id,
    });

    if (!report) {
      throw new BadRequestException('Failed to create report.');
    }

    return report;
  }
}
