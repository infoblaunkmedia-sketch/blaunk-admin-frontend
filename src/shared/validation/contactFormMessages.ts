import { isValidIndianPan, MOBILE_DIGITS_MAX } from '../../utils/inputFormats';

export type ReferenceLike = {
  name?: string;
  mobile?: string;
  designation?: string;
  city?: string;
};

export type NomineeLike = {
  name?: string;
  mobile?: string;
  relation?: string;
  percentage?: string;
  pan?: string;
};

function referenceOrdinal(i: number): string {
  if (i === 0) return 'First';
  if (i === 1) return 'Second';
  return `Reference ${i + 1}`;
}

/** Returns a user-facing message if any reference row is inconsistent, or null if OK. */
export function findReferenceContactIssue(references: ReferenceLike[]): string | null {
  for (let i = 0; i < references.length; i += 1) {
    const r = references[i] ?? {};
    const mobile = String(r.mobile ?? '').trim();
    if (mobile && mobile.length !== MOBILE_DIGITS_MAX) {
      return `${referenceOrdinal(i)} reference: mobile number must be exactly 10 digits.`;
    }
  }
  return null;
}

const PAN_HINT = 'Use 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).';

/** Returns a user-facing message if any partially filled nominee row is invalid, or null. */
export function findNomineeContactIssue(nominees: NomineeLike[]): string | null {
  for (let i = 0; i < nominees.length; i += 1) {
    const n = nominees[i] ?? {};
    const mobile = String(n.mobile ?? '').trim();
    if (mobile && mobile.length !== MOBILE_DIGITS_MAX) {
      return 'Nominee mobile number must be exactly 10 digits.';
    }
    const pan = String(n.pan ?? '').trim();
    if (pan && !isValidIndianPan(pan)) {
      return `Nominee PAN is not valid. ${PAN_HINT}`;
    }
  }
  return null;
}

/** Digits only, max 3 chars, for 0–100 ratio entry. */
export function sanitizeSharingRatioDigits(raw: string): string {
  return String(raw ?? '').replace(/\D/g, '').slice(0, 3);
}

/**
 * When the user edits one side of 3P : Blaunk, keep the pair summing to 100.
 * Clearing the edited side resets the partner to a sensible default for the other field.
 */
export function applySharingRatioEdit(
  side: 'threeP' | 'blaunk',
  raw: string,
): { sharingThreeP: string; sharingBlaunk: string } {
  const digits = sanitizeSharingRatioDigits(raw);
  if (digits === '') {
    return side === 'threeP'
      ? { sharingThreeP: '', sharingBlaunk: '100' }
      : { sharingThreeP: '0', sharingBlaunk: '' };
  }
  let n = parseInt(digits, 10);
  if (!Number.isFinite(n)) n = 0;
  n = Math.min(100, Math.max(0, n));
  if (side === 'threeP') {
    return { sharingThreeP: String(n), sharingBlaunk: String(100 - n) };
  }
  return { sharingThreeP: String(100 - n), sharingBlaunk: String(n) };
}

/** Run before save; both values must be whole numbers 0–100 that sum to 100. */
export function validateSharingRatioStrings(threeP: string, blaunk: string): string | null {
  const aStr = String(threeP ?? '').trim();
  const bStr = String(blaunk ?? '').trim();
  if (aStr === '' || bStr === '') {
    return 'Please enter both sharing ratio values (3P and Blaunk).';
  }
  if (!/^\d{1,3}$/.test(aStr) || !/^\d{1,3}$/.test(bStr)) {
    return 'Sharing ratios must be whole numbers only (no letters or symbols).';
  }
  const a = parseInt(aStr, 10);
  const b = parseInt(bStr, 10);
  if (a < 0 || a > 100 || b < 0 || b > 100) {
    return 'Each sharing ratio must be between 0 and 100.';
  }
  if (a + b !== 100) {
    return '3P and Blaunk sharing ratios must add up to 100.';
  }
  return null;
}

const IMAGE_TYPES = /^image\/(jpeg|jpg|png|gif|webp)$/i;

/** Max size in bytes; returns message or null if OK. */
export function validateImageFileForUpload(file: File, maxBytes: number): string | null {
  if (!file.type || !IMAGE_TYPES.test(file.type)) {
    return 'Please choose an image file (JPG, PNG, GIF, or WebP).';
  }
  if (file.size > maxBytes) {
    const maxKb = Math.round(maxBytes / 1024);
    return `This image is too large. Maximum size is ${maxKb} KB.`;
  }
  return null;
}
