import { ReportStatus, ReportType } from '@prisma/client';
import { ReportEntity } from './report.repositoriy.entity';
import { GetReportDto } from '../application/dtos/get-report.dto';

export interface ReportPort {
  getReport(dto: GetReportDto): Promise<ReportEntity | null>;
  createReport(
    userId: string,
    type: ReportType,
    filters: any,
    status: ReportStatus,
  ): Promise<ReportEntity>;
  updateStatus(
    reportId: string,
    status: ReportStatus,
  ): Promise<ReportEntity | null>;
}

export const REPORT_PORT = Symbol('REPORT_PORT');
