import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { Media } from './media/Media';

export const AdminPersonnelPage: React.FC = () => (
  <ErrorBoundary>
    <Routes>
      <Route index element={<Navigate to="media" replace />} />
      <Route path="media" element={<Media />} />
      <Route path="*" element={<Navigate to="media" replace />} />
    </Routes>
  </ErrorBoundary>
);
