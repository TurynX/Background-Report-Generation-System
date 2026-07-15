import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '@prisma/client';
import { IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  reportId: string;

  @IsEnum(ReportStatus)
  status: ReportStatus;
}
