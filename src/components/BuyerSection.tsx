import React, { useState } from 'react';
import { Buyer, TaxType } from '../types/quotation';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

type Props = {
  buyer: Buyer;
  onChangeBuyer: (buyer: Buyer) => void;
  taxType: TaxType;
  onChangeTaxType: (taxType: TaxType) => void;
};

export default function BuyerSection({ buyer, onChangeBuyer, taxType, onChangeTaxType }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGSTLookup = async (gstinVal: string) => {
    const cleanGst = gstinVal.trim().toUpperCase();
    if (cleanGst.length !== 15) {
      setError('GSTIN must be exactly 15 characters long.');
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/gst-lookup?gstin=${cleanGst}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to lookup GSTIN details.');
      }

      if (data.success) {
        // Pre-fill Buyer information
        const companyName = data.tradeName || data.legalName;
        const formattedAddress = data.address.formatted;
        
        onChangeBuyer({
          name: companyName,
          address: formattedAddress,
          gstin: cleanGst,
          email: data.email || buyer.email || '',
          phone: data.phone || buyer.phone || '',
        });

        // Auto-set Tax Mode based on State Code
        // Seller state is 10 (Bihar)
        const buyerStateCode = data.address.stateCode;
        if (buyerStateCode === '10') {
          onChangeTaxType('local');
          setSuccess(`Verified: ${companyName} (Bihar - Local CGST+SGST applied)`);
        } else {
          onChangeTaxType('igst');
          setSuccess(`Verified: ${companyName} (${data.address.state} - Interstate IGST applied)`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="text-blue-600 w-5 h-5" />
          <h2 className="font-bold text-gray-800 text-base">Buyer / Client Configuration</h2>
        </div>
        <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>JMK Local State Code: 10 (Bihar)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 15-Digit GSTIN Input (Verification Trigger) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>GSTIN Number (15-Digit)</span>
            <span className="text-[10px] text-gray-400 lowercase font-medium flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-gray-300" />
              Try 10AAACJ3919M1Z8 (Bihar) or 21ABCDE5555F1Z4 (Odisha)
            </span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                placeholder="Enter 15-character GSTIN (e.g. 10AAACJ3919M1Z8)"
                value={buyer.gstin || ''}
                maxLength={15}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  onChangeBuyer({ ...buyer, gstin: val });
                  // Proactive triggers on typing complete 15 chars
                  if (val.length === 15) {
                    handleGSTLookup(val);
                  }
                }}
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/20"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGSTLookup(buyer.gstin || '')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Auto-Fill</span>
              )}
            </button>
          </div>

          {/* Feedback states */}
          {error && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Company Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company / Buyer Name *</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="e.g. ABC Construction Pvt Ltd"
              value={buyer.name}
              onChange={(e) => onChangeBuyer({ ...buyer, name: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="e.g. +91 98765 43210"
              value={buyer.phone || ''}
              onChange={(e) => onChangeBuyer({ ...buyer, phone: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="e.g. procurement@buyer.com"
              value={buyer.email || ''}
              onChange={(e) => onChangeBuyer({ ...buyer, email: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Billing Address Textarea */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Billing Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              placeholder="Full billing and shipping address with state name and pincode..."
              rows={2}
              value={buyer.address}
              onChange={(e) => onChangeBuyer({ ...buyer, address: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-sans"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
