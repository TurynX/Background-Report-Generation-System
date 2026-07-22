import { ReportStatus, ReportType } from '@prisma/client';
import { ReportEntity } from './report.repositoriy.entity';

export interface ReportPort {
  createReport(
    userId: string,
    type: ReportType,
    filters: any,
  ): Promise<ReportEntity>;

  getReportById(reportId: string): Promise<ReportEntity | null>;

  updateStatus(
    reportId: string,
    status: ReportStatus,
  ): Promise<ReportEntity | null>;
}

export const REPORT_PORT = Symbol('REPORT_PORT');
