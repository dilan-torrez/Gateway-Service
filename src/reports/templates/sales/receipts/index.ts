import { classicLetterTwoCopiesReceipt } from './classic-letter-two-copies.receipt';
import { institutionalLetterTwoCopiesReceipt } from './institutional-letter-two-copies.receipt';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesReceiptData } from '../../../interfaces/sales/sales-receipt-data.interface';

type SalesReceiptBuilder = (data: SalesReceiptData) => TDocumentDefinitions;

const defaultSalesReceiptTemplate = 'classic-letter-two-copies';

export const salesReceiptTemplates: Record<string, SalesReceiptBuilder> = {
  'classic-letter-two-copies': classicLetterTwoCopiesReceipt,
  'institutional-letter-two-copies': institutionalLetterTwoCopiesReceipt,
};

export function findSalesReceiptTemplate(templateId?: string): SalesReceiptBuilder | null {
  if (!templateId) {
    return salesReceiptTemplates[defaultSalesReceiptTemplate];
  }

  return salesReceiptTemplates[templateId] ?? null;
}
