/** Canonical payout status values stored in API/DB. */
export const PAYOUT_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'REVERSE_BACK',
  'ON_HOLD',
  'DOUBLE_ENTRY',
  'ENTRY_MISSING',
] as const;

export type PayoutStatus = typeof PAYOUT_STATUSES[number];

/** Admin approval dropdown — Pending, Approved, Rejected only. */
export const PAYOUT_APPROVAL_OPTIONS: { value: PayoutStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

/** Remark options when approval is Rejected (visible to DSA on their Limit table). */
export const PAYOUT_REMARK_OPTIONS = [
  'Reversed Back',
  'Duplicate Entry',
  'Journal Voucher Reversal',
  'Management Not Approved',
  'DSA Closed & Transferred',
  'Bank Entry Missing',
] as const;

export type PayoutRemark = typeof PAYOUT_REMARK_OPTIONS[number];

export const PAYOUT_STATUS_OPTIONS: { value: PayoutStatus; label: string }[] = [
  ...PAYOUT_APPROVAL_OPTIONS,
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REVERSE_BACK', label: 'Reverse Back' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'ENTRY_MISSING', label: 'Entry Missing' },
];

const LABEL_BY_VALUE = Object.fromEntries(
  PAYOUT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PayoutStatus, string>;

const ALIASES: Record<string, PayoutStatus> = {
  PENDING_APPROVAL: 'PENDING',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  REVERSE_BACK: 'REVERSE_BACK',
  ON_HOLD: 'ON_HOLD',
  DOUBLE_ENTRY: 'DOUBLE_ENTRY',
  ENTRY_MISSING: 'ENTRY_MISSING',
};

export function normalizePayoutStatus(raw: string): PayoutStatus {
  const key = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  return ALIASES[key] || 'PENDING';
}

export function payoutStatusLabel(raw: string): string {
  const key = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (ALIASES[key]) return LABEL_BY_VALUE[ALIASES[key]];
  if (key in LABEL_BY_VALUE) return LABEL_BY_VALUE[key as PayoutStatus];
  return raw;
}

export function isPayoutStatus(raw: string): boolean {
  const key = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  return Boolean(ALIASES[key] || key in LABEL_BY_VALUE);
}

export const PENDING_PAYOUT_STATUSES: PayoutStatus[] = ['PENDING'];

export function isPendingPayoutStatus(raw: string): boolean {
  const norm = normalizePayoutStatus(raw);
  return norm === 'PENDING' || String(raw).toUpperCase() === 'PENDING_APPROVAL';
}

export function isNegativePayoutStatus(raw: string): boolean {
  return normalizePayoutStatus(raw) === 'REJECTED';
}

export function isPayoutRemark(value: string): value is PayoutRemark {
  return PAYOUT_REMARK_OPTIONS.includes(value as PayoutRemark);
}
