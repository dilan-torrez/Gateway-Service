import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  SalesReceiptData,
  SalesReceiptProduct,
} from '../../../interfaces/sales/sales-receipt-data.interface';
import { formatSpanishDate } from '../../../utils/report-date.util';

const PAGE = {
  width: 612,
  height: 792,
  margin: 56.7,
};

const HALF_PAGE_HEIGHT = PAGE.height / 2;

const RECEIPT = {
  width: PAGE.width - PAGE.margin * 2,
  height: HALF_PAGE_HEIGHT - PAGE.margin * 2,
};

const CUT_LINE_WIDTH = PAGE.width - PAGE.margin * 2;
const RECEIPT_PADDING = {
  left: 14,
  top: 12,
  right: 14,
  bottom: 10,
};
const RECEIPT_FOOTER_HEIGHT = 58;
const RECEIPT_BODY_HEIGHT = RECEIPT.height - RECEIPT_PADDING.top - RECEIPT_PADDING.bottom;

export function institutionalLetterTwoCopiesReceipt(
  data: SalesReceiptData,
): TDocumentDefinitions {
  const receiptX = PAGE.margin;
  const topReceiptY = (HALF_PAGE_HEIGHT - RECEIPT.height) / 2;
  const separatorY = HALF_PAGE_HEIGHT;
  const bottomReceiptY = HALF_PAGE_HEIGHT + topReceiptY;

  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [0, 0, 0, 0],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 8,
      color: '#1f2933',
    },
    content: [
      ({
        ...buildReceiptCopy(data),
        absolutePosition: { x: receiptX, y: topReceiptY },
      } as unknown as Content),
      ({
        ...buildCutSeparator(CUT_LINE_WIDTH),
        absolutePosition: { x: PAGE.margin, y: separatorY },
      } as Content),
      ({
        ...buildReceiptCopy(data),
        absolutePosition: { x: receiptX, y: bottomReceiptY },
      } as unknown as Content),
    ],
    styles: {
      institution: {
        fontSize: 8,
        bold: true,
        color: '#111827',
      },
      institutionSub: {
        fontSize: 8,
        color: '#374151',
        alignment: 'center',
      },
      copyBadge: {
        fontSize: 7.5,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      title: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      titleSub: {
        fontSize: 7,
        alignment: 'center',
        color: '#4b5563',
      },
      saleCodeLabel: {
        fontSize: 7.2,
        alignment: 'right',
        color: '#4b5563',
      },
      saleCodeValue: {
        fontSize: 10,
        bold: true,
        alignment: 'right',
        color: '#111827',
      },
      amountLabel: {
        fontSize: 7,
        alignment: 'right',
        color: '#4b5563',
      },
      amountValue: {
        fontSize: 12.5,
        bold: true,
        alignment: 'right',
        color: '#111827',
      },
      mainLabel: {
        fontSize: 7.4,
        bold: true,
        color: '#111827',
        fillColor: '#eef2f7',
      },
      mainValue: {
        fontSize: 7.9,
        color: '#111827',
      },
      sectionTitle: {
        fontSize: 7.4,
        bold: true,
        color: '#111827',
      },
      cardTitle: {
        fontSize: 7,
        bold: true,
        color: '#111827',
      },
      label: {
        fontSize: 6.35,
        bold: true,
        color: '#4b5563',
      },
      value: {
        fontSize: 6.45,
        color: '#111827',
      },
      valueBold: {
        fontSize: 6.9,
        bold: true,
        color: '#111827',
      },
      tableHeader: {
        fontSize: 6.8,
        bold: true,
        color: '#111827',
        fillColor: '#eef2f7',
      },
      tableCell: {
        fontSize: 6.55,
        color: '#111827',
      },
      tableCellCenter: {
        fontSize: 6.55,
        color: '#111827',
        alignment: 'center',
      },
      tableCellRight: {
        fontSize: 6.55,
        color: '#111827',
        alignment: 'right',
      },
      totalLabel: {
        fontSize: 7.2,
        bold: true,
        color: '#111827',
      },
      totalValue: {
        fontSize: 8.5,
        bold: true,
        alignment: 'right',
        color: '#111827',
      },
      footerText: {
        fontSize: 6.6,
        color: '#374151',
      },
      metadata: {
        fontSize: 5,
        color: '#6b7280',
      },
      signature: {
        fontSize: 7.3,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      signatureName: {
        fontSize: 8,
        alignment: 'center',
        color: '#111827',
      },
    },
  };

  return documentDefinition;
}

