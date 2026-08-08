import { Item, HSNBreakupRow, TaxType } from '../types/quotation';

/**
 * Calculates row total: 
 * - If unit is 'KG': Total Weight (KG) * Rate (₹ per KG)
 * - If unit is 'PCS' or 'MTR': Quantity * Rate (₹ per Piece)
 */
export function calculateItemAmount(item: Item): number {
  const quantity = Number(item.quantity || 0);
  const rate = Number(item.rate || 0);
  const unit = (item.unit || '').toUpperCase();

  if (unit === 'KG') {
    const totalWeight = calculateItemWeight(item);
    return Number((totalWeight * rate).toFixed(2));
  }
  return Number((quantity * rate).toFixed(2));
}

/**
 * Calculates item weight: Weight = Unit Weight * Quantity
 */
export function calculateItemWeight(item: Item): number {
  const unitWeight = Number(item.unitWeightKg ?? item.unitWeight ?? 0);
  const quantity = Number(item.quantity || 0);
  return Number((quantity * unitWeight).toFixed(2));
}

/**
 * Calculates total weight of all items in the quotation
 */
export function calculateTotalWeight(items: Item[]): number {
  return Number(items.reduce((sum, it) => sum + calculateItemWeight(it), 0).toFixed(2));
}

/**
 * Calculates subtotal of the items (sum of item amounts)
 */
export function calculateSubtotal(items: Item[]): number {
  return Number(items.reduce((sum, it) => sum + calculateItemAmount(it), 0).toFixed(2));
}

/**
 * Calculates total taxes based on tax type
 */
export function calculateTaxAmounts(subtotal: number, taxType: TaxType) {
  if (taxType === 'igst') {
    const igst = Number((subtotal * 0.18).toFixed(2));
    return { igst, cgst: 0, sgst: 0, totalTax: igst };
  }
  const cgst = Number((subtotal * 0.09).toFixed(2));
  const sgst = Number((subtotal * 0.09).toFixed(2));
  return { igst: 0, cgst, sgst, totalTax: Number((cgst + sgst).toFixed(2)) };
}

/**
 * Groups taxable amounts dynamically by HSN/SAC code
 */
export function getHSNBreakup(items: Item[], taxType: TaxType): HSNBreakupRow[] {
  const byHSN: Record<string, number> = {};
  items.forEach((it) => {
    const amt = calculateItemAmount(it);
    byHSN[it.hsn] = (byHSN[it.hsn] || 0) + amt;
  });

  return Object.keys(byHSN).map((hsn) => {
    const taxableValue = Number(byHSN[hsn].toFixed(2));
    if (taxType === 'igst') {
      const igstAmount = Number((taxableValue * 0.18).toFixed(2));
      return { 
        hsn, 
        taxableValue, 
        igstRate: 18, 
        igstAmount, 
        totalTax: igstAmount 
      } as HSNBreakupRow;
    }
    const cgstAmount = Number((taxableValue * 0.09).toFixed(2));
    const sgstAmount = Number((taxableValue * 0.09).toFixed(2));
    return { 
      hsn, 
      taxableValue, 
      cgstRate: 9, 
      sgstRate: 9, 
      cgstAmount, 
      sgstAmount, 
      totalTax: Number((cgstAmount + sgstAmount).toFixed(2)) 
    } as HSNBreakupRow;
  });
}
