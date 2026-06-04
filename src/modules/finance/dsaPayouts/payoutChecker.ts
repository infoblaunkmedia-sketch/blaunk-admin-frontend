import {
  isNegativePayoutStatus,
  isPendingPayoutStatus,
  normalizePayoutStatus,
} from '../../../shared/constants/payoutStatus';
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
