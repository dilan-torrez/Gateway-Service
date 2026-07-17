import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesReceiptData } from '../../../interfaces/sales/sales-receipt-data.interface';
import { reciboFormal } from './reciboFormal';

type SalesReceiptBuilder = (data: SalesReceiptData) => TDocumentDefinitions;

const defaultSalesReceiptTemplate = 'reciboFormal';

export const salesReceiptTemplates: Record<string, SalesReceiptBuilder> = {
  'reciboFormal': reciboFormal,
};

export function findSalesReceiptTemplate(): SalesReceiptBuilder {
  return salesReceiptTemplates[defaultSalesReceiptTemplate];
}
