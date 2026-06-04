import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PlanCharges } from './planCharges/PlanCharges';
import { Commission } from './commission/Commission';
import { Vouchers } from './vouchers/Vouchers';
import { Products } from './products/Products';
import { Categories } from './categories/Categories';

const TABS = [
  { label: 'Plan Charges', path: '/platform/plan-charges', section: 'plan-charges' },
  { label: 'Commission', path: '/platform/commission', section: 'commission' },
  { label: 'Vouchers', path: '/platform/vouchers', section: 'vouchers' },
  { label: 'Products', path: '/platform/products', section: 'products' },
  { label: 'Categories', path: '/platform/categories', section: 'categories' },
];

export const PlatformPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="platform">
      <Routes>
        <Route index element={<Navigate to="plan-charges" replace />} />
        <Route path="plan-charges" element={<PlanCharges />} />
        <Route path="commission" element={<Commission />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="dsa-limits" element={<Navigate to="/platform/plan-charges" replace />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
