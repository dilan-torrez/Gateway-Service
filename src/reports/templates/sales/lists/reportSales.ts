import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesListData, SalesListItem } from '../../../interfaces/sales/sales-list-data.interface';
import { buildSalesReportHeader } from '../cabeceras';

export function reportSales(data: SalesListData): TDocumentDefinitions {
  return {
    pageSize: 'LETTER',
    pageOrientation: 'landscape',
    pageMargins: [40, 90, 40, 46],
    header: () => buildPageHeader(data),
    footer: (currentPage: number, pageCount: number) =>
      buildPageFooter(currentPage, pageCount, data),
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 7,
      color: '#111827',
    },
    content: [buildSalesTable(data.sales)],
    styles: {
      tableHeader: {
        fontSize: 7,
        bold: true,
        color: '#111827',
        fillColor: '#e5e7eb',
      },
      tableCell: {
        fontSize: 6.5,
        color: '#111827',
      },
      tableCellCenter: {
        fontSize: 6.5,
        alignment: 'center',
        color: '#111827',
      },
      tableCellRight: {
        fontSize: 6.5,
        alignment: 'right',
        color: '#111827',
      },
    },
  };
}

function buildPageHeader(data: SalesListData): Content {
  return {
    margin: [40, 28, 40, 0],
    stack: [
      buildSalesReportHeader({
        institutionName: 'MUTUAL DE SERVICIOS AL POLICIA',
        institutionShortName: '"MUSERPOL"',
        title: 'REPORTE DE VENTAS',
        generatedAt: data.metadata?.generatedAt ?? new Date(),
        generatedBy: data.metadata?.generatedBy,
        dateFrom: data.filters.dateFrom,
        dateTo: data.filters.dateTo,
      }),
    ],
  } as Content;
}

function buildPageFooter(currentPage: number, pageCount: number, data: SalesListData): Content {
  return {
    margin: [40, 12, 40, 0],
    columns: [
      {
        width: '*',
        text: [
          {
            text: 'Cantidad: ',
            bold: true,
          },
          {
            text: String(data.totalItems),
          },
        ],
        fontSize: 7,
        color: '#374151',
      },
      {
        width: 120,
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'right',
        fontSize: 7,
        color: '#374151',
      },
    ],
  } as Content;
}

function buildSalesTable(sales: SalesListItem[]): Content {
  // const testRows = multiplyRowsForPreview(sales, 1);
  const body: unknown[][] = [
    [
      headerCell('CODIGO'),
      headerCell('FECHA - HORA'),
      headerCell('TITULAR'),
      headerCell('SERVICIO'),
      headerCell('CANT.'),
      headerCell('PRECIO'),
      headerCell('TIPO PAGO'),
      headerCell('TOTAL'),
      headerCell('RECEPCIONISTA'),
    ],
    ...sales.map((sale, index) => rowCells(sale, index)),
  ];

  if (sales.length === 0) {
    body.push([
      {
        text: 'Sin ventas registradas en el rango de fechas seleccionado.',
        colSpan: 9,
        style: 'tableCell',
        margin: [4, 5, 4, 5],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ]);
  }

  return {
    table: {
      headerRows: 1,
      widths: [52, 58, 150, 140, 32, 45, 70, 50, 72],
      body,
    },
    layout: {
      hLineWidth: () => 0.4,
      vLineWidth: () => 0.4,
      hLineColor: () => '#d1d5db',
      vLineColor: () => '#d1d5db',
      paddingLeft: () => 3,
      paddingRight: () => 3,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
  } as Content;
}

// function multiplyRowsForPreview(sales: SalesListItem[], times: number): SalesListItem[] {
//   return Array.from({ length: times }).flatMap(() => sales);
// }

function headerCell(text: string) {
  return {
    text,
    style: 'tableHeader',
    alignment: 'center',
  };
}

function rowCells(sale: SalesListItem, index: number) {
  const fillColor = index % 2 === 0 ? null : '#f9fafb';

  return [
    cell(sale.code),
    cell(formatDateTime(sale.receptionDate)),
    cell(sale.principalCustomer),
    cell(sale.service),
    cell(String(sale.amount)),
    cell(sale.price),
    cell(sale.paymentType),
    cell(sale.total),
    cell(sale.receptionist),
  ].map((value) => ({ ...value, fillColor }));
}

function cell(text: string | null | undefined, style = 'tableCell') {
  return {
    text: fallback(text),
    style,
    alignment: 'center',
  };
}

function formatDateTime(value: string | Date | null | undefined): string {
  const date = parseDate(value) ?? new Date();

  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function fallback(value: string | null | undefined): string {
  const normalized = value?.trim();

  return normalized ? normalized : '-';
}
