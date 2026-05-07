import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { DsaNetwork } from './dsa/DsaNetwork';
import { Verifiers } from './verifiers/Verifiers';

const TABS = [
  { label: 'DSA Network', path: '/channel-partners/dsa' },
  { label: 'Verifiers', path: '/channel-partners/verifiers' },  
];

export const ChannelPartnersPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="dsa" replace />} />
        <Route path="dsa" element={<DsaNetwork />} />
        <Route path="verifiers" element={<Verifiers />} />        
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
