export interface SalesReceiptResponse {
  error: boolean;
  message: string;
  data: SalesReceiptData | null;
}

export interface SalesReceiptData {
  sale: {
    id: number;  // no aparecera en el pdf
    code: string | null;
    state: string;
    personId: number;
    receptionist: string;
    createdAt: string | Date;
  };
  principalCustomer: {
    id: number; // no aparecera en el pdf
    fullName: string;
    identityCard: string;
    nup: number | null;
    isPolice: boolean;
  };
  payer: {
    customer: string | null;
    identityCardCustomer: string | null;
    isThirdParty: boolean;
  };
  voucher: {
    id: number; // no aparecera en el pdf
    receiptNumber: string | null;
    description: string | null;
    paymentTypeState: string;
    depositDate: string | Date | null;
    createdAt: string | Date;
    total: string;
  };
  payment: {
    type: {
      id: number; // no aparecera en el pdf
      name: string;
      shortened: string;
    } | null;
    location: {
      id: number; // no aparecera en el pdf
      name: string;
      code: string | null;
      eif: string | null;
    } | null;
  };
  currency: {
    symbol: string | null;
  };
  products: SalesReceiptProduct[];
  totals: {
    productCount: number;
    quantity: number;
    amount: string;
  };
  metadata?: {
    source?: string;
    generatedFor?: string;
    generatedAt?: string;
  };
}

export interface SalesReceiptProduct {
  id: number; // no aparecera en el pdf
  name: string;
  amount: number;
  price: string;
  total: string;
}
