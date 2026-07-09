import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { PdfmakeRendererService } from './renderer/pdfmake-renderer.service';
import { ReportsSalesService } from './services/reports.sales.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsSalesService, PdfmakeRendererService],
})
export class ReportsModule {}
