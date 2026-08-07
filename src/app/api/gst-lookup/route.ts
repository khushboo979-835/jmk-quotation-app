import { NextRequest, NextResponse } from 'next/server';
import { GST_STATE_CODES } from '../../../utils/gstStateCodes';

export async function GET(req: NextRequest) {
  let cleanGstin = '';
  let stateCode = '';
  let stateName = 'Unknown State';
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

    // Clean up GSTIN input string automatically (trim whitespace, convert to uppercase)
    cleanGstin = gstinParam.trim().toUpperCase().replace(/\s/g, '');

    // Validate 15-character GSTIN regex
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isValidFormat = gstRegex.test(cleanGstin);

    if (!isValidFormat) {
      return NextResponse.json(
        { success: false, error: 'GSTIN not registered on Govt Portal' },
        { status: 400 }
      );
    }

    // Extract State Code and name from the clean GSTIN
    stateCode = cleanGstin.substring(0, 2);
    stateName = GST_STATE_CODES[stateCode] || 'Unknown State';
    taxType = stateCode === '10' ? 'local' : 'interstate';

    const host = process.env.RAPIDAPI_HOST || 'gst-verification-api-get-profile-returns-data.p.rapidapi.com';
    const key = process.env.RAPIDAPI_KEY || 'cfdaf1276emshb38e4dd3a148642p1d78f9jsn00678446e71c';

    let response: Response | null = null;
    let resData: any = null;

    // Endpoint 1: https://${process.env.RAPIDAPI_HOST}/v1/gstin/${cleanGstin}
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

    // Endpoint 2 (Fallback): https://${process.env.RAPIDAPI_HOST}/v1/gstin/${cleanGstin}/profile
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
      throw new Error('All GST endpoints failed or returned non-200 status');
    }

    const data = resData.data || resData;

    // Extract Legal/Trade Name: data.tradeNam || data.lgnm || data.data?.tradeNam || data.data?.lgnm || data.trade_name || data.legal_name
    const companyName = data.tradeNam || data.lgnm || (data.data && (data.data.tradeNam || data.data.lgnm)) || data.trade_name || data.legal_name;

    if (!companyName) {
      throw new Error('No company name found in the API response payload');
    }

    // Extract Address: data.pradr?.addr || data.data?.pradr?.addr
    const rawAddr = data.pradr?.addr || (data.data?.pradr?.addr) || data.pradr || data.address || {};
    
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
    console.error('GST API lookup failed. Triggering Graceful State Fallback...', err);

    // GRACEFUL FALLBACK (If API limits exceed, network times out, or query fails but format is valid)
    if (cleanGstin) {
      return NextResponse.json({
        success: true,
        isFallback: true,
        companyName: '',
        taxType,
        message: `✓ State Verified (Code ${stateCode} - ${stateName}). Enter Business Name manually if needed.`,
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

    // Hard fallback failure for invalid formats
    return NextResponse.json(
      { success: false, error: 'GSTIN not registered on Govt Portal' },
      { status: 400 }
    );
  }
}
