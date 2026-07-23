import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesListData } from '../../../interfaces/sales/sales-list-data.interface';
import { reportSales } from './reportSales';

type SalesListBuilder = (data: SalesListData) => TDocumentDefinitions;

const defaultSalesListTemplate = 'reportSales';

export const salesListTemplates: Record<string, SalesListBuilder> = {
  'reportSales': reportSales,
};

export function findSalesListTemplate(): SalesListBuilder {
  return salesListTemplates[defaultSalesListTemplate];
}
