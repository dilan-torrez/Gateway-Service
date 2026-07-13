import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { SalesReceiptData } from '../../../interfaces/sales/sales-receipt-data.interface';
import { formatSpanishDate } from '../../../utils/report-date.util';

export function classicLetterTwoCopiesReceipt(data: SalesReceiptData): TDocumentDefinitions {
  const pageWidth = 564;
  const receiptHeight = 360;
  const separatorHeight = 24;
  const documentDefinition = {
    pageSize: 'LETTER',
    pageMargins: [24, 24, 24, 24],
    content: [
      {
        table: {
          widths: [pageWidth],
          heights: [receiptHeight, separatorHeight, receiptHeight],
          body: [
            [buildReceiptCopy(data)],
            [buildReceiptSeparator(pageWidth)],
            [buildReceiptCopy(data)],
          ],
        },
        layout: noPaddingLayout(),
      },
    ],
    styles: {
      institution: { fontSize: 8.5, bold: true },
      subtitle: { fontSize: 7.5 },
      title: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 10, 0, 8] },
      receiptNumber: { fontSize: 9, bold: true, alignment: 'right' },
      amountBox: { fontSize: 11, bold: true, alignment: 'right' },
      label: { fontSize: 7.5, bold: true },
      value: { fontSize: 7.5 },
      labelCell: { fontSize: 7.5, bold: true, fillColor: '#eeeeee' },
      valueCell: { fontSize: 7.5, fillColor: '#eeeeee' },
      smallLabel: { fontSize: 7.5, bold: true },
      smallValue: { fontSize: 7.5 },
      date: { fontSize: 7.5, alignment: 'right', margin: [0, 10, 0, 0] },
      collectorTitle: { fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
      collectorName: { fontSize: 7.5, alignment: 'center', margin: [0, 1, 0, 0] },
    },
  };

  return documentDefinition as unknown as TDocumentDefinitions;
}

function buildReceiptSeparator(width: number) {
  return {
    margin: [0, 12, 0, 12],
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        lineWidth: 0.5,
        dash: { length: 3 },
        lineColor: '#777777',
      },
    ],
  };
}

function buildReceiptCopy(data: SalesReceiptData) {
  return {
    table: {
      widths: ['*'],
      heights: [360],
      body: [
        [
          {
            border: [true, true, true, true],
            margin: [14, 30, 14, 22],
            stack: [
              buildHeader(getSalesReceiptNumber(data), getSalesReceiptAmount(data)),
              { text: 'RECIBO OFICIAL', style: 'title' },
              {
                margin: [0, 8, 0, 0],
                columns: [
                  {
                    width: '*',
                    stack: [
                      buildLine('Recibimos de:', getSalesReceiptReceivedFrom(data)),
                      buildLine('La suma de:', getSalesReceiptLiteralAmount(data)),
                      {
                        margin: [0, 8, 0, 0],
                        table: {
                          widths: [95, '*'],
                          body: [
                              [
                                { text: 'Por concepto de:', style: 'labelCell' },
                                { text: getSalesReceiptConcept(data), style: 'valueCell' },
                              ],
                              [
                                { text: 'Forma de Pago:', style: 'labelCell' },
                                { text: getSalesReceiptPaymentType(data), style: 'valueCell' },
                              ],
                          ],
                        },
                        layout: lightTableLayout(),
                      },
                    ],
                  },
                  {
                    width: 145,
                    margin: [10, 30, 0, 0],
                    stack: [
                      buildSmallLine('Nro de Folder:', ''),
                      buildSmallLine('Nro.:', ''),
                      buildSmallLine('Banco:', getSalesReceiptBank(data)),
                    ],
                  },
                ],
              },
              { text: getSalesReceiptDate(data), style: 'date' },
              {
                margin: [0, 28, 0, 0],
                table: {
                  widths: ['*'],
                  body: [[{ text: '', border: [false, true, false, false] }]],
                },
                layout: 'noBorders',
              },
              { text: 'COBRADO POR', style: 'collectorTitle' },
              { text: getSalesReceiptReceptionist(data), style: 'collectorName' },
            ],
          },
        ],
      ],
    },
    layout: noPaddingLayout(),
    unbreakable: true,
  };
}

