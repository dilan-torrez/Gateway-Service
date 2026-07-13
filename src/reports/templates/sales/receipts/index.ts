import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesReceiptData } from '../../../interfaces/sales/sales-receipt-data.interface';
import { reciboPrueba } from './reciboPrueba';
import { reciboFormal } from './reciboFormal';

type SalesReceiptBuilder = (data: SalesReceiptData) => TDocumentDefinitions;

const defaultSalesReceiptTemplate = 'reciboFormal';

export const salesReceiptTemplates: Record<string, SalesReceiptBuilder> = {
  'reciboPrueba': reciboPrueba,
  'reciboFormal': reciboFormal,
};

export function findSalesReceiptTemplate(templateId?: string): SalesReceiptBuilder | null {
  if (!templateId) {
    return salesReceiptTemplates[defaultSalesReceiptTemplate];
  }

  return salesReceiptTemplates[templateId] ?? null;
}
