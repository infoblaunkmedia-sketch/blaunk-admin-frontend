import {
  isNegativePayoutStatus,
  isPendingPayoutStatus,
  normalizePayoutStatus,
} from '../../../shared/constants/payoutStatus';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import type { DsaPayoutSubmission } from '../finance.types';

/** Admin/employee who last approved, rejected, or changed payout status. */
export function payoutCheckerLabel(row: DsaPayoutSubmission): string {
  const status = normalizePayoutStatus(row.status);
  if (isPendingPayoutStatus(status)) return '-';
  if (status === 'APPROVED') {
    return row.approvedBy || row.lastActedBy || '-';
  }
  if (isNegativePayoutStatus(status)) {
    return row.rejectedBy || row.lastActedBy || '-';
  }
  return row.lastActedBy || row.approvedBy || row.rejectedBy || '-';
}

/** Checker employee / admin id (who acted on the payout). */
export function payoutCheckerId(row: DsaPayoutSubmission): string {
  return payoutCheckerLabel(row);
}

/** Date when checker approved or rejected. */
export function payoutCheckerDate(row: DsaPayoutSubmission): string {
  const status = normalizePayoutStatus(row.status);
  if (isPendingPayoutStatus(status)) return '-';
  const actedAt = row.lastActedAt || row.approvedAt || row.rejectedAt;
  if (!actedAt) return '-';
  return formatDateDDMMYYYY(String(actedAt)) || '-';
}
