import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NatsService } from 'src/common/services/nats.service';
import { ReportRenderResult } from '../interfaces/common/report-render-result.interface';
import { SalesReceiptResponse } from '../interfaces/sales/sales-receipt-data.interface';
import { PdfmakeRendererService } from '../renderer/pdfmake-renderer.service';
import { findSalesReceiptTemplate } from '../templates/sales/receipts';
import { buildReceiptFileName } from '../utils/report-file-name.util';

@Injectable()
export class ReportsSalesService {
  constructor(
    private readonly nats: NatsService,
    private readonly renderer: PdfmakeRendererService,
  ) {}

  async generateSaleReceipt(saleId: number, templateId?: string): Promise<ReportRenderResult> {
    const response = (await this.nats.firstValue('sales.personSaleDetails', {
      saleId,
    })) as SalesReceiptResponse;

    if (response?.error) {
      throw new BadRequestException({
        error: true,
        message: response.message,
      });
    }

    if (!response?.data) {
      throw new NotFoundException({
        error: true,
        message: 'No se encontraron datos para generar el recibo.',
      });
    }

    const template = findSalesReceiptTemplate(templateId);

    if (!template) {
      throw new BadRequestException({
        error: true,
        message: 'La plantilla solicitada para el recibo de venta no existe.',
      });
    }

    const documentDefinition = template(response.data);
    const buffer = await this.renderer.generatePdfBuffer(documentDefinition);
    const receiptNumber =
      response.data.voucher.receiptNumber ?? response.data.sale.code ?? String(saleId);

    return {
      buffer,
      fileName: buildReceiptFileName(receiptNumber),
      contentType: 'application/pdf',
      disposition: 'inline',
    };
  }
}
