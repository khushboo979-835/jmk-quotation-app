import React from 'react';
import { Item } from '../types/quotation';
import { Trash2, ExternalLink } from 'lucide-react';
import { calculateItemAmount, calculateItemWeight } from '../utils/calculations';

type Props = {
  item: Item;
  index: number;
  onChange?: (item: Item) => void;
  onRemove?: (id: string) => void;
};

export default function ItemRow({ item, index, onChange, onRemove }: Props) {
  const hasWeight = item.unitWeight && item.unitWeight > 0;
  const rowWeight = calculateItemWeight(item);

  const handleQtyChange = (val: string) => {
    const qty = Math.max(0, Number(val));
    const amt = Number((qty * item.rate).toFixed(2));
    const totalWt = item.unitWeight ? Number((qty * item.unitWeight).toFixed(2)) : undefined;

    onChange?.({
      ...item,
      quantity: qty,
      amount: amt,
      totalWeight: totalWt
    });
  };

  const handleRateChange = (val: string) => {
    const rate = Math.max(0, Number(val));
    const amt = Number((item.quantity * rate).toFixed(2));

    onChange?.({
      ...item,
      rate,
      amount: amt
    });
  };

  return (
    <>
      {/* Desktop Grid View (>= 640px) */}
      <div className="hidden sm:grid grid-cols-12 gap-2 items-center p-3 border-b hover:bg-gray-50/50 transition-colors">
        <div className="col-span-1 text-center font-semibold text-gray-500 text-xs">{index + 1}</div>
        
        {/* Description column with active links and weight badges */}
        <div className="col-span-4 flex flex-col">
          <a 
            href={item.photoUrl || item.link} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-700 hover:text-blue-900 font-bold hover:underline text-sm flex items-center gap-1 cursor-pointer"
          >
            <span>{item.productName}</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          
          {hasWeight ? (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150">
                Unit Wt: {item.unitWeight} kg
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                Total Wt: {rowWeight.toLocaleString('en-IN')} kg
              </span>
            </div>
          ) : null}
        </div>

        {/* HSN */}
        <div className="col-span-1 text-center text-xs font-semibold text-gray-650">{item.hsn}</div>
        
        {/* Unit */}
        <div className="col-span-1 text-center text-xs font-medium text-gray-500">{item.unit}</div>
        
        {/* Qty Input */}
        <div className="col-span-1 text-center">
          <input
            type="number"
            min={0}
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={(e) => handleQtyChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-1 px-1.5 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
        </div>
        
        {/* Rate Input */}
        <div className="col-span-2 text-right">
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-gray-400">₹</span>
            <input
              type="number"
              min={0}
              value={item.rate === 0 ? '' : item.rate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="pl-5 pr-2 py-1 w-full text-right border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
        </div>
        
        {/* Amount Display */}
        <div className="col-span-1 text-right font-extrabold text-gray-800 text-sm">
          ₹{calculateItemAmount(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        {/* Action Button */}
        <div className="col-span-1 text-center">
          <button 
            onClick={() => onRemove?.(item.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Card View (< 640px) */}
      <div className="block sm:hidden p-4 border-b hover:bg-gray-50/50 transition-colors space-y-3 bg-white">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">#{index + 1}</span>
            <a 
              href={item.photoUrl || item.link} 
              target="_blank" 
              rel="noreferrer" 
              className="text-blue-700 hover:text-blue-900 font-bold hover:underline text-sm flex items-center gap-1 cursor-pointer break-words min-w-0"
            >
              <span>{item.productName}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </a>
          </div>
          <button 
            onClick={() => onRemove?.(item.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Specs & HSN & Unit row */}
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="font-semibold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150">
            HSN: {item.hsn}
          </span>
          <span className="font-semibold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150">
            Unit: {item.unit}
          </span>
          {hasWeight ? (
            <>
              <span className="font-semibold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150">
                Unit Wt: {item.unitWeight} kg
              </span>
              <span className="font-bold bg-blue-50/50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                Total Wt: {rowWeight.toLocaleString('en-IN')} kg
              </span>
            </>
          ) : null}
        </div>

        {/* Inputs (Qty & Rate) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</label>
            <input
              type="number"
              min={0}
              value={item.quantity === 0 ? '' : item.quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-1.5 px-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rate</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-400">₹</span>
              <input
                type="number"
                min={0}
                value={item.rate === 0 ? '' : item.rate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="pl-5 pr-2 py-1.5 w-full text-right border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subtotal</span>
          <span className="font-extrabold text-blue-900 text-sm">
            ₹{calculateItemAmount(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </>
  );
}
