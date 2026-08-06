import { NextRequest, NextResponse } from 'next/server';
import { lookupGSTINDetails } from '../../../utils/gstLookup';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gstin = searchParams.get('gstin')?.trim().toUpperCase();

    if (!gstin) {
      return NextResponse.json({ error: 'GSTIN parameter is required' }, { status: 400 });
    }

    if (gstin.length !== 15) {
      return NextResponse.json({ error: 'GSTIN must be exactly 15 characters' }, { status: 400 });
    }

    const details = lookupGSTINDetails(gstin);

    if (!details) {
      return NextResponse.json({ error: 'Invalid GSTIN format or unknown state code' }, { status: 400 });
    }

    return NextResponse.json(details);
  } catch (err: any) {
    console.error('GST lookup API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 }
    );
  }
}
