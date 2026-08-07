import { NextRequest, NextResponse } from 'next/server';
import { GST_STATE_CODES } from '../../../utils/gstStateCodes';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gstin = searchParams.get('gstin')?.trim().toUpperCase();

    if (!gstin) {
      return NextResponse.json(
        { success: false, error: 'GSTIN parameter is required' },
        { status: 400 }
      );
    }

    // Validate 15-character GSTIN regex
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstin)) {
      return NextResponse.json(
        { success: false, error: 'GSTIN not registered on Govt Portal' },
        { status: 400 }
      );
    }

    const host = process.env.RAPIDAPI_HOST || 'gst-verification-api-get-profile-returns-data.p.rapidapi.com';
    const key = process.env.RAPIDAPI_KEY || 'cfdaf1276emshb38e4dd3a148642p1d78f9jsn00678446e71c';
    const url = `https://${host}/v1/gstin/${gstin}/profile`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': host,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'GSTIN not registered on Govt Portal' });
    }

    const resData = await response.json();
    const data = resData.data || resData;

    if (!data) {
      return NextResponse.json({ success: false, error: 'GSTIN not registered on Govt Portal' });
    }

    // Extract companyName: data.tradeNam || data.lgnm || data.trade_name || data.legal_name
    const companyName = data.tradeNam || data.lgnm || data.trade_name || data.legal_name;
    if (!companyName) {
      return NextResponse.json({ success: false, error: 'GSTIN not registered on Govt Portal' });
    }

    // Extract address: Construct from data.pradr?.addr (bno, bnm, st, loc, dst, stcd, pncd)
    const rawAddr = data.pradr?.addr || data.pradr || data.address || {};
    const bno = rawAddr.bno || rawAddr.building_no || rawAddr.buildingNo || '';
    const bnm = rawAddr.bnm || rawAddr.building_name || '';
    const building = [bno, bnm].filter(Boolean).join(' ');

    const st = rawAddr.st || rawAddr.street || rawAddr.street_name || '';
    const loc = rawAddr.loc || rawAddr.locality || rawAddr.location || '';
    const dst = rawAddr.dst || rawAddr.district || rawAddr.city || '';
    const stcd = rawAddr.stcd || rawAddr.state_code || rawAddr.stateCode || rawAddr.state || '';
    const pncd = rawAddr.pncd || rawAddr.pincode || rawAddr.pin_code || rawAddr.pin || '';

    // Extract stateCode: First 2 digits of GSTIN
    const stateCode = gstin.substring(0, 2);
    const stateName = GST_STATE_CODES[stateCode] || stcd || 'Unknown State';

    const formattedAddress = [building, st, loc, dst, stateName, pncd]
      .map((val) => String(val || '').trim())
      .filter(Boolean)
      .join(', ');

    // Auto-Set Tax Mode
    const taxType = stateCode === '10' ? 'local' : 'interstate';

    return NextResponse.json({
      success: true,
      companyName,
      tradeName: companyName, // For backwards compatibility
      legalName: companyName, // For backwards compatibility
      taxType,
      phone: data.phone || data.mobNum || '',
      address: {
        building,
        street: st,
        location: loc,
        pincode: pncd,
        state: stateName,
        stateCode: stateCode,
        formatted: formattedAddress,
      },
    });
  } catch (err: any) {
    console.error('GST lookup API error:', err);
    return NextResponse.json({ success: false, error: 'GSTIN not registered on Govt Portal' });
  }
}
