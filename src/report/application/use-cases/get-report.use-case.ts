import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  REPORT_PORT,
  type ReportPort,
} from 'src/report/domain/report.repository';
import { GetReportDto } from '../dtos/get-report.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class GetReportUseCase {
  constructor(
    @Inject(REPORT_PORT)
    private readonly reportRepository: ReportPort,
    @InjectQueue('report-queue') private readonly reportQueue: Queue,
  ) {}

  async execute(userId: string, dto: GetReportDto) {
    const report = await this.reportRepository.getReport(dto);

    if (!report) {
      const createReport = await this.reportRepository.createReport(
        userId,
        dto.type,
        dto.filters,
        'PENDING',
      );

      await this.reportQueue.add('generate-report', {
        type: dto.type,
        filters: dto.filters,
        reportId: createReport.id,
      });

      return createReport;
    }

    return report;
  }
}
