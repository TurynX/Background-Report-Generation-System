import { ReportStatus, ReportType } from '@prisma/client';

export class ReportEntity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly type: ReportType,
    readonly status: ReportStatus,
    readonly filters: any | null,
    readonly fileUrl: string | null,
    readonly errorMessage: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
