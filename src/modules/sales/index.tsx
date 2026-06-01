import React from 'react';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { SalesAdvertisement } from './SalesAdvertisement';

export const SalesPage: React.FC = () => (
  <ErrorBoundary>
    <SalesAdvertisement />
  </ErrorBoundary>
);
