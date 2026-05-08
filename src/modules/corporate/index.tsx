import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { ShareholdingList } from './shareholding/ShareholdingList';
import { ShareholdingForm } from './shareholding/ShareholdingForm';
import { ShareholdingDetails } from './shareholding/ShareholdingDetails';
import { CompanyProfile } from './companyProfile/CompanyProfile';

const TABS = [
  { label: 'Shareholding', path: '/corporate/shareholding' },
  { label: 'Company Profile', path: '/corporate/profile' },
];

export const CorporatePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="shareholding" replace />} />
        <Route path="shareholding" element={<ShareholdingList />} />
        <Route path="shareholding/new" element={<ShareholdingForm />} />
        <Route path="shareholding/:pan" element={<ShareholdingDetails />} />
        <Route path="shareholding/:pan/edit" element={<ShareholdingForm />} />
        <Route path="profile" element={<CompanyProfile />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
