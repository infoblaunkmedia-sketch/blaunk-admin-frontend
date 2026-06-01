import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { UserRights } from './userRights/UserRights';
import { Security } from './security/Security';
import { SlotSettings } from '../marketing/slotSettings/SlotSettings';
import { MatchDoe } from '../marketing/matchDoe/MatchDoe';

const TABS = [
  { label: 'User Rights', path: '/settings/rights', section: 'rights' },
  { label: 'Security', path: '/settings/security', section: 'security' },
  { label: 'Slot Settings', path: '/settings/slot-settings', section: 'slot-settings' },
  { label: 'Match Code', path: '/settings/match-code', section: 'match-code' },
];

export const SettingsPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="settings">
      <Routes>
        <Route index element={<Navigate to="rights" replace />} />
        <Route path="rights" element={<UserRights />} />
        <Route path="security" element={<Security />} />
        <Route path="slot-settings" element={<SlotSettings />} />
        <Route path="match-code" element={<MatchDoe />} />
        <Route path="match-doe" element={<Navigate to="match-code" replace />} />
        <Route path="ip-management" element={<Navigate to="/it" replace />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
