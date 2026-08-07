import React, { useState } from 'react';
import { Buyer, TaxType } from '../types/quotation';
import { 
  Building2, 
  Phone, 
  User, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { GST_STATE_CODES } from '../utils/gstStateCodes';

type Props = {
  buyer: Buyer;
  onChangeBuyer: (buyer: Buyer) => void;
  taxType: TaxType;
  onChangeTaxType: (taxType: TaxType) => void;
};

export default function BuyerSection({ buyer, onChangeBuyer, taxType, onChangeTaxType }: Props) {
  const [isFetchingGst, setIsFetchingGst] = useState(false);
  const [badge, setBadge] = useState<{ type: 'green' | 'amber' | 'red'; text: string } | null>(null);

  const handleGSTLookup = async (gstinVal: string) => {
    const cleanGst = gstinVal.trim().toUpperCase().replace(/\s/g, '');
    
    // Validate 15-character GSTIN regex
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      setBadge({ type: 'red', text: "Invalid 15-digit GSTIN pattern." });
      return;
    }

    setIsFetchingGst(true);
    setBadge(null);

    try {
      const res = await fetch(`/api/gst-lookup?gstin=${cleanGst}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lookup failed');
      }

      const buyerStateCode = data.address?.stateCode || cleanGst.substring(0, 2);
      const stateName = data.address?.state || GST_STATE_CODES[buyerStateCode] || 'Unknown State';

      // Auto-set Tax Mode based on State Code
      // Seller state is 10 (Bihar)
      if (buyerStateCode === '10') {
        onChangeTaxType('local');
      } else {
        onChangeTaxType('igst');
      }

      if (data.isFallback) {
        // On Graceful Fallback: Show Amber Badge and preserve manually entered details
        onChangeBuyer({
          ...buyer,
          gstin: cleanGst,
          name: buyer.name || '',
          address: buyer.address || '',
        });

        setBadge({
          type: 'amber',
          text: `✓ Valid GSTIN Format (State Code ${buyerStateCode} - ${stateName}). Enter company name below.`
        });
      } else {
        // On API Success: Show Green Badge and auto-fill details
        const companyName = data.companyName || data.tradeName || data.legalName;
        const formattedAddress = data.address?.formatted || data.address || '';

        onChangeBuyer({
          name: companyName,
          address: formattedAddress,
          gstin: cleanGst,
          phone: data.phone || buyer.phone || '',
          contactPerson: buyer.contactPerson || '',
        });

        setBadge({
          type: 'green',
          text: `✓ Verified: ${companyName} (${stateName} - ${buyerStateCode === '10' ? 'Local CGST+SGST' : 'Interstate IGST'} applied)`
        });
      }
    } catch (err: any) {
      console.error('Client-side GST lookup fallback execution:', err);
      // Fallback: If external API returns 404/500/Quota Error, auto-detect state code and show amber badge
      const buyerStateCode = cleanGst.substring(0, 2);
      const stateName = GST_STATE_CODES[buyerStateCode] || 'Unknown State';

      if (buyerStateCode === '10') {
        onChangeTaxType('local');
      } else {
        onChangeTaxType('igst');
      }

      onChangeBuyer({
        ...buyer,
        gstin: cleanGst,
      });

      setBadge({
        type: 'amber',
        text: `✓ Valid GSTIN Format (State Code ${buyerStateCode} - ${stateName}). Enter company name below.`
      });
    } finally {
      setIsFetchingGst(false);
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
                  const val = e.target.value.toUpperCase().replace(/\s/g, '');
                  // Clear previous badges instantly upon typing
                  setBadge(null);
                  onChangeBuyer({ ...buyer, gstin: val });
                  // Proactive triggers on typing complete 15 chars and matching regex format
                  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                  if (val.length === 15 && gstRegex.test(val)) {
                    handleGSTLookup(val);
                  }
                }}
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/20"
              />
            </div>
            <button
              type="button"
              disabled={isFetchingGst}
              onClick={() => handleGSTLookup(buyer.gstin || '')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap min-w-[130px]"
            >
              {isFetchingGst ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Auto-Fill</span>
              )}
            </button>
          </div>

          {/* Feedback states (Inline Badges) */}
          {badge && (
            <div className={`mt-2.5 flex items-center gap-2 text-xs p-2.5 rounded-lg border font-semibold ${
              badge.type === 'green'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : badge.type === 'amber'
                ? 'text-amber-700 bg-amber-50 border-amber-100'
                : 'text-red-600 bg-red-50 border-red-100'
            }`}>
              {badge.type === 'red' ? (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              ) : badge.type === 'amber' ? (
                <HelpCircle className="w-4 h-4 text-amber-505 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
              <span>{badge.text}</span>
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

        {/* Contact Person Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contact Person Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="e.g. Rahul Singh"
              value={buyer.contactPerson || ''}
              onChange={(e) => onChangeBuyer({ ...buyer, contactPerson: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Mobile / Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile / Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="e.g. +91 74939 16194"
              value={buyer.phone || ''}
              onChange={(e) => onChangeBuyer({ ...buyer, phone: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Full Billing & Delivery Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Billing & Delivery Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              placeholder="Full billing and shipping address with state name and pincode..."
              rows={3}
              value={buyer.address}
              onChange={(e) => onChangeBuyer({ ...buyer, address: e.target.value })}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-sans bg-white"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
