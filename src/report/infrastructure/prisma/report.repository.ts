import { Injectable } from '@nestjs/common';

import { ReportPort } from 'src/report/domain/report.repository';
import { PrismaService } from 'src/lib/prisma.service';
import { ReportStatus, ReportType } from '@prisma/client';
import { ReportEntity } from 'src/report/domain/report.repositoriy.entity';

@Injectable()
export class ReportRepository implements ReportPort {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    userId: string,
    type: ReportType,
    filters: any,
  ): Promise<ReportEntity> {
    const report = await this.prisma.report.create({
      data: {
        userId,
        type,
        filters,
      },
    });
    return new ReportEntity(
      report.id,
      report.userId,
      report.type,
      report.status,
      report.filters,
      report.fileUrl,
      report.fileKey,
      report.errorMessage,
      report.createdAt,
      report.updatedAt,
    );
  }

  async getReportById(reportId: string): Promise<ReportEntity | null> {
    const report = await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return null;
    }

    return new ReportEntity(
      report.id,
      report.userId,
      report.type,
      report.status,
      report.filters,
      report.fileUrl,
      report.fileKey,
      report.errorMessage,
      report.createdAt,
      report.updatedAt,
    );
  }

  async updateStatus(
    reportId: string,
    status: ReportStatus,
  ): Promise<ReportEntity> {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
    return new ReportEntity(
      report.id,
      report.userId,
      report.type,
      report.status,
      report.filters,
      report.fileUrl,
      report.fileKey,
      report.errorMessage,
      report.createdAt,
      report.updatedAt,
    );
  }
}
