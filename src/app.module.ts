import { Module } from '@nestjs/common';

import { ReportModule } from './report/report.module';
import { PrismaModule } from './lib/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule, ReportModule],
})
export class AppModule {}
