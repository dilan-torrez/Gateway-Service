import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesListData } from '../../../interfaces/sales/sales-list-data.interface';
import { reportSales } from './reportSalesPdf';
import { reportSalesExcel } from './reportSalesExcel';
import { Workbook } from 'exceljs';

type SalesListBuilder = (data: SalesListData) => TDocumentDefinitions;
type SalesListExcelBuilder = (data: SalesListData) => Workbook;

const defaultSalesListTemplate = 'reportSales';

export const salesListTemplates: Record<string, SalesListBuilder> = {
  reportSales: reportSales,
};

export function findSalesListPdfTemplate(): SalesListBuilder {
  return salesListTemplates[defaultSalesListTemplate];
}

export function findSalesListExcelTemplate(): SalesListExcelBuilder {
  return reportSalesExcel;
}
