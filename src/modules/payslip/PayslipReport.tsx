import React from 'react';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { PayslipGenerator } from './PayslipGenerator';

export const PayslipReport: React.FC = () => (
  <ErrorBoundary>
    <PayslipGenerator
      title="Payslip"
      subtitle="Payroll operations: monthly/yearly payslips, employee CTC, FORM16, and investment forms (PDF or Excel)."
    />
  </ErrorBoundary>
);
