import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { UserRights } from './userRights/UserRights';
import { Security } from './security/Security';
import { IpManagement } from './ipManagement/IpManagement';

const TABS = [
  { label: 'User Rights', path: '/settings/rights' },
  { label: 'Security', path: '/settings/security' },
  { label: 'IP Management', path: '/settings/ip-management' },
];

export const SettingsPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="rights" replace />} />
        <Route path="rights" element={<UserRights />} />
        <Route path="security" element={<Security />} />
        <Route path="ip-management" element={<IpManagement />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
