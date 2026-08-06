export type TaxType = 'igst' | 'local';

export interface Product {
  id: string;
  name: string;
  category?: string;
  hsn: string;
  size?: string;
  unit: string;
  defaultRate: number;
  imageUrl?: string;
  photoUrl?: string;
  link?: string;
  unitWeight?: number;
}

export type CatalogueItem = Product;

export interface CatalogueCategory {
  category: string;
  products: Product[];
}

export interface Item {
  id: string; // unique line id
  productId?: string;
  category?: string;
  productName: string;
  hsn: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  photoUrl?: string;
  link?: string;
  unitWeight?: number;
  totalWeight?: number;
}

export interface Buyer {
  name: string;
  address: string;
  gstin?: string;
  email?: string;
  phone?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface QuotationFormData {
  quotationNumber: string;
  quotationDate: string;
  buyer: Buyer;
  items: Item[];
  taxType: TaxType;
  bankDetails: BankDetails;
  authorisedSignatory: string;
  deliveryNote?: string;
  modeTermsOfPayment?: string;
  referenceNo?: string;
  otherReferences?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}

export interface HSNBreakupRow {
  hsn: string;
  taxableValue: number;
  igstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  totalTax: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
}