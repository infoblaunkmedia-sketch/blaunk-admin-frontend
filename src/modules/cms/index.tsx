import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { Banners } from './banners/Banners';
import { Giff } from './giff/Giff';
import { Shops } from './localStores/Shops';
import { ShopCategories } from './localStores/ShopCategories';
const TABS = [
  { label: 'Upload', path: '/cms/banners', section: 'banners' },
  { label: 'GIFF', path: '/cms/giff', section: 'giff' },
  { label: 'B-Store Shops', path: '/cms/local-stores', section: 'local-stores' },
  { label: 'B-Store Categories', path: '/cms/store-categories', section: 'store-categories' },
];

export const CmsPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="cms">
      <Routes>
        <Route index element={<Navigate to="banners" replace />} />
        <Route path="banners" element={<Banners />} />
        <Route path="giff" element={<Giff />} />
        <Route path="local-stores" element={<Shops />} />
        <Route path="store-categories" element={<ShopCategories />} />
        <Route path="images" element={<Navigate to="/cms/banners" replace />} />
        <Route path="pages" element={<Navigate to="/cms/banners" replace />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
