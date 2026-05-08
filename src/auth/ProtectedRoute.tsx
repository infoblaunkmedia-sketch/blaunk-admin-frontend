import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getWorkspaceHomePath } from './homePath';
import type { ModulePermission } from '../shared/types/auth.types';

interface ProtectedRouteProps {
  requiredPermission?: ModulePermission;
  /** KPI / admin dashboard: non-admins are sent to their workspace home instead of `/403`. */
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requireAdmin,
}) => {
  const { isAuthenticated, hasPermission, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to={getWorkspaceHomePath(user)} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={getWorkspaceHomePath(user!)} replace />;
  }

  return <Outlet />;
};
