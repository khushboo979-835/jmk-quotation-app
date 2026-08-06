export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh'
};

// State capitals and typical pincodes for dynamic address generation
export const STATE_CITY_MAPPING: Record<string, { city: string; pincode: string }> = {
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
  '31': { city: 'Kavaratti', pincode: '682555' },
  '32': { city: 'Kochi', pincode: '682001' },
  '33': { city: 'Chennai', pincode: '600001' },
  '34': { city: 'Puducherry', pincode: '605001' },
  '35': { city: 'Port Blair', pincode: '744101' },
  '36': { city: 'Hyderabad', pincode: '500001' },
  '37': { city: 'Visakhapatnam', pincode: '530001' },
  '38': { city: 'Leh', pincode: '194101' }
};

// Predefined database of specific test GSTINs for precise lookup
export const GSTIN_DB: Record<string, { tradeName: string; legalName: string; building: string; street: string; location: string; pincode: string; phone: string; email: string }> = {
  '10AAACJ3919M1Z8': {
    tradeName: 'Maurya Scaffolding & Construction',
    legalName: 'Maurya Scaffolding & Construction Private Limited',
    building: 'Plot No. 42A, Patliputra Industrial Area',
    street: 'Road No. 4',
    location: 'Patna',
    pincode: '800013',
    phone: '+91 7493916194',
    email: 'contact@mauryascaffolding.com'
  },
  '21ABCDE5555F1Z4': {
    tradeName: 'Kalinga Steel & Infrastructure',
    legalName: 'Kalinga Steel & Infrastructure Ltd',
    building: 'Shed No. 12, Chandaka Industrial Estate',
    street: 'Infocity Road',
    location: 'Bhubaneswar',
    pincode: '751024',
    phone: '+91 9437012345',
    email: 'procurement@kalingasteel.com'
  },
  '27GHIJK9999L2Z9': {
    tradeName: 'Sahyadri Engineering Solutions',
    legalName: 'Sahyadri Engineering Solutions LLP',
    building: 'Gala No. 8, MIDC Industrial Area',
    street: 'Thane-Belapur Road',
    location: 'Navi Mumbai',
    pincode: '400705',
    phone: '+91 22 27789012',
    email: 'info@sahyadrieng.co.in'
  },
  '07XYZAB1111C1Z0': {
    tradeName: 'Apex Scaffolding & Formwork Delhi',
    legalName: 'Apex Scaffolding Delhi Private Limited',
    building: 'Plot No. 185, Okhla Industrial Area',
    street: 'Phase III',
    location: 'New Delhi',
    pincode: '110020',
    phone: '+91 11 41607890',
    email: 'sales@apexscaffolding.in'
  },
  '21AAACU2227J1ZQ': {
    tradeName: 'UMSL Limited',
    legalName: 'UMSL Limited',
    building: 'UMSL LTD, KALINGA BAZAR',
    street: 'KAPALESWAR CHOUDWAR',
    location: 'Cuttack',
    pincode: '754025',
    phone: '+91 671 2309876',
    email: 'contact@umsl.in'
  }
};

/**
 * Validates the 15-digit GSTIN format.
 * Format: 2 digits + 10 alphanumeric (PAN) + 1 digit + 1 char + 1 digit/char
 */
export function isValidGSTIN(gstin: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.toUpperCase());
}

/**
 * Get state information from GSTIN
 */
export function getStateFromGSTIN(gstin: string) {
  if (gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  const state = STATE_CODES[code];
  return state ? { code, name: state } : null;
}

/**
 * Performs a GSTIN lookup. If it exists in the predefined DB, it returns that.
 * Otherwise, if the GSTIN format is valid, it dynamically generates a realistic profile.
 */
export function lookupGSTINDetails(gstinVal: string) {
  const gstin = gstinVal.trim().toUpperCase();
  if (!isValidGSTIN(gstin)) return null;

  const stateInfo = getStateFromGSTIN(gstin);
  if (!stateInfo) return null;

  // 1. Check if in DB
  let details = GSTIN_DB[gstin];

  if (!details) {
    // 2. Generate dynamic realistic details
    const mapping = STATE_CITY_MAPPING[stateInfo.code] || { city: 'Capital City', pincode: '400001' };
    const panLetters = gstin.substring(2, 7);
    const panDigits = gstin.substring(7, 11);
    
    // Create a deterministic name based on the GSTIN's letters and digits
    const cleanLetters = panLetters.replace(/[^A-Z]/g, '');
    const companyTypeSuffix = gstin.charAt(12) === '1' ? 'Pvt Ltd' : 'Enterprises';
    const tradeName = `${cleanLetters} Engineering & Scaffolding`;
    const legalName = `${tradeName} ${companyTypeSuffix}`;

    // Create a deterministic phone number based on digits in GSTIN
    let numericSequence = '';
    for (let i = 0; i < gstin.length; i++) {
      const char = gstin.charAt(i);
      if (char >= '0' && char <= '9') {
        numericSequence += char;
      }
    }
    // ensure exactly 9 digits for Indian mobile (+91 9XXXXXXXXX)
    while (numericSequence.length < 9) {
      numericSequence += '7';
    }
    const phone = `+91 9${numericSequence.substring(0, 9)}`;
    const emailName = tradeName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `contact@${emailName}.com`;

    // Dynamic address structure
    const plotNo = parseInt(panDigits, 10) % 500 || 124;
    const phaseNo = (parseInt(gstin.charAt(14), 36) % 4) + 1;
    
    details = {
      tradeName,
      legalName,
      building: `Plot No. ${plotNo}, Phase ${phaseNo}`,
      street: 'Industrial Development Area Road',
      location: mapping.city,
      pincode: mapping.pincode,
      phone,
      email
    };
  }

  const formattedAddress = `${details.building}, ${details.street}, ${details.location}, ${stateInfo.name} - ${details.pincode}`;

  return {
    success: true,
    tradeName: details.tradeName,
    legalName: details.legalName,
    gstin,
    phone: details.phone,
    email: details.email,
    address: {
      building: details.building,
      street: details.street,
      location: details.location,
      pincode: details.pincode,
      state: stateInfo.name,
      stateCode: stateInfo.code,
      formatted: formattedAddress
    }
  };
}
