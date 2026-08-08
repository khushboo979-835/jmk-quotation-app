import fs from 'fs';
import path from 'path';
import { QuotationFormData } from '../types/quotation';

// Save database outside src/ to avoid hot reload triggers in Next.js Turbopack dev server
const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface QuotationRecord {
  id: string;
  quotationNumber: string;
  date: string;
  buyerName: string;
  buyerGstin: string;
  totalWeightKg: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  lineItems: any[];
  pdfGeneratedAt: string;
  formData: QuotationFormData; // Full form state to allow viewing details and re-downloading
}

function ensureDbExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ quotations: [] }, null, 2), 'utf-8');
  }
}

export function readDb(): { quotations: QuotationRecord[] } {
  try {
    ensureDbExists();
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return { quotations: [] };
  }
}

export function writeDb(data: { quotations: QuotationRecord[] }) {
  try {
    ensureDbExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local JSON database:', error);
  }
}

/**
 * Gets all quotation records
 */
export function getQuotations(): QuotationRecord[] {
  return readDb().quotations;
}

/**
 * Saves a quotation, auto-incrementing the ID if needed
 */
export function saveQuotation(formData: QuotationFormData): QuotationRecord {
  const db = readDb();
  
  // Clean up and compute totals
  const subtotal = Number(formData.items.reduce((sum, it) => sum + (it.amount || 0), 0).toFixed(2));
  
  // Calculate tax amounts
  let taxAmount = 0;
  if (formData.taxType === 'igst') {
    taxAmount = Number((subtotal * 0.18).toFixed(2));
  } else {
    const cgst = Number((subtotal * 0.09).toFixed(2));
    const sgst = Number((subtotal * 0.09).toFixed(2));
    taxAmount = Number((cgst + sgst).toFixed(2));
  }
  
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));
  const totalWeightKg = Number(formData.items.reduce((sum, it) => {
    const qty = it.quantity || 0;
    const unitWt = it.unitWeightKg ?? it.unitWeight ?? 0;
    return sum + (qty * unitWt);
  }, 0).toFixed(2));

  // Determine quotation number
  let finalQuotationNumber = formData.quotationNumber;
  
  // If the number is a generic placeholder or empty, generate the auto-increment one
  if (!finalQuotationNumber || finalQuotationNumber.startsWith('Q-') || finalQuotationNumber === 'AUTO') {
    finalQuotationNumber = getNextQuotationNumber();
  }

  // Create record
  const record: QuotationRecord = {
    id: formData.quotationNumber || `rec_${Math.random().toString(36).substring(2, 9)}`,
    quotationNumber: finalQuotationNumber,
    date: formData.quotationDate || new Date().toISOString().split('T')[0],
    buyerName: formData.buyer?.name || 'Walk-in Customer',
    buyerGstin: formData.buyer?.gstin || '',
    totalWeightKg,
    subtotal,
    taxAmount,
    grandTotal,
    lineItems: formData.items,
    pdfGeneratedAt: new Date().toISOString(),
    formData: {
      ...formData,
      quotationNumber: finalQuotationNumber
    }
  };
  
  // Use quotation number as ID for clean unique indexing
  record.id = finalQuotationNumber;

  // Check if we should update or append
  const existingIdx = db.quotations.findIndex(q => q.quotationNumber === finalQuotationNumber);
  if (existingIdx > -1) {
    db.quotations[existingIdx] = record;
  } else {
    db.quotations.push(record);
  }

  writeDb(db);
  return record;
}

/**
 * Deletes a quotation by its quotationNumber/ID
 */
export function deleteQuotation(quotationNumber: string): boolean {
  const db = readDb();
  const initialLen = db.quotations.length;
  db.quotations = db.quotations.filter(q => q.quotationNumber !== quotationNumber);
  
  if (db.quotations.length < initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

/**
 * Calculates the next sequential quotation number: JMK-${YEAR}-${MONTH}-${SEQ}
 */
export function getNextQuotationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  // Pad month to 2 digits
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const prefix = `JMK-${year}-${month}-`;
  const db = readDb();
  
  // Filter for matching prefix numbers
  const seqs = db.quotations
    .map(q => q.quotationNumber)
    .filter(num => num.startsWith(prefix))
    .map(num => {
      const part = num.replace(prefix, '');
      const seq = parseInt(part, 10);
      return isNaN(seq) ? 0 : seq;
    });

  const nextSeq = seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
  const seqString = String(nextSeq).padStart(3, '0');
  
  return `${prefix}${seqString}`;
}
