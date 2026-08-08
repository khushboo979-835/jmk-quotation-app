'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  FileDown, 
  Eye, 
  TrendingUp, 
  Scale, 
  Users, 
  Layers, 
  Loader2,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import HeaderSection from '../../components/HeaderSection';

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
  formData: any;
}

export default function AdminDashboard() {
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuotationRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch quotations on mount
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setQuotations(data.quotations || []);
        }
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Handle PDF re-download
  const handleRedownload = async (quote: QuotationRecord) => {
    setDownloadingId(quote.quotationNumber);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote.formData),
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
      const sanitizedName = quote.buyerName.replace(/\s+/g, '_');
      a.download = `JMK_Quotation_${sanitizedName}_${quote.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert('Error downloading PDF: ' + e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle deletion
  const handleDelete = async (quotationNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quotationNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/quotations?id=${encodeURIComponent(quotationNumber)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Quotation deleted successfully!');
          fetchQuotations();
          if (selectedQuote?.quotationNumber === quotationNumber) {
            setSelectedQuote(null);
          }
        } else {
          alert('Delete failed: ' + data.error);
        }
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Calculations for Metrics Cards
  const totalQuotations = quotations.length;
  const totalRevenue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const totalWeightTonnes = quotations.reduce((sum, q) => sum + (q.totalWeightKg || 0), 0) / 1000;
  const activeClients = Array.from(new Set(quotations.map(q => q.buyerName.trim().toLowerCase()))).length;

  // Search Filter
  const filteredQuotations = quotations.filter(q => {
    const term = searchQuery.toLowerCase();
    return (
      q.quotationNumber.toLowerCase().includes(term) ||
      q.buyerName.toLowerCase().includes(term) ||
      (q.buyerGstin || '').toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      <HeaderSection />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation / Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <a 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center border border-gray-200 cursor-pointer"
              title="Back to Quotation Creator"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <h1 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Admin Dashboard & Tracking</span>
              </h1>
              <p className="text-xs font-semibold text-gray-400">Manage saved invoices, logistics weights, and client records</p>
            </div>
          </div>

          <a 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Create New Quotation</span>
          </a>
        </div>

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Quotations */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Quotations</span>
              <span className="text-xl font-black text-slate-800">{totalQuotations}</span>
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
              <span className="text-xl font-black text-slate-800">
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Card 3: Total Weight */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Logistics Weight</span>
              <span className="text-xl font-black text-slate-800">
                {totalWeightTonnes.toFixed(2)} Tons
              </span>
            </div>
          </div>

          {/* Card 4: Active Clients */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Clients</span>
              <span className="text-xl font-black text-slate-800">{activeClients}</span>
            </div>
          </div>
        </div>

        {/* Database Search & Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-extrabold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span>Saved Quotations Database</span>
            </h2>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quote #, client, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-gray-700"
              />
            </div>
          </div>

          {/* Quotations Table */}
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span>Loading quotations from local database...</span>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs font-semibold">
              No quotation records found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/60 text-gray-500 font-extrabold uppercase tracking-wider border-b border-gray-200 select-none">
                  <tr>
                    <th className="py-3 px-4">Quotation ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4 text-right">Total Wt (KG)</th>
                    <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-250/50 bg-white font-semibold text-gray-750">
                  {filteredQuotations.map((quote) => (
                    <tr key={quote.quotationNumber} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-700">{quote.quotationNumber}</td>
                      <td className="py-3.5 px-4 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{quote.date}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-800 font-extrabold max-w-[200px] truncate" title={quote.buyerName}>
                        {quote.buyerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                        {quote.buyerGstin || <span className="text-gray-300">N/A</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {quote.totalWeightKg.toLocaleString('en-IN', { minimumFractionDigits: 1 })} KG
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-blue-900">
                        ₹{quote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 transition-all cursor-pointer flex items-center justify-center"
                            title="View Quote Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleRedownload(quote)}
                            disabled={downloadingId === quote.quotationNumber}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-100 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                            title="Re-download PDF Invoice"
                          >
                            {downloadingId === quote.quotationNumber ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(quote.quotationNumber)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-100 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Details Sidebar / Drawer Overlay */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in" onClick={() => setSelectedQuote(null)}>
            <div 
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between p-6 border-l border-slate-100 animate-slide-left overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Drawer Header */}
                <div className="flex justify-between items-start border-b border-gray-150 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-wide border border-blue-100 uppercase">
                      Quotation Record
                    </span>
                    <h3 className="text-lg font-black text-gray-800 mt-1">
                      {selectedQuote.quotationNumber}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedQuote(null)}
                    className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Details grid */}
                <div className="space-y-5">
                  {/* Buyer & Date */}
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Billing Customer</span>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{selectedQuote.buyerName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{selectedQuote.formData.buyer.address}</p>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 text-xs">
                      <div>
                        <span className="text-gray-400 block">GSTIN</span>
                        <span className="font-bold text-slate-700">{selectedQuote.buyerGstin || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Quotation Date</span>
                        <span className="font-bold text-slate-700">{selectedQuote.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Line Items Details ({selectedQuote.lineItems.length})</h5>
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs font-semibold">
                      {selectedQuote.lineItems.map((item, idx) => (
                        <div key={item.id || idx} className="p-3 bg-white flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                            <div className="font-bold text-slate-800 leading-tight truncate">{item.productName}</div>
                            <span className="text-[10px] text-gray-400 font-medium">HSN: {item.hsn} • Unit: {item.unit}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-slate-850 font-bold block">{item.quantity} {item.unit}</span>
                            <span className="text-blue-700 text-[10px] block">₹{item.rate}/{item.unit === 'KG' ? 'KG' : 'Pc'}</span>
                            <span className="text-slate-900 font-extrabold block mt-0.5">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs font-semibold text-slate-650">
                    <div className="flex justify-between">
                      <span>Taxable Value (Subtotal)</span>
                      <span className="text-slate-800">₹{selectedQuote.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Amount ({selectedQuote.formData.taxType === 'igst' ? 'IGST 18%' : 'CGST 9% + SGST 9%'})</span>
                      <span className="text-blue-700">₹{selectedQuote.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 text-sm font-bold text-slate-800">
                      <span>Grand Total (Taxes Incl.)</span>
                      <span className="text-blue-900 font-black">₹{selectedQuote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Logistics info */}
                  {selectedQuote.totalWeightKg > 0 && (
                    <div className="bg-amber-50/30 border border-amber-200/60 rounded-xl p-4 flex gap-3 items-center">
                      <Scale className="w-5 h-5 text-amber-700 flex-shrink-0" />
                      <div className="leading-tight text-xs font-semibold text-slate-700">
                        <span>Total logistics material weight:</span>
                        <div className="text-sm font-extrabold text-amber-800 mt-0.5">
                          {selectedQuote.totalWeightKg.toLocaleString('en-IN')} KG ({ (selectedQuote.totalWeightKg / 1000).toFixed(2) } Tonnes)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="mt-8 pt-4 border-t border-gray-150 flex flex-col gap-2">
                <button
                  onClick={() => handleRedownload(selectedQuote)}
                  disabled={downloadingId === selectedQuote.quotationNumber}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  {downloadingId === selectedQuote.quotationNumber ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF Invoice...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Download PDF Invoice</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (confirm('Delete this record?')) {
                      handleDelete(selectedQuote.quotationNumber);
                    }
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  Delete Quotation Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Simple custom inline Close Icon
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
