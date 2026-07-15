import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportType } from '@prisma/client';

export class GetReportDto {
  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;

  @IsNotEmpty()
  filters: any;
}
