import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PlanCharges } from './planCharges/PlanCharges';
import { Commission } from './commission/Commission';
import { Vouchers } from './vouchers/Vouchers';
import { DsaLimits } from './dsaLimits/DsaLimits';

const TABS = [
  { label: 'Plan Charges', path: '/platform/plan-charges', section: 'plan-charges' },
  { label: 'Commission', path: '/platform/commission', section: 'commission' },
  { label: 'Vouchers', path: '/platform/vouchers', section: 'vouchers' },
  { label: 'DSA Limits', path: '/platform/dsa-limits', section: 'dsa-limits' },
];

export const PlatformPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="platform">
      <Routes>
        <Route index element={<Navigate to="plan-charges" replace />} />
        <Route path="plan-charges" element={<PlanCharges />} />
        <Route path="commission" element={<Commission />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="dsa-limits" element={<DsaLimits />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
