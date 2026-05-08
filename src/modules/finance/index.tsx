import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { B2BPayments } from './b2bPayments/B2BPayments';
import { DsaPayouts } from './dsaPayouts/DsaPayouts';
import { BgtBankAccounts } from './bankAccounts/BgtBankAccounts';

const TABS = [
  { label: 'B2B Payments', path: '/finance/b2b' },
  { label: 'DSA Payouts', path: '/finance/dsa-payouts' },
  { label: 'BGT Bank Accounts', path: '/finance/bank-accounts' },
];

export const FinancePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="b2b" replace />} />
        <Route path="b2b" element={<B2BPayments />} />
        <Route path="dsa-payouts" element={<DsaPayouts />} />
        <Route path="bank-accounts" element={<BgtBankAccounts />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