function buildReceiptCopy(data: SalesReceiptData) {
  return {
    table: {
      widths: [RECEIPT.width],
      heights: [RECEIPT.height],
      body: [
        [
          {
            border: [true, true, true, true],
            margin: [
              RECEIPT_PADDING.left,
              RECEIPT_PADDING.top,
              RECEIPT_PADDING.right,
              RECEIPT_PADDING.bottom,
            ],
            table: {
              widths: ['*'],
              heights: [RECEIPT_BODY_HEIGHT - RECEIPT_FOOTER_HEIGHT, RECEIPT_FOOTER_HEIGHT],
              body: [
                [
                  {
                    border: [false, false, false, false],
                    stack: [
                      buildHeader(data),
                      buildMainInformation(data),
                      buildProductsBlock(data),
                    ],
                  },
                ],
                [
                  {
                    border: [false, false, false, false],
                    stack: [buildFooter(data)],
                  },
                ],
              ],
            },
            layout: noPaddingLayout(),
          },
        ],
      ],
    },
    layout: outerBorderLayout(),
    unbreakable: true,
  };
}

function buildHeader(data: SalesReceiptData) {
  return {
    table: {
      widths: [162, '*', 142],
      body: [
        [
          {
            border: [false, false, false, false],
            fillColor: '#f3f4f6',
            margin: [6, 5, 6, 5],
            stack: [
              {
                text: 'MUTUAL DE SERVICIOS AL POLICIA',
                style: 'institution',
              },
              {
                text: '"MUSERPOL"',
                style: 'institutionSub',
                margin: [0, 1, 0, 0],
              },
            ],
          },
          {
            border: [false, false, false, false],
            fillColor: '#f3f4f6',
            margin: [6, 3, 6, 3],
            stack: [
              {
                text: 'RECIBO OFICIAL',
                style: 'title',
                margin: [0, 3, 0, 0],
              },
              {
                text: 'Documento administrativo de venta',
                style: 'titleSub',
                margin: [0, 1, 0, 0],
              },
            ],
          },
          {
            border: [false, false, false, false],
            fillColor: '#f3f4f6',
            margin: [6, 4, 6, 4],
            stack: [
              {
                text: 'N°',
                style: 'saleCodeLabel',
              },
              {
                text: `VEN-${saleCode(data)}`,
                style: 'saleCodeValue',
                margin: [0, 1, 0, 3],
              },
            ],
          },
        ],
      ],
    },
    layout: noPaddingLayout(),
  };
}

function buildMainInformation(data: SalesReceiptData) {
  return {
    margin: [0, 6, 0, 0],
    table: {
      widths: [74, '*', 68, 112],
      body: [
        [
          {
            text: 'TITULAR',
            style: 'mainLabel',
          },
          {
            text: `${customerName(data)} - CI ${customerCi(data)}`,
            style: 'mainValue',
            colSpan: 3,
          },
          {},
          {},
        ],
        [
          {
            text: 'LA SUMA DE',
            style: 'mainLabel',
          },
          {
            text: amountToLiteral(totalAmount(data)),
            style: 'mainValue',
          },
          {
            text: 'FORMA PAGO',
            style: 'mainLabel',
          },
          {
            text: paymentType(data),
            style: 'mainValue',
          },
        ],
        [
          {
            text: 'PAGADOR',
            style: 'mainLabel',
          },
          {
            text: `${payerName(data)} - CI ${payerCi(data)} - Tercero: ${yesNo(data.payer.isThirdParty)}`,
            style: 'mainValue',
          },
          {
            text: 'ENTIDAD',
            style: 'mainLabel',
          },
          {
            text: paymentLocation(data),
            style: 'mainValue',
          },
        ],
      ],
    },
    layout: mainTableLayout(),
  };
}

function buildProductsBlock(data: SalesReceiptData) {
  const body: unknown[][] = [
    [
      {
        text: 'NOMBRE DEL SERVICIO',
        style: 'tableHeader',
      },
      {
        text: 'CANT.',
        style: 'tableHeader',
        alignment: 'center',
      },
      {
        text: 'P. UNIT.',
        style: 'tableHeader',
        alignment: 'right',
      },
      {
        text: 'TOTAL',
        style: 'tableHeader',
        alignment: 'right',
      },
    ],
    ...data.products.map(productRow),
  ];

  if (data.products.length === 0) {
    body.push([
      {
        text: 'Sin productos registrados',
        style: 'tableCell',
        colSpan: 4,
      },
      {},
      {},
      {},
    ]);
  }

  return {
    margin: [0, 5, 0, 0],
    stack: [
      {
        text: 'POR CONCEPTO DE',
        style: 'sectionTitle',
        margin: [0, 0, 0, 2],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 36, 55, 58],
          body,
        },
        layout: productsTableLayout(),
      },
    ],
  };
}

