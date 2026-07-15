import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetReportDto } from 'src/report/application/dtos/get-report.dto';
import { GetReportUseCase } from 'src/report/application/use-cases/get-report.use-case';
import { AuthGuard } from 'src/auth/guard/guard.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly getReportUseCase: GetReportUseCase) {}

  @Post()
  @HttpCode(201)
  getReport(@Body() body: GetReportDto, @Req() req) {
    const userId = req.user.sub;
    return this.getReportUseCase.execute(userId, body);
  }
}
