/** Digits only, capped at `maxLen` (e.g. mobile 10, pincode 6, Aadhaar 12). */
export function digitsOnlyMax(raw: string, maxLen: number): string {
  return raw.replace(/\D/g, '').slice(0, maxLen);
}

export const MOBILE_DIGITS_MAX = 10;
export const INDIAN_PINCODE_DIGITS_MAX = 6;
export const AADHAAR_DIGITS_MAX = 12;

/** ZIP/PIN when allowing international numeric codes (max length cap). */
export const ZIP_DIGITS_MAX = 10;

/** Indian PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F). */
export function sanitizePan(raw: string): string {
  const u = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let out = '';
  for (let i = 0; i < u.length && out.length < 10; i++) {
    const c = u[i];
    const pos = out.length;
    if (pos < 5) {
      if (/[A-Z]/.test(c)) out += c;
    } else if (pos < 9) {
      if (/[0-9]/.test(c)) out += c;
    } else if (/[A-Z]/.test(c)) {
      out += c;
    }
  }
  return out;
}

/** Indian TAN: 4 letters + 5 digits + 1 letter (e.g. ABCD12345E). */
export function sanitizeTan(raw: string): string {
  const u = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let out = '';
  for (let i = 0; i < u.length && out.length < 10; i++) {
    const c = u[i];
    const pos = out.length;
    if (pos < 4) {
      if (/[A-Z]/.test(c)) out += c;
    } else if (pos < 9) {
      if (/[0-9]/.test(c)) out += c;
    } else if (/[A-Z]/.test(c)) {
      out += c;
    }
  }
  return out;
}

/** CIN (India): 21 alphanumeric characters, uppercase. */
export const CIN_MAX_LEN = 21;

export function sanitizeCin(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CIN_MAX_LEN);
}
