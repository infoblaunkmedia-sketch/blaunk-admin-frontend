import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { ShareholdingList } from './shareholding/ShareholdingList';
import { ShareholdingForm } from './shareholding/ShareholdingForm';
import { ShareholdingDetails } from './shareholding/ShareholdingDetails';
import { ShareholdingMis } from './mis/ShareholdingMis';

const TABS = [
  { label: 'Shareholding', path: '/corporate/shareholding', section: 'shareholding' },
  { label: 'MIS', path: '/corporate/mis', section: 'mis' },
];

export const CorporatePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="corporate">
      <Routes>
        <Route index element={<Navigate to="shareholding" replace />} />
        <Route path="shareholding" element={<ShareholdingList />} />
        <Route path="shareholding/new" element={<ShareholdingForm />} />
        <Route path="shareholding/:pan" element={<ShareholdingDetails />} />
        <Route path="shareholding/:pan/edit" element={<ShareholdingForm />} />
        <Route path="mis" element={<ShareholdingMis />} />
        <Route path="profile" element={<Navigate to="/management/company-profile" replace />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
