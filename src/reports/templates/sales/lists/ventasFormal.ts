import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesListData, SalesListItem } from '../../../interfaces/sales/sales-list-data.interface';
import { buildSalesReportHeader } from '../cabeceras';

export function ventasFormal(data: SalesListData): TDocumentDefinitions {
  return {
    pageSize: 'LETTER',
    pageOrientation: 'landscape',
    pageMargins: [40, 34, 40, 34],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 7,
      color: '#111827',
    },
    content: [
      buildSalesReportHeader({
        institutionName: 'MUTUAL DE SERVICIOS AL POLICIA',
        institutionShortName: 'MUSERPOL',
        title: 'REPORTE DE VENTAS',
        generatedAt: data.metadata?.generatedAt ?? new Date(),
        generatedBy: data.metadata?.source ?? 'Sales-Service',
        dateFrom: data.filters.dateFrom,
        dateTo: data.filters.dateTo,
      }),
      buildSeparator(),
      buildSummary(data),
      buildSalesTable(data.sales),
    ],
    styles: {
      summaryLabel: {
        fontSize: 7,
        bold: true,
        color: '#374151',
      },
      summaryValue: {
        fontSize: 7,
        color: '#111827',
      },
      tableHeader: {
        fontSize: 6.4,
        bold: true,
        color: '#111827',
        fillColor: '#e5e7eb',
      },
      tableCell: {
        fontSize: 6.2,
        color: '#111827',
      },
      tableCellCenter: {
        fontSize: 6.2,
        alignment: 'center',
        color: '#111827',
      },
      tableCellRight: {
        fontSize: 6.2,
        alignment: 'right',
        color: '#111827',
      },
    },
  };
}

function buildSeparator(): Content {
  return {
    margin: [0, 6, 0, 8],
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 712,
        y2: 0,
        lineWidth: 0.5,
        lineColor: '#d1d5db',
      },
    ],
  } as Content;
}

function buildSummary(data: SalesListData): Content {
  return {
    margin: [0, 0, 0, 8],
    columns: [
      {
        width: '*',
        text: [
          { text: 'Total registros: ', style: 'summaryLabel' },
          { text: String(data.totalItems), style: 'summaryValue' },
        ],
      },
      {
        width: 210,
        alignment: 'right',
        text: [
          { text: 'Generado: ', style: 'summaryLabel' },
          { text: formatDateTime(data.metadata?.generatedAt), style: 'summaryValue' },
        ],
      },
    ],
  } as Content;
}

function buildSalesTable(sales: SalesListItem[]): Content {
  const body: unknown[][] = [
    [
      headerCell('CODIGO'),
      headerCell('FECHA Y HORA'),
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

function headerCell(text: string) {
  return {
    text,
    style: 'tableHeader',
    alignment:
      text === 'CANT.' ? 'center' : text === 'PRECIO' || text === 'TOTAL' ? 'right' : 'left',
  };
}

function rowCells(sale: SalesListItem, index: number) {
  const fillColor = index % 2 === 0 ? null : '#f9fafb';

  return [
    cell(sale.code),
    cell(formatDateTime(sale.receptionDate)),
    cell(sale.principalCustomer),
    cell(sale.service),
    cell(String(sale.amount), 'tableCellCenter'),
    cell(sale.price, 'tableCellRight'),
    cell(sale.paymentType),
    cell(sale.total, 'tableCellRight'),
    cell(sale.receptionist),
  ].map((value) => ({ ...value, fillColor }));
}

function cell(text: string | null | undefined, style = 'tableCell') {
  return {
    text: fallback(text),
    style,
  };
}

function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);

  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
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
