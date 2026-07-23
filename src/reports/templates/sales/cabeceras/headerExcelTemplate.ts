import { existsSync } from 'fs';
import { join } from 'path';
import { Workbook, Worksheet } from 'exceljs';
import type { SalesReportHeaderData } from './headerPdfTemplate';

export const EXCEL_HEADER_LAST_ROW = 6;

const COLORS = {
  primary: '4A4A4A',
  primaryDark: '1F1F1F',
  primarySoft: 'E6E6E6',
  primarySoftBorder: 'C8C8C8',
  text: '202020',
  surface: 'F5F5F5',
  white: 'FFFFFF',
};

export function buildSalesExcelHeader(
  workbook: Workbook,
  worksheet: Worksheet,
  data: SalesReportHeaderData,
): void {
  const generatedAt = parseDate(data.generatedAt) ?? new Date();
  const logoPath = findLogoPath();
  const titleStartColumn = logoPath ? 'C' : 'A';

  if (logoPath) {
    buildLogoBlock(workbook, worksheet, logoPath);
  }

  buildTitleBlock(worksheet, titleStartColumn, data);
  buildGenerationBlock(worksheet, data, generatedAt);
  buildAccentLine(worksheet);
  configureHeaderRows(worksheet);
}

function buildLogoBlock(workbook: Workbook, worksheet: Worksheet, logoPath: string): void {
  worksheet.mergeCells('A1:B5');

  const logoCell = worksheet.getCell('A1');
  logoCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.white },
  };
  logoCell.alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };
  logoCell.border = {
    right: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
  };

  const imageId = workbook.addImage({
    filename: logoPath,
    extension: 'png',
  });

  worksheet.addImage(imageId, {
    tl: { col: 0.55, row: 0.65 },
    ext: { width: 120, height: 80 },
    editAs: 'oneCell',
  });
}

function buildTitleBlock(
  worksheet: Worksheet,
  startColumn: 'A' | 'C',
  data: SalesReportHeaderData,
): void {
  const titleRows = [
    {
      row: 1,
      value: fallback(data.institutionName),
      size: 10,
      color: COLORS.text,
    },
    {
      row: 2,
      value: fallback(data.institutionShortName),
      size: 8,
      color: COLORS.primary,
    },
    {
      row: 3,
      value: fallback(data.title),
      size: 16,
      color: COLORS.primaryDark,
    },
  ];

  titleRows.forEach(({ row, value, size, color }) => {
    worksheet.mergeCells(`${startColumn}${row}:G${row}`);

    const cell = worksheet.getCell(`${startColumn}${row}`);
    cell.value = value;
    cell.font = {
      name: 'Arial',
      size,
      bold: true,
      color: { argb: color },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      shrinkToFit: true,
    };
  });

  worksheet.mergeCells(`${startColumn}4:G5`);

  const periodCell = worksheet.getCell(`${startColumn}4`);
  periodCell.value = {
    richText: [
      {
        font: {
          name: 'Arial',
          size: 9,
          bold: true,
          color: { argb: COLORS.primaryDark },
        },
        text: 'PERIODO  ',
      },
      {
        font: {
          name: 'Arial',
          size: 9,
          color: { argb: COLORS.text },
        },
        text: `${formatOptionalDate(data.dateFrom)}  —  ${formatOptionalDate(data.dateTo)}`,
      },
    ],
  };
  periodCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primarySoft },
  };
  periodCell.alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };
  applyBorder(periodCell);
}

function buildGenerationBlock(
  worksheet: Worksheet,
  data: SalesReportHeaderData,
  generatedAt: Date,
): void {
  worksheet.mergeCells('H1:I1');

  const generatedTitle = worksheet.getCell('H1');
  generatedTitle.value = 'GENERADO';
  generatedTitle.font = {
    name: 'Arial',
    size: 9,
    bold: true,
    color: { argb: COLORS.white },
  };
  generatedTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primary },
  };
  generatedTitle.alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };

  const metadata = [
    ['Fecha', formatDate(generatedAt)],
    ['Hora', formatTime(generatedAt)],
    ['Usuario', truncateText(fallback(data.generatedBy), 22)],
  ];

  metadata.forEach(([label, value], index) => {
    const row = index + 2;
    const labelCell = worksheet.getCell(`H${row}`);
    const valueCell = worksheet.getCell(`I${row}`);

    labelCell.value = label;
    labelCell.font = {
      name: 'Arial',
      size: 8,
      bold: true,
      color: { argb: COLORS.primaryDark },
    };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primarySoft },
    };
    labelCell.alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };

    valueCell.value = value;
    valueCell.font = {
      name: 'Arial',
      size: 8,
      color: { argb: COLORS.text },
    };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.surface },
    };
    valueCell.alignment = {
      horizontal: 'left',
      vertical: 'middle',
      shrinkToFit: true,
    };

    applyBorder(labelCell);
    applyBorder(valueCell);
  });
}

function buildAccentLine(worksheet: Worksheet): void {
  worksheet.mergeCells(`A${EXCEL_HEADER_LAST_ROW}:I${EXCEL_HEADER_LAST_ROW}`);

  const accentCell = worksheet.getCell(`A${EXCEL_HEADER_LAST_ROW}`);
  accentCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primary },
  };
  accentCell.border = {
    bottom: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
  };
}

function configureHeaderRows(worksheet: Worksheet): void {
  worksheet.getRow(1).height = 21;
  worksheet.getRow(2).height = 18;
  worksheet.getRow(3).height = 25;
  worksheet.getRow(4).height = 18;
  worksheet.getRow(5).height = 18;
  worksheet.getRow(EXCEL_HEADER_LAST_ROW).height = 4;
}

function applyBorder(cell: ReturnType<Worksheet['getCell']>): void {
  cell.border = {
    top: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
    left: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
    bottom: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
    right: {
      style: 'thin',
      color: { argb: COLORS.primarySoftBorder },
    },
  };
}

function formatOptionalDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);

  return date ? formatDate(date) : '-';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
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

function fallback(value: string | null | undefined): string {
  return value?.trim() || '-';
}

function truncateText(value: string, maximumLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maximumLength
    ? normalized
    : `${normalized.slice(0, Math.max(maximumLength - 3, 0))}...`;
}

function findLogoPath(): string | null {
  const possiblePaths = [
    join(process.cwd(), 'src', 'reports', 'templates', 'img', 'logo.png'),
    join(process.cwd(), 'dist', 'reports', 'templates', 'img', 'logo.png'),
  ];

  return possiblePaths.find((path) => existsSync(path)) ?? null;
}
