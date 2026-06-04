import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { B2BPayments } from './b2bPayments/B2BPayments';
import { DsaPayouts } from './dsaPayouts/DsaPayouts';
import { BgtBankAccounts } from './bankAccounts/BgtBankAccounts';

const TABS = [
  { label: 'B2B Payments', path: '/finance/b2b', section: 'b2b' },
  { label: 'DSA Limit', path: '/finance/dsa-limit', section: 'dsa-payouts' },
  { label: 'BGT Bank Accounts', path: '/finance/bank-accounts', section: 'bank-accounts' },
];

export const FinancePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="finance">
      <Routes>
        <Route index element={<Navigate to="b2b" replace />} />
        <Route path="b2b" element={<B2BPayments />} />
        <Route path="dsa-limit" element={<DsaPayouts />} />
        <Route path="dsa-payouts" element={<Navigate to="/finance/dsa-limit" replace />} />
        <Route path="dsa-limit-check" element={<Navigate to="/finance/dsa-limit" replace />} />
        <Route path="bank-accounts" element={<BgtBankAccounts />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
