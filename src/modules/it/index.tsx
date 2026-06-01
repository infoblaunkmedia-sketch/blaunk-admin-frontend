import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { IpManagement } from '../settings/ipManagement/IpManagement';

export const ItPage: React.FC = () => (
  <ErrorBoundary>
    <Routes>
      <Route index element={<IpManagement />} />
      <Route path="ip-management" element={<Navigate to="/it" replace />} />
    </Routes>
  </ErrorBoundary>
);
