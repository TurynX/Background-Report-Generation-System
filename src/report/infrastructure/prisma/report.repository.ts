import { Injectable } from '@nestjs/common';

import { ReportPort } from 'src/report/domain/report.repository';
import { PrismaService } from 'src/lib/prisma.service';
import { GetReportDto } from 'src/report/application/dtos/get-report.dto';
import { ReportStatus, ReportType } from '@prisma/client';

@Injectable()
export class ReportRepository implements ReportPort {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    userId: string,
    type: ReportType,
    filters: any,
    status: ReportStatus,
  ): Promise<any> {
    const report = await this.prisma.report.create({
      data: {
        userId,
        type,
        status,
        filters,
      },
    });
    return report;
  }

  async getReport(dto: GetReportDto): Promise<any | null> {
    const report = dto.filters
      ? await this.prisma.report.findFirst({
          where: {
            type: dto.type,
            filters: {
              equals: dto.filters,
            },
          },
        })
      : await this.prisma.report.findFirst({
          where: {
            type: dto.type,
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
