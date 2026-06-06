import React from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';

export const RetailManagementPage: React.FC = () => (
  <ErrorBoundary>
    <PageHeader title="Retail Management" />
  </ErrorBoundary>
);
