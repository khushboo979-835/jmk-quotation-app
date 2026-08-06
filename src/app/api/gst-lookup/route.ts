import { NextRequest, NextResponse } from 'next/server';
import { isValidGSTIN, getStateFromGSTIN } from '../../../utils/gstLookup';

// Mock database for specific test GSTINs
const GSTIN_DB: Record<string, { tradeName: string; legalName: string; building: string; street: string; location: string; pincode: string }> = {
  '10AAACJ3919M1Z8': {
    tradeName: 'Maurya Scaffolding & Construction',
    legalName: 'Maurya Scaffolding & Construction Private Limited',
    building: 'Plot No. 42A, Patliputra Industrial Area',
    street: 'Road No. 4',
    location: 'Patna',
    pincode: '800013',
  },
  '21ABCDE5555F1Z4': {
    tradeName: 'Kalinga Steel & Infrastructure',
    legalName: 'Kalinga Steel & Infrastructure Ltd',
    building: 'Shed No. 12, Chandaka Industrial Estate',
    street: 'Infocity Road',
    location: 'Bhubaneswar',
    pincode: '751024',
  },
  '27GHIJK9999L2Z9': {
    tradeName: 'Sahyadri Engineering Solutions',
    legalName: 'Sahyadri Engineering Solutions LLP',
    building: 'Gala No. 8, MIDC Industrial Area',
    street: 'Thane-Belapur Road',
    location: 'Navi Mumbai',
    pincode: '400705',
  },
  '07XYZAB1111C1Z0': {
    tradeName: 'Apex Scaffolding & Formwork Delhi',
    legalName: 'Apex Scaffolding Delhi Private Limited',
    building: 'Plot No. 185, Okhla Industrial Area',
    street: 'Phase III',
    location: 'New Delhi',
    pincode: '110020',
  }
};

// State capital and typical pincode mappings for dynamic mock generation
const STATE_CITY_MAPPING: Record<string, { city: string; pincode: string }> = {
  '01': { city: 'Srinagar', pincode: '190001' },
  '02': { city: 'Shimla', pincode: '171001' },
  '03': { city: 'Amritsar', pincode: '143001' },
  '04': { city: 'Chandigarh', pincode: '160001' },
  '05': { city: 'Dehradun', pincode: '248001' },
  '06': { city: 'Gurugram', pincode: '122001' },
  '07': { city: 'New Delhi', pincode: '110001' },
  '08': { city: 'Jaipur', pincode: '302001' },
  '09': { city: 'Lucknow', pincode: '226001' },
  '10': { city: 'Patna', pincode: '800001' },
  '11': { city: 'Gangtok', pincode: '737101' },
  '12': { city: 'Itanagar', pincode: '791111' },
  '13': { city: 'Kohima', pincode: '797001' },
  '14': { city: 'Imphal', pincode: '795001' },
  '15': { city: 'Aizawl', pincode: '796001' },
  '16': { city: 'Agartala', pincode: '799001' },
  '17': { city: 'Shillong', pincode: '793001' },
  '18': { city: 'Guwahati', pincode: '781001' },
  '19': { city: 'Kolkata', pincode: '700001' },
  '20': { city: 'Ranchi', pincode: '834001' },
  '21': { city: 'Bhubaneswar', pincode: '751001' },
  '22': { city: 'Raipur', pincode: '492001' },
  '23': { city: 'Bhopal', pincode: '462001' },
  '24': { city: 'Ahmedabad', pincode: '380001' },
  '25': { city: 'Daman', pincode: '396210' },
  '26': { city: 'Silvassa', pincode: '396230' },
  '27': { city: 'Mumbai', pincode: '400001' },
  '28': { city: 'Vijayawada', pincode: '520001' },
  '29': { city: 'Bengaluru', pincode: '560001' },
  '30': { city: 'Panaji', pincode: '403001' },
  '32': { city: 'Kochi', pincode: '682001' },
  '33': { city: 'Chennai', pincode: '600001' },
  '34': { city: 'Puducherry', pincode: '605001' },
  '35': { city: 'Port Blair', pincode: '744101' },
  '36': { city: 'Hyderabad', pincode: '500001' },
  '37': { city: 'Visakhapatnam', pincode: '530001' },
  '38': { city: 'Leh', pincode: '194101' }
};

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

    if (!isValidGSTIN(gstin)) {
      return NextResponse.json({ error: 'Invalid GSTIN format' }, { status: 400 });
    }

    const stateInfo = getStateFromGSTIN(gstin);
    if (!stateInfo) {
      return NextResponse.json({ error: 'Invalid or unknown GSTIN state code' }, { status: 400 });
    }

    // Check if we have predefined mock details in DB
    let details = GSTIN_DB[gstin];

    if (!details) {
      // Dynamic fallback based on state code
      const mapping = STATE_CITY_MAPPING[stateInfo.code] || { city: 'Capital City', pincode: '110001' };
      // Generate a realistic company name based on PAN letters
      const panLetters = gstin.substring(2, 7);
      const companyTypeSuffix = gstin.charAt(12) === '1' ? 'Pvt Ltd' : 'Enterprises';
      const tradeName = `${panLetters} Engineering & Scaffolding ${companyTypeSuffix}`;
      
      details = {
        tradeName,
        legalName: `${tradeName} Private Limited`,
        building: 'Plot No. ' + Math.floor(Math.random() * 500 + 1) + ', Phase ' + (Math.floor(Math.random() * 4) + 1),
        street: 'Industrial Development Area Road',
        location: mapping.city,
        pincode: mapping.pincode,
      };
    }

    const fullAddress = `${details.building}, ${details.street}, ${details.location}, ${stateInfo.name} - ${details.pincode}`;

    return NextResponse.json({
      success: true,
      tradeName: details.tradeName,
      legalName: details.legalName,
      gstin: gstin,
      address: {
        building: details.building,
        street: details.street,
        location: details.location,
        pincode: details.pincode,
        state: stateInfo.name,
        stateCode: stateInfo.code,
        formatted: fullAddress
      }
    });

  } catch (err: any) {
    console.error('GST lookup API error', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
