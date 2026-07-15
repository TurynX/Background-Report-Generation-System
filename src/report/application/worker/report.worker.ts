import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { S3StorageService } from '../../infrastructure/storage/services/s3-storage.service';
import { ReportStatus, ReportType } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma.service';

@Processor('report-queue')
export class ReportWorker extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: S3StorageService,
  ) {
    super();
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [headers, ...rows].join('\n');
  }

  async process(
    job: Job<{ type: ReportType; filters: any; reportId: string }>,
  ): Promise<any> {
    const { type, filters, reportId } = job.data;

    let data: any;

    try {
      if (type === 'SALES_SUMMARY') {
        data = await this.prisma.sales.findMany({ where: filters });
      } else if (type === 'USER_ACTIVITY') {
        data = await this.prisma.user.findMany({ where: filters });
      }

      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.PROCESSING,
        },
      });

      console.log('Processing...');

      const csvContent = this.convertToCSV(data);
      const fileName = `${type.toLowerCase()}/${reportId}.csv`;

      const uploadedFile = await this.storageService.uploadFile(
        fileName,
        Buffer.from(csvContent),
        'text/csv',
      );

      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          fileUrl: uploadedFile.url,
        },
      });

      console.log('Completed');
    } catch (error) {
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.FAILED,
          errorMessage: error.message,
        },
      });
      console.log(error);
    }
  }
}
