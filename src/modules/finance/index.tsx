import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { useAuth } from '../../auth/useAuth';
import { B2BPayments } from './b2bPayments/B2BPayments';
import { DsaPayouts } from './dsaPayouts/DsaPayouts';
import { BgtBankAccounts } from './bankAccounts/BgtBankAccounts';

const TABS = [
  { label: 'B2B Payments', path: '/finance/b2b', section: 'b2b' },
  { label: 'DSA Limit', path: '/finance/dsa-limit', section: 'dsa-payouts' },
  { label: 'BGT Bank Accounts', path: '/finance/bank-accounts', section: 'bank-accounts' },
];

const FinanceIndexRedirect: React.FC = () => {
  const { hasSection, user } = useAuth();
  const visible = TABS.filter(
    (tab) => user?.role === 'admin' || !tab.section || hasSection('finance', tab.section),
  );
  const first = visible[0];
  if (!first) return <Navigate to="/home/employee" replace />;
  const segment = first.path.replace('/finance/', '');
  return <Navigate to={segment} replace />;
};

export const FinancePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="finance">
      <Routes>
        <Route index element={<FinanceIndexRedirect />} />
        <Route path="b2b" element={<B2BPayments />} />
        <Route path="dsa-limit" element={<DsaPayouts />} />
        <Route path="dsa-limit-check" element={<Navigate to="/finance/dsa-limit" replace />} />
        <Route path="dsa-payouts" element={<Navigate to="/finance/dsa-limit" replace />} />
        <Route path="bank-accounts" element={<BgtBankAccounts />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
