export type BankTransferStatus = 'Pending' | 'Completed' | 'Failed';
import type { PayoutStatus } from '../../shared/constants/payoutStatus';
export type { PayoutStatus };
export type PaymentMode = 'Cash' | 'QR' | 'UPI' | 'Swift' | 'RTGS' | 'NEFT';

export interface B2BPayment {
  id: string;
  orderId: string;
  payinAmount: number;
  charges: number;
  tds: number;
  tcs: number;
  penalties: number;
  portalFee: number;
  netPayout: number;
  bankTransferStatus: BankTransferStatus;
  transactionNumber: string;
  date: string;
}

export interface DsaPayoutSubmission {
  id: string;
  dsaCode: string;
  dsaName: string;
  country: string;
  submittedAmount: number;
  currency: string;
  currencyInr: number;
  shareRatio: number;
  calculatedLimit: number;
  mode: PaymentMode;
  transactionNumber: string;
  submissionDate: string;
  status: PayoutStatus;
  approvalNote?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  lastActedBy?: string;
  lastActedAt?: string;
  newAmount?: number;
  bodBalance?: number;
  usedValue?: number;
  availableBalance?: number;
}

export interface NeftAccount {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
}

export interface QrEntry {
  country: string;
  imageUrl: string;
}

export interface WireAccount {
  swiftCode: string;
  iban: string;
  bankName: string;
  beneficiaryName: string;
  country: string;
}

export interface BgtBankAccounts {
  neft: NeftAccount;
  qrEntries: QrEntry[];
  wire: WireAccount;
}
