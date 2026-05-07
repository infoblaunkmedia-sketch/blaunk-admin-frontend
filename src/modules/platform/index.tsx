import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PlanCharges } from './planCharges/PlanCharges';
import { Commission } from './commission/Commission';
import { Vouchers } from './vouchers/Vouchers';
import { DsaLimits } from './dsaLimits/DsaLimits';

const TABS = [
  { label: 'Plan Charges', path: '/platform/plan-charges' },
  { label: 'Commission', path: '/platform/commission' },
  { label: 'Vouchers', path: '/platform/vouchers' },
  { label: 'DSA Limits', path: '/platform/dsa-limits' },
];

export const PlatformPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
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
