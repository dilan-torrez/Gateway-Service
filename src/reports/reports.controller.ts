import { Controller, Get, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards';
import { ReportsSalesService } from './services/reports.sales.service';

@ApiTags('sales-reports')
@Controller('sales')
export class ReportsController {
  constructor(private readonly reportsSalesService: ReportsSalesService) {}

  @Get(':saleId/receipt')
  @ApiOperation({ summary: 'Generar recibo oficial de venta en PDF' })
  @ApiParam({ name: 'saleId', type: Number, example: 1 })
  @ApiQuery({
    name: 'template',
    required: false,
    enum: ['classic-letter-two-copies', 'institutional-letter-two-copies'],
    example: 'classic-letter-two-copies',
  })
  @ApiResponse({ status: 200, description: 'PDF del recibo oficial' })
  async saleReceipt(
    @Param('saleId', ParseIntPipe) saleId: number,
    @Query('template') template: string | undefined,
    @Res() res: Response,
  ) {
    const receipt = await this.reportsSalesService.generateSaleReceipt(saleId, template);

    res.set({
      'Content-Type': receipt.contentType,
      'Content-Disposition': `${receipt.disposition}; filename="${receipt.fileName}"`,
      'Content-Length': receipt.buffer.length,
    });

    res.send(receipt.buffer);
  }
}
