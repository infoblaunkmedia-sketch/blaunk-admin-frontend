import type { DsaPayoutSubmission } from '../finance.types';
import { normalizePayoutStatus } from '../../../shared/constants/payoutStatus';

function round2(n: number) {
  return Number(n.toFixed(2));
}

/** Latest approved calculatedLimit for a DSA (running cap before this pay-in). */
export function latestApprovedLimitForDsa(
  records: DsaPayoutSubmission[],
  dsaCode: string,
  excludeId?: string,
): number {
  const code = String(dsaCode || '').trim().toUpperCase();
  let best = 0;
  let bestAt = 0;
  for (const row of records) {
    if (excludeId && row.id === excludeId) continue;
    if (String(row.dsaCode || '').trim().toUpperCase() !== code) continue;
    if (normalizePayoutStatus(row.status) !== 'APPROVED') continue;
    const limit = Number(row.calculatedLimit || 0);
    if (limit <= 0) continue;
    const at = new Date(row.approvedAt || row.lastActedAt || 0).getTime();
    if (at >= bestAt) {
      bestAt = at;
      best = limit;
    }
  }
  return best;
}

/** Limit for this pay-in only (share-ratio portion of Currency-INR). Prior approvals do not stack. */
export function suggestCalculatedLimit(
  _records: DsaPayoutSubmission[],
  row: DsaPayoutSubmission,
  currencyInr: number,
): number {
  const inr = Number(currencyInr) || 0;
  if (inr <= 0) return 0;
  const sr = Number(row.shareRatio) || 30;
  return Math.max(0, round2(inr * sr / 100));
}

export function formatLimitValue(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  return String(n);
}
