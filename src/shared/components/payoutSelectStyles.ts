const PAYOUT_SELECT_BASE =
  'box-border h-8 shrink-0 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold outline-none focus:border-primary disabled:opacity-60';

/** Approval column — fixed width so Pending / Approved / Rejected never shift layout. */
export const PAYOUT_STATUS_SELECT_CLASS = `${PAYOUT_SELECT_BASE} w-[7.75rem] min-w-[7.75rem] max-w-[7.75rem]`;

/** Remark column — wide enough for the longest rejection reason. */
export const PAYOUT_REMARK_SELECT_CLASS = `${PAYOUT_SELECT_BASE} w-full min-w-[13.5rem] max-w-[16rem]`;

/** @deprecated Use PAYOUT_STATUS_SELECT_CLASS or PAYOUT_REMARK_SELECT_CLASS */
export const PAYOUT_SELECT_CLASS = PAYOUT_STATUS_SELECT_CLASS;
