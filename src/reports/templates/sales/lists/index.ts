import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesListData } from '../../../interfaces/sales/sales-list-data.interface';
import { ventasFormal } from './ventasFormal';

type SalesListBuilder = (data: SalesListData) => TDocumentDefinitions;

const defaultSalesListTemplate = 'ventasFormal';

export const salesListTemplates: Record<string, SalesListBuilder> = {
  ventasFormal,
};

export function findSalesListTemplate(templateId?: string): SalesListBuilder | null {
  if (!templateId) {
    return salesListTemplates[defaultSalesListTemplate];
  }

  return salesListTemplates[templateId] ?? null;
}
