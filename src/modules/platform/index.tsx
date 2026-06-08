import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PlanCharges } from './planCharges/PlanCharges';
import { Commission } from './commission/Commission';
import { Vouchers } from './vouchers/Vouchers';
import { Products } from './products/Products';
import { Categories } from './categories/Categories';
import { MatchDoe } from '../marketing/matchDoe/MatchDoe';
import { Countries } from './countries/Countries';

const TABS = [
  { label: 'Plan Charges', path: '/management/plan-charges', section: 'plan-charges' },
  { label: 'Commission', path: '/management/commission', section: 'commission' },
  { label: 'Vouchers', path: '/management/vouchers', section: 'vouchers' },
  { label: 'Products', path: '/management/products', section: 'products' },
  { label: 'Categories', path: '/management/categories', section: 'categories' },
  { label: 'Countries', path: '/management/countries', section: 'countries' },
  { label: 'Match Code', path: '/management/match-code', section: 'match-code' },
];

export const ManagementPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="platform">
      <Routes>
        <Route index element={<Navigate to="plan-charges" replace />} />
        <Route path="plan-charges" element={<PlanCharges />} />
        <Route path="commission" element={<Commission />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="dsa-limits" element={<Navigate to="/management/plan-charges" replace />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="countries" element={<Countries />} />
        <Route path="rights" element={<Navigate to="/it/rights" replace />} />
        <Route path="security" element={<Navigate to="/it/rights" replace />} />
        <Route path="slot-settings" element={<Navigate to="/management/plan-charges" replace />} />
        <Route path="match-code" element={<MatchDoe />} />
        <Route path="match-doe" element={<Navigate to="match-code" replace />} />
        <Route path="ip-management" element={<Navigate to="/it" replace />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);

/** @deprecated Use ManagementPage */
export const PlatformPage = ManagementPage;
