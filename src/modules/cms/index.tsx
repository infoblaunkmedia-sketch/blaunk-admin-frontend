import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { ImageLibrary } from './images/ImageLibrary';
import { PageContent } from './pages/PageContent';

const TABS = [
  { label: 'Image Library', path: '/cms/images' },
  { label: 'Page Content', path: '/cms/pages' },
];

export const CmsPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="images" replace />} />
        <Route path="images" element={<ImageLibrary />} />
        <Route path="pages" element={<PageContent />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
