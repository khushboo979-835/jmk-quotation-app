'use client';

import React, { useState, useEffect } from 'react';
import HeaderSection from '../components/HeaderSection';
import ItemRow from '../components/ItemRow';
import SummarySection from '../components/SummarySection';
import PDFPreviewModal from '../components/PDFPreviewModal';
import BuyerSection from '../components/BuyerSection';
import ProductCatalog from '../components/ProductCatalog';
import { QuotationFormData, Item as QuotationItem, TaxType, Buyer } from '../types/quotation';
import catalogue from '../data/catalogue';
import {
  FileText,
  Calendar,
  Hash,
  User,
  FileDown,
  Loader2,
  Landmark,
  Layers,
  Scale
} from 'lucide-react';
import { calculateTotalWeight } from '../utils/calculations';

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function Home() {
  const [quotationNumber, setQuotationNumber] = useState(`Q-${new Date().getFullYear()}-001`);
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState<Buyer>({ name: '', address: '', gstin: '', email: '', phone: '' });
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [taxType, setTaxType] = useState<TaxType>('igst');
  const [bankDetails] = useState({ bankName: 'HDFC Bank', accountNumber: '50200100070241', ifsc: 'HDFC0004927' });
  const [authorisedSignatory, setAuthorisedSignatory] = useState('JMK ENGINEERING & DEVELOPER');

  const [pdfUrl, setPdfUrl] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const addProduct = (productId: string) => {
    const p = catalogue.find((c) => c.id === productId);
    if (!p) return;
    
    // Check if item already exists to prevent duplicate rows (increment qty instead)
    const existingIndex = items.findIndex((item) => item.productId === p.id);
    if (existingIndex > -1) {
      const updated = [...items];
      const current = updated[existingIndex];
      const newQty = current.quantity + 1;
      updated[existingIndex] = {
        ...current,
        quantity: newQty,
        amount: Number((newQty * current.rate).toFixed(2)),
        totalWeight: current.unitWeight ? Number((newQty * current.unitWeight).toFixed(2)) : undefined,
      };
      setItems(updated);
      return;
    }

    const newItem: QuotationItem = {
      id: generateId(),
      productId: p.id,
      productName: p.name,
      hsn: p.hsn,
      unit: p.unit,
      quantity: 1,
      rate: p.defaultRate,
      amount: p.defaultRate * 1,
      photoUrl: p.photoUrl,
      link: p.photoUrl,
      unitWeight: p.unitWeight,
      totalWeight: p.unitWeight ? p.unitWeight : undefined,
    } as QuotationItem;
    setItems((s) => [...s, newItem]);
  };

  const removeItem = (id: string) => setItems((s) => s.filter((i) => i.id !== id));

  const updateItem = (it: QuotationItem) => setItems((s) => s.map((x) => (x.id === it.id ? it : x)));

  const handleGenerate = async () => {
    if (!buyer.name.trim()) {
      alert('Please enter or verify the Buyer Name.');
      return;
    }
    if (!buyer.address.trim()) {
      alert('Please enter the Billing Address.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product to the quotation.');
      return;
    }

    setIsGenerating(true);
    try {
      const payload: QuotationFormData = {
        quotationNumber,
        quotationDate,
        buyer,
        items,
        taxType,
        bankDetails,
        authorisedSignatory,
      };

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert('Failed to generate PDF: ' + err);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const bName = buyer.name || 'Estimate';
      const sanitizedBName = bName.replace(/\s+/g, '_');
      a.download = `JMK_Quotation_${sanitizedBName}_${quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert('Error generating PDF: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalQuotationWeight = calculateTotalWeight(items);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Banner Branding */}
      <HeaderSection />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Forms and Configuration */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Row 1: Quotation Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                <FileText className="text-blue-600 w-5 h-5" />
                <h2 className="font-bold text-gray-800 text-base">Quotation Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quotation Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      value={quotationNumber}
                      onChange={(e) => setQuotationNumber(e.target.value)}
                      placeholder="e.g. Q-2026-001"
                      className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quotation Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                      className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Authorised Signatory</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      value={authorisedSignatory}
                      onChange={(e) => setAuthorisedSignatory(e.target.value)}
                      placeholder="Signatory Name"
                      className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Buyer details Component */}
            <BuyerSection 
              buyer={buyer} 
              onChangeBuyer={setBuyer} 
              taxType={taxType} 
              onChangeTaxType={setTaxType} 
            />

            {/* Row 3: Bank & Seller Identity Details Block */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-3">
                <Landmark className="text-blue-600 w-5 h-5" />
                <h2 className="font-bold text-gray-800 text-base">JMK Company Details & Bank Account</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-medium">Bank Name</span>
                  <span className="font-bold text-gray-700">{bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Account Number</span>
                  <span className="font-bold text-gray-700">{bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">IFSC Code</span>
                  <span className="font-bold text-gray-700">{bankDetails.ifsc}</span>
                </div>
                <div className="pt-2 border-t border-gray-200/40 md:col-span-1">
                  <span className="text-gray-400 block font-medium">Seller GSTIN</span>
                  <span className="font-bold text-gray-700">10AHVPJ9876K1Z9</span>
                </div>
                <div className="pt-2 border-t border-gray-200/40 md:col-span-1">
                  <span className="text-gray-400 block font-medium">PAN Number</span>
                  <span className="font-bold text-gray-700">AHVPJ9876K</span>
                </div>
                <div className="pt-2 border-t border-gray-200/40 md:col-span-1">
                  <span className="text-gray-400 block font-medium">Registered Office</span>
                  <span className="font-bold text-gray-700">Patna, Bihar (10)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic E-commerce Product Catalog */}
          <div className="lg:col-span-5 h-[760px]">
            <ProductCatalog items={items} onAddProduct={addProduct} />
          </div>

        </div>

        {/* Bottom Section: Added Quotation Items Table */}
        <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="bg-blue-105 bg-blue-650 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-blue-600">
                {items.length}
              </span>
              <span>Quotation Line Items</span>
            </h3>
            
            <div className="flex items-center gap-4">
              {totalQuotationWeight > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Total Weight: {totalQuotationWeight.toLocaleString('en-IN')} kg</span>
                </div>
              )}
              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-red-650 hover:text-red-750 hover:underline font-bold transition-colors cursor-pointer text-red-600"
                >
                  Clear All Items
                </button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-200 rounded-lg">
              <Layers className="text-gray-300 w-12 h-12" />
              <span className="text-sm font-medium">Your active quotation is empty. Select products from the catalog.</span>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 bg-gray-50/80 p-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Description of Goods</div>
                <div className="col-span-1 text-center">HSN</div>
                <div className="col-span-1 text-center">Unit</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate (₹)</div>
                <div className="col-span-1 text-right">Amount (₹)</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-gray-200 bg-white">
                {items.map((it, idx) => (
                  <ItemRow key={it.id} item={it} index={idx} onChange={updateItem} onRemove={removeItem} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Totals, Tax Config & PDF Trigger */}
        {items.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Tax Settings Override */}
            <div className="md:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-700 text-sm border-b border-gray-100 pb-2">Tax Settings Override</h4>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quotation Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as TaxType)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="igst">Inter-State Transaction (IGST @ 18%)</option>
                  <option value="local">Intra-State / Local Transaction (CGST 9% + SGST 9%)</option>
                </select>
              </div>
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100/50 text-[11px] text-blue-700 font-semibold leading-relaxed">
                Note: Tax mode is automatically preset depending on the buyer's GSTIN state code, but can be overridden manually here if needed.
              </div>
            </div>

            {/* Right: Summary Box & Download Button */}
            <div className="md:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
              <SummarySection 
                items={items} 
                taxType={taxType} 
                onDownloadPDF={handleGenerate}
                isDownloading={isGenerating}
              />
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95 text-sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Generate & Download GST Quotation PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Modal for PDF Preview */}
        <PDFPreviewModal
          open={isModalOpen}
          pdfUrl={pdfUrl}
          quotationNumber={quotationNumber}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </main>
  );
}