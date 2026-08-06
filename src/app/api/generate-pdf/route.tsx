import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import QuotationPDF from '../../../components/QuotationPDF';
import { QuotationFormData } from '../../../types/quotation';

export async function POST(req: NextRequest) {
  try {
    const data: QuotationFormData = await req.json();

    if (!data || !data.buyer || !data.items) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process and validate items to ensure amount and weight values are computed
    const items = data.items.map((it) => {
      const quantity = Number(it.quantity || 0);
      const rate = Number(it.rate || 0);
      const unitWeight = it.unitWeight ? Number(it.unitWeight || 0) : undefined;
      
      return {
        ...it,
        amount: Number((quantity * rate).toFixed(2)),
        unitWeight,
        totalWeight: unitWeight ? Number((quantity * unitWeight).toFixed(2)) : undefined,
      };
    });

    // Extract GSTIN state code (first 2 digits). If '10', set taxType = 'local', else taxType = 'igst'.
    const gstin = (data.buyer.gstin || '').trim();
    const stateCode = gstin.substring(0, 2);
    // If no GSTIN is provided, fall back to whatever taxType was selected on frontend, or default to local.
    const determinedTaxType = gstin.length >= 2 
      ? (stateCode === '10' ? 'local' : 'igst')
      : (data.taxType || 'local');

    const payload = { 
      ...data, 
      items,
      taxType: determinedTaxType 
    } as QuotationFormData;

    // Render PDF to buffer using @react-pdf/renderer
    const buffer = await renderToBuffer(<QuotationPDF data={payload} />);

    const buyerName = payload.buyer?.name || 'Estimate';
    const sanitizedBuyerName = buyerName.replace(/\s+/g, '_');
    const filename = `JMK_Quotation_${sanitizedBuyerName}_${payload.quotationNumber}.pdf`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('generate-pdf API route error:', err);
    return new NextResponse(JSON.stringify({ error: 'Failed to render quotation PDF', details: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
