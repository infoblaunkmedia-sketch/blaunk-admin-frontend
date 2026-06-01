import React from 'react';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { PayslipGenerator } from '../../payslip/PayslipGenerator';

export const Payroll: React.FC = () => (
  <ErrorBoundary>
    <PayslipGenerator title="Payroll" subtitle="" />
  </ErrorBoundary>
);