function buildHeader(receiptNumber: string, amount: string) {
  return {
    columns: [
      {
        width: '*',
        stack: [
          { text: 'MUTUAL DE SERVICIOS AL POLICIA', style: 'institution' },
          { text: '"MUSERPOL"', style: 'subtitle' },
        ],
      },
      {
        width: 150,
        stack: [
          { text: `N°       ${receiptNumber}`, style: 'receiptNumber' },
          {
            margin: [0, 8, 0, 0],
            table: {
              widths: ['*'],
              body: [[{ text: amount, style: 'amountBox', margin: [6, 4, 6, 4] }]],
            },
          },
        ],
      },
    ],
  };
}

function buildLine(label: string, value: string) {
  return {
    margin: [0, 5, 0, 0],
    columns: [
      { width: 95, text: label, style: 'label' },
      { width: '*', text: value, style: 'value' },
    ],
  };
}

function buildSmallLine(label: string, value: string) {
  return {
    margin: [0, 4, 0, 0],
    columns: [
      { width: 65, text: label, style: 'smallLabel' },
      { width: '*', text: value, style: 'smallValue' },
    ],
  };
}

function lightTableLayout() {
  return {
    hLineColor: () => '#777777',
    vLineColor: () => '#777777',
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 3,
    paddingBottom: () => 3,
  };
}

function noPaddingLayout() {
  return {
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
    hLineWidth: () => 0,
    vLineWidth: () => 0,
  };
}

function getSalesReceiptNumber(data: SalesReceiptData): string {
  return data.sale.code;
}

function getSalesReceiptAmount(data: SalesReceiptData): string {
  const symbol = data.currency.symbol;
  const normalizedSymbol = symbol?.toUpperCase() === 'BS' ? 'Bs' : (symbol ?? 'Bs');

  return `${normalizedSymbol}. ${data.voucher.total}`;
}

function getSalesReceiptLiteralAmount(data: SalesReceiptData): string {
  const [integerPart, decimalPart = '00'] = String(data.voucher.total).split('.');
  const amount = Number(integerPart);
  const cents = decimalPart.padEnd(2, '0').slice(0, 2);

  return `${numberToSpanish(amount)} ${cents}/100 Bolivianos`;
}

function getSalesReceiptConcept(data: SalesReceiptData): string {
  if (data.products.length === 0) {
    return '';
  }

  if (data.products.length === 1) {
    return data.products[0].name;
  }

  return 'Venta de productos varios';
}

function getSalesReceiptReceivedFrom(data: SalesReceiptData): string {
  return [
    data.principalCustomer.fullName,
    data.principalCustomer.identityCard,
  ]
    .filter(Boolean)
    .join(' - ');
}

function getSalesReceiptPaymentType(data: SalesReceiptData): string {
  return data.payment.type?.name ?? '';
}

function getSalesReceiptBank(data: SalesReceiptData): string {
  return data.voucher.paymentLocation ?? '';
}

function getSalesReceiptDate(data: SalesReceiptData): string {
  return formatSpanishDate(data.voucher.depositDate ?? data.sale.createdAt);
}

function getSalesReceiptReceptionist(data: SalesReceiptData): string {
  return data.sale.receptionist ?? '';
}

function numberToSpanish(value: number): string {
  if (value === 0) {
    return 'CERO';
  }

  if (value < 0 || value > 9999 || !Number.isInteger(value)) {
    return String(value).toUpperCase();
  }

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

  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];
  if (value < 30) return value === 20 ? 'VEINTE' : `VEINTI${units[value - 20]}`;
  if (value < 100) {
    const unit = value % 10;
    return unit === 0 ? tens[Math.floor(value / 10)] : `${tens[Math.floor(value / 10)]} Y ${units[unit]}`;
  }
  if (value === 100) return 'CIEN';
  if (value < 1000) {
    const rest = value % 100;
    return rest === 0
      ? hundreds[Math.floor(value / 100)]
      : `${hundreds[Math.floor(value / 100)]} ${numberToSpanish(rest)}`;
  }

  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  const prefix = thousands === 1 ? 'MIL' : `${numberToSpanish(thousands)} MIL`;

  return rest === 0 ? prefix : `${prefix} ${numberToSpanish(rest)}`;
}
