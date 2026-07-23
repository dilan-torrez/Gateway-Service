import { Workbook, Worksheet } from 'exceljs';
import { SalesListData, SalesListItem } from '../../../interfaces/sales/sales-list-data.interface';
import {
  buildSalesExcelHeader,
  buildSalesListHeaderData,
  EXCEL_HEADER_LAST_ROW,
} from '../cabeceras';

const TABLE_HEADER_ROW = EXCEL_HEADER_LAST_ROW + 1;
const DATA_START_ROW = TABLE_HEADER_ROW + 1;
const LAST_COLUMN = 9;

const COLORS = {
  primary: '4A4A4A',
  headerText: 'FFFFFF',
  text: '202020',
  muted: '666666',
  grid: 'C8C8C8',
  alternateRow: 'F2F2F2',
  emptyRow: 'F8F8F8',
};

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

const COLUMN_WIDTHS = [16, 21, 34, 34, 11, 15, 20, 16, 25];

export function reportSalesExcel(data: SalesListData): Workbook {
  const workbook = new Workbook();
  const generatedAt = parseDate(data.metadata?.generatedAt) ?? new Date();

  workbook.creator = data.metadata?.generatedBy || 'Gateway-Service';
  workbook.company = 'MUTUAL DE SERVICIOS AL POLICIA';
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  const worksheet = workbook.addWorksheet('Ventas', {
    properties: {
      defaultRowHeight: 18,
    },
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
    views: [
      {
        state: 'frozen',
        ySplit: TABLE_HEADER_ROW,
        activeCell: `A${TABLE_HEADER_ROW}`,
        showGridLines: false,
      },
    ],
  });

  configureColumns(worksheet);
  buildSalesExcelHeader(workbook, worksheet, buildSalesListHeaderData(data));
  buildTable(worksheet, data.sales);

  worksheet.headerFooter.oddFooter =
    '&LReporte de ventas&CInformación institucional&RPágina &P de &N';

  return workbook;
}

function configureColumns(worksheet: Worksheet): void {
  COLUMN_WIDTHS.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });
}

function buildTable(worksheet: Worksheet, sales: SalesListItem[]): void {
  const headerRow = worksheet.getRow(TABLE_HEADER_ROW);
  headerRow.values = HEADERS;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: COLORS.headerText },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    applyBorder(cell);
  });

  sales.forEach((sale, index) => {
    const row = worksheet.addRow([
      safeText(sale.code),
      parseDate(sale.receptionDate),
      safeText(sale.principalCustomer),
      safeText(sale.service),
      toFiniteNumber(sale.amount) ?? 0,
      toFiniteNumber(sale.price),
      safeText(sale.paymentType),
      toFiniteNumber(sale.total),
      safeText(sale.receptionist),
    ]);

    row.height = 24;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Arial',
        size: 9,
        color: { argb: COLORS.text },
      };
      cell.alignment = {
        vertical: 'middle',
        wrapText: true,
      };
      applyBorder(cell);

      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.alternateRow },
        };
      }
    });

    row.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    row.getCell(2).numFmt = 'dd/mm/yyyy hh:mm';
    row.getCell(2).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    row.getCell(5).numFmt = '0';
    row.getCell(5).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(6).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    row.getCell(7).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    row.getCell(8).numFmt = '#,##0.00';
    row.getCell(8).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
    row.getCell(9).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
  });

  const lastDataRow = TABLE_HEADER_ROW + sales.length;
  const lastContentRow = sales.length > 0 ? lastDataRow : DATA_START_ROW;

  if (sales.length === 0) {
    const emptyRow = worksheet.getRow(DATA_START_ROW);
    worksheet.mergeCells(`A${DATA_START_ROW}:I${DATA_START_ROW}`);
    emptyRow.getCell(1).value =
      'No existen ventas registradas para el rango de fechas seleccionado.';
    emptyRow.getCell(1).font = {
      name: 'Arial',
      size: 10,
      italic: true,
      color: { argb: COLORS.muted },
    };
    emptyRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.emptyRow },
    };
    emptyRow.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    emptyRow.height = 30;
  }

  worksheet.autoFilter = {
    from: { row: TABLE_HEADER_ROW, column: 1 },
    to: {
      row: Math.max(TABLE_HEADER_ROW, lastDataRow),
      column: LAST_COLUMN,
    },
  };
  worksheet.pageSetup.printArea = `A1:I${lastContentRow}`;
  worksheet.pageSetup.printTitlesRow = `${TABLE_HEADER_ROW}:${TABLE_HEADER_ROW}`;
}

function applyBorder(cell: ReturnType<Worksheet['getCell']>): void {
  cell.border = {
    top: { style: 'thin', color: { argb: COLORS.grid } },
    left: { style: 'thin', color: { argb: COLORS.grid } },
    bottom: { style: 'thin', color: { argb: COLORS.grid } },
    right: { style: 'thin', color: { argb: COLORS.grid } },
  };
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalized = value.trim();
  const localDateTime = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  const date = localDateTime
    ? new Date(
        Number(localDateTime[1]),
        Number(localDateTime[2]) - 1,
        Number(localDateTime[3]),
        Number(localDateTime[4]),
        Number(localDateTime[5]),
        Number(localDateTime[6]),
      )
    : new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function toFiniteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue =
    typeof value === 'number'
      ? value
      : Number(
          String(value)
            .match(/-?\d+(?:[.,]\d+)?/)?.[0]
            .replace(',', '.'),
        );

  return Number.isFinite(numberValue) ? numberValue : null;
}

function safeText(value: unknown): string {
  return String(value ?? '').trim();
}
