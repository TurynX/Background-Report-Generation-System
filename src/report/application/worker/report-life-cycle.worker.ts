import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/lib/prisma.service';

@Injectable()
export class ReportLifeCycleWorker {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markExpiredReports() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.report.updateMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          lte: sevenDaysAgo,
        },
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    });

    console.log(`Reports expired: ${updated.count}`);

    const deleted = await this.prisma.report.deleteMany({
      where: {
        status: 'EXPIRED',
        updatedAt: {
          lte: sevenDaysAgo,
        },
      },
    });

    console.log(`Deleted: ${deleted.count}`);
  }
}
