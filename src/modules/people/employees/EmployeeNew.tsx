import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { EmployeeForm } from './EmployeeForm';

export const EmployeeNew: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <EmployeeForm
        initial={{}}
        isNew
        onSaved={() => navigate('/people/employees')}
        onCancel={() => navigate('/people/employees')}
      />
    </ErrorBoundary>
  );
};
