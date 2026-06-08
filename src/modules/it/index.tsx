import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { IpManagement } from '../settings/ipManagement/IpManagement';
import { UserRights } from '../settings/userRights/UserRights';

const TABS = [
  { label: 'IP Management', path: '/it', section: 'ip-management' },
  { label: 'User Rights', path: '/it/rights', section: 'rights' },
];

export const ItPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="it">
      <Routes>
        <Route index element={<IpManagement />} />
        <Route path="ip-management" element={<Navigate to="/it" replace />} />
        <Route path="rights" element={<UserRights />} />
        <Route path="match-code" element={<Navigate to="/management/match-code" replace />} />
        <Route path="match-doe" element={<Navigate to="/management/match-code" replace />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
