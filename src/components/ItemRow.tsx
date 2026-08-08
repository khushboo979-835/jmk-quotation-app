import React from 'react';
import { Item } from '../types/quotation';
import { Trash2, ExternalLink } from 'lucide-react';
import { calculateItemAmount, calculateItemWeight } from '../utils/calculations';

type Props = {
  item: Item;
  index: number;
  onChange?: (item: Item) => void;
  onRemove?: (id: string) => void;
  onProductClick?: (productId: string) => void;
};

export default function ItemRow({ item, index, onChange, onRemove, onProductClick }: Props) {
  const unitWeight = item.unitWeightKg ?? item.unitWeight ?? 0;
  const rowWeight = calculateItemWeight(item);
  const itemAmount = calculateItemAmount(item);

  const handleQtyChange = (val: string) => {
    const qty = Math.max(0, Number(val));
    const totalWt = Number((qty * unitWeight).toFixed(2));

    const updatedItem = {
      ...item,
      quantity: qty,
      totalWeight: totalWt
    };

    onChange?.({
      ...updatedItem,
      amount: calculateItemAmount(updatedItem)
    });
  };

  const handleRateChange = (val: string) => {
    const rate = Math.max(0, Number(val));
    const updatedItem = {
      ...item,
      rate
    };

    onChange?.({
      ...updatedItem,
      amount: calculateItemAmount(updatedItem)
    });
  };

  const handleUnitChange = (val: string) => {
    const updatedItem = {
      ...item,
      unit: val
    };

    onChange?.({
      ...updatedItem,
      amount: calculateItemAmount(updatedItem)
    });
  };

  // Determine rate placeholder prefix/suffix based on selected Unit
  const getRateLabel = () => {
    const unitUpper = (item.unit || '').toUpperCase();
    if (unitUpper === 'KG') return '₹/KG';
    if (unitUpper === 'MTR') return '₹/MTR';
    return '₹/Pc';
  };

  return (
    <>
      {/* Desktop Grid View (>= 640px) */}
      <div className="hidden sm:grid grid-cols-12 gap-2 items-center p-3 border-b hover:bg-gray-50/50 transition-colors">
        {/* Column 1: Index (#) */}
        <div className="col-span-1 text-center font-bold text-gray-500 text-xs">{index + 1}</div>
        
        {/* Column 2: Description of Goods (with size) */}
        <div className="col-span-3 flex flex-col min-w-0">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (item.productId) onProductClick?.(item.productId);
            }}
            className="text-left text-blue-700 hover:text-blue-900 font-bold hover:underline text-sm flex items-center gap-1 cursor-pointer truncate bg-transparent border-none p-0 outline-none focus:outline-none"
            title="Click to view details & specifications"
          >
            <span className="truncate">{item.productName}</span>
            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </button>
          {item.category && (
            <span className="text-[10px] text-gray-400 font-medium">
              {item.category}
            </span>
          )}
        </div>

        {/* Column 3: HSN Code */}
        <div className="col-span-1 text-center text-xs font-semibold text-gray-650">{item.hsn}</div>
        
        {/* Column 4: Unit (KG / PCS / MTR) Dropdown */}
        <div className="col-span-1 text-center">
          <select
            value={item.unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-1 px-1 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white cursor-pointer"
          >
            <option value="PCS">PCS</option>
            <option value="KG">KG</option>
            <option value="MTR">MTR</option>
          </select>
        </div>
        
        {/* Column 5: Quantity / Nos Input */}
        <div className="col-span-1 text-center">
          <input
            type="number"
            min={0}
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={(e) => handleQtyChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-1 px-1 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
        </div>

        {/* Column 6: Unit Wt (KG/Pc) (Readonly Badge) */}
        <div className="col-span-1 text-center">
          <span className="inline-block text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-250">
            {unitWeight.toFixed(1)} KG
          </span>
        </div>

        {/* Column 7: Total Weight (KG) = Quantity * UnitWt */}
        <div className="col-span-1 text-center">
          <span className="inline-block text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
            {rowWeight.toFixed(1)} KG
          </span>
        </div>
        
        {/* Column 8: Rate Input (₹ per KG or ₹ per Piece) */}
        <div className="col-span-1 text-right">
          <div className="relative">
            <span className="absolute left-1 top-2 text-[8px] font-extrabold text-gray-400 bg-gray-100/90 px-0.5 rounded uppercase">
              {getRateLabel()}
            </span>
            <input
              type="number"
              min={0}
              step="any"
              value={item.rate === 0 ? '' : item.rate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="pl-8 pr-1 py-1 w-full text-right border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
        </div>
        
        {/* Column 9: Line Amount (₹) */}
        <div className="col-span-1 text-right font-extrabold text-gray-800 text-sm">
          ₹{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        {/* Column 10: Action (Delete) */}
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
            <div className="flex flex-col min-w-0">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.productId) onProductClick?.(item.productId);
                }}
                className="text-left text-blue-700 hover:text-blue-900 font-bold hover:underline text-sm flex items-center gap-1 cursor-pointer break-words min-w-0 bg-transparent border-none p-0 outline-none focus:outline-none"
                title="Click to view details & specifications"
              >
                <span>{item.productName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </button>
              {item.category && (
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {item.category}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => onRemove?.(item.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Specs & HSN & Weight Badges */}
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="font-semibold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-150">
            HSN: {item.hsn}
          </span>
          <span className="font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
            Unit Wt: {unitWeight.toFixed(1)} kg
          </span>
          <span className="font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
            Total Wt: {rowWeight.toFixed(1)} kg
          </span>
        </div>

        {/* Inputs row for mobile */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Unit dropdown */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
            <select
              value={item.unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-1.5 px-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            >
              <option value="PCS">PCS</option>
              <option value="KG">KG</option>
              <option value="MTR">MTR</option>
            </select>
          </div>
          {/* Qty Input */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</label>
            <input
              type="number"
              min={0}
              value={item.quantity === 0 ? '' : item.quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-1.5 px-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
          {/* Rate Input */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rate</label>
            <div className="relative">
              <span className="absolute left-1.5 top-2 text-[8px] font-extrabold text-gray-400 uppercase">
                {getRateLabel()}
              </span>
              <input
                type="number"
                min={0}
                step="any"
                value={item.rate === 0 ? '' : item.rate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="pl-8 pr-1.5 py-1.5 w-full text-right border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
              />
            </div>
          </div>
        </div>

        {/* Subtotal Display */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subtotal</span>
          <span className="font-extrabold text-blue-900 text-sm">
            ₹{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </>
  );
}
