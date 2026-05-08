import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getWorkspaceHomePath } from './homePath';

export const WorkspaceEmployeeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.employeeType === '3pc') return <Navigate to="/home/contractor" replace />;
  return <>{children}</>;
};

export const WorkspaceContractorGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.employeeType !== '3pc') return <Navigate to="/home/employee" replace />;
  return <>{children}</>;
};

export const WorkspaceIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getWorkspaceHomePath(user)} replace />;
};
