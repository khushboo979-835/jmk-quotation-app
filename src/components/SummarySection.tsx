import React from 'react';
import { Item, TaxType } from '../types/quotation';
import { 
  calculateSubtotal, 
  calculateTaxAmounts, 
  calculateTotalWeight,
  getHSNBreakup 
} from '../utils/calculations';
import { numberToWords } from '../utils/numberToWords';
import { Scale, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';

type Props = {
  items: Item[];
  taxType: TaxType;
  onDownloadPDF?: () => void;
  isDownloading?: boolean;
};

export default function SummarySection({ items, taxType, onDownloadPDF, isDownloading = false }: Props) {
  const subtotal = calculateSubtotal(items);
  const taxes = calculateTaxAmounts(subtotal, taxType);
  const grandTotal = subtotal + taxes.totalTax;
  const totalWeight = calculateTotalWeight(items);
  const hsnBreakup = getHSNBreakup(items, taxType);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Calculations Summary Card */}
      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-150 space-y-3.5">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Quotation Summary</h4>
        
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Taxable Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Tax Group */}
          {taxType === 'igst' ? (
            <div className="flex justify-between text-sm font-medium text-gray-650">
              <span>IGST (18%)</span>
              <span className="text-blue-700">₹{taxes.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm font-medium text-gray-650">
                <span>CGST (9%)</span>
                <span className="text-blue-700">₹{taxes.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-650">
                <span>SGST (9%)</span>
                <span className="text-blue-700">₹{taxes.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          )}

          {/* Grand Total */}
          <div className="border-t border-gray-200/80 pt-3 flex justify-between items-baseline">
            <span className="font-extrabold text-gray-800 text-sm">Grand Total (Incl. Taxes)</span>
            <span className="font-black text-blue-900 text-lg">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Word Representation */}
        <div className="text-[11px] font-semibold text-blue-800 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100/50 leading-relaxed italic">
          <span>Amount in words:</span>
          <p className="mt-0.5 text-gray-700 font-bold not-italic">{numberToWords(grandTotal)}</p>
        </div>
      </div>

      {/* Logistics & Materials weight preview (if applicable) */}
      {totalWeight > 0 ? (
        <div className="bg-amber-50/20 border border-amber-200/60 rounded-xl p-4 flex gap-3 items-start">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg flex-shrink-0 border border-amber-100">
            <Scale className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-bold text-gray-700">Total Material Weight:</div>
            <div className="text-sm font-extrabold text-amber-800">
              {totalWeight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG ({ (totalWeight / 1000).toFixed(2) } Tonnes)
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Calculated logistics freight weight. Transportation rates are applied separately based on the total weight of {totalWeight.toFixed(2)} KG.
            </p>
          </div>
        </div>
      ) : null}

      {/* Live HSN breakup preview table inside summary */}
      {hsnBreakup.length > 0 ? (
        <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h5 className="font-bold text-xs text-gray-700 uppercase tracking-wide">Live HSN Tax Summary Matrix</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-gray-100/50 text-gray-500 font-bold border-b border-gray-150 uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3 text-center">HSN</th>
                  <th className="py-2 px-2 text-right">Taxable (₹)</th>
                  <th className="py-2 px-2 text-right">Tax Rate</th>
                  <th className="py-2 px-2 text-right">Tax Amt (₹)</th>
                  <th className="py-2 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-600">
                {hsnBreakup.map((row) => (
                  <tr key={row.hsn} className="hover:bg-gray-50/30">
                    <td className="py-2 px-3 text-center font-bold text-gray-700">{row.hsn}</td>
                    <td className="py-2 px-2 text-right">₹{row.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-2 text-right text-blue-600 font-bold">
                      {taxType === 'igst' ? 'IGST 18%' : 'CGST 9% + SGST 9%'}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold">₹{row.totalTax.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-right font-extrabold text-blue-905">
                      ₹{(row.taxableValue + row.totalTax).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {onDownloadPDF && (
        <div className="pt-2">
          <button
            onClick={onDownloadPDF}
            disabled={isDownloading || items.length === 0}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95 uppercase tracking-wider"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating GST Invoice PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate & Download GST Quotation PDF</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
