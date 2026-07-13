import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface SalesReportHeaderData {
  title: string;
  logo?: string | null;
  generatedAt?: string | Date | null;
  generatedBy?: string | null;
  dateFrom?: string | Date | null;
  dateTo?: string | Date | null;
  institutionName: string;
  institutionShortName: string;
}

export interface SalesHeaderPreviewData extends SalesReportHeaderData {
  description: string;
}

export function buildSalesHeaderPreview(data: SalesHeaderPreviewData): TDocumentDefinitions {
  return {
    pageSize: 'LETTER' as const,
    pageMargins: [40, 36, 40, 36] as [number, number, number, number],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 8,
      color: '#111827',
    },
    content: [
      buildSalesReportHeader(data),
      {
        margin: [0, 8, 0, 0] as [number, number, number, number],
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 532,
            y2: 0,
            lineWidth: 0.5,
            lineColor: '#d1d5db',
          },
        ],
      },
      {
        text: data.description,
        fontSize: 9,
        color: '#374151',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
  };
}

export function buildSalesReportHeader(data: SalesReportHeaderData): Content {
  const generatedAt = parseDate(data.generatedAt) ?? new Date();

  return {
    margin: [0, 0, 0, 8],
    stack: [
      {
        columns: [
          {
            width: 78,
            stack: [buildLogoBlock(data)],
          },
          {
            width: '*',
            text: '',
          },
          buildGeneratedMetaBlock(data, generatedAt),
        ],
      },
      {
        relativePosition: { x: 0, y: -48 },
        margin: [86, 0, 173, 0],
        stack: [buildCenteredTitleBlock(data)],
      },
    ],
  } as Content;
}

function buildCenteredTitleBlock(data: SalesReportHeaderData): Content {
  return {
    stack: [
      {
        text: data.institutionName,
        fontSize: 8,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      {
        text: data.institutionShortName,
        fontSize: 8,
        bold: true,
        alignment: 'center',
        color: '#374151',
        margin: [0, 1, 0, 3],
      },
      {
        text: data.title,
        fontSize: 11,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      {
        text: `Desde: ${formatOptionalDate(data.dateFrom)}    Hasta: ${formatOptionalDate(data.dateTo)}`,
        fontSize: 7,
        alignment: 'center',
        color: '#374151',
        margin: [0, 2, 0, 0],
      },
    ],
  } as Content;
}

function buildGeneratedMetaBlock(data: SalesReportHeaderData, generatedAt: Date): Content {
  return {
    width: 165,
    stack: [
      {
        text: `Fecha: ${formatDate(generatedAt)}`,
        fontSize: 7,
        alignment: 'right',
        color: '#111827',
      },
      {
        text: `Hora: ${formatTime(generatedAt)}`,
        fontSize: 7,
        alignment: 'right',
        color: '#111827',
        margin: [0, 2, 0, 0],
      },
      {
        text: `Usuario: ${fallback(data.generatedBy)}`,
        fontSize: 7,
        alignment: 'right',
        color: '#111827',
        margin: [0, 2, 0, 0],
      },
    ],
  } as Content;
}

function buildLogoBlock(data: SalesReportHeaderData): Content {
  if (data.logo) {
    return {
      image: data.logo,
      width: 62,
      alignment: 'left',
      margin: [0, 0, 0, 0],
    } as Content;
  }

  return {
    table: {
      widths: [62],
      heights: [48],
      body: [
        [
          {
            text: 'LOGO',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            color: '#6b7280',
            margin: [0, 18, 0, 0],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  } as Content;
}

function formatOptionalDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);

  return date ? formatDate(date) : '-';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
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

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function fallback(value: string | null | undefined): string {
  const normalized = value?.trim();

  return normalized ? normalized : '-';
}
