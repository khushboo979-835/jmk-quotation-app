import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ILineItem {
  id: string;
  name: string;
  category?: string;
  hsn: string;
  unit: string;
  quantity: number;
  unitWeightKg?: number;
  totalWeightKg?: number;
  rate: number;
  amount: number;
  photoUrl?: string;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  quotationDate: string;
  buyerName: string;
  buyerGstin?: string;
  contactPerson?: string;
  mobileNumber?: string;
  address?: string;
  stateCode?: string;
  totalWeightKg: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  lineItems: ILineItem[];
  formData: any;
  createdAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: String,
  hsn: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitWeightKg: Number,
  totalWeightKg: Number,
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  photoUrl: String
});

const QuotationSchema = new Schema<IQuotation>({
  quotationNumber: { type: String, required: true, unique: true },
  quotationDate: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerGstin: String,
  contactPerson: String,
  mobileNumber: String,
  address: String,
  stateCode: String,
  totalWeightKg: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  lineItems: [LineItemSchema],
  formData: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Quotation = models.Quotation || model<IQuotation>('Quotation', QuotationSchema);

export async function getNextQuotationNumberMongo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `JMK-${year}-${month}-`;

  const latestQuote = await Quotation.findOne({
    quotationNumber: { $regex: `^${prefix}` }
  })
  .sort({ quotationNumber: -1 })
  .exec();

  let nextSeq = 1;
  if (latestQuote) {
    const part = latestQuote.quotationNumber.replace(prefix, '');
    const seq = parseInt(part, 10);
    nextSeq = isNaN(seq) ? 1 : seq + 1;
  }

  const seqString = String(nextSeq).padStart(3, '0');
  return `${prefix}${seqString}`;
}

export default Quotation;
