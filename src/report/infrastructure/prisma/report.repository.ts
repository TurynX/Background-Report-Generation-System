import { Injectable } from '@nestjs/common';

import { ReportPort } from 'src/report/domain/report.repository';
import { PrismaService } from 'src/lib/prisma.service';
import { ReportStatus, ReportType } from '@prisma/client';

@Injectable()
export class ReportRepository implements ReportPort {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    userId: string,
    type: ReportType,
    filters: any,
  ): Promise<any> {
    const report = await this.prisma.report.create({
      data: {
        userId,
        type,
        filters,
      },
    });
    return report;
  }

  async getReportById(reportId: string): Promise<any | null> {
    const report = await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return null;
    }

    return report;
  }

  async updateStatus(reportId: string, status: ReportStatus): Promise<any> {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
    return report;
  }
}
