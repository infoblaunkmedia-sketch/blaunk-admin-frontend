import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { PayslipGenerator } from './PayslipGenerator';

export const MyPayslipPage: React.FC = () => {
  const { user } = useAuth();
  const employeeCode = String(user?.code || user?.employeeCode || user?.username || '').trim().toUpperCase();

  return (
    <PayslipGenerator
      title="My Payslip"
      subtitle={
        employeeCode
          ? `Payslip for ${employeeCode} — only your own records are shown.`
          : 'Your employee code is not linked to this account.'
      }
      selfService
      lockedEmployeeCode={employeeCode}
    />
  );
};
