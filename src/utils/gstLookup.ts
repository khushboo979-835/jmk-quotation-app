import { GST_STATE_CODES } from './gstStateCodes';

export const STATE_CODES = GST_STATE_CODES;

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
