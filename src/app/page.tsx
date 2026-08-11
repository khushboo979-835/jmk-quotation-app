'use client';

import React, { useState, useEffect } from 'react';
import HeaderSection from '../components/HeaderSection';
import ItemRow from '../components/ItemRow';
import SummarySection from '../components/SummarySection';
import PDFPreviewModal from '../components/PDFPreviewModal';
import BuyerSection from '../components/BuyerSection';
import ProductCatalog from '../components/ProductCatalog';
import { QuotationFormData, Item as QuotationItem, TaxType, Buyer, Product } from '../types/quotation';
import ProductModal from '../components/ProductModal';
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
import { calculateTotalWeight, calculateItemAmount, calculateItemWeight } from '../utils/calculations';

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function Home() {
  const [quotationNumber, setQuotationNumber] = useState(`Q-${new Date().getFullYear()}-001`);
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState<Buyer>({ name: '', address: '', gstin: '', phone: '', contactPerson: '' });
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [taxType, setTaxType] = useState<TaxType>('igst');
  const [bankDetails] = useState({ bankName: 'HDFC Bank', accountNumber: '50200100070241', ifsc: 'HDFC0004927' });
  const [authorisedSignatory, setAuthorisedSignatory] = useState('JMK ENGINEERING & DEVELOPER');

  // Tally advanced transport & delivery fields
  const [deliveryNote, setDeliveryNote] = useState('');
  const [modeTermsOfPayment, setModeTermsOfPayment] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [otherReferences, setOtherReferences] = useState('');
  const [buyerOrderNo, setBuyerOrderNo] = useState('');
  const [buyerOrderDate, setBuyerOrderDate] = useState('');
  const [dispatchDocNo, setDispatchDocNo] = useState('');
  const [deliveryNoteDate, setDeliveryNoteDate] = useState('');
  const [dispatchedThrough, setDispatchedThrough] = useState('');
  const [destination, setDestination] = useState('');
  const [termsOfDelivery, setTermsOfDelivery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [pdfModule, setPdfModule] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // State to track if we are in Edit Mode vs New Mode
  const [isEditing, setIsEditing] = useState(false);

  const computeNextQuotationNumber = (dbQuotations: any[], localQuotations: any[]) => {
    const currentYear = new Date().getFullYear();
    const allNumbers = new Set<string>();
    dbQuotations.forEach(q => {
      if (q.quotationNumber) allNumbers.add(q.quotationNumber);
    });
    localQuotations.forEach(q => {
      if (q.quotationNumber) allNumbers.add(q.quotationNumber);
    });
    
    const count = allNumbers.size;
    
    let maxSeq = 0;
    allNumbers.forEach(num => {
      const match = num.match(/^Q-(\d{4})-(\d+)$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const seq = parseInt(match[2], 10);
        if (year === currentYear && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    const nextSeq = Math.max(count + 1, maxSeq + 1);
    const padSeq = String(nextSeq).padStart(3, '0');
    return `Q-${currentYear}-${padSeq}`;
  };

  const fetchNextId = async () => {
    let dbQuotations: any[] = [];
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.quotations)) {
          dbQuotations = data.quotations;
        }
      }
    } catch (err) {
      console.error('Error fetching quotations for next ID:', err);
    }

    let localQuotations: any[] = [];
    try {
      const localQuotesStr = localStorage.getItem('jmk_offline_quotations');
      if (localQuotesStr) {
        localQuotations = JSON.parse(localQuotesStr);
      }
    } catch (err) {
      console.error('Error loading offline quotations for next ID:', err);
    }

    const nextId = computeNextQuotationNumber(dbQuotations, localQuotations);
    if (!isEditing) {
      setQuotationNumber(nextId);
    }
    return nextId;
  };

  // Load PDF module on client-side mount & handle load/edit initialize
  useEffect(() => {
    import('@react-pdf/renderer').then((module) => {
      setPdfModule(module);
    });

    const init = async () => {
      let dbQuotations: any[] = [];
      try {
        const res = await fetch('/api/quotations');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.quotations)) {
            dbQuotations = data.quotations;
          }
        }
      } catch (err) {
        console.error('Failed to fetch quotations on mount:', err);
      }

      let localQuotations: any[] = [];
      try {
        const localQuotesStr = localStorage.getItem('jmk_offline_quotations');
        if (localQuotesStr) {
          localQuotations = JSON.parse(localQuotesStr);
        }
      } catch (err) {
        console.error('Failed to read local quotations on mount:', err);
      }

      let loadedFromEdit = false;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const found = dbQuotations.find(q => q.quotationNumber === editId) || 
                        localQuotations.find(q => q.quotationNumber === editId);
          if (found && found.formData) {
            const fd = found.formData;
            setQuotationNumber(found.quotationNumber);
            setQuotationDate(fd.quotationDate || found.date || '');
            setBuyer(fd.buyer || { name: '', address: '', gstin: '', phone: '', contactPerson: '' });
            setItems(fd.items || found.lineItems || []);
            setTaxType(fd.taxType || 'igst');
            setDeliveryNote(fd.deliveryNote || '');
            setModeTermsOfPayment(fd.modeTermsOfPayment || '');
            setReferenceNo(fd.referenceNo || '');
            setOtherReferences(fd.otherReferences || '');
            setBuyerOrderNo(fd.buyerOrderNo || '');
            setBuyerOrderDate(fd.buyerOrderDate || '');
            setDispatchDocNo(fd.dispatchDocNo || '');
            setDeliveryNoteDate(fd.deliveryNoteDate || '');
            setDispatchedThrough(fd.dispatchedThrough || '');
            setDestination(fd.destination || '');
            setTermsOfDelivery(fd.termsOfDelivery || '');
            setIsEditing(true);
            loadedFromEdit = true;
          }
        }
      }

      if (!loadedFromEdit) {
        const nextId = computeNextQuotationNumber(dbQuotations, localQuotations);
        setQuotationNumber(nextId);
        setIsEditing(false);
      }
    };

    init();
  }, []);

  const handleCreateNewQuotation = async () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setBuyer({ name: '', address: '', gstin: '', phone: '', contactPerson: '' });
    setItems([]);
    setTaxType('igst');
    setDeliveryNote('');
    setModeTermsOfPayment('');
    setReferenceNo('');
    setOtherReferences('');
    setBuyerOrderNo('');
    setBuyerOrderDate('');
    setDispatchDocNo('');
    setDeliveryNoteDate('');
    setDispatchedThrough('');
    setDestination('');
    setTermsOfDelivery('');
    setSaveStatus('idle');
    setIsEditing(false);

    // Refresh sequence ID with updated counts
    let dbQuotations: any[] = [];
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.quotations)) {
          dbQuotations = data.quotations;
        }
      }
    } catch (err) {
      console.error('Error fetching quotations for next ID:', err);
    }

    let localQuotations: any[] = [];
    try {
      const localQuotesStr = localStorage.getItem('jmk_offline_quotations');
      if (localQuotesStr) {
        localQuotations = JSON.parse(localQuotesStr);
      }
    } catch (err) {
      console.error('Error loading offline quotations for next ID:', err);
    }

    const nextId = computeNextQuotationNumber(dbQuotations, localQuotations);
    setQuotationNumber(nextId);
  };

  // Pre-compile PDF in the background whenever data changes (debounced to avoid blocking main thread)
  useEffect(() => {
    if (!pdfModule || items.length === 0 || !buyer.name.trim()) {
      setPdfBlob(null);
      return;
    }

    const compilePdf = async () => {
      setPdfLoading(true);
      try {
        const payload: QuotationFormData = {
          quotationNumber,
          quotationDate,
          buyer,
          items,
          taxType,
          bankDetails,
          authorisedSignatory,
          deliveryNote,
          modeTermsOfPayment,
          referenceNo,
          otherReferences,
          buyerOrderNo,
          buyerOrderDate,
          dispatchDocNo,
          deliveryNoteDate,
          dispatchedThrough,
          destination,
          termsOfDelivery,
          logoPath: '/jmk-logo.png' // Use client public path
        };

        const QuotationPDF = (await import('../components/QuotationPDF')).default;
        const blob = await pdfModule.pdf(<QuotationPDF data={payload} />).toBlob();
        setPdfBlob(blob);
      } catch (err) {
        console.error('Error pre-compiling PDF:', err);
      } finally {
        setPdfLoading(false);
      }
    };

    const handler = setTimeout(compilePdf, 800);
    return () => clearTimeout(handler);
  }, [
    pdfModule,
    quotationNumber,
    quotationDate,
    buyer,
    items,
    taxType,
    bankDetails,
    authorisedSignatory,
    deliveryNote,
    modeTermsOfPayment,
    referenceNo,
    otherReferences,
    buyerOrderNo,
    buyerOrderDate,
    dispatchDocNo,
    deliveryNoteDate,
    dispatchedThrough,
    destination,
    termsOfDelivery
  ]);

  // Reset save status on form input changes to represent "dirty" state
  useEffect(() => {
    setSaveStatus('idle');
  }, [
    quotationNumber,
    quotationDate,
    buyer,
    items,
    taxType,
    deliveryNote,
    modeTermsOfPayment,
    referenceNo,
    otherReferences,
    buyerOrderNo,
    buyerOrderDate,
    dispatchDocNo,
    deliveryNoteDate,
    dispatchedThrough,
    destination,
    termsOfDelivery
  ]);

  const handleGenerateAndSave = async () => {
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
    setSaveStatus('saving');

    const currentPayload: QuotationFormData = {
      quotationNumber,
      quotationDate,
      buyer,
      items,
      taxType,
      bankDetails,
      authorisedSignatory,
      deliveryNote,
      modeTermsOfPayment,
      referenceNo,
      otherReferences,
      buyerOrderNo,
      buyerOrderDate,
      dispatchDocNo,
      deliveryNoteDate,
      dispatchedThrough,
      destination,
      termsOfDelivery,
      logoPath: '/jmk-logo.png'
    };

    // 1. Instantly trigger client-side PDF download using pre-compiled blob or compile on-demand
    try {
      let downloadBlob = pdfBlob;

      if (!downloadBlob || pdfLoading) {
        // If not pre-compiled, generate on-demand client-side
        if (pdfModule) {
          const QuotationPDF = (await import('../components/QuotationPDF')).default;
          downloadBlob = await pdfModule.pdf(<QuotationPDF data={currentPayload} />).toBlob();
        } else {
          // If module is not loaded, load and compile
          const module = await import('@react-pdf/renderer');
          const QuotationPDF = (await import('../components/QuotationPDF')).default;
          downloadBlob = await module.pdf(<QuotationPDF data={currentPayload} />).toBlob();
        }
      }

      if (downloadBlob) {
        const url = window.URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.href = url;
        const bName = buyer.name || 'Estimate';
        const sanitizedBName = bName.replace(/\s+/g, '_');
        a.download = `JMK_Quotation_${sanitizedBName}_${quotationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to create PDF blob');
      }
    } catch (pdfErr) {
      console.error('Client PDF download failed, falling back to server route:', pdfErr);
      try {
        const res = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPayload),
        });
        if (!res.ok) throw new Error('Server PDF route failed');
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
      } catch (fallbackErr: any) {
        setSaveStatus('error');
        alert('Error generating PDF: ' + fallbackErr.message);
        setIsGenerating(false);
        return;
      }
    }

    // 2. Save to localStorage immediately as an offline instant fallback before network execution
    const subtotal = Number(items.reduce((sum, it) => sum + (it.amount || 0), 0).toFixed(2));
    let taxAmount = 0;
    if (taxType === 'igst') {
      taxAmount = Number((subtotal * 0.18).toFixed(2));
    } else {
      const cgst = Number((subtotal * 0.09).toFixed(2));
      const sgst = Number((subtotal * 0.09).toFixed(2));
      taxAmount = Number((cgst + sgst).toFixed(2));
    }
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));
    const totalWeightKg = Number(items.reduce((sum, it) => {
      const qty = it.quantity || 0;
      const unitWt = it.unitWeightKg ?? it.unitWeight ?? 0;
      return sum + (qty * unitWt);
    }, 0).toFixed(2));

    const offlineRecord = {
      id: quotationNumber,
      quotationNumber,
      date: quotationDate,
      buyerName: buyer.name,
      buyerGstin: buyer.gstin || '',
      totalWeightKg,
      subtotal,
      taxAmount,
      grandTotal,
      lineItems: items,
      pdfGeneratedAt: new Date().toISOString(),
      formData: currentPayload
    };

    try {
      const localQuotesStr = localStorage.getItem('jmk_offline_quotations');
      const localQuotes = localQuotesStr ? JSON.parse(localQuotesStr) : [];
      // Remove any duplicate key
      const filteredQuotes = localQuotes.filter((q: any) => q.quotationNumber !== quotationNumber);
      filteredQuotes.unshift(offlineRecord);
      localStorage.setItem('jmk_offline_quotations', JSON.stringify(filteredQuotes));
      setSaveStatus('success');
    } catch (localErr) {
      console.error('Error saving to localStorage:', localErr);
    }

    setIsGenerating(false);

    // 3. Simultaneously fire a non-blocking asynchronous POST request to /api/quotations in the background
    fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPayload),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.record) {
            // Update client state and localStorage if final number is different
            const finalNum = data.record.quotationNumber;
            if (finalNum !== quotationNumber) {
              setQuotationNumber(finalNum);
              try {
                const localQuotesStr = localStorage.getItem('jmk_offline_quotations');
                if (localQuotesStr) {
                  const localQuotes = JSON.parse(localQuotesStr);
                  const recordIdx = localQuotes.findIndex((q: any) => q.quotationNumber === quotationNumber);
                  if (recordIdx > -1) {
                    localQuotes[recordIdx].quotationNumber = finalNum;
                    localQuotes[recordIdx].id = finalNum;
                    localQuotes[recordIdx].formData.quotationNumber = finalNum;
                    localStorage.setItem('jmk_offline_quotations', JSON.stringify(localQuotes));
                  }
                }
              } catch (localErr) {
                console.error('Failed to update localStorage index:', localErr);
              }
            }
          }
        } else {
          console.error('Background database save failed:', res.statusText);
        }
        // Refresh next ID in the background if we were not in edit mode
        if (!isEditing) {
          fetchNextId();
        }
      })
      .catch((err) => {
        console.error('Background database sync network error:', err);
      });
  };

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
      const unitWeight = current.unitWeightKg ?? current.unitWeight ?? 0;
      
      const updatedItem = {
        ...current,
        quantity: newQty,
        totalWeight: Number((newQty * unitWeight).toFixed(2)),
      };
      
      updated[existingIndex] = {
        ...updatedItem,
        amount: calculateItemAmount(updatedItem),
      };
      setItems(updated);
      return;
    }

    const unitWeight = p.unitWeightKg ?? p.unitWeight ?? 0;
    const newItem: QuotationItem = {
      id: generateId(),
      productId: p.id,
      productName: p.name,
      hsn: p.hsn,
      unit: p.unit,
      quantity: 1,
      rate: p.defaultRate,
      amount: 0,
      photoUrl: p.photoUrl,
      link: p.photoUrl,
      unitWeight: unitWeight,
      unitWeightKg: unitWeight,
      totalWeight: unitWeight ? unitWeight : undefined,
    } as QuotationItem;

    newItem.amount = calculateItemAmount(newItem);
    setItems((s) => [...s, newItem]);
  };

  const removeItem = (id: string) => setItems((s) => s.filter((i) => i.id !== id));

  const updateItem = (it: QuotationItem) => setItems((s) => s.map((x) => (x.id === it.id ? it : x)));



  const totalQuotationWeight = calculateTotalWeight(items);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Banner Branding */}
      <HeaderSection />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            <span className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">JMK Quotation System v2.1</span>
            {isEditing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-250 text-amber-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Editing Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNewQuotation}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-250 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>+ Create New Quotation</span>
            </button>
            <a 
              href="/admin"
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Go to Admin Dashboard</span>
            </a>
          </div>
        </div>
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

            {/* Row 2.5: Collapsible Advanced Tally Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full font-bold text-gray-800 text-base focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                  <span>Transport & Dispatch Details (Tally Layout)</span>
                </div>
                <span className="text-xs text-blue-600 font-bold hover:underline">
                  {showAdvanced ? 'Hide Details ▲' : 'Show Details ▼'}
                </span>
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-150 transition-all duration-300">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Delivery Note</label>
                    <input
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g. Del-909"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mode / Terms of Payment</label>
                    <input
                      value={modeTermsOfPayment}
                      onChange={(e) => setModeTermsOfPayment(e.target.value)}
                      placeholder="e.g. 100% Advance"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reference No. & Date</label>
                    <input
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="e.g. Ref-123, 04-Aug-2026"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Other References</label>
                    <input
                      value={otherReferences}
                      onChange={(e) => setOtherReferences(e.target.value)}
                      placeholder="e.g. Email request"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Buyer's Order No.</label>
                    <input
                      value={buyerOrderNo}
                      onChange={(e) => setBuyerOrderNo(e.target.value)}
                      placeholder="e.g. PO-8876"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Order Date</label>
                    <input
                      type="date"
                      value={buyerOrderDate}
                      onChange={(e) => setBuyerOrderDate(e.target.value)}
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Dispatch Doc No.</label>
                    <input
                      value={dispatchDocNo}
                      onChange={(e) => setDispatchDocNo(e.target.value)}
                      placeholder="e.g. Lorry No. BR01X1234"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Delivery Note Date</label>
                    <input
                      type="date"
                      value={deliveryNoteDate}
                      onChange={(e) => setDeliveryNoteDate(e.target.value)}
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Dispatched through</label>
                    <input
                      value={dispatchedThrough}
                      onChange={(e) => setDispatchedThrough(e.target.value)}
                      placeholder="e.g. V-Trans Logistics"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Destination</label>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Project Site, Patna"
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 font-semibold text-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Terms of Delivery</label>
                    <textarea
                      rows={2}
                      value={termsOfDelivery}
                      onChange={(e) => setTermsOfDelivery(e.target.value)}
                      placeholder="e.g. Ex-Patna yard. Loading charges extra..."
                      className="px-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/20 resize-none font-sans font-semibold text-gray-700"
                    />
                  </div>
                </div>
              )}
            </div>

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
                  <span className="font-bold text-gray-700">10BIEPD2766D2ZX</span>
                </div>
                <div className="pt-2 border-t border-gray-200/40 md:col-span-1">
                  <span className="text-gray-400 block font-medium">PAN Number</span>
                  <span className="font-bold text-gray-700">BIEPD2766D</span>
                </div>
                <div className="pt-2 border-t border-gray-200/40 md:col-span-1">
                  <span className="text-gray-400 block font-medium">Registered Office</span>
                  <span className="font-bold text-gray-700">Jakariyapur, Patna, Bihar (10)</span>
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
                <div className="col-span-3">Description of Goods</div>
                <div className="col-span-1 text-center">HSN</div>
                <div className="col-span-1 text-center">Unit</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-1 text-center">Unit Wt (KG)</div>
                <div className="col-span-1 text-center">Total Wt (KG)</div>
                <div className="col-span-1 text-right">Rate (₹)</div>
                <div className="col-span-1 text-right">Amount (₹)</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-gray-200 bg-white">
                {items.map((it, idx) => (
                  <ItemRow 
                    key={it.id} 
                    item={it} 
                    index={idx} 
                    onChange={updateItem} 
                    onRemove={removeItem} 
                    onProductClick={(prodId) => {
                      const prod = catalogue.find(p => p.id === prodId);
                      if (prod) setSelectedProduct(prod);
                    }}
                  />
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
                onDownloadPDF={handleGenerateAndSave}
                isDownloading={isGenerating}
                saveStatus={saveStatus}
              />
              
              <div className="mt-6 pt-4 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Inline Status Badge */}
                <div>
                  {saveStatus === 'success' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>✓ PDF Downloaded & Auto-Saved to Database</span>
                    </span>
                  )}
                  {saveStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-150 text-blue-800 text-xs font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Syncing with Cloud Database...</span>
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                      <span>⚠ Offline Fallback: Saved to Local Storage</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleGenerateAndSave}
                  disabled={isGenerating || items.length === 0}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white font-extrabold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95 text-sm uppercase tracking-wider font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Generate & Download GST Quotation PDF</span>
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

        {/* Modal for Product Specs Details */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
    </main>
  );
}