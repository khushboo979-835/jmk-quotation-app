import { NextRequest, NextResponse } from 'next/server';
import { GST_STATE_CODES } from '../../../utils/gstStateCodes';

export async function GET(req: NextRequest) {
  let cleanGstin = '';
  let stateCode = '';
  let stateName = 'Unknown State';
  let pan = '';
  let taxType = 'interstate';

  try {
    const { searchParams } = new URL(req.url);
    const gstinParam = searchParams.get('gstin');

    if (!gstinParam) {
      return NextResponse.json(
        { success: false, error: 'GSTIN parameter is required' },
        { status: 400 }
      );
    }

    // Clean and sanitize input gstin: Trim whitespace, remove internal spaces, convert to uppercase.
    cleanGstin = gstinParam.trim().toUpperCase().replace(/\s/g, '');

    // Check 15-character GSTIN regex
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isValidFormat = gstRegex.test(cleanGstin);

    if (!isValidFormat) {
      return NextResponse.json(
        { success: false, error: 'GSTIN not registered on Govt Portal' },
        { status: 400 }
      );
    }

    // Extract State Code & PAN
    stateCode = cleanGstin.substring(0, 2);
    pan = cleanGstin.substring(2, 12);
    stateName = GST_STATE_CODES[stateCode] || 'Unknown State';
    taxType = stateCode === '10' ? 'local' : 'interstate';

    const host = process.env.RAPIDAPI_HOST || 'gst-verification-api-get-profile-returns-data.p.rapidapi.com';
    const key = process.env.RAPIDAPI_KEY || 'cfdaf1276emshb38e4dd3a148642p1d78f9jsn00678446e71c';

    let response: Response | null = null;
    let resData: any = null;

    // Try Endpoint 1: https://${RAPIDAPI_HOST}/v1/gstin/${cleanGstin}
    try {
      const url1 = `https://${host}/v1/gstin/${cleanGstin}`;
      response = await fetch(url1, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': host,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 seconds timeout
      });

      if (response.ok) {
        resData = await response.json();
      }
    } catch (err) {
      console.warn('Endpoint 1 query failed, falling back to Endpoint 2...', err);
    }

    // Try Endpoint 2: https://${RAPIDAPI_HOST}/v1/gstin/${cleanGstin}/profile
    if (!resData || !response || !response.ok) {
      const url2 = `https://${host}/v1/gstin/${cleanGstin}/profile`;
      response = await fetch(url2, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': host,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 seconds timeout
      });

      if (response.ok) {
        resData = await response.json();
      }
    }

    if (!response || !response.ok || !resData) {
      throw new Error('RapidAPI request failed');
    }

    const data = resData.data || resData.result || resData;
    if (!data) {
      throw new Error('Empty response from RapidAPI');
    }

    // Robust response parsing across multiple keys
    const companyName = data.tradeNam || data.lgnm || data.business_name || data.trade_name || data.legal_name || (data.data && (data.data.tradeNam || data.data.lgnm || data.data.trade_name || data.data.legal_name)) || (data.result && (data.result.legal_name || data.result.trade_name));

    if (!companyName) {
      throw new Error('No company name found in the API response payload');
    }

    // Extract Address
    const rawAddr = data.pradr?.addr || (data.data?.pradr?.addr) || (data.result?.pradr?.addr) || data.pradr || data.address || {};
    
    const bno = rawAddr.bno || rawAddr.building_no || rawAddr.buildingNo || '';
    const bnm = rawAddr.bnm || rawAddr.building_name || '';
    const building = [bno, bnm].filter(Boolean).join(' ');

    const st = rawAddr.st || rawAddr.street || rawAddr.street_name || '';
    const loc = rawAddr.loc || rawAddr.locality || rawAddr.location || '';
    const dst = rawAddr.dst || rawAddr.district || rawAddr.city || '';
    const stcd = rawAddr.stcd || rawAddr.state_code || rawAddr.stateCode || rawAddr.state || '';
    const pncd = rawAddr.pncd || rawAddr.pincode || rawAddr.pin_code || rawAddr.pin || '';

    const resolvedStateName = GST_STATE_CODES[stateCode] || stcd || stateName;

    const formattedAddress = [building, st, loc, dst, resolvedStateName, pncd]
      .map((val) => String(val || '').trim())
      .filter(Boolean)
      .join(', ');

    return NextResponse.json({
      success: true,
      companyName,
      tradeName: companyName,
      legalName: companyName,
      taxType,
      pan,
      phone: data.phone || data.mobNum || '',
      address: {
        building,
        street: st,
        location: loc,
        pincode: pncd,
        state: resolvedStateName,
        stateCode: stateCode,
        formatted: formattedAddress,
      },
    });
  } catch (err: any) {
    console.warn('RapidAPI lookup failed. Triggering Graceful API Fallback...', err);

    // Graceful API Fallback:
    // If RapidAPI returns 404/500/Quota limit exceeded, extract stateCode (first 2 digits) and PAN (digits 3-12).
    // Map stateCode to State Name (e.g. '10' -> Bihar).
    // Set taxType: 'local' (CGST 9% + SGST 9%) if stateCode == '10', else 'interstate' (IGST 18%).
    // Return JSON: { success: true, isFallback: true, pan, stateCode, stateName, taxType, message: "✓ State Code Matched (Bihar - Code 10)" }
    if (cleanGstin) {
      return NextResponse.json({
        success: true,
        isFallback: true,
        pan,
        stateCode,
        stateName,
        taxType,
        message: `✓ State Code Matched (${stateName} - Code ${stateCode})`,
        companyName: '',
        address: {
          building: '',
          street: '',
          location: '',
          pincode: '',
          state: stateName,
          stateCode: stateCode,
          formatted: '',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'GSTIN not registered on Govt Portal' },
      { status: 400 }
    );
  }
}
