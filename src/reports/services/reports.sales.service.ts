import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportRenderResult } from '../interfaces/common/report-render-result.interface';
import { SalesReceiptData } from '../interfaces/sales/sales-receipt-data.interface';
import { PdfmakeRendererService } from '../renderer/pdfmake-renderer.service';
import { buildSalesHeaderPreview, SalesHeaderPreviewData } from '../templates/sales/cabeceras';
import { findSalesReceiptTemplate } from '../templates/sales/receipts';
import { buildReceiptFileName } from '../utils/report-file-name.util';

@Injectable()
export class ReportsSalesService {
  constructor(private readonly pdfMake: PdfmakeRendererService) {}

  async generateSalesHeaderPreview(): Promise<ReportRenderResult> {
    const previewData: SalesHeaderPreviewData = {
      title: 'REPORTE GENERAL DE VENTAS',
      generatedAt: new Date(),
      generatedBy: 'dgbautista',
      dateFrom: '2026-07-01T00:00:00-04:00',
      dateTo: '2026-07-10T23:59:59-04:00',
      description: 'Vista previa de cabecera reutilizable para reportes de ventas.',
    };

    const documentDefinition = buildSalesHeaderPreview(previewData);
    const buffer = await this.pdfMake.generatePdfBuffer(documentDefinition);

    return {
      buffer,
      fileName: 'sales-report-header-preview.pdf',
      contentType: 'application/pdf',
      disposition: 'inline',
    };
  }

  async renderSaleReceipt(
    data: SalesReceiptData,
    templateId?: string,
  ): Promise<ReportRenderResult> {
    const template = findSalesReceiptTemplate(templateId);

    if (!template) {
      throw new BadRequestException({
        error: true,
        message: 'La plantilla solicitada para el recibo de venta no existe.',
      });
    }

    // Aqui se arma el recibo con los datos de la venta y la plantilla elegida.
    const documentDefinition = template(data);

    // Aqui se convierte el recibo armado a PDF.
    const buffer = await this.pdfMake.generatePdfBuffer(documentDefinition);
    const receiptNumber = data.sale.code;

    return {
      buffer,
      fileName: buildReceiptFileName(receiptNumber),
      contentType: 'application/pdf',
      disposition: 'inline',
    };
  }
}
