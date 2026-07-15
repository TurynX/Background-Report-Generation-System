import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ReportPort, REPORT_PORT } from '../../domain/report.repository';
import { ReportEntity } from 'src/report/domain/report.repositoriy.entity';
import { UpdateStatusDto } from '../dtos/update-status.dto';

@Injectable()
export class UpdateStatusUseCase {
  constructor(
    @Inject(REPORT_PORT) private readonly reportRepository: ReportPort,
  ) {}

  async execute(dto: UpdateStatusDto): Promise<ReportEntity> {
    const { reportId, status } = dto;
    const report = await this.reportRepository.updateStatus(reportId, status);
    if (!report) {
      throw new NotFoundException(`Report with id ${reportId} not found`);
    }

    return report;
  }
}
