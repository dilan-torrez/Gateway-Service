import { Workbook } from 'exceljs';
import { SalesListData } from '../../../interfaces/sales/sales-list-data.interface';

const HEADERS = [
  'CÓDIGO',
  'FECHA - HORA',
  'TITULAR',
  'SERVICIO',
  'CANT.',
  'PRECIO',
  'TIPO PAGO',
  'TOTAL',
  'RECEPCIONISTA',
];

export function reportSalesExcel(data: SalesListData): Workbook {
  const workbook = new Workbook();

  workbook.creator = data.metadata?.generatedBy || 'Gateway-Service';
  const worksheet = workbook.addWorksheet('Ventas');

  worksheet.addRow(HEADERS);

  data.sales.forEach((sale) => {
    const products = sale.products?.length
      ? sale.products
      : [{ name: sale.service, amount: sale.amount, price: sale.price }];
    const row = worksheet.addRow([
      sale.code ?? '',
      sale.receptionDate ?? '',
      sale.principalCustomer ?? '',
      products.map((product) => `• ${product.name}`).join('\n'),
      products.map((product) => product.amount).join('\n'),
      products.map((product) => product.price).join('\n'),
      sale.paymentType ?? '',
      sale.total ?? '',
      sale.receptionist ?? '',
    ]);

    row.height = Math.max(18, products.length * 15);
    [4, 5, 6].forEach((column) => {
      row.getCell(column).alignment = {
        vertical: 'middle',
        horizontal: column === 4 ? 'left' : 'center',
        wrapText: true,
      };
    });
  });

  return workbook;
}
