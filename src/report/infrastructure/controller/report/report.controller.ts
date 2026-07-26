import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetReportDto } from 'src/report/application/dtos/get-report.dto';
import { GetReportByIdUseCase } from 'src/report/application/use-cases/get-report-by-id.use-case';
import { AuthGuard } from 'src/auth/guard/guard.guard';
import { CreateReportUseCase } from 'src/report/application/use-cases/create-report.use-case';
import { ReportStatus } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(
    private readonly getReportByIdUseCase: GetReportByIdUseCase,
    private readonly createReportUseCase: CreateReportUseCase,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async generateReport(@Body() body: GetReportDto, @Req() req) {
    const userId = req.user.sub;
    const report = await this.createReportUseCase.execute(
      userId,
      body.type,
      body.filters,
    );
    if (report.fileUrl === null) {
      return {
        data: report,
        message: 'Report is being generated',
      };
    }
    return { data: report, message: 'Report generated successfully' };
  }

  @Get('getReport/:id')
  @HttpCode(HttpStatus.OK)
  async getReport(@Param('id') id: string) {
    const report = await this.getReportByIdUseCase.execute(id);
    return { data: report, message: 'Report retrieved successfully' };
  }
}
