import React from 'react';
import { FormField } from '../../../shared/components/FormField';
import type { BankDetails } from '../channelPartners.types';
import { BankNameInput } from '../../../shared/components/BankNameInput';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

interface BankDetailsFieldsProps {
  value: BankDetails;
  onChange: (val: BankDetails) => void;
}

export const BankDetailsFields: React.FC<BankDetailsFieldsProps> = ({ value, onChange }) => {
  const set = <K extends keyof BankDetails>(k: K, v: BankDetails[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* <FormField label="Account Holder Name">
        <input className={inputClass} value={value.accountHolderName}
          onChange={(e) => set('accountHolderName', e.target.value)} />
      </FormField> */}
      <FormField label="Account Number">
        <input className={inputClass} value={value.accountNumber}
          onChange={(e) => set('accountNumber', e.target.value)} />
      </FormField>
      <FormField label="IFSC Code">
        <input className={inputClass} value={value.ifsc}
          onChange={(e) => set('ifsc', e.target.value.toUpperCase())} />
      </FormField>
      <FormField label="Bank Name">
        <BankNameInput
          className={inputClass}
          value={value.bankName}
          onChange={(v) => set('bankName', v)}
        />
      </FormField>
      {/* <FormField label="Branch">
        <input className={inputClass} value={value.branch}
          onChange={(e) => set('branch', e.target.value)} />
      </FormField> */}
    </div>
  );
};
