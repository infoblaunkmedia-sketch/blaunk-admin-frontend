import React from 'react';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PayslipReport } from './PayslipReport';

export const PayslipPage: React.FC = () => (
  <ErrorBoundary>
    <PayslipReport />
  </ErrorBoundary>
);
