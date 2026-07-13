export const buildReceiptFileName = (code: string | null | undefined): string => {
  const normalizedCode = String(code || 'sin-codigo').replace(/[^a-zA-Z0-9-_]/g, '');

  return `recibo-${normalizedCode}.pdf`;
};
