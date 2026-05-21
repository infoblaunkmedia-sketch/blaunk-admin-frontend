import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { Employees } from './employees/Employees';
import { EmployeeNew } from './employees/EmployeeNew';
import { EmployeeDetails } from './employees/EmployeeDetails';
import { Payroll } from './payroll/Payroll';
import { Vacancies } from './vacancies/Vacancies';
import { ThirdPartyCredentials } from './thirdPartyCredentials/ThirdPartyCredentials';

const TABS = [
  { label: 'Employees', path: '/people/employees', section: 'employees' },
  { label: '3P Credentials', path: '/people/3p-credentials', section: '3p-credentials' },
  { label: 'Payroll', path: '/people/payroll', section: 'payroll' },
  { label: 'Vacancies', path: '/people/vacancies', section: 'vacancies' },
];

export const PeoplePage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="people">
      <Routes>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<EmployeeNew />} />
        <Route path="employees/:pan" element={<EmployeeDetails />} />
        <Route path="3p-credentials" element={<ThirdPartyCredentials />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="vacancies" element={<Vacancies />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
