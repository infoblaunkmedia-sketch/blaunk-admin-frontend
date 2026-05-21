import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { Individuals } from './individuals/Individuals';
import { Issues } from './issues/Issues';
import { Reviews } from './reviews/Reviews';
import { Vendors } from '../channelPartners/vendors/Vendors';

const TABS = [
  { label: 'Individuals', path: '/customers/individuals', section: 'individuals' },
  { label: 'Vendors', path: '/customers/vendors', section: 'vendors' },
  { label: 'Issues', path: '/customers/issues', section: 'issues' },
  { label: 'Reviews', path: '/customers/reviews', section: 'reviews' },
];

export const CustomersPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="customers">
      <Routes>
        <Route index element={<Navigate to="individuals" replace />} />
        <Route path="individuals" element={<Individuals />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="issues" element={<Issues />} />
        <Route path="reviews" element={<Reviews />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