function productRow(product: SalesReceiptProduct) {
  return [
    {
      text: fallback(product.name),
      style: 'tableCell',
    },
    {
      text: fallback(product.amount),
      style: 'tableCellCenter',
    },
    {
      text: money(product.price),
      style: 'tableCellRight',
    },
    {
      text: money(product.total),
      style: 'tableCellRight',
    },
  ];
}

function buildFooter(data: SalesReceiptData) {
  return {
    margin: [0, 5, 0, 0],
    stack: [
      {
        margin: [105, 0, 105, 4],
        columns: [
          buildSignatureBox('RECEPCIONADO POR', fallback(data.sale.receptionist)),
          buildSignatureBox('PAGADOR / TITULAR', payerName(data)),
        ],
        columnGap: 24,
      },
      {
        margin: [0, 2, 0, 0],
        columns: [
          {
            width: '*',
            stack: [
              {
                text: `Fecha de emisión: ${formatSpanishDate(receiptDate(data))}`,
                style: 'footerText',
              },
              {
                text: metadataText(data),
                style: 'metadata',
                margin: [0, 3, 0, 0],
              },
            ],
          },
          {
            width: 118,
            stack: [
              {
                table: {
                  widths: [118],
                  body: [
                    [
                      {
                        border: [true, true, true, true],
                        fillColor: '#ffffff',
                        margin: [5, 2, 5, 2],
                        stack: [
                          {
                            text: 'IMPORTE',
                            style: 'amountLabel',
                          },
                          {
                            text: money(data.voucher.total, data.currency.symbol),
                            style: 'amountValue',
                          },
                        ],
                      },
                    ],
                  ],
                },
                layout: amountBoxLayout(),
              },
            ],
          },
        ],
        columnGap: 12,
      },
    ],
  };
}

function buildSignatureBox(title: string, name: string) {
  return {
    width: '*',
    stack: [
      {
        text: '________________________',
        style: 'signature',
      },
      {
        text: title,
        style: 'signature',
        margin: [0, 3, 0, 0],
      },
      {
        text: name,
        style: 'signatureName',
      },
    ],
  };
}

function buildCutSeparator(width: number) {
  return {
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        lineWidth: 0.5,
        dash: { length: 3, space: 3 },
        lineColor: '#9ca3af',
      },
    ],
  };
}

function outerBorderLayout() {
  return {
    hLineColor: () => '#111827',
    vLineColor: () => '#111827',
    hLineWidth: () => 0.7,
    vLineWidth: () => 0.7,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  };
}

function noPaddingLayout() {
  return {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  };
}

function amountBoxLayout() {
  return {
    hLineColor: () => '#111827',
    vLineColor: () => '#111827',
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  };
}

function badgeLayout() {
  return {
    hLineColor: () => '#6b7280',
    vLineColor: () => '#6b7280',
    hLineWidth: () => 0.45,
    vLineWidth: () => 0.45,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  };
}

function mainTableLayout() {
  return {
    hLineColor: () => '#9ca3af',
    vLineColor: () => '#9ca3af',
    hLineWidth: () => 0.45,
    vLineWidth: () => 0.45,
    paddingLeft: () => 3,
    paddingRight: () => 3,
    paddingTop: () => 2,
    paddingBottom: () => 2,
  };
}

function detailGridLayout() {
  return {
    hLineColor: () => '#d1d5db',
    vLineColor: () => '#d1d5db',
    hLineWidth: () => 0.35,
    vLineWidth: () => 0.35,
    paddingLeft: () => 2,
    paddingRight: () => 2,
    paddingTop: () => 2,
    paddingBottom: () => 2,
  };
}

function productsTableLayout() {
  return {
    hLineColor: () => '#9ca3af',
    vLineColor: () => '#9ca3af',
    hLineWidth: () => 0.35,
    vLineWidth: () => 0.35,
    paddingLeft: () => 2.2,
    paddingRight: () => 2.2,
    paddingTop: () => 1.5,
    paddingBottom: () => 1.5,
  };
}

function saleCode(data: SalesReceiptData): string {
  return fallback(data.sale.code);
}

function totalAmount(data: SalesReceiptData): string {
  return data.voucher.total ?? data.totals.amount ?? '0.00';
}

function customerName(data: SalesReceiptData): string {
  return data.principalCustomer.fullName ?? 'SIN NOMBRE';
}

function customerCi(data: SalesReceiptData): string {
  return data.principalCustomer.identityCard ?? 'SIN CI';
}

function payerName(data: SalesReceiptData): string {
  return data.payer.customer ?? data.principalCustomer.fullName ?? 'SIN NOMBRE';
}

