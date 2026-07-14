export const buildReceiptFileName = (code: string | null | undefined): string => {
  const normalizedCode = String(code || 'sin-codigo').replace(/[^a-zA-Z0-9-_]/g, '');

  return `recibo-${normalizedCode}.pdf`;
};

export const buildSalesListFileName = (
  dateFrom: string | null | undefined,
  dateTo: string | null | undefined,
): string => {
  const from = normalizeDateForFileName(dateFrom) ?? 'sin-fecha-inicio';
  const to = normalizeDateForFileName(dateTo) ?? 'sin-fecha-fin';

  return `reporte-ventas-${from}-${to}.pdf`;
};

function normalizeDateForFileName(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).replace(/[^a-zA-Z0-9-_]/g, '');
  }

  return date.toISOString().slice(0, 10);
}