function payerCi(data: SalesReceiptData): string {
  return data.payer.identityCardCustomer ?? data.principalCustomer.identityCard ?? 'SIN CI';
}

function paymentType(data: SalesReceiptData): string {
  return data.payment.type?.name ?? 'No especificado';
}

function paymentLocation(data: SalesReceiptData): string {
  return data.payment.location?.name ?? 'No especificado';
}

function concept(data: SalesReceiptData): string {
  return productsConcept(data.products);
}

function productsConcept(products: SalesReceiptProduct[]): string {
  if (!products || products.length === 0) {
    return 'Sin productos registrados';
  }

  if (products.length === 1) {
    return products[0].name;
  }

  return products.map((product) => product.name).join(', ');
}

function description(data: SalesReceiptData): string {
  return data.voucher.description ?? 'No especificado';
}

function receiptDate(data: SalesReceiptData): string | Date {
  return data.voucher.depositDate ?? data.voucher.createdAt ?? data.sale.createdAt;
}

function fallbackDate(value: string | Date | null): string {
  return value ? adminDate(value) : '-';
}

function adminDate(value: string | Date): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(date).replace(',', '');
}

function money(amount: string, symbol?: string | null): string {
  return `${normalizeCurrency(symbol)} ${amount ?? '0.00'}`.trim();
}

function normalizeCurrency(symbol?: string | null): string {
  const value = (symbol ?? 'Bs.').trim();
  const lower = value.toLowerCase();

  if (lower === 'bs' || lower === 'bs.') {
    return 'Bs.';
  }

  return value;
}

function amountToLiteral(value: string): string {
  const [integerPart, decimalPart = '00'] = String(value ?? '0.00').split('.');
  const amount = Number(integerPart);
  const cents = decimalPart.padEnd(2, '0').slice(0, 2);

  return `${numberToSpanish(amount)} ${cents}/100 Bolivianos`;
}

function numberToSpanish(value: number): string {
  if (!Number.isFinite(value)) {
    return '-';
  }

  if (value === 0) {
    return 'CERO';
  }

  if (value < 0) {
    return `MENOS ${numberToSpanish(Math.abs(value))}`;
  }

  if (!Number.isInteger(value)) {
    return String(value).toUpperCase();
  }

  if (value <= 999999) {
    return numberToSpanishUnderMillion(value);
  }

  return String(value).toUpperCase();
}

function numberToSpanishUnderMillion(value: number): string {
  const units = [
    '',
    'UNO',
    'DOS',
    'TRES',
    'CUATRO',
    'CINCO',
    'SEIS',
    'SIETE',
    'OCHO',
    'NUEVE',
  ];

  const teens = [
    'DIEZ',
    'ONCE',
    'DOCE',
    'TRECE',
    'CATORCE',
    'QUINCE',
    'DIECISEIS',
    'DIECISIETE',
    'DIECIOCHO',
    'DIECINUEVE',
  ];

  const tens = [
    '',
    '',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ];

  const hundreds = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ];

  if (value < 10) {
    return units[value];
  }

  if (value < 20) {
    return teens[value - 10];
  }

  if (value < 30) {
    return value === 20 ? 'VEINTE' : `VEINTI${units[value - 20]}`;
  }

  if (value < 100) {
    const unit = value % 10;
    const ten = Math.floor(value / 10);

    return unit === 0 ? tens[ten] : `${tens[ten]} Y ${units[unit]}`;
  }

  if (value === 100) {
    return 'CIEN';
  }

  if (value < 1000) {
    const rest = value % 100;
    const hundred = Math.floor(value / 100);

    return rest === 0
      ? hundreds[hundred]
      : `${hundreds[hundred]} ${numberToSpanishUnderMillion(rest)}`;
  }

  if (value < 1000000) {
    const thousands = Math.floor(value / 1000);
    const rest = value % 1000;
    const prefix =
      thousands === 1
        ? 'MIL'
        : `${numberToSpanishUnderMillion(thousands)} MIL`;

    return rest === 0
      ? prefix
      : `${prefix} ${numberToSpanishUnderMillion(rest)}`;
  }

  return String(value);
}

function yesNo(value: boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }

  return value ? 'Sí' : 'No';
}

function fallback(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
}

function metadataText(data: SalesReceiptData): string {
  const metadata = [
    data.metadata?.source ? `Fuente: ${data.metadata.source}` : null,
    data.metadata?.generatedFor
      ? `Generado para: ${data.metadata.generatedFor}`
      : null,
    data.metadata?.generatedAt
      ? `Generado en: ${adminDate(data.metadata.generatedAt)}`
      : null,
  ].filter(Boolean);

  return metadata.length > 0 ? metadata.join(' | ') : 'Metadata: -';
}
